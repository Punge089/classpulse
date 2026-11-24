import { beforeAll, describe, it, expect } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { provisionUsers, readSnapshot, assertLocalTestTarget, isLocalTestServer } from "../../src/lib/uat6Provisioner";
import { verifyPassword } from "../../src/lib/password";
let targetUrl: string;
beforeAll(async () => {
    const source = new URL(process.env.DATABASE_URL!);
    if (!["localhost", "127.0.0.1", "[::1]"].includes(source.hostname) || source.pathname !== "/classpulse_test")
        throw new Error("TEST_BOOTSTRAP_REJECTED");
    const admin = new PrismaClient({ datasources: { db: { url: source.toString() } }, log: [] });
    try {
        const rows = await admin.$queryRawUnsafe<{
            address: string;
        }[]>("SELECT host(inet_server_addr()) AS address");
        if (!isLocalTestServer(rows[0]?.address))
            throw new Error("TEST_SERVER_NOT_LOCAL");
        const dbs = await admin.$queryRawUnsafe<{
            exists: boolean;
        }[]>("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname='classpulse_fixture_test') AS exists");
        if (!dbs[0].exists)
            await admin.$executeRawUnsafe('CREATE DATABASE classpulse_fixture_test');
    }
    finally {
        await admin.$disconnect();
    }
    source.pathname = "/classpulse_fixture_test";
    source.search = "";
    assertLocalTestTarget(source.toString());
    targetUrl = source.toString();
});
async function setup() {
    const u = new URL(targetUrl);
    const schema = "fx_" + randomUUID().replace(/-/g, "");
    const root = new PrismaClient({ datasources: { db: { url: targetUrl } }, log: [] });
    try {
        await root.$executeRawUnsafe('CREATE SCHEMA "' + schema + '"');
    }
    finally {
        await root.$disconnect();
    }
    u.searchParams.set("schema", schema);
    const db = new PrismaClient({ datasources: { db: { url: u.toString() } }, log: [] });
    await db.$executeRawUnsafe('CREATE TYPE "Role" AS ENUM (\'OWNER\',\'RESPONDENT\')');
    await db.$executeRawUnsafe('CREATE TABLE "User" (id SERIAL PRIMARY KEY,email TEXT UNIQUE NOT NULL,"fullName" TEXT NOT NULL,role "Role" NOT NULL,"isActive" BOOLEAN NOT NULL DEFAULT TRUE,"passwordHash" TEXT NOT NULL,"createdAt" TIMESTAMP NOT NULL DEFAULT now())');
    await db.$executeRawUnsafe('CREATE TABLE "Course" (id SERIAL PRIMARY KEY,code TEXT UNIQUE NOT NULL,title TEXT NOT NULL,"ownerId" INTEGER NOT NULL REFERENCES "User"(id))');
    await db.$executeRawUnsafe('CREATE TABLE "Enrollment" (id SERIAL PRIMARY KEY,"userId" INTEGER REFERENCES "User"(id),"courseId" INTEGER REFERENCES "Course"(id),UNIQUE("courseId","userId"))');
    for (const [email, role] of [["ann.lee@classpulse.test", "OWNER"], ["ben.kim@classpulse.test", "OWNER"], ["student1@classpulse.test", "RESPONDENT"], ["student2@classpulse.test", "RESPONDENT"], ["student3@classpulse.test", "RESPONDENT"]])
        await db.user.create({ data: { email, role: role as "OWNER" | "RESPONDENT", fullName: "Synthetic fixture", passwordHash: "preserve-internal-test-only" } });
    await db.course.create({ data: { code: "CPE334", title: "Synthetic334", ownerId: 1 } });
    await db.course.create({ data: { code: "CPE231", title: "Synthetic231", ownerId: 2 } });
    await db.enrollment.createMany({ data: [{ userId: 3, courseId: 1 }, { userId: 4, courseId: 1 }, { userId: 5, courseId: 2 }] });
    // Sentinel stands for unrelated business data. No live data or shared fixture/reset helper is used.
    await db.$executeRawUnsafe('CREATE TABLE "Sentinel" (id INTEGER PRIMARY KEY,payload TEXT NOT NULL)');
    await db.$executeRawUnsafe("INSERT INTO \"Sentinel\" VALUES (1,'retained unrelated data')");
    return { db, url: u.toString() };
}
const options = (approved: Awaited<ReturnType<typeof readSnapshot>>, url: string) => ({
    approved, confirmed: true, targetConfirmation: "LOCAL_TEST_ONLY", testUrl: url,
    passwords: ["Synthetic-password-A", "Synthetic-password-A"] as [
        string,
        string
    ]
});
async function preserved(db: PrismaClient) {
    return { users: await db.user.findMany({ where: { id: { lte: 5 } }, orderBy: { id: "asc" } }), courses: await db.course.findMany(), enrollments: await db.enrollment.findMany({ where: { userId: { lte: 5 } }, orderBy: { id: "asc" } }), sentinel: await db.$queryRawUnsafe('SELECT * FROM "Sentinel"') };
}
describe("real PostgreSQL additive transaction", () => {
    it("adds exactly two users and one enrollment and preserves all existing rows", async () => {
        const { db, url } = await setup();
        try {
            const before = await preserved(db);
            const approved = await readSnapshot(db);
            await provisionUsers(db, options(approved, url));
            const users = await db.user.findMany({ where: { email: { startsWith: "uat6." } }, orderBy: { email: "asc" } });
            expect(users).toHaveLength(2);
            expect(users.map(u => u.isActive)).toEqual([true, false]);
            expect(users.every(u => u.role === "RESPONDENT")).toBe(true);
            expect(await verifyPassword("Synthetic-password-A", users[0].passwordHash)).toBe(true);
            expect(await verifyPassword("Synthetic-password-A", users[1].passwordHash)).toBe(true);
            expect(users[0].passwordHash).not.toBe(users[1].passwordHash);
            expect(await db.enrollment.count()).toBe(4);
            expect(await db.enrollment.count({ where: { userId: users[0].id, courseId: 1 } })).toBe(1);
            expect(await db.enrollment.count({ where: { userId: users[1].id } })).toBe(0);
            expect(await preserved(db)).toEqual(before);
        }
        finally {
            await db.$disconnect();
        }
    });
    for (const stage of ["first-user", "second-user", "enrollment"] as const)
        it("rolls back actual inserts when failure occurs after " + stage, async () => {
            const { db, url } = await setup();
            try {
                const before = await preserved(db);
                const approved = await readSnapshot(db);
                await expect(provisionUsers(db, { ...options(approved, url), testFailure: stage })).rejects.toThrow("APPLY_FAILED");
                expect(await db.user.count()).toBe(5);
                expect(await db.enrollment.count()).toBe(3);
                expect(await preserved(db)).toEqual(before);
            }
            finally {
                await db.$disconnect();
            }
        });
    it("refuses a case-variant collision without changing the existing hash", async () => {
        const { db, url } = await setup();
        try {
            const approved = await readSnapshot(db);
            await db.user.create({ data: { email: " UAT6.EXTRA@classpulse.test ", fullName: "Existing", role: "RESPONDENT", passwordHash: "unchanged" } });
            await expect(provisionUsers(db, options(approved, url))).rejects.toThrow("EMAIL_COLLISION");
            expect(await db.user.count()).toBe(6);
            expect(await db.enrollment.count()).toBe(3);
        }
        finally {
            await db.$disconnect();
        }
    });
    it("rejects changed student3 enrollment inside the guarded transaction", async () => {
        const { db, url } = await setup();
        try {
            const approved = await readSnapshot(db);
            await db.enrollment.create({ data: { userId: 5, courseId: 1 } });
            await expect(provisionUsers(db, options(approved, url))).rejects.toThrow("BASELINE_MISMATCH");
            expect(await db.user.count()).toBe(5);
            expect(await db.enrollment.count()).toBe(4);
        }
        finally {
            await db.$disconnect();
        }
    });
    it("allows at most one of two concurrent applies", async () => {
        const { db, url } = await setup();
        try {
            const approved = await readSnapshot(db);
            const results = await Promise.allSettled([provisionUsers(db, options(approved, url)), provisionUsers(db, options(approved, url))]);
            expect(results.filter(x => x.status === "fulfilled")).toHaveLength(1);
            expect(await db.user.count()).toBe(7);
            expect(await db.enrollment.count()).toBe(4);
            await expect(provisionUsers(db, options(approved, url))).rejects.toThrow();
            expect(await db.user.count()).toBe(7);
        }
        finally {
            await db.$disconnect();
        }
    });
    it("refuses missing human confirmation before writes", async () => {
        const { db, url } = await setup();
        try {
            const approved = await readSnapshot(db);
            await expect(provisionUsers(db, { ...options(approved, url), confirmed: false })).rejects.toThrow("HUMAN_GATE_REQUIRED");
            expect(await db.user.count()).toBe(5);
        }
        finally {
            await db.$disconnect();
        }
    });
});
import { inspectUsers } from "../../src/lib/uat6Provisioner";
it("inspect runs a real read-only transaction and preserves rows", async () => {
    const { db } = await setup();
    try {
        const before = await preserved(db);
        let readOnly = false;
        const wrapper = { $transaction: async (callback: any, settings: any) => db.$transaction(async (tx) => {
                const proxy = new Proxy(tx, { get(target, key) {
                        if (key === "$queryRawUnsafe")
                            return async (...args: unknown[]) => {
                                const [state] = await tx.$queryRawUnsafe<{
                                    transaction_read_only: string;
                                }[]>("SHOW transaction_read_only");
                                readOnly = state.transaction_read_only === "on";
                                return (tx.$queryRawUnsafe as any)(...args);
                            };
                        return Reflect.get(target, key);
                    } });
                return callback(proxy);
            }, settings) } as unknown as PrismaClient;
        const result = await inspectUsers(wrapper);
        expect(readOnly).toBe(true);
        expect(result.baseline.users).toHaveLength(5);
        expect(JSON.stringify(result)).not.toContain("passwordHash");
        expect(await preserved(db)).toEqual(before);
    }
    finally {
        await db.$disconnect();
    }
});

it("refuses an unexpected schema column before inserting fixtures",async()=>{
 const {db,url}=await setup();
 try{
 const approved=await readSnapshot(db);
 await db.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN "unreviewedField" TEXT');
 await expect(provisionUsers(db,options(approved,url))).rejects.toThrow("SCHEMA_MISMATCH");
 expect(await db.user.count()).toBe(5);expect(await db.enrollment.count()).toBe(3);
 }finally{await db.$disconnect();}
});

