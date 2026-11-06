import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { createApp } from "../../src/app";
import { getPrisma } from "../../src/prisma";
import { loginAs } from "../helpers/auth";
import {
  makeSurvey, resetDb, seedFixture, type Fixture, type SurveyWithQuestions
} from "../helpers/fixture";

const app = createApp();
const prisma = getPrisma();
let f: Fixture;

beforeEach(async () => {
  await resetDb();
  f = await seedFixture();
});
afterAll(async () => {
  await prisma.$disconnect();
});

function validAnswers(survey: SurveyWithQuestions) {
  return {
    answers: [
      { questionId: survey.questions[0].id, ratingValue: 4 },
      { questionId: survey.questions[1].id, optionId: survey.questions[1].options[0].id }
    ]
  };
}

describe("F-04 respondent survey access", () => {
  test("TEST-22 student1 lists only published surveys in enrolled courses with hasResponded", async () => {
    const published = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    const responded = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    const draft = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "DRAFT" });
    const otherCourse = await makeSurvey({ course: f.cpe231, owner: f.owner2 });
    const agent = await loginAs(app, "student1@classpulse.test");
    const submitted = await agent.post("/api/surveys/" + responded.id + "/responses").send(validAnswers(responded));
    expect(submitted.status).toBe(201);

    const res = await agent.get("/api/surveys");
    expect(res.status).toBe(200);
    const rows = res.body.surveys as Array<{
      id: number; courseCode: string; status: string; hasResponded: boolean;
    }>;
    expect(rows.map(row => row.id).sort()).toEqual([published.id, responded.id].sort());
    expect(rows.find(row => row.id === published.id)).toMatchObject({
      courseCode: "CPE334", status: "PUBLISHED", hasResponded: false
    });
    expect(rows.find(row => row.id === responded.id)).toMatchObject({
      courseCode: "CPE334", status: "PUBLISHED", hasResponded: true
    });
    expect(rows.map(row => row.id)).not.toContain(draft.id);
    expect(rows.map(row => row.id)).not.toContain(otherCourse.id);
  });

  test("TEST-39 detail is visible only to an enrolled respondent for a published survey", async () => {
    const published = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    const draft = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "DRAFT" });
    const closed = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "CLOSED" });
    const otherCourse = await makeSurvey({ course: f.cpe231, owner: f.owner2 });
    const student = await loginAs(app, "student1@classpulse.test");

    const visible = await student.get("/api/surveys/" + published.id);
    expect(visible.status).toBe(200);
    expect(visible.body.survey).toMatchObject({
      id: published.id, courseCode: "CPE334", status: "PUBLISHED"
    });
    for (const survey of [draft, closed, otherCourse]) {
      const hidden = await student.get("/api/surveys/" + survey.id);
      expect(hidden.status).toBe(404);
      expect(hidden.body.error.code).toBe("NOT_FOUND");
    }
    const nonNumeric = await student.get("/api/surveys/not-a-number");
    expect(nonNumeric.status).toBe(404);
    expect(nonNumeric.body.error.code).toBe("NOT_FOUND");

    const owner = await loginAs(app, "ann.lee@classpulse.test");
    const wrongRole = await owner.get("/api/surveys/" + published.id);
    expect(wrongRole.status).toBe(403);
    expect(wrongRole.body.error.code).toBe("FORBIDDEN");
  });
});

describe("F-04 response submission", () => {
  test("TEST-23 a valid response stores one answer per question and returns the saved answer shape", async () => {
    const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    const agent = await loginAs(app, "student1@classpulse.test");
    const posted = await agent.post("/api/surveys/" + survey.id + "/responses").send(validAnswers(survey));
    expect(posted.status).toBe(201);
    expect(posted.body.response).toMatchObject({ surveyId: survey.id });
    expect(Number.isNaN(Date.parse(posted.body.response.submittedAt))).toBe(false);

    const responseId = posted.body.response.id as number;
    expect(await prisma.response.count({ where: { surveyId: survey.id } })).toBe(1);
    expect(await prisma.answer.count({ where: { responseId } })).toBe(2);

    const fetched = await agent.get("/api/responses/" + responseId);
    expect(fetched.status).toBe(200);
    expect(fetched.body.response).toMatchObject({ id: responseId, surveyId: survey.id });
    const answers = fetched.body.response.answers as Array<Record<string, unknown>>;
    expect(answers).toHaveLength(2);
    expect(answers.find(answer => answer.questionId === survey.questions[0].id)).toMatchObject({
      questionId: survey.questions[0].id,
      prompt: survey.questions[0].prompt,
      type: "RATING",
      ratingValue: 4
    });
    expect(answers.find(answer => answer.questionId === survey.questions[1].id)).toMatchObject({
      questionId: survey.questions[1].id,
      prompt: survey.questions[1].prompt,
      type: "SINGLE_CHOICE",
      optionId: survey.questions[1].options[0].id,
      optionLabel: "Yes"
    });
    expect(JSON.stringify(fetched.body)).not.toMatch(/passwordHash|respondentId|email|fullName|student1@classpulse\.test/);
  });

  test("TEST-24 a sequential duplicate submission returns ALREADY_RESPONDED and stores one response", async () => {
    const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    const agent = await loginAs(app, "student1@classpulse.test");
    const body = validAnswers(survey);
    const first = await agent.post("/api/surveys/" + survey.id + "/responses").send(body);
    const second = await agent.post("/api/surveys/" + survey.id + "/responses").send(body);
    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("ALREADY_RESPONDED");
    expect(await prisma.response.count({ where: { surveyId: survey.id } })).toBe(1);
  });

  test("TEST-25 simultaneous submissions store exactly one response", async () => {
    const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    const agent = await loginAs(app, "student1@classpulse.test");
    const body = validAnswers(survey);
    const [r1, r2] = await Promise.all([
      agent.post("/api/surveys/" + survey.id + "/responses").send(body),
      agent.post("/api/surveys/" + survey.id + "/responses").send(body)
    ]);
    expect([r1.status, r2.status].sort()).toEqual([201, 409]);
    expect(await prisma.response.count({ where: { surveyId: survey.id } })).toBe(1);
  });

  test("TEST-26 closed and draft surveys reject before answer validation; unknown survey is 404", async () => {
    const draft = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "DRAFT" });
    const closed = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "CLOSED" });
    const agent = await loginAs(app, "student1@classpulse.test");
    const draftResult = await agent.post("/api/surveys/" + draft.id + "/responses").send(validAnswers(draft));
    const closedResult = await agent.post("/api/surveys/" + closed.id + "/responses").send(validAnswers(closed));
    const closedInvalid = await agent.post("/api/surveys/" + closed.id + "/responses").send({ answers: "not-an-array" });
    const missing = await agent.post("/api/surveys/2147483647/responses").send({ answers: [] });

    expect([draftResult.status, draftResult.body.error.code]).toEqual([409, "SURVEY_NOT_OPEN"]);
    expect([closedResult.status, closedResult.body.error.code]).toEqual([409, "SURVEY_NOT_OPEN"]);
    expect([closedInvalid.status, closedInvalid.body.error.code]).toEqual([409, "SURVEY_NOT_OPEN"]);
    expect([missing.status, missing.body.error.code]).toEqual([404, "NOT_FOUND"]);
    expect(await prisma.response.count()).toBe(0);
    expect(await prisma.answer.count()).toBe(0);
  });

  test("TEST-27 a non-enrolled student gets NOT_ELIGIBLE before DRAFT status", async () => {
    const draft = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "DRAFT" });
    const student3 = await loginAs(app, "student3@classpulse.test");
    const res = await student3.post("/api/surveys/" + draft.id + "/responses").send(validAnswers(draft));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("NOT_ELIGIBLE");
    expect(await prisma.response.count()).toBe(0);
    expect(await prisma.answer.count()).toBe(0);
  });

  test("TEST-29 rating boundaries accept 1 and 5 and reject 0, 6, decimals and strings", async () => {
    const cases: Array<[number | string, number]> = [
      [1, 201], [5, 201], [0, 400], [6, 400], [2.5, 400], ["3", 400]
    ];
    const agent = await loginAs(app, "student1@classpulse.test");
    for (const [ratingValue, expectedStatus] of cases) {
      const survey = await makeSurvey({
        course: f.cpe334,
        owner: f.owner1,
        questions: [{ prompt: "Rate this course", type: "RATING" }]
      });
      const res = await agent.post("/api/surveys/" + survey.id + "/responses")
        .send({ answers: [{ questionId: survey.questions[0].id, ratingValue }] });
      expect(res.status).toBe(expectedStatus);
      if (expectedStatus === 400) expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(await prisma.response.count({ where: { surveyId: survey.id } }))
        .toBe(expectedStatus === 201 ? 1 : 0);
    }
  });

  test("TEST-30 respondents cannot read another student's response or edit/delete a response", async () => {
    const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    const student1 = await loginAs(app, "student1@classpulse.test");
    const student2 = await loginAs(app, "student2@classpulse.test");
    const posted = await student1.post("/api/surveys/" + survey.id + "/responses").send(validAnswers(survey));
    expect(posted.status).toBe(201);
    const responseId = posted.body.response.id as number;

    const other = await student2.get("/api/responses/" + responseId);
    expect(other.status).toBe(404);
    expect(other.body.error.code).toBe("NOT_FOUND");
    expect(Object.keys(other.body)).toEqual(["error"]);
    expect(JSON.stringify(other.body)).not.toMatch(/ratingValue|optionId|optionLabel|respondentId|student1@classpulse\.test/);

    const update = await student1.put("/api/responses/" + responseId).send({ answers: [] });
    const remove = await student1.delete("/api/responses/" + responseId);
    for (const res of [update, remove]) {
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    }
  });

  test("TEST-31 an owner cannot submit or read a respondent response", async () => {
    const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    const student = await loginAs(app, "student1@classpulse.test");
    const posted = await student.post("/api/surveys/" + survey.id + "/responses").send(validAnswers(survey));
    expect(posted.status).toBe(201);
    const responseId = posted.body.response.id as number;

    const owner = await loginAs(app, "ann.lee@classpulse.test");
    const submit = await owner.post("/api/surveys/" + survey.id + "/responses").send(validAnswers(survey));
    const read = await owner.get("/api/responses/" + responseId);
    for (const res of [submit, read]) {
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    }
    expect(await prisma.response.count({ where: { surveyId: survey.id } })).toBe(1);
  });
});
