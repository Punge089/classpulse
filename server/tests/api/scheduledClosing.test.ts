import { expect, test } from "vitest";
import { createApp } from "../../src/app";
import { getPrisma } from "../../src/prisma";
import { loginAs } from "../helpers/auth";
import { makeSurvey, resetDb, seedFixture } from "../helpers/fixture";

test("TEST-180 saves and persists a canonical closing deadline on an owned draft", async () => {
  await resetDb();
  const fixture = await seedFixture();
  const draft = await makeSurvey({
    owner: fixture.owner1,
    course: fixture.cpe334,
    status: "DRAFT"
  });
  const owner = await loginAs(createApp(), fixture.owner1.email);
  const prisma = getPrisma();
  const original = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
  const closesAt = "2030-11-28T12:00:00.000Z";

  const response = await owner.put(`/api/owner/surveys/${draft.id}/schedule`).send({
    closesAt,
    expectedUpdatedAt: original.updatedAt.toISOString()
  });

  expect(response.status).toBe(200);
  expect(response.body.survey).toMatchObject({ id: draft.id, status: "DRAFT", closesAt });
  const stored = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
  expect(stored).toMatchObject({ status: "DRAFT", closesAt: new Date(closesAt) });
});
