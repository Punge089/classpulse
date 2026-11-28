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
