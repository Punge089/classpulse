export type Snapshot = {
    users: {
        id: number;
        email: string;
        role: string;
        isActive: boolean;
    }[];
    courses: {
        id: number;
        code: string;
        ownerId: number;
    }[];
    enrollments: {
        id: number;
        userId: number;
        courseId: number;
    }[];
    collisions: {
        email: string;
    }[];
};
export const TARGET_EMAILS = ["uat6.extra@classpulse.test", "uat6.inactive@classpulse.test"] as const;
const normalize = (s: string) => s.trim().toLowerCase();
const mismatch = (): never => { throw new Error("BASELINE_MISMATCH"); };
function canonical(s: Snapshot): string {
    return JSON.stringify({
        users: [...s.users].sort((a, b) => a.id - b.id),
        courses: [...s.courses].sort((a, b) => a.id - b.id),
        enrollments: [...s.enrollments].sort((a, b) => a.id - b.id)
    });
}
export function validateBaseline(actual: Snapshot, approved: Snapshot): {
    courseId: number;
} {
    if (actual.collisions.some(u => TARGET_EMAILS.some(e => e === normalize(u.email))))
        throw new Error("EMAIL_COLLISION");
    if (actual.users.length !== 5 || actual.courses.length !== 2 || actual.enrollments.length !== 3)
        mismatch();
    const ownerEmails = ["ann.lee@classpulse.test", "ben.kim@classpulse.test"];
    const ownerIds = ownerEmails.map(email => {
        const u = actual.users.filter(u => u.email === email);
        if (u.length !== 1 || u[0].role !== "OWNER" || !u[0].isActive)
            mismatch();
        return u[0].id;
    });
    if (new Set(actual.users.map(u => u.id)).size !== 5)
        mismatch();
    const courses = ["CPE334", "CPE231"].map((code, i) => {
        const rows = actual.courses.filter(c => c.code === code);
        if (rows.length !== 1 || rows[0].ownerId !== ownerIds[i])
            mismatch();
        return rows[0];
    });
    if (courses[0].id === courses[1].id)
        mismatch();
    for (const n of [1, 2, 3]) {
        const users = actual.users.filter(u => u.email === "student" + n + "@classpulse.test");
        if (users.length !== 1 || users[0].role !== "RESPONDENT" || !users[0].isActive)
            mismatch();
        const e = actual.enrollments.filter(e => e.userId === users[0].id);
        if (e.length !== 1 || e[0].courseId !== courses[n === 3 ? 1 : 0].id)
            mismatch();
    }
    if (new Set(actual.enrollments.map(e => e.id)).size !== 3 || canonical(actual) !== canonical(approved))
        mismatch();
    return { courseId: courses[0].id };
}
export function isLocalTestServer(address: string): boolean {
    if (["127.0.0.1", "::1"].includes(address))
        return true;
    // CI postgres service is a local Docker container, so its server address is private rather than loopback.
    return process.env.CI === "true" && process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REPOSITORY === "Punge089/classpulse"
        && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address);
}
export function assertLocalTestTarget(raw: string): void {
    try {
        const u = new URL(raw);
        if (!["postgres:", "postgresql:"].includes(u.protocol) || !["localhost", "127.0.0.1", "[::1]"].includes(u.hostname) || (u.pathname !== "/classpulse_fixture_test" || u.searchParams.has("host")))
            throw new Error();
    }
    catch {
        throw new Error("TEST_TARGET_REJECTED");
    }
}
import type { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword } from "./password";
type Db = Prisma.TransactionClient | PrismaClient;
const EXISTING = ["ann.lee@classpulse.test", "ben.kim@classpulse.test", "student1@classpulse.test", "student2@classpulse.test", "student3@classpulse.test"];
export async function readSnapshot(db: Db): Promise<Snapshot> {
    const users = await db.user.findMany({ where: { email: { in: EXISTING } }, select: { id: true, email: true, role: true, isActive: true }, orderBy: { id: "asc" } });
    const courses = await db.course.findMany({ where: { code: { in: ["CPE334", "CPE231"] } }, select: { id: true, code: true, ownerId: true }, orderBy: { id: "asc" } });
    const enrollments = await db.enrollment.findMany({ where: { userId: { in: users.map(u => u.id) } }, select: { id: true, userId: true, courseId: true }, orderBy: { id: "asc" } });
    const collisions = await db.$queryRawUnsafe<{
        email: string;
    }[]>('SELECT email FROM "User" WHERE lower(btrim(email)) IN (\'uat6.extra@classpulse.test\',\'uat6.inactive@classpulse.test\')');
    return { users, courses, enrollments, collisions };
}
export type ApplyOptions = {
    approved: Snapshot;
    confirmed: boolean;
    targetConfirmation: string;
    testUrl?: string;
    passwords: [
        string,
        string
    ];
    testFailure?: "first-user" | "second-user" | "enrollment";
};
export async function inspectUsers(db: PrismaClient): Promise<{
    database: string;
    baseline: Snapshot;
}> {
    return db.$transaction(async (tx) => {
        await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
        await tx.$executeRawUnsafe("SET LOCAL statement_timeout = '8s'");
        const [row] = await tx.$queryRawUnsafe<{
            database: string;
        }[]>("SELECT current_database() AS database");
        return { database: row.database, baseline: await readSnapshot(tx) };
    }, { timeout: 12000 });
}
export async function provisionUsers(db: PrismaClient, options: ApplyOptions) {
    const local = options.testUrl !== undefined;
    if (!options.confirmed || !options.approved || options.passwords.length !== 2 || options.passwords.some(p => typeof p !== "string" || p.length === 0))
        throw new Error("HUMAN_GATE_REQUIRED");
    if (local) {
        assertLocalTestTarget(options.testUrl!);
        if (options.targetConfirmation !== "LOCAL_TEST_ONLY")
            throw new Error("HUMAN_GATE_REQUIRED");
    }
    else if (options.targetConfirmation !== "cpe-334-en-034/classpulse-pg/classpulse" || options.testFailure)
        throw new Error("HUMAN_GATE_REQUIRED");
    // Expensive hashing and all human input happen before acquiring database locks.
    const hashes = await Promise.all(options.passwords.map(p => hashPassword(p)));
    const fail = (stage: string) => { if (local && options.testFailure === stage)
        throw new Error("APPLY_FAILED"); };
    try {
        return await db.$transaction(async (tx) => {
            await tx.$executeRawUnsafe("SET LOCAL lock_timeout = '3s'");
            await tx.$executeRawUnsafe("SET LOCAL statement_timeout = '8s'");
            const [target] = await tx.$queryRawUnsafe<{
                database: string;
                address: string;
            }[]>("SELECT current_database() AS database,host(inet_server_addr()) AS address");
            if (target.database !== (local ? "classpulse_fixture_test" : "classpulse") || (local && !isLocalTestServer(target.address)))
                throw new Error("TARGET_MISMATCH");
            // Fixed order, before guards. This also blocks other ordinary writes to these tables.
            await tx.$executeRawUnsafe('LOCK TABLE "User","Course","Enrollment" IN SHARE ROW EXCLUSIVE MODE');
            const baseline = await readSnapshot(tx);
            const { courseId } = validateBaseline(baseline, options.approved);
            const extra = await tx.user.create({ data: { email: TARGET_EMAILS[0], fullName: "UAT6 Extra Respondent", role: "RESPONDENT", isActive: true, passwordHash: hashes[0] }, select: { id: true, email: true, role: true, isActive: true } });
            fail("first-user");
            const inactive = await tx.user.create({ data: { email: TARGET_EMAILS[1], fullName: "UAT6 Inactive Respondent", role: "RESPONDENT", isActive: false, passwordHash: hashes[1] }, select: { id: true, email: true, role: true, isActive: true } });
            fail("second-user");
            const enrollment = await tx.enrollment.create({ data: { userId: extra.id, courseId }, select: { id: true, userId: true, courseId: true } });
            fail("enrollment");
            const after = await readSnapshot(tx);
            if (canonical(after) !== canonical(baseline))
                throw new Error("BASELINE_MISMATCH");
            return { users: [extra, inactive], enrollment, existingBaselineUnchanged: true };
        }, { isolationLevel: "Serializable", maxWait: 5000, timeout: 15000 });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (["EMAIL_COLLISION", "BASELINE_MISMATCH", "TARGET_MISMATCH"].includes(message))
            throw new Error(message);
        throw new Error("APPLY_FAILED");
    }
}
