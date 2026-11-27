import request from "supertest";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { createApp } from "../../src/app";
import { getPrisma } from "../../src/prisma";
import { loginAs } from "../helpers/auth";
import { resetDb, seedFixture, type Fixture } from "../helpers/fixture";

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
    const response = await owner().post("/api/owner/surveys").send(validBody([
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
    const response = await owner().post("/api/owner/surveys").send(validBody([
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
});
