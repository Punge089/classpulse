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

test("TEST-120 replaces an owned draft's questions in order", async () => {
  const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const owner = await loginAs(app, fixture.owner1.email);
  const detail = await owner.get(`/api/owner/surveys/${original.id}`);
  expect(detail.status).toBe(200);
  const timestamp = (await prisma.survey.findUniqueOrThrow({ where: { id: original.id } })).updatedAt.toISOString();
  const response = await owner.put(`/api/owner/surveys/${original.id}/questions`).send({
    expectedUpdatedAt: timestamp,
    questions: [
      { prompt: "Updated choice", type: "SINGLE_CHOICE", required: true, options: ["Yes", "No"] },
      { prompt: "Updated rating", type: "RATING", required: true }
    ]
  });
  expect(response.status).toBe(200);
  const stored = await prisma.survey.findUniqueOrThrow({
    where: { id: original.id },
    include: { questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } } }
  });
  expect(stored.questions.map(q => [q.prompt, q.type, q.position])).toEqual([
    ["Updated choice", "SINGLE_CHOICE", 1], ["Updated rating", "RATING", 2]
  ]);
  expect(stored.questions[0].options.map(option => option.label)).toEqual(["Yes", "No"]);
  expect([stored.id, stored.courseId, stored.ownerId, stored.title, stored.status, stored.statusVersion]).toEqual(
    [original.id, original.courseId, original.ownerId, original.title, original.status, original.statusVersion]
  );
});

test("TEST-122 invalid replacement preserves the draft and token", async () => {
  const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const owner = await loginAs(app, fixture.owner1.email);
  const response = await owner.put(`/api/owner/surveys/${original.id}/questions`).send({
    expectedUpdatedAt: original.updatedAt.toISOString(), questions: []
  });
  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe("VALIDATION_ERROR");
  const stored = await prisma.survey.findUniqueOrThrow({ where: { id: original.id }, include: {
    questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
  } });
  expect(stored).toEqual(original);
});

test("TEST-123 rejects editing a published survey without changing it", async () => {
  const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "PUBLISHED" });
  const owner = await loginAs(app, fixture.owner1.email);
  const response = await owner.put(`/api/owner/surveys/${original.id}/questions`).send({
    expectedUpdatedAt: original.updatedAt.toISOString(), questions: [{ prompt: "Valid", type: "RATING" }]
  });
  expect(response.status).toBe(409);
  expect(response.body.error.code).toBe("INVALID_TRANSITION");
  const stored = await prisma.survey.findUniqueOrThrow({ where: { id: original.id }, include: {
    questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
  } });
  expect(stored).toEqual(original);
});

test("TEST-124 foreign owner receives 404 before invalid body validation", async () => {
  const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const other = await loginAs(app, fixture.owner2.email);
  const response = await other.put(`/api/owner/surveys/${original.id}/questions`).send({ questions: [] });
  expect(response.status).toBe(404);
  expect(response.body.error.code).toBe("NOT_FOUND");
  const stored = await prisma.survey.findUniqueOrThrow({ where: { id: original.id }, include: {
    questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
  } });
  expect(stored).toEqual(original);
});

test("TEST-125 stale token cannot overwrite newer questions", async () => {
  const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const owner = await loginAs(app, fixture.owner1.email);
  const body = { expectedUpdatedAt: original.updatedAt.toISOString(), questions: [{ prompt: "New", type: "RATING" }] };
  expect((await owner.put(`/api/owner/surveys/${original.id}/questions`).send(body)).status).toBe(200);
  const before = await prisma.survey.findUniqueOrThrow({ where: { id: original.id }, include: {
    questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
  } });
  const stale = await owner.put(`/api/owner/surveys/${original.id}/questions`).send(body);
  expect(stale.status).toBe(409);
  expect(stale.body.error.code).toBe("STALE_SURVEY");
  const after = await prisma.survey.findUniqueOrThrow({ where: { id: original.id }, include: {
    questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
  } });
  expect(after).toEqual(before);
});
