import { describe, it, expect } from "vitest";
import { validateBaseline, assertLocalTestTarget } from "../../src/lib/uat6Provisioner";
const baseline = () => ({
    users: [
        { id: 1, email: "ann.lee@classpulse.test", role: "OWNER", isActive: true },
        { id: 2, email: "ben.kim@classpulse.test", role: "OWNER", isActive: true },
        ...[1, 2, 3].map((n) => ({ id: n + 2, email: "student" + n + "@classpulse.test", role: "RESPONDENT", isActive: true }))
    ],
    courses: [{ id: 1, code: "CPE334", ownerId: 1 }, { id: 2, code: "CPE231", ownerId: 2 }],
    enrollments: [{ id: 1, userId: 3, courseId: 1 }, { id: 2, userId: 4, courseId: 1 }, { id: 3, userId: 5, courseId: 2 }],
    collisions: [] as {
        email: string;
    }[]
});
describe("UAT6 baseline safety contract", () => {
    it("accepts the exact intended existing fixture without changing it", () => { const s = baseline(); const before = structuredClone(s); expect(validateBaseline(s, s)).toEqual({ courseId: 1 }); expect(s).toEqual(before); });
    for (const email of ["uat6.extra@classpulse.test", " UAT6.INACTIVE@classpulse.test "])
        it("refuses normalized collision " + email, () => { const s = baseline(); s.collisions = [{ email }]; expect(() => validateBaseline(s, baseline())).toThrow("EMAIL_COLLISION"); });
    for (const change of ["inactive-owner", "wrong-owner-role", "wrong-student-role", "missing-student", "student3-enrolled", "student1-extra", "wrong-course-owner", "changed-id"])
        it("refuses baseline deviation " + change, () => { const s = baseline(); if (change === "inactive-owner")
            s.users[0].isActive = false; if (change === "wrong-owner-role")
            s.users[0].role = "RESPONDENT"; if (change === "wrong-student-role")
            s.users[2].role = "OWNER"; if (change === "missing-student")
            s.users.pop(); if (change === "student3-enrolled")
            s.enrollments.push({ id: 4, userId: 5, courseId: 1 }); if (change === "student1-extra")
            s.enrollments.push({ id: 4, userId: 3, courseId: 2 }); if (change === "wrong-course-owner")
            s.courses[0].ownerId = 2; if (change === "changed-id")
            s.users[2].id = 98; expect(() => validateBaseline(s, baseline())).toThrow("BASELINE_MISMATCH"); });
    it("does not accept an equally incorrect human baseline as proof", () => { const s = baseline(); s.enrollments.push({ id: 4, userId: 5, courseId: 1 }); expect(() => validateBaseline(s, s)).toThrow("BASELINE_MISMATCH"); });
});
describe("local DB test target guard", () => {
    it("accepts only dedicated localhost test database", () => expect(assertLocalTestTarget("postgresql://test:test@localhost:5432/classpulse_fixture_test")).toBeUndefined());
    for (const url of ["postgresql://test:test@localhost/classpulse", "postgresql://test:test@cloud.example/classpulse_fixture_test", "postgresql://test:test@localhost/classpulse_test", "invalid"])
        it("refuses non-isolated target", () => expect(() => assertLocalTestTarget(url)).toThrow("TEST_TARGET_REJECTED"));
});
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { isLocalTestServer } from "../../src/lib/uat6Provisioner";
describe("CLI fail-closed boundary", () => {
    for (const args of [[], ["apply"], ["unknown"], ["apply", "baseline.json", "unexpected"]])
        it("stops without a connection or valid interactive apply arguments", () => {
            const run = spawnSync(process.execPath, [resolve("node_modules/tsx/dist/cli.mjs"), resolve("tools/provision-uat6.ts"), ...args], { env: { ...process.env, DATABASE_URL: "" }, encoding: "utf8" });
            expect(run.status).toBe(1);
            expect(run.stdout).toBe("");
            expect(run.stderr).toContain("PROVISIONER_STOPPED");
            expect(run.stderr).not.toContain("postgresql://");
        });
    it("rejects host query overrides", () => expect(() => assertLocalTestTarget("postgresql://test:test@localhost/classpulse_fixture_test?host=cloud.example")).toThrow("TEST_TARGET_REJECTED"));
    it("requires the explicit known CI service context for a non-loopback server", () => {
        const old = [process.env.CI, process.env.GITHUB_ACTIONS, process.env.GITHUB_REPOSITORY];
        try {
            delete process.env.CI;
            expect(isLocalTestServer("172.18.0.2")).toBe(false);
            process.env.CI = "true";
            process.env.GITHUB_ACTIONS = "true";
            process.env.GITHUB_REPOSITORY = "Punge089/classpulse";
            expect(isLocalTestServer("172.18.0.2")).toBe(true);
            expect(isLocalTestServer("203.0.113.1")).toBe(false);
        }
        finally {
            for (const [i, key] of ["CI", "GITHUB_ACTIONS", "GITHUB_REPOSITORY"].entries()) {
                if (old[i] === undefined)
                    delete process.env[key];
                else
                    process.env[key] = old[i];
            }
        }
    });
});
