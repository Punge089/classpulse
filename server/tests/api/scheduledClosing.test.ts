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

test("TEST-181 an owned draft accepts only one of two updates using the same schedule token", async () => {
  await resetDb();
  const fixture = await seedFixture();
  const draft = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const prisma = getPrisma();
  const before = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
  const path = `/api/owner/surveys/${draft.id}/schedule`;
  const [first, second] = await Promise.all([
    loginAs(createApp(), fixture.owner1.email), loginAs(createApp(), fixture.owner1.email)
  ]);
  const expectedUpdatedAt = before.updatedAt.toISOString();
  const deadlines = ["2030-11-28T12:00:00.000Z", "2030-11-29T12:00:00.000Z"];
  const responses = await Promise.all([
    first.put(path).send({ expectedUpdatedAt, closesAt: deadlines[0] }),
    second.put(path).send({ expectedUpdatedAt, closesAt: deadlines[1] })
  ]);
  expect(responses.map(response => response.status).sort()).toEqual([200, 409]);
  const winner = responses.findIndex(response => response.status === 200);
  expect(responses[1 - winner].body.error.code).toBe("STALE_SURVEY");
  expect(responses[winner].body.survey.closesAt).toBe(deadlines[winner]);

  const after = await prisma.survey.findUniqueOrThrow({
    where: { id: draft.id },
    include: { questions: { orderBy: { position: "asc" } } }
  });
  expect(after).toMatchObject({
    id: before.id, status: before.status, statusVersion: before.statusVersion,
    closesAt: new Date(deadlines[winner])
  });
  expect(after.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());
  expect(after.questions.map(question => question.id)).toEqual(draft.questions.map(question => question.id));
  expect(await prisma.surveyLifecycleEvent.count({ where: { surveyId: draft.id } })).toBe(0);
});

test("TEST-182 rejects a rollover closing date for an owned draft without changing rows", async () => {
  await resetDb();
  const fixture = await seedFixture();
  const draft = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const owner = await loginAs(createApp(), fixture.owner1.email);
  const prisma = getPrisma();
  const before = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
  const response = await owner.put(`/api/owner/surveys/${draft.id}/schedule`).send({
    closesAt: "2030-02-30T12:00:00.000Z",
    expectedUpdatedAt: before.updatedAt.toISOString()
  });
  expect(response.status).toBe(400);
  expect(response.body.error).toMatchObject({
    code: "VALIDATION_ERROR",
    details: expect.arrayContaining([expect.objectContaining({ field: "closesAt" })])
  });
  expect(await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } })).toEqual(before);
});
