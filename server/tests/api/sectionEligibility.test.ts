import { beforeEach, expect, test } from "vitest";
import { createApp } from "../../src/app";
import { getPrisma } from "../../src/prisma";
import { loginAs } from "../helpers/auth";
import { makeSurvey, resetDb, seedFixture, type Fixture } from "../helpers/fixture";

const app = createApp();
const prisma = getPrisma();
let fixture: Fixture;

beforeEach(async () => {
  await resetDb();
  fixture = await seedFixture();
});

test("TEST-200 accepts all sections on an owned draft and advances the update token", async () => {
  const draft = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const owner = await loginAs(app, fixture.owner1.email);
  const path = `/api/owner/surveys/${draft.id}`;
  expect((await owner.get(path)).status).toBe(200);
  const original = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });

  const result = await owner.put(`${path}/sections`).send({
    expectedUpdatedAt: original.updatedAt.toISOString(),
    sectionIds: []
  });
  expect(result.status).toBe(200);

  const stored = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
  expect(stored.updatedAt.getTime()).toBeGreaterThan(original.updatedAt.getTime());
  expect(stored.status).toBe(original.status);
  expect(stored.statusVersion).toBe(original.statusVersion);

  const reloaded = await owner.get(path);
  expect(reloaded.status).toBe(200);
  expect(reloaded.body.survey.sectionIds).toEqual([]);
  expect(reloaded.body.survey.updatedAt).toBe(stored.updatedAt.toISOString());
});
