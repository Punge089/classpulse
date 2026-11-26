import { afterAll, beforeEach, describe, expect, test } from "vitest";
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

afterAll(async () => { await prisma.$disconnect(); });

const body = (courseId: number, title: string) => ({
  courseId,
  title,
  questions: [{
    prompt: "Rate this class (CP-EX-001 blank title confirmation)",
    type: "RATING",
    required: true
  }]
});

async function counts() {
  return {
    surveys: await prisma.survey.count(),
    questions: await prisma.question.count(),
    options: await prisma.questionOption.count()
  };
}

describe("CP-EX-F01 reported-case regression (AC-11, AC-19, BR-02)", () => {
  test.each([
    { label: "A exact empty input", title: "" },
    { label: "B whitespace-only input", title: " \t\n " }
  ])("$label rejects the otherwise valid owner request without writes", async ({ title }) => {
    // An unrelated valid record makes preservation stronger than an empty-DB check.
    const retained = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
    const owner = await loginAs(app, fixture.owner1.email);
    const beforeCounts = await counts();
    const beforeList = await owner.get("/api/owner/surveys");
    expect(beforeList.status).toBe(200);

    const reply = await owner.post("/api/owner/surveys").send(body(fixture.cpe334.id, title));
    // On the reported source this is 201, not a setup/type/other-field failure.
    expect(reply.status).toBe(400);
    expect(reply.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
      details: expect.arrayContaining([{
        field: "title", message: "Title must be 1 to 120 characters"
      }])
    });
    expect(await counts()).toEqual(beforeCounts);
    const afterList = await owner.get("/api/owner/surveys");
    expect(afterList.status).toBe(200);
    expect(afterList.body).toEqual(beforeList.body);
    expect(await prisma.survey.findUniqueOrThrow({
      where: { id: retained.id },
      include: { questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } } }
    })).toEqual(retained);
  });

  test.each([1, 120])("valid %i-character title still creates and reloads normally", async length => {
    const owner = await loginAs(app, fixture.owner1.email);
    const title = "T".repeat(length);
    const reply = await owner.post("/api/owner/surveys").send(body(fixture.cpe334.id, ` ${title} `));
    expect(reply.status).toBe(201);
    expect(reply.body.survey).toMatchObject({ title, status: "DRAFT", courseId: fixture.cpe334.id });
    const reloaded = await owner.get(`/api/owner/surveys/${reply.body.survey.id}`);
    expect(reloaded.status).toBe(200);
    expect(reloaded.body.survey).toEqual(reply.body.survey);
    expect(reloaded.body.survey.questions).toHaveLength(1);
    expect(reloaded.body.survey.questions[0]).toMatchObject({ type: "RATING", required: true });
    expect(await counts()).toEqual({ surveys: 1, questions: 1, options: 0 });
  });
});
