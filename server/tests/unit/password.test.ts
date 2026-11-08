import { afterAll, beforeEach, expect, test } from "vitest";
import { hashPassword, verifyPassword } from "../../src/lib/password";
import { getPrisma } from "../../src/prisma";
import { resetDb, seedFixture } from "../helpers/fixture";

const prisma = getPrisma();
beforeEach(async () => {
  await resetDb();
});
afterAll(async () => {
  await prisma.$disconnect();
});

test("TEST-06 passwords are stored only as salted scrypt hashes that verify", async () => {
  const hash = await hashPassword("secret");
  expect(hash).not.toBe("secret");
  expect(hash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
  expect(await verifyPassword("secret", hash)).toBe(true);
  expect(await verifyPassword("Secret", hash)).toBe(false);
  expect(await hashPassword("secret")).not.toBe(hash);

  const password = process.env.SEED_PASSWORD;
  if (!password) throw new Error("TEST-06 needs a synthetic SEED_PASSWORD");
  const { owner1 } = await seedFixture();
  expect(owner1.passwordHash).not.toBe(password);
  expect(await verifyPassword(password, owner1.passwordHash)).toBe(true);
});
