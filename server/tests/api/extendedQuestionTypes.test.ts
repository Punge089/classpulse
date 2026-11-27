import request from "supertest";
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

const owner = () => loginAs(app, "ann.lee@classpulse.test");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Body = any;

function validBody(questions: Body[]) {
  return {
    courseId: f.cpe334.id,
    title: "F-07 owner-create test",
    description: "Synthetic F-07 test fixture",
    questions
  };
}

describe("F-07 owner creation independent slice", () => {
  test("TEST-140 an owner creates a TEXT question with no options", async () => {
    const agent = await owner();
    const response = await agent.post("/api/owner/surveys").send(validBody([
      { prompt: "What helped you learn?", type: "TEXT" }
    ]));

    expect(response.status).toBe(201);
    expect(response.body.survey).toMatchObject({
      courseId: f.cpe334.id,
      status: "DRAFT",
      questions: [{ position: 1, prompt: "What helped you learn?", type: "TEXT", options: [] }]
    });

    const stored = await prisma.survey.findFirstOrThrow({
      include: { questions: { orderBy: { position: "asc" }, include: { options: true } } }
    });
    expect(stored.questions.map(question => [question.type, question.options.length])).toEqual([["TEXT", 0]]);
  });

  test("TEST-140 an owner creates a MULTI_CHOICE question with persisted option order", async () => {
    const agent = await owner();
    const response = await agent.post("/api/owner/surveys").send(validBody([
      { prompt: "Which format helped?", type: "MULTI_CHOICE", options: ["Worked examples", "Discussion", "Practice"] }
    ]));

    expect(response.status).toBe(201);
    expect(response.body.survey.questions).toEqual([
      expect.objectContaining({
        position: 1,
        prompt: "Which format helped?",
        type: "MULTI_CHOICE",
        options: [
          expect.objectContaining({ position: 1, label: "Worked examples" }),
          expect.objectContaining({ position: 2, label: "Discussion" }),
          expect.objectContaining({ position: 3, label: "Practice" })
        ]
      })
    ]);

    const stored = await prisma.survey.findFirstOrThrow({
      include: { questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } } }
    });
    expect(stored.questions.map(question => [question.type, question.options.map(option => option.label)])).toEqual([
      ["MULTI_CHOICE", ["Worked examples", "Discussion", "Practice"]]
    ]);
  });

  test("TEST-141 supports 2/6 multi-choice options and rejects case-folded duplicates without a survey row", async () => {
    const agent = await owner();
    for (const count of [2, 6]) {
      const options = Array.from({ length: count }, (_value, index) => `Choice ${index + 1}`);
      const result = await agent.post("/api/owner/surveys").send(validBody([
        { prompt: `Pick ${count}`, type: "MULTI_CHOICE", options }
      ]));
      expect(result.status).toBe(201);
      expect(result.body.survey.questions[0].options.map((option: { label: string }) => option.label)).toEqual(options);
    }
    const before = await prisma.survey.count();
    const invalid = await agent.post("/api/owner/surveys").send(validBody([
      { prompt: "Duplicate", type: "MULTI_CHOICE", options: ["Yes", " yes "] }
    ]));
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.details.map((detail: { field: string }) => detail.field)).toContain("questions[0].options");
    expect(await prisma.survey.count()).toBe(before);
  });
});

describe("F-07 TEST-145/146 mixed answers and own history", () => {
  test("submits text and multiple selections atomically and returns them in own detail", async () => {
    const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "PUBLISHED" });
    const text = await prisma.question.create({ data: {
      surveyId: survey.id, position: 3, prompt: "What helped?", type: "TEXT", required: true
    } });
    const multi = await prisma.question.create({ data: {
      surveyId: survey.id, position: 4, prompt: "Which formats?", type: "MULTI_CHOICE", required: true,
      options: { create: [{ position: 1, label: "Practice" }, { position: 2, label: "Examples" }, { position: 3, label: "Discussion" }] }
    } });
    const choices = await prisma.questionOption.findMany({ where: { questionId: multi.id }, orderBy: { position: "asc" } });
    const student = await loginAs(app, "student1@classpulse.test");
    const submitted = await student.post(`/api/surveys/${survey.id}/responses`).send({ answers: [
      { questionId: survey.questions[0].id, ratingValue: 5 },
      { questionId: survey.questions[1].id, optionId: survey.questions[1].options[0].id },
      { questionId: text.id, textValue: "Helpful practice" },
      { questionId: multi.id, optionIds: [choices[2].id, choices[0].id] }
    ] });
    expect(submitted.status).toBe(201);
    const stored = await prisma.response.findUniqueOrThrow({ where: { id: submitted.body.response.id }, include: { answers: true } });
    expect(stored.answers).toHaveLength(4);
    expect((stored.answers.find(answer => answer.questionId === text.id) as any).textValue).toBe("Helpful practice");
    const studentHistory = await student.get(`/api/responses/${stored.id}`);
    expect(studentHistory.status).toBe(200);
    expect(studentHistory.body.response.answers).toContainEqual(expect.objectContaining({
      questionId: text.id, prompt: "What helped?", type: "TEXT", textValue: "Helpful practice"
    }));
    expect(studentHistory.body.response.answers).toContainEqual(expect.objectContaining({
      questionId: multi.id, prompt: "Which formats?", type: "MULTI_CHOICE", selectedOptions: [
        { optionId: choices[0].id, label: "Practice" }, { optionId: choices[2].id, label: "Discussion" }
      ]
    }));
    expect(JSON.stringify(studentHistory.body)).not.toMatch(/respondentId|email|rawAnswerId/);
    const duplicate = await student.post(`/api/surveys/${survey.id}/responses`).send({ answers: [
      { questionId: survey.questions[0].id, ratingValue: 5 },
      { questionId: survey.questions[1].id, optionId: survey.questions[1].options[0].id },
      { questionId: text.id, textValue: "Helpful practice" },
      { questionId: multi.id, optionIds: [choices[0].id, choices[2].id] }
    ] });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("ALREADY_RESPONDED");
    expect(await prisma.response.count({ where: { surveyId: survey.id, respondentId: f.student1.id } })).toBe(1);
  });

  test("rejects an invalid multi-choice answer without creating a response or partial answers", async () => {
    const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "PUBLISHED" });
    const text = await prisma.question.create({ data: {
      surveyId: survey.id, position: 3, prompt: "What helped?", type: "TEXT", required: true
    } });
    const multi = await prisma.question.create({ data: {
      surveyId: survey.id, position: 4, prompt: "Which formats?", type: "MULTI_CHOICE", required: true,
      options: { create: [{ position: 1, label: "Practice" }, { position: 2, label: "Examples" }] }
    } });
    const [practice, examples] = await prisma.questionOption.findMany({ where: { questionId: multi.id }, orderBy: { position: "asc" } });
    const student = await loginAs(app, "student1@classpulse.test");
    const rejected = await student.post(`/api/surveys/${survey.id}/responses`).send({ answers: [
      { questionId: survey.questions[0].id, ratingValue: 4 },
      { questionId: survey.questions[1].id, optionId: survey.questions[1].options[0].id },
      { questionId: text.id, textValue: "Useful" },
      { questionId: multi.id, optionIds: [practice.id, practice.id] }
    ] });
    expect(rejected.status).toBe(400);
    expect(rejected.body.error.details.map((detail: { field: string }) => detail.field)).toContain("answers[3].optionIds");
    expect(await prisma.response.count({ where: { surveyId: survey.id, respondentId: f.student1.id } })).toBe(0);
    expect(examples.id).not.toBe(practice.id);
  });
});
