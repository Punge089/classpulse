import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { createApp } from "../../src/app";
import { getPrisma } from "../../src/prisma";
import { loginAs } from "../helpers/auth";
import { makeSurvey, resetDb, seedFixture, type Fixture } from "../helpers/fixture";

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

async function insertResponse(
  surveyId: number,
  respondentId: number,
  questionIds: [number, number],
  ratingValue: number,
  optionId: number
): Promise<void> {
  await prisma.response.create({
    data: {
      surveyId,
      respondentId,
      answers: {
        create: [
          { questionId: questionIds[0], ratingValue },
          { questionId: questionIds[1], optionId }
        ]
      }
    }
  });
}

describe("F-05 owner survey summary", () => {
  test("TEST-34 owner gets aggregates for ratings [4,4,5] and ordered choices", async () => {
    const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    await prisma.enrollment.create({ data: { courseId: f.cpe334.id, userId: f.student3.id } });
    const questionIds: [number, number] = [survey.questions[0].id, survey.questions[1].id];
    const yesId = survey.questions[1].options[0].id;
    await insertResponse(survey.id, f.student1.id, questionIds, 4, yesId);
    await insertResponse(survey.id, f.student2.id, questionIds, 4, yesId);
    await insertResponse(survey.id, f.student3.id, questionIds, 5, yesId);

    const owner = await loginAs(app, "ann.lee@classpulse.test");
    const res = await owner.get("/api/owner/surveys/" + survey.id + "/summary");
    expect(res.status).toBe(200);
    expect(res.body.summary).toMatchObject({
      surveyId: survey.id,
      status: "PUBLISHED",
      responseCount: 3,
      questions: [
        {
          questionId: questionIds[0],
          prompt: survey.questions[0].prompt,
          type: "RATING",
          rating: { average: 4.33, distribution: { "1": 0, "2": 0, "3": 0, "4": 2, "5": 1 } }
        },
        {
          questionId: questionIds[1],
          prompt: survey.questions[1].prompt,
          type: "SINGLE_CHOICE",
          choice: {
            options: [
              { optionId: yesId, label: "Yes", count: 3 },
              { optionId: survey.questions[1].options[1].id, label: "No", count: 0 }
            ]
          }
        }
      ]
    });
    expect(await prisma.response.count({ where: { surveyId: survey.id } })).toBe(3);
  });

  test("TEST-36 empty summary, ownership, role and invalid-id checks", async () => {
    const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    const owner1 = await loginAs(app, "ann.lee@classpulse.test");
    const owner2 = await loginAs(app, "ben.kim@classpulse.test");
    const student = await loginAs(app, "student1@classpulse.test");

    const empty = await owner1.get("/api/owner/surveys/" + survey.id + "/summary");
    expect(empty.status).toBe(200);
    expect(empty.body.summary).toMatchObject({
      surveyId: survey.id,
      status: "PUBLISHED",
      responseCount: 0,
      questions: [
        {
          questionId: survey.questions[0].id,
          rating: { average: null, distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
        },
        {
          questionId: survey.questions[1].id,
          choice: {
            options: [
              { optionId: survey.questions[1].options[0].id, label: "Yes", count: 0 },
              { optionId: survey.questions[1].options[1].id, label: "No", count: 0 }
            ]
          }
        }
      ]
    });

    const notOwned = await owner2.get("/api/owner/surveys/" + survey.id + "/summary");
    expect(notOwned.status).toBe(404);
    expect(notOwned.body.error.code).toBe("NOT_FOUND");
    const wrongRole = await student.get("/api/owner/surveys/" + survey.id + "/summary");
    expect(wrongRole.status).toBe(403);
    expect(wrongRole.body.error.code).toBe("FORBIDDEN");
    for (const id of ["2147483647", "not-a-number"]) {
      const missing = await owner1.get("/api/owner/surveys/" + id + "/summary");
      expect(missing.status).toBe(404);
      expect(missing.body.error.code).toBe("NOT_FOUND");
    }
  });

  test("TEST-37 summary JSON contains no respondent identity or individual answer rows", async () => {
    const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    await insertResponse(
      survey.id,
      f.student1.id,
      [survey.questions[0].id, survey.questions[1].id],
      4,
      survey.questions[1].options[0].id
    );
    const owner = await loginAs(app, "ann.lee@classpulse.test");
    const res = await owner.get("/api/owner/surveys/" + survey.id + "/summary");
    expect(res.status).toBe(200);
    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toMatch(/respondentId|email|fullName|student1@classpulse\.test|Student 1/);
    expect(res.body.summary).not.toHaveProperty("responses");
    for (const question of res.body.summary.questions as Array<Record<string, unknown>>) {
      expect(question).not.toHaveProperty("answers");
    }
  });
});
