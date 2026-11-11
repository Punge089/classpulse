import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Prisma } from "@prisma/client";
import { expect, test } from "vitest";
import { seedAccounts } from "../../prisma/seed";

test("L5-2-T3 missing seed credentials fail before writes and the web entry never seeds", async () => {
  let databaseTouches = 0;
  const db = new Proxy({}, {
    get: () => {
      databaseTouches += 1;
      throw new Error("Database must not be accessed before seed credentials are checked");
    }
  }) as Prisma.TransactionClient;

  await expect(seedAccounts(db, "")).rejects.toThrow("Set SEED_PASSWORD");
  expect(databaseTouches).toBe(0);

  const seedSource = readFileSync(resolve(process.cwd(), "prisma/seed.ts"), "utf8");
  expect(seedSource).toMatch(/process\.env\.SEED_PASSWORD/);
  expect(seedSource).not.toMatch(/process\.env\.SEED_PASSWORD\s*(?:\?\?|\|\|)\s*["']/);

  const webEntry = readFileSync(resolve(process.cwd(), "src/index.ts"), "utf8");
  expect(webEntry).not.toMatch(/seedAccounts|seedDevelopment|prisma:seed/);
});