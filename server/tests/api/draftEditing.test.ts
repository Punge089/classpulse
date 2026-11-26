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

test("TEST-127 failed replacement rolls back questions, options and update token", async () => {
  const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const owner = await loginAs(app, fixture.owner1.email);
  await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION f06_reject_question() RETURNS trigger AS $$
    BEGIN IF NEW.prompt = 'F06 forced rollback' THEN RAISE EXCEPTION 'F06 test fault'; END IF; RETURN NEW; END;
    $$ LANGUAGE plpgsql`);
  try {
    await prisma.$executeRawUnsafe(`CREATE TRIGGER f06_reject_question_trigger BEFORE INSERT ON "Question"
      FOR EACH ROW EXECUTE FUNCTION f06_reject_question()`);
    const result = await owner.put(`/api/owner/surveys/${original.id}/questions`).send({
      expectedUpdatedAt: original.updatedAt.toISOString(),
      questions: [
        { prompt: "First replacement", type: "SINGLE_CHOICE", options: ["Yes", "No"] },
        { prompt: "F06 forced rollback", type: "RATING" }
      ]
    });
    expect(result.status).toBe(500);
    expect(result.body).toEqual({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
    const after = await prisma.survey.findUniqueOrThrow({ where: { id: original.id }, include: {
      questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
    } });
    expect(after).toEqual(original);
  } finally {
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS f06_reject_question_trigger ON "Question"');
    await prisma.$executeRawUnsafe("DROP FUNCTION IF EXISTS f06_reject_question()");
  }
});

test("TEST-126 concurrent publish and edit preserve one complete serial outcome", async () => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
    const editor = await loginAs(app, fixture.owner1.email);
    const publisher = await loginAs(app, fixture.owner1.email);
    const [edit, publish] = await Promise.all([
      editor.put(`/api/owner/surveys/${original.id}/questions`).send({
        expectedUpdatedAt: original.updatedAt.toISOString(),
        questions: [{ prompt: "Complete replacement", type: "RATING", required: true }]
      }),
      publisher.post(`/api/owner/surveys/${original.id}/publish`)
    ]);
    expect(publish.status).toBe(200);
    expect([200, 409]).toContain(edit.status);
    if (edit.status === 409) expect(edit.body.error.code).toBe("INVALID_TRANSITION");
    const after = await prisma.survey.findUniqueOrThrow({ where: { id: original.id }, include: {
      questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
    } });
    expect(after.status).toBe("PUBLISHED");
    if (edit.status === 200) {
      expect(after.questions.map(q => [q.prompt, q.position])).toEqual([["Complete replacement", 1]]);
      expect(after.questions[0].options).toEqual([]);
    } else {
      expect(after.questions).toEqual(original.questions);
    }
  }
});

test("TEST-128 refuses an inconsistent draft with responses without deleting data", async () => {
  const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const saved = await prisma.response.create({ data: { surveyId: original.id, respondentId: fixture.student1.id } });
  await prisma.answer.create({ data: { responseId: saved.id, questionId: original.questions[0].id, ratingValue: 4 } });
  const before = await prisma.response.findUniqueOrThrow({ where: { id: saved.id }, include: { answers: true } });
  const owner = await loginAs(app, fixture.owner1.email);
  const result = await owner.put(`/api/owner/surveys/${original.id}/questions`).send({
    expectedUpdatedAt: original.updatedAt.toISOString(),
    questions: [{ prompt: "Replacement", type: "RATING" }]
  });
  expect(result.status).toBe(409);
  expect(result.body.error.code).toBe("DRAFT_HAS_RESPONSES");
  const after = await prisma.survey.findUniqueOrThrow({ where: { id: original.id }, include: {
    questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
  } });
  expect(after).toEqual(original);
  expect(await prisma.response.findUniqueOrThrow({ where: { id: saved.id }, include: { answers: true } })).toEqual(before);
});

test.each([
  { name: "empty", questions: [] },
  { name: "too many", questions: Array.from({ length: 21 }, () => ({ prompt: "Q", type: "RATING" })) },
  { name: "blank prompt", questions: [{ prompt: " ", type: "RATING" }] },
  { name: "long prompt", questions: [{ prompt: "x".repeat(301), type: "RATING" }] },
  { name: "duplicate choices", questions: [{ prompt: "Q", type: "SINGLE_CHOICE", options: ["Yes", " yes "] }] },
  { name: "rating choices", questions: [{ prompt: "Q", type: "RATING", options: ["No"] }] },
  { name: "supplied identifier", questions: [{ id: 1, prompt: "Q", type: "RATING" }] }
])("TEST-122 rejects $name and leaves existing rows intact", async ({ questions }) => {
  const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const owner = await loginAs(app, fixture.owner1.email);
  const result = await owner.put(`/api/owner/surveys/${original.id}/questions`).send({
    expectedUpdatedAt: original.updatedAt.toISOString(), questions
  });
  expect(result.status).toBe(400);
  expect(result.body.error.code).toBe("VALIDATION_ERROR");
  expect(result.body.error.details.length).toBeGreaterThan(0);
  const stored = await prisma.survey.findUniqueOrThrow({ where: { id: original.id }, include: {
    questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
  } });
  expect(stored).toEqual(original);
});

test("TEST-125 concurrent same-token edits produce one winner", async () => {
  const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const owner1 = await loginAs(app, fixture.owner1.email);
  const owner2 = await loginAs(app, fixture.owner1.email);
  const edit = (prompt: string) => ({ expectedUpdatedAt: original.updatedAt.toISOString(), questions: [{ prompt, type: "RATING" }] });
  const [a, b] = await Promise.all([
    owner1.put(`/api/owner/surveys/${original.id}/questions`).send(edit("First")),
    owner2.put(`/api/owner/surveys/${original.id}/questions`).send(edit("Second"))
  ]);
  expect([a.status, b.status].sort()).toEqual([200, 409]);
  expect((a.status === 409 ? a : b).body.error.code).toBe("STALE_SURVEY");
  const stored = await prisma.survey.findUniqueOrThrow({ where: { id: original.id }, include: { questions: true } });
  expect(stored.questions).toHaveLength(1);
  expect(stored.questions[0].prompt).toBe(a.status === 200 ? "First" : "Second");
  expect(stored.statusVersion).toBe(original.statusVersion);
});
