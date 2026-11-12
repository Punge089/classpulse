import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import request from "supertest";
import { afterAll, describe, expect, test, vi } from "vitest";
import { createApp } from "../../src/app";
import { getPrisma } from "../../src/prisma";

type AppOptions = { clientDistPath: string };
const createAppWithOptions = createApp as unknown as (options: AppOptions) => ReturnType<typeof createApp>;
const clientDist = mkdtempSync(join(tmpdir(), "classpulse-cloud-ready-"));
mkdirSync(join(clientDist, "assets"), { recursive: true });
writeFileSync(join(clientDist, "index.html"),
  "<!doctype html><html><body><main id=\"fixture-root\">client fixture</main></body></html>");
writeFileSync(join(clientDist, "assets", "fixture.js"), "window.classPulseFixture = true;");

const previousNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "production";
const app = createAppWithOptions({ clientDistPath: clientDist });
if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
else process.env.NODE_ENV = previousNodeEnv;

const prisma = getPrisma();

afterAll(async () => {
  vi.restoreAllMocks();
  rmSync(clientDist, { recursive: true, force: true });
  await prisma.$disconnect();
});

describe("L5-2 cloud-ready app", () => {
  test("L5-2-T1 reports real database readiness and sanitized failure separately from liveness", async () => {
    await prisma.$queryRawUnsafe("SELECT 1");
    const query = vi.spyOn(prisma, "$queryRaw");
    try {
      const ready = await request(app).get("/api/ready");
      expect(ready.status).toBe(200);
      expect(ready.body).toEqual({ status: "ready", db: "connected" });
      expect(query).toHaveBeenCalledTimes(1);

      query.mockClear();
      query.mockRejectedValue(new Error("synthetic private database detail"));
      const unavailable = await request(app).get("/api/ready");
      expect(unavailable.status).toBe(503);
      expect(unavailable.body).toEqual({ status: "unavailable" });
      expect(JSON.stringify(unavailable.body)).not.toContain("synthetic private database detail");
      expect(query).toHaveBeenCalledTimes(1);

      const health = await request(app).get("/api/health");
      expect(health.status).toBe(200);
      expect(health.body).toEqual({ status: "ok" });
      expect(query).toHaveBeenCalledTimes(1);
    } finally {
      query.mockRestore();
    }
  });

  test("L5-2-T2 serves HTML navigations and assets but preserves 404 boundaries", async () => {
    const home = await request(app).get("/").set("Accept", "text/html");
    expect(home.status).toBe(200);
    expect(home.text).toContain("fixture-root");

    const deepLink = await request(app).get("/owner/surveys/1").set("Accept", "text/html");
    expect(deepLink.status).toBe(200);
    expect(deepLink.text).toContain("fixture-root");

    const asset = await request(app).get("/assets/fixture.js");
    expect(asset.status).toBe(200);
    expect(asset.text).toContain("classPulseFixture");

    const jsonClientRequest = await request(app).get("/owner/surveys/1")
      .set("Accept", "application/json");
    expect(jsonClientRequest.status).toBe(404);
    expect(jsonClientRequest.text).not.toContain("fixture-root");

    const unknownApi = await request(app).get("/api/not-a-route")
      .set("Accept", "application/json");
    expect(unknownApi.status).toBe(404);
    expect(unknownApi.body.error.code).toBe("NOT_FOUND");

    for (const path of ["/assets/missing.js", "/missing.svg"]) {
      const missingAsset = await request(app).get(path).set("Accept", "text/html");
      expect(missingAsset.status).toBe(404);
      expect(missingAsset.text).not.toContain("fixture-root");
    }
  });

  test("L5-2-T4 examples list settings and use safe host-specific placeholders", () => {
    const rootExamplePath = resolve(process.cwd(), "../.env.example");
    const serverExamplePath = resolve(process.cwd(), ".env.example");
    const missing = [rootExamplePath, serverExamplePath]
      .filter(path => !existsSync(path)).map(path => basename(path));
    if (missing.length > 0) {
      expect(missing).toEqual([]);
      return;
    }

    const rootExample = readFileSync(rootExamplePath, "utf8");
    const serverExample = readFileSync(serverExamplePath, "utf8");
    const rootKeys = [
      "DATABASE_URL", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD",
      "SEED_PASSWORD", "PORT", "SESSION_TTL_HOURS", "NODE_ENV"
    ];
    const serverKeys = ["DATABASE_URL", "SEED_PASSWORD", "PORT", "SESSION_TTL_HOURS", "NODE_ENV"];
    for (const key of rootKeys) expect(rootExample).toMatch(new RegExp("^" + key + "=.+" + "$", "m"));
    for (const key of serverKeys) expect(serverExample).toMatch(new RegExp("^" + key + "=.+" + "$", "m"));

    const rootDatabaseUrl = /^DATABASE_URL=(.+)$/m.exec(rootExample)?.[1] ?? "";
    const serverDatabaseUrl = /^DATABASE_URL=(.+)$/m.exec(serverExample)?.[1] ?? "";
    expect(rootDatabaseUrl).toContain("@db:5432/");
    expect(serverDatabaseUrl).toContain("@localhost:5432/");
    expect(rootDatabaseUrl).toMatch(/CHANGE_ME|REPLACE_ME|EXAMPLE/i);
    expect(rootExample).toContain("NODE_ENV=production");
    expect(serverExample).toContain("NODE_ENV=development");
  });
});