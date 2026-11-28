import request from "supertest";
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

test("TEST-208 reports current eligibility separately from historical responses", async () => {
  const survey = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "PUBLISHED" });
  const courseId = fixture.cpe334.id;
  await prisma.enrollment.create({ data: { courseId, userId: fixture.student3.id } });
  const respondent = await loginAs(app, fixture.student1.email);
  const [rating, choice] = survey.questions;
  const submitted = await respondent.post(`/api/surveys/${survey.id}/responses`).send({ answers: [
    { questionId: rating.id, ratingValue: 4 },
    { questionId: choice.id, optionId: choice.options[0].id }
  ] });
  expect(submitted.status).toBe(201);

  const owner = await loginAs(app, fixture.owner1.email);
  const path = `/api/owner/surveys/${survey.id}/summary`;
  const threeEligible = await owner.get(path);
  expect(threeEligible.status).toBe(200);
  expect(threeEligible.body.summary.responseCount).toBe(1);
  expect(threeEligible.body.summary.responseRate).toEqual({ respondedEligible: 1, eligible: 3, percent: 33.33 });

  await prisma.enrollment.deleteMany({ where: { courseId, userId: fixture.student1.id } });
  const noEligibleRespondentsAnswered = await owner.get(path);
  expect(noEligibleRespondentsAnswered.status).toBe(200);
  expect(noEligibleRespondentsAnswered.body.summary.responseCount).toBe(1);
  expect(noEligibleRespondentsAnswered.body.summary.responseRate).toEqual({ respondedEligible: 0, eligible: 2, percent: 0 });

  await prisma.enrollment.deleteMany({ where: { courseId } });
  const emptyRoster = await owner.get(path);
  expect(emptyRoster.status).toBe(200);
  expect(emptyRoster.body.summary.responseCount).toBe(1);
  expect(emptyRoster.body.summary.responseRate).toEqual({ respondedEligible: 0, eligible: 0, percent: null });
  expect(await prisma.response.count({ where: { surveyId: survey.id } })).toBe(1);
});

test("TEST-204 preserves role and ownership denials before validating section targets", async () => {
  const draft = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const path = `/api/owner/surveys/${draft.id}/sections`;
  const respondent = await loginAs(app, fixture.student1.email);
  const otherOwner = await loginAs(app, fixture.owner2.email);
  const malformed = { sectionIds: [0], expectedUpdatedAt: "invalid" };
  const before = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });

  const unauthenticated = await request(app).put(path).send(malformed);
  expect([unauthenticated.status, unauthenticated.body.error.code]).toEqual([401, "UNAUTHENTICATED"]);
  const wrongRole = await respondent.put(path).send(malformed);
  expect([wrongRole.status, wrongRole.body.error.code]).toEqual([403, "FORBIDDEN"]);
  const foreign = await otherOwner.put(path).send(malformed);
  const missing = await otherOwner.put("/api/owner/surveys/2147483647/sections").send(malformed);
  expect([foreign.status, missing.status]).toEqual([404, 404]);
  expect(foreign.body).toEqual(missing.body);
  expect(await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } })).toEqual(before);
});

test("TEST-201/205/206 restricts sections and preserves the section captured with a response", async () => {
  const courseId = fixture.cpe334.id;
  const [alpha, beta, foreign] = await Promise.all([
    prisma.courseSection.create({ data: { courseId, code: "A", label: "Alpha" } }),
    prisma.courseSection.create({ data: { courseId, code: "B", label: "Beta" } }),
    prisma.courseSection.create({ data: { courseId: fixture.cpe231.id, code: "A", label: "Different course" } })
  ]);
  const assign = (userId: number, sectionId: number) => prisma.$executeRaw`
    UPDATE "Enrollment" SET "sectionId" = ${sectionId} WHERE "courseId" = ${courseId} AND "userId" = ${userId}`;
  await assign(fixture.student1.id, alpha.id);
  await assign(fixture.student2.id, beta.id);
  const draft = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const owner = await loginAs(app, fixture.owner1.email);
  const target = `/api/owner/surveys/${draft.id}`;
  const ownedCourses = await owner.get("/api/owner/courses");
  expect(ownedCourses.body.courses).toEqual([{
    id: courseId, code: fixture.cpe334.code, title: fixture.cpe334.title,
    sections: [{ id: alpha.id, code: "A", label: "Alpha" }, { id: beta.id, code: "B", label: "Beta" }]
  }]);

  const changeAudience = (sectionIds: number[]) => owner.put(`${target}/sections`).send({
    sectionIds, expectedUpdatedAt: draft.updatedAt.toISOString()
  });
  const invalid = await changeAudience([foreign.id]);
  expect([invalid.status, invalid.body.error.code]).toEqual([400, "VALIDATION_ERROR"]);
  expect(invalid.text).not.toContain(foreign.label);
  const configured = await changeAudience([alpha.id]);
  expect(configured.status).toBe(200);
  expect(configured.body.survey.sectionIds).toEqual([alpha.id]);
  const published = await owner.post(`${target}/publish`);
  expect(published.status).toBe(200);
  expect(published.body.survey.sectionIds).toEqual([alpha.id]);

  const eligible = await loginAs(app, fixture.student1.email);
  const ineligible = await loginAs(app, fixture.student2.email);
  const survey = `/api/surveys/${draft.id}`;
  expect((await eligible.get("/api/surveys")).body.surveys.map((row: { id: number }) => row.id)).toContain(draft.id);
  expect((await ineligible.get("/api/surveys")).body.surveys.map((row: { id: number }) => row.id)).not.toContain(draft.id);
  expect((await ineligible.get(survey)).status).toBe(404);
  const [rating, choice] = draft.questions;
  const body = { answers: [
    { questionId: rating.id, ratingValue: 3 },
    { questionId: choice.id, optionId: choice.options[0].id }
  ] };
  const rejected = await ineligible.post(`${survey}/responses`).send(body);
  expect([rejected.status, rejected.body.error.code]).toEqual([403, "NOT_ELIGIBLE"]);
  const saved = await eligible.post(`${survey}/responses`).send(body);
  expect(saved.status).toBe(201);

  await assign(fixture.student1.id, beta.id);
  expect((await eligible.get(survey)).status).toBe(404);
  expect((await eligible.get(`/api/responses/${saved.body.response.id}`)).status).toBe(200);
  expect(await prisma.response.findUniqueOrThrow({ where: { id: saved.body.response.id } }))
    .toMatchObject({ sectionIdAtSubmission: alpha.id });
  const summary = await owner.get(`${target}/summary`);
  expect(summary.body.summary).toMatchObject({
    responseCount: 1, responseRate: { respondedEligible: 0, eligible: 0, percent: null }
  });
});

test("TEST-202/203 atomic audience writes preserve targets and reject a same-token loser", async () => {
  const courseId = fixture.cpe334.id;
  const [alpha, beta, foreign] = await Promise.all([
    prisma.courseSection.create({ data: { courseId, code: "A", label: "Alpha" } }),
    prisma.courseSection.create({ data: { courseId, code: "B", label: "Beta" } }),
    prisma.courseSection.create({ data: { courseId: fixture.cpe231.id, code: "A", label: "Foreign section" } })
  ]);
  const draft = await makeSurvey({ course: fixture.cpe334, owner: fixture.owner1, status: "DRAFT" });
  const owner = await loginAs(app, fixture.owner1.email);
  const second = await loginAs(app, fixture.owner1.email);
  const surveyPath = `/api/owner/surveys/${draft.id}`;
  const path = `${surveyPath}/sections`;
  const payload = (sectionIds: number[], expectedUpdatedAt = draft.updatedAt.toISOString()) => ({ sectionIds, expectedUpdatedAt });
  const [left, right] = await Promise.all([
    owner.put(path).send(payload([alpha.id])), second.put(path).send(payload([beta.id]))
  ]);
  expect([left.status, right.status].sort()).toEqual([200, 409]);
  const winner = left.status === 200 ? left : right;
  const loser = left.status === 409 ? left : right;
  expect(loser.body.error.code).toBe("STALE_SURVEY");
  const { updatedAt, sectionIds } = winner.body.survey;
  expect(Date.parse(updatedAt)).toBeGreaterThan(draft.updatedAt.getTime());
  expect(winner.body.survey.statusVersion).toBe(draft.statusVersion);

  const readback = () => prisma.survey.findUniqueOrThrow({
    where: { id: draft.id }, include: { sectionTargets: { orderBy: { sectionId: "asc" } } }
  });
  const saved = await readback();
  expect(saved.sectionTargets.map(target => target.sectionId)).toEqual(sectionIds);
  const invalid = [
    payload([alpha.id, alpha.id], updatedAt),
    payload([2147483647], updatedAt),
    payload([foreign.id], updatedAt),
    payload([alpha.id], "2026-11-28T14:00:00+07:00"),
    { ...payload([alpha.id], updatedAt), extra: true }
  ];
  for (const body of invalid) {
    const denied = await owner.put(path).send(body);
    expect([denied.status, denied.body.error.code]).toEqual([400, "VALIDATION_ERROR"]);
    expect(denied.text).not.toContain(foreign.label);
  }
  expect(await readback()).toEqual(saved);

  await prisma.$executeRawUnsafe(`CREATE FUNCTION f10_test_target_fault() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'fixture-only insert failure'; END;
  $$`);
  try {
    await prisma.$executeRawUnsafe(`CREATE TRIGGER f10_test_target_fault BEFORE INSERT ON "SurveySection"
      FOR EACH ROW EXECUTE FUNCTION f10_test_target_fault()`);
    const failed = await owner.put(path).send(payload([alpha.id, beta.id], updatedAt));
    expect([failed.status, failed.body.error.code]).toEqual([500, "INTERNAL_ERROR"]);
    expect(failed.text).not.toContain("fixture-only insert failure");
    expect(await readback()).toEqual(saved);
    expect(await prisma.surveyLifecycleEvent.count({ where: { surveyId: draft.id } })).toBe(0);
  } finally {
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS f10_test_target_fault ON "SurveySection"');
    await prisma.$executeRawUnsafe("DROP FUNCTION f10_test_target_fault()");
  }

  const published = await owner.post(`${surveyPath}/publish`);
  expect(published.status).toBe(200);
  const forbidden = await owner.put(path).send(payload([], published.body.survey.updatedAt));
  expect([forbidden.status, forbidden.body.error.code]).toEqual([409, "INVALID_TRANSITION"]);
  expect((await readback()).sectionTargets.map(target => target.sectionId)).toEqual(sectionIds);
});

test("TEST-213 preserves the owner aggregate at 500 responses and 20 questions", async () => {
  const course = fixture.cpe334;
  const owner = await loginAs(app, fixture.owner1.email);
  const survey = await makeSurvey({
    owner: fixture.owner1,
    course,
    questions: [
      ...Array.from({ length: 10 }, (_, index) => ({ type: "RATING" as const, prompt: `Rating ${index + 1}` })),
      ...Array.from({ length: 9 }, (_, index) => ({
        type: "SINGLE_CHOICE" as const, prompt: `Choice ${index + 1}`, options: ["Yes", "No"]
      })),
      { type: "MULTI_CHOICE", prompt: "Select all that apply", options: ["Practice", "Examples"] }
    ]
  });
  const members = await prisma.user.createManyAndReturn({
    data: Array.from({ length: 500 }, (_, index) => ({
      email: `f10-scale-${index}@classpulse.test`, fullName: "Synthetic respondent",
      role: "RESPONDENT" as const, passwordHash: "unused-test-value"
    })),
    select: { id: true }
  });
  await prisma.enrollment.deleteMany({ where: { courseId: course.id } });
  await prisma.enrollment.createMany({ data: members.map(member => ({ courseId: course.id, userId: member.id })) });
  const responses = await prisma.response.createManyAndReturn({
    data: members.map(member => ({ surveyId: survey.id, respondentId: member.id })),
    select: { id: true }
  });
  await prisma.answer.createMany({
    data: responses.flatMap(response => survey.questions.map(question => ({
      responseId: response.id,
      questionId: question.id,
      ratingValue: question.type === "RATING" ? 4 : null,
      optionId: question.type === "SINGLE_CHOICE" ? question.options[0].id : null
    })))
  });
  const multiQuestion = survey.questions[19];
  const multiAnswers = await prisma.answer.findMany({
    where: { questionId: multiQuestion.id }, orderBy: { id: "asc" }, select: { id: true }
  });
  await prisma.answerSelectedOption.createMany({
    data: multiAnswers.flatMap((answer, index) => multiQuestion.options.slice(0, index < 250 ? 2 : 1).map(option => ({
      answerId: answer.id, questionId: multiQuestion.id, optionId: option.id
    })))
  });

  const result = await owner.get(`/api/owner/surveys/${survey.id}/summary`);
  expect(result.status).toBe(200);
  expect(result.body.summary).toMatchObject({
    responseCount: 500, responseRate: { respondedEligible: 500, eligible: 500, percent: 100 }
  });
  expect(result.body.summary.questions).toHaveLength(20);
  expect(result.body.summary.questions[0]).toMatchObject({
    type: "RATING", rating: { average: 4, distribution: { "4": 500 } }
  });
  expect(result.body.summary.questions[10]).toMatchObject({
    type: "SINGLE_CHOICE", choice: { options: [{ count: 500 }, { count: 0 }] }
  });
  expect(result.body.summary.questions[19]).toMatchObject({
    type: "MULTI_CHOICE", multiChoice: { answeredCount: 500, options: [{ count: 500 }, { count: 250 }] }
  });
}, 30_000);
