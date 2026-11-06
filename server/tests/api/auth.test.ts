import { createHash } from "node:crypto";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { createApp } from "../../src/app";
import { getPrisma } from "../../src/prisma";
import { loginAs, sessionCookiePair, sessionSetCookie } from "../helpers/auth";
import { resetDb, seedFixture, type Fixture } from "../helpers/fixture";

const app = createApp();
const prisma = getPrisma();
const password = process.env.SEED_PASSWORD ?? "";
let f: Fixture;

beforeEach(async () => {
  await resetDb();
  f = await seedFixture();
});
afterAll(async () => {
  await prisma.$disconnect();
});

const login = (body: object) => request(app).post("/api/auth/login").send(body);

describe("F-01 login, session and current user", () => {
  test("TEST-01 valid login returns the user and an HttpOnly SameSite=Lax cp_session cookie", async () => {
    const res = await login({ email: "ann.lee@classpulse.test", password });
    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toEqual(["user"]);
    expect(res.body.user).toEqual({
      id: f.owner1.id, email: "ann.lee@classpulse.test", fullName: "Dr. Ann Lee", role: "OWNER"
    });
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");

    const cookie = sessionSetCookie(res);
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    const ttlHours = Number(process.env.SESSION_TTL_HOURS ?? "8");
    const maxAge = Number(/Max-Age=(\d+)/i.exec(cookie!)?.[1]);
    expect(Math.abs(maxAge - ttlHours * 3600)).toBeLessThanOrEqual(60);

    const token = sessionCookiePair(res).slice("cp_session=".length);
    const rows = await prisma.session.findMany({ where: { userId: f.owner1.id } });
    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).toBe(createHash("sha256").update(token).digest("hex"));
    expect(rows[0].tokenHash).not.toBe(token);
  });

  test("TEST-02 wrong password, unknown email and an inactive user are indistinguishable", async () => {
    await prisma.user.update({ where: { id: f.student3.id }, data: { isActive: false } });
    const attempts = [
      await login({ email: "ann.lee@classpulse.test", password: "not-the-password" }),
      await login({ email: "ghost@classpulse.test", password: "not-the-password" }),
      await login({ email: "student3@classpulse.test", password })
    ];
    for (const res of attempts) {
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
      expect(res.body.error.message).toBe(attempts[0].body.error.message);
      expect(sessionSetCookie(res)).toBeUndefined();
    }
    expect(await prisma.session.count()).toBe(0);
  });

  test("TEST-03 /me returns the current user with a cookie and 401 without one", async () => {
    const agent = await loginAs(app, "student1@classpulse.test");
    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body).toEqual({
      user: { id: f.student1.id, email: "student1@classpulse.test", fullName: "Student 1", role: "RESPONDENT" }
    });

    const anonymous = await request(app).get("/api/auth/me");
    expect(anonymous.status).toBe(401);
    expect(anonymous.body.error.code).toBe("UNAUTHENTICATED");
  });

  test("TEST-04 logout deletes the session and the replayed cookie is rejected", async () => {
    const loginRes = await login({ email: "student1@classpulse.test", password });
    const savedCookie = sessionCookiePair(loginRes);
    expect(await prisma.session.count({ where: { userId: f.student1.id } })).toBe(1);

    const logout = await request(app).post("/api/auth/logout").set("Cookie", savedCookie);
    expect(logout.status).toBe(204);
    const cleared = sessionSetCookie(logout);
    expect(cleared).toBeDefined();
    expect(cleared).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);

    // A fresh request that sets the saved cookie by hand: the server itself must reject it.
    const replay = await request(app).get("/api/auth/me").set("Cookie", savedCookie);
    expect(replay.status).toBe(401);
    expect(replay.body.error.code).toBe("UNAUTHENTICATED");
    expect(await prisma.session.count({ where: { userId: f.student1.id } })).toBe(0);
  });

  test("TEST-05 a session whose expiresAt has passed is rejected", async () => {
    const agent = await loginAs(app, "student1@classpulse.test");
    expect((await agent.get("/api/auth/me")).status).toBe(200);
    await prisma.session.updateMany({
      where: { userId: f.student1.id }, data: { expiresAt: new Date(Date.now() - 60_000) }
    });
    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  test("TEST-55 a malformed login body is a 400 with no cookie and no session", async () => {
    const cases: Array<[object, string[]]> = [
      [{}, ["email", "password"]],
      [{ email: "ann.lee@classpulse.test" }, ["password"]],
      [{ password: "x" }, ["email"]],
      [{ email: 123, password: "x" }, ["email"]]
    ];
    for (const [body, fields] of cases) {
      const res = await login(body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.details.map((d: { field: string }) => d.field).sort()).toEqual(fields.sort());
      expect(sessionSetCookie(res)).toBeUndefined();
    }
    const raw = await request(app).post("/api/auth/login")
      .set("Content-Type", "application/json").send("{");
    expect(raw.status).toBe(400);
    expect(raw.body.error.code).toBe("VALIDATION_ERROR");
    expect(sessionSetCookie(raw)).toBeUndefined();
    expect(await prisma.session.count()).toBe(0);
  });

  test("TEST-56 the session cookie is Secure in production (login and logout) and not in test", async () => {
    const original = process.env.NODE_ENV;
    const secure = /;\s*Secure\b/i;
    try {
      process.env.NODE_ENV = "production";
      const productionLogin = await login({ email: "student1@classpulse.test", password });
      expect(productionLogin.status).toBe(200);
      expect(sessionSetCookie(productionLogin)).toMatch(secure);

      const productionLogout = await request(app).post("/api/auth/logout")
        .set("Cookie", sessionCookiePair(productionLogin));
      expect(productionLogout.status).toBe(204);
      expect(sessionSetCookie(productionLogout)).toMatch(secure);

      process.env.NODE_ENV = "test";
      const testLogin = await login({ email: "student1@classpulse.test", password });
      expect(testLogin.status).toBe(200);
      expect(sessionSetCookie(testLogin)).toBeDefined();
      expect(sessionSetCookie(testLogin)).not.toMatch(secure);
    } finally {
      if (original === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = original;
    }
  });
});
