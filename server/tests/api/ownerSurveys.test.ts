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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Body = any;

function validBody(courseId: number): Body {
  return {
    courseId,
    title: "Lecture feedback W10",
    description: "How was week 10?",
    questions: [
      { prompt: "Pace of lectures", type: "RATING" },
      { prompt: "Would you recommend it?", type: "SINGLE_CHOICE", options: ["Yes", "No"] }
    ]
  };
}

const ownerAgent = () => loginAs(app, "ann.lee@classpulse.test");
const otherOwnerAgent = () => loginAs(app, "ben.kim@classpulse.test");
const studentAgent = () => loginAs(app, "student1@classpulse.test");
const surveyCount = () => prisma.survey.count();
const statusOf = async (id: number) => (await prisma.survey.findUniqueOrThrow({ where: { id } })).status;

describe("F-03 create a survey", () => {
  test("TEST-10 an owner creates a DRAFT survey with ordered questions and options", async () => {
    const owner = await ownerAgent();
    const res = await owner.post("/api/owner/surveys").send(validBody(f.cpe334.id));
    expect(res.status).toBe(201);
    expect(res.body.survey).toMatchObject({
      courseId: f.cpe334.id, courseCode: "CPE334", title: "Lecture feedback W10",
      description: "How was week 10?", mode: "IDENTIFIED", status: "DRAFT", publishedAt: null, closedAt: null
    });
    expect(res.body.survey.questions.map((q: Body) => [q.position, q.type, q.required, q.prompt])).toEqual([
      [1, "RATING", true, "Pace of lectures"], [2, "SINGLE_CHOICE", true, "Would you recommend it?"]
    ]);
    expect(res.body.survey.questions[0].options).toEqual([]);
    expect(res.body.survey.questions[1].options.map((o: Body) => [o.position, o.label]))
      .toEqual([[1, "Yes"], [2, "No"]]);

    expect(await surveyCount()).toBe(1);
    const stored = await prisma.survey.findFirstOrThrow({
      include: { questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } } }
    });
    expect(stored.ownerId).toBe(f.owner1.id);
    expect(stored.status).toBe("DRAFT");
    expect(stored.questions.map(q => q.position)).toEqual([1, 2]);
    expect(stored.questions[1].options.map(o => o.position)).toEqual([1, 2]);

    const detail = await owner.get("/api/owner/surveys/" + stored.id);
    expect(detail.status).toBe(200);
    expect(detail.body.survey.questions).toEqual(res.body.survey.questions);
  });

  test("TEST-12 invalid bodies are 400 VALIDATION_ERROR with details and store nothing", async () => {
    const owner = await ownerAgent();
    const bad: Body[] = [
      { ...validBody(f.cpe334.id), title: "" },
      { ...validBody(f.cpe334.id), questions: "x" },
      { ...validBody(f.cpe334.id), questions: [] },
      { ...validBody(f.cpe334.id), questions: [{ prompt: "Pick", type: "SINGLE_CHOICE", options: ["Yes"] }] },
      { ...validBody(f.cpe334.id), questions: [{ prompt: "Rate", type: "RATING", options: ["a", "b"] }] },
      { ...validBody(f.cpe334.id), questions: [{ prompt: "Pick", type: "SINGLE_CHOICE", options: ["Yes", " yes "] }] }
    ];
    for (const body of bad) {
      const res = await owner.post("/api/owner/surveys").send(body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.details.length).toBeGreaterThan(0);
      expect(JSON.stringify(res.body)).not.toMatch(/stack/i);
    }
    const raw = await owner.post("/api/owner/surveys").set("Content-Type", "application/json").send("{");
    expect(raw.status).toBe(400);
    expect(raw.body.error.code).toBe("VALIDATION_ERROR");
    expect(JSON.stringify(raw.body)).not.toMatch(/stack/i);
    expect(await surveyCount()).toBe(0);
  });

  test("TEST-13 course ownership (404) is checked before field validation (400)", async () => {
    const owner = await ownerAgent();
    const post = (body: Body) => owner.post("/api/owner/surveys").send(body);

    const a = await post(validBody(f.cpe231.id));
    expect([a.status, a.body.error.code]).toEqual([404, "NOT_FOUND"]);

    const b = await post({ ...validBody(f.cpe231.id), title: "" });
    expect([b.status, b.body.error.code]).toEqual([404, "NOT_FOUND"]);

    const c = await post({ ...validBody(f.cpe334.id), title: "" });
    expect(c.status).toBe(400);
    expect(c.body.error.details.map((d: Body) => d.field)).toContain("title");

    const d = await post({ ...validBody(f.cpe334.id), courseId: "abc", title: "" });
    expect(d.status).toBe(400);
    expect(d.body.error.details.map((x: Body) => x.field)).toContain("courseId");

    const e = await post(validBody(9999));
    expect([e.status, e.body.error.code]).toEqual([404, "NOT_FOUND"]);

    // Extra boundary: an id beyond the database integer range is a 400, never a 500.
    const g = await post({ ...validBody(f.cpe334.id), courseId: 2147483648 });
    expect(g.status).toBe(400);
    expect(g.body.error.details.map((x: Body) => x.field)).toContain("courseId");

    expect(await surveyCount()).toBe(0);
  });
});

describe("F-03 publish and close", () => {
  test("TEST-14 publishing a DRAFT survey makes it PUBLISHED with publishedAt", async () => {
    const draft = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "DRAFT" });
    const owner = await ownerAgent();
    const res = await owner.post(`/api/owner/surveys/${draft.id}/publish`);
    expect(res.status).toBe(200);
    expect(res.body.survey).toMatchObject({ id: draft.id, status: "PUBLISHED", closedAt: null });
    expect(res.body.survey.publishedAt).not.toBeNull();
    const row = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
    expect(row.status).toBe("PUBLISHED");
    expect(row.publishedAt).not.toBeNull();
  });

  test("TEST-16 invalid transitions are 409 INVALID_TRANSITION and leave the status unchanged", async () => {
    const owner = await ownerAgent();
    const published = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "PUBLISHED" });
    const closed = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "CLOSED" });
    const draft = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "DRAFT" });
    const attempts: Array<[number, "publish" | "close", string]> = [
      [published.id, "publish", "PUBLISHED"],
      [closed.id, "publish", "CLOSED"],
      [draft.id, "close", "DRAFT"],
      [closed.id, "close", "CLOSED"]
    ];
    for (const [id, action, before] of attempts) {
      const res = await owner.post(`/api/owner/surveys/${id}/${action}`);
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("INVALID_TRANSITION");
      expect(await statusOf(id)).toBe(before);
    }
  });

  test("TEST-17 closing a PUBLISHED survey makes it CLOSED with closedAt", async () => {
    const published = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "PUBLISHED" });
    const owner = await ownerAgent();
    const res = await owner.post(`/api/owner/surveys/${published.id}/close`);
    expect(res.status).toBe(200);
    expect(res.body.survey).toMatchObject({ id: published.id, status: "CLOSED" });
    expect(res.body.survey.closedAt).not.toBeNull();
    const row = await prisma.survey.findUniqueOrThrow({ where: { id: published.id } });
    expect([row.status, row.closedAt !== null]).toEqual(["CLOSED", true]);
  });
});

describe("F-03 access control", () => {
  test("TEST-18 a respondent gets 403 FORBIDDEN on every owner route and nothing is created", async () => {
    const draft = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "DRAFT" });
    const student = await studentAgent();
    const calls = [
      () => student.get("/api/owner/courses"),
      () => student.get("/api/owner/surveys"),
      () => student.post("/api/owner/surveys").send(validBody(f.cpe334.id)),
      () => student.get(`/api/owner/surveys/${draft.id}`),
      () => student.post(`/api/owner/surveys/${draft.id}/publish`),
      () => student.post(`/api/owner/surveys/${draft.id}/close`)
    ];
    for (const call of calls) {
      const res = await call();
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    }
    expect(await surveyCount()).toBe(1);
    expect(await statusOf(draft.id)).toBe("DRAFT");
  });

  test("TEST-19 another owner gets 404 reading, publishing or closing my survey and nothing changes", async () => {
    const draft = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "DRAFT" });
    // Positive control: the real owner can read it, so the 404s below come from ownership, not a missing route.
    const own = await (await ownerAgent()).get(`/api/owner/surveys/${draft.id}`);
    expect(own.status).toBe(200);
    expect(own.body.survey.id).toBe(draft.id);

    const other = await otherOwnerAgent();
    for (const res of [
      await other.get(`/api/owner/surveys/${draft.id}`),
      await other.post(`/api/owner/surveys/${draft.id}/publish`),
      await other.post(`/api/owner/surveys/${draft.id}/close`)
    ]) {
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    }
    const row = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
    expect([row.status, row.publishedAt, row.closedAt]).toEqual(["DRAFT", null, null]);
    expect((await other.get("/api/owner/surveys/abc")).status).toBe(404);
  });
});

describe("F-03 lists", () => {
  test("TEST-20 the survey list holds only the caller's surveys with their response counts", async () => {
    const mine = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "PUBLISHED" });
    const draft = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "DRAFT" });
    await makeSurvey({ course: f.cpe231, owner: f.owner2, status: "PUBLISHED" });
    await prisma.response.create({ data: { surveyId: mine.id, respondentId: f.student1.id } });

    const owner = await ownerAgent();
    const res = await owner.get("/api/owner/surveys");
    expect(res.status).toBe(200);
    expect(res.body.surveys).toHaveLength(2);
    const byId = new Map<number, Body>(res.body.surveys.map((s: Body) => [s.id, s]));
    expect([...byId.keys()].sort()).toEqual([mine.id, draft.id].sort());
    expect(byId.get(mine.id)).toEqual({
      id: mine.id, title: "Fixture survey", status: "PUBLISHED", courseCode: "CPE334", responseCount: 1
    });
    expect(byId.get(draft.id)).toMatchObject({ status: "DRAFT", responseCount: 0 });
  });

  test("TEST-20 the course list holds only the caller's courses", async () => {
    const owner = await ownerAgent();
    const res = await owner.get("/api/owner/courses");
    expect(res.status).toBe(200);
    expect(res.body.courses).toEqual([{ id: f.cpe334.id, code: "CPE334", title: f.cpe334.title }]);
  });
});
