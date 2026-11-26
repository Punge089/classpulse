import { afterAll, beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import { getPrisma } from "../../src/prisma";
import { loginAs } from "../helpers/auth";
import { makeSurvey, resetDb, seedFixture, type Fixture, type SurveyWithQuestions } from "../helpers/fixture";

const app = createApp();
const prisma = getPrisma();
let f: Fixture;
beforeEach(async () => { await resetDb(); f = await seedFixture(); });
afterAll(async () => { await prisma.$disconnect(); });

function answers(survey: SurveyWithQuestions) {
  return { answers: [
    { questionId: survey.questions[0].id, ratingValue: 4 },
    { questionId: survey.questions[1].id, optionId: survey.questions[1].options[0].id }
  ] };
}
async function saved(student = f.student1, status: "PUBLISHED" | "CLOSED" = "PUBLISHED", title = "History survey", submittedAt = new Date()) {
  const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1, status });
  const named = await prisma.survey.update({ where: { id: survey.id }, data: { title } });
  const response = await prisma.response.create({ data: { surveyId: survey.id, respondentId: student.id, submittedAt } });
  return { survey: named, response };
}
const cursor = (submittedAt: Date, id: number) => Buffer.from(JSON.stringify({ submittedAt: submittedAt.toISOString(), id })).toString("base64url");
const fields = (res: { body: { error: { details?: Array<{ field: string }> } } }) => (res.body.error.details ?? []).map(item => item.field);

describe("Sprint 2 F-09 response history API", () => {
  test("TEST-160 history route resolves before the numeric detail route", async () => {
    await saved(); await saved();
    const student = await loginAs(app, "student1@classpulse.test");
    const result = await student.get("/api/responses/mine");
    expect(result.status).toBe(200);
    expect(result.body.responses).toHaveLength(2);
  });

  test("TEST-161 every cursor page is filtered to the authenticated respondent", async () => {
    const base = Date.parse("2026-11-20T00:00:00.000Z");
    for (let i = 0; i < 24; i++) {
      await saved(f.student1, "PUBLISHED", `A-${i}`, new Date(base + i * 1000));
      if (i % 3 === 0) await saved(f.student2, "PUBLISHED", `PRIVATE-B-${i}`, new Date(base + i * 1000 + 500));
    }
    const student = await loginAs(app, "student1@classpulse.test");
    let path = "/api/responses/mine?limit=5";
    const ids: number[] = [];
    for (let page = 0; page < 8 && path; page++) {
      const result = await student.get(path);
      expect(result.status).toBe(200);
      expect(JSON.stringify(result.body)).not.toMatch(/PRIVATE-B|respondentId/);
      ids.push(...result.body.responses.map((item: { id: number }) => item.id));
      path = result.body.nextCursor ? `/api/responses/mine?limit=5&cursor=${encodeURIComponent(result.body.nextCursor)}` : "";
    }
    expect(ids).toHaveLength(24);
    expect(new Set(ids).size).toBe(24);
    const otherIds = (await prisma.response.findMany({ where: { respondentId: f.student2.id }, select: { id: true } })).map(row => row.id);
    expect(ids.some(id => otherIds.includes(id))).toBe(false);
  });

  test("TEST-162 closed survey history survives unenrollment while new submission is forbidden", async () => {
    const prior = await saved(f.student1, "CLOSED", "Saved closed history");
    await prisma.enrollment.delete({ where: { courseId_userId: { courseId: f.cpe334.id, userId: f.student1.id } } });
    const student = await loginAs(app, "student1@classpulse.test");
    const list = await student.get("/api/responses/mine");
    expect(list.status).toBe(200);
    expect(list.body.responses).toContainEqual(expect.objectContaining({ id: prior.response.id, surveyTitle: "Saved closed history", surveyStatus: "CLOSED" }));
    const detail = await student.get(`/api/responses/${prior.response.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.response.id).toBe(prior.response.id);
    const newSurvey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
    const submitted = await student.post(`/api/surveys/${newSurvey.id}/responses`).send(answers(newSurvey));
    expect([submitted.status, submitted.body.error.code]).toEqual([403, "NOT_ELIGIBLE"]);
  });

  test("TEST-163 and TEST-167 order equal timestamps by descending ID across a page boundary", async () => {
    const time = new Date("2026-11-20T10:00:00.000Z");
    const created = [];
    for (let i = 0; i < 4; i++) created.push(await saved(f.student1, "PUBLISHED", `Tie-${i}`, time));
    const student = await loginAs(app, "student1@classpulse.test");
    const first = await student.get("/api/responses/mine?limit=2");
    expect(first.status).toBe(200);
    const second = await student.get(`/api/responses/mine?limit=2&cursor=${encodeURIComponent(first.body.nextCursor)}`);
    expect(second.status).toBe(200);
    const got = [...first.body.responses, ...second.body.responses].map((item: { id: number }) => item.id);
    expect(got).toEqual(created.map(item => item.response.id).reverse());
    expect(new Set(got).size).toBe(4);
  });

  test("TEST-164 defaults to 20 and TEST-169 sets nextCursor only when another row exists", async () => {
    for (let i = 0; i < 21; i++) await saved(f.student1, "PUBLISHED", `Default-${i}`, new Date(Date.now() + i));
    const student = await loginAs(app, "student1@classpulse.test");
    const first = await student.get("/api/responses/mine");
    expect(first.status).toBe(200);
    expect(first.body.responses).toHaveLength(20);
    expect(first.body.nextCursor).toEqual(expect.any(String));
    const last = await student.get(`/api/responses/mine?limit=20&cursor=${encodeURIComponent(first.body.nextCursor)}`);
    expect(last.status).toBe(200);
    expect(last.body.responses).toHaveLength(1);
    expect(last.body.nextCursor).toBeNull();
  });

  test("TEST-165 accepts boundary limits and rejects exact invalid query forms", async () => {
    for (let i = 0; i < 51; i++) await saved(f.student1, "PUBLISHED", `Limit-${i}`, new Date(Date.now() + i));
    const student = await loginAs(app, "student1@classpulse.test");
    for (const [limit, count] of [["1", 1], ["50", 50]] as const) {
      const accepted = await student.get(`/api/responses/mine?limit=${limit}`);
      expect(accepted.status).toBe(200); expect(accepted.body.responses).toHaveLength(count);
    }
    const invalid = ["0", "51", "-1", "1.5", "abc", "01", "+1", "1e1", "%20", "limit=1&limit=2", "limit%5B%5D=1", "other=1", "cursor=%"];
    for (const query of invalid) {
      const result = await student.get(`/api/responses/mine?${query}`);
      expect(result.status).toBe(400);
      expect(result.body.error.code).toBe("VALIDATION_ERROR");
      expect(fields(result)).toContain(query.includes("cursor") ? "cursor" : "limit");
      expect(result.body).not.toHaveProperty("responses");
    }
  });

  test("TEST-166 a valid foreign-position cursor never grants access or creates gaps", async () => {
    const firstTime = new Date("2026-11-21T00:00:00.000Z");
    const owned = [];
    for (let i = 0; i < 6; i++) owned.push(await saved(f.student1, "PUBLISHED", `Owned-${i}`, new Date(firstTime.getTime() - i * 1000)));
    const foreign = await saved(f.student2, "PUBLISHED", "Secret foreign row", new Date(firstTime.getTime() - 2500));
    const student = await loginAs(app, "student1@classpulse.test");
    const foreignPosition = cursor(foreign.response.submittedAt, foreign.response.id);
    const atPosition = await student.get(`/api/responses/mine?limit=20&cursor=${encodeURIComponent(foreignPosition)}`);
    expect(atPosition.status).toBe(200);
    expect(JSON.stringify(atPosition.body)).not.toMatch(/Secret foreign row|PRIVATE-B/);
    expect(atPosition.body.responses.map((row: { id: number }) => row.id)).not.toContain(foreign.response.id);
    const collected = [];
    let next = "/api/responses/mine?limit=2";
    while (next) {
      const page = await student.get(next);
      collected.push(...page.body.responses.map((row: { id: number }) => row.id));
      next = page.body.nextCursor ? `/api/responses/mine?limit=2&cursor=${encodeURIComponent(page.body.nextCursor)}` : "";
    }
    expect(collected.sort((a: number, b: number) => a - b)).toEqual(owned.map(item => item.response.id).sort((a, b) => a - b));
  });

  test("TEST-168 adding a newer response after page one does not shift the continuation", async () => {
    for (let i = 0; i < 5; i++) await saved(f.student1, "PUBLISHED", `Stable-${i}`, new Date(Date.now() - i * 1000));
    const student = await loginAs(app, "student1@classpulse.test");
    const first = await student.get("/api/responses/mine?limit=2");
    await saved(f.student1, "PUBLISHED", "Arrived later", new Date(Date.now() + 60_000));
    expect(first.status).toBe(200);
    const pageTwo = await student.get(`/api/responses/mine?limit=2&cursor=${encodeURIComponent(first.body.nextCursor)}`);
    expect(pageTwo.status).toBe(200);
    const ids = [...first.body.responses, ...pageTwo.body.responses].map((row: { id: number }) => row.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(JSON.stringify(pageTwo.body)).not.toContain("Arrived later");
  });

  test("TEST-170 rejects malformed, noncanonical, out-of-range, and oversized cursors", async () => {
    const student = await loginAs(app, "student1@classpulse.test");
    const payloads = ["{", "{}", JSON.stringify({ submittedAt: "2026-11-20T00:00:00Z", id: 1 }), JSON.stringify({ submittedAt: "2026-11-20T00:00:00.000+00:00", id: 1 }), JSON.stringify({ submittedAt: "2026-02-30T00:00:00.000Z", id: 1 }), JSON.stringify({ submittedAt: "2026-11-20T00:00:00.000Z", id: 0 }), JSON.stringify({ submittedAt: "2026-11-20T00:00:00.000Z", id: -1 }), JSON.stringify({ submittedAt: "2026-11-20T00:00:00.000Z", id: 2147483648 }), JSON.stringify({ submittedAt: "2026-11-20T00:00:00.000Z", id: 1.5 }), JSON.stringify({ submittedAt: "2026-11-20T00:00:00.000Z", id: "1" }), JSON.stringify({ submittedAt: "2026-11-20T00:00:00.000Z", id: 1, extra: true })];
    const invalid = ["%", "not-base64!", Buffer.from(payloads[0]).toString("base64url") + "=", ...payloads.map(value => Buffer.from(value).toString("base64url")), "a".repeat(257)];
    for (const value of invalid) {
      const result = await student.get(`/api/responses/mine?cursor=${encodeURIComponent(value)}`);
      expect(result.status).toBe(400);
      expect(result.body.error.code).toBe("VALIDATION_ERROR");
      expect(fields(result)).toContain("cursor");
      expect(result.body).not.toHaveProperty("responses");
    }
  });

  test("TEST-171 empty history is an empty 200 page", async () => {
    const student = await loginAs(app, "student1@classpulse.test");
    const result = await student.get("/api/responses/mine");
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ responses: [], nextCursor: null });
  });

  test("TEST-172 list projection includes survey/course metadata but no answer content", async () => {
    const prior = await saved();
    await prisma.answer.create({ data: { responseId: prior.response.id, questionId: prior.survey.questions[0].id, ratingValue: 5 } });
    const student = await loginAs(app, "student1@classpulse.test");
    const result = await student.get("/api/responses/mine");
    expect(result.status).toBe(200);
    expect(result.body.responses[0]).toMatchObject({ id: prior.response.id, surveyId: prior.survey.id, surveyTitle: "History survey", surveyStatus: "PUBLISHED", courseCode: "CPE334", courseTitle: f.cpe334.title, submittedAt: prior.response.submittedAt.toISOString() });
    expect(JSON.stringify(result.body)).not.toMatch(/ratingValue|optionId|answers|respondentId/);
  });

  test("TEST-173 unauthenticated errors take precedence over malformed query input", async () => {
    const result = await request(app).get("/api/responses/mine?limit=0");
    expect(result.status).toBe(401);
    expect(result.body.error.code).toBe("UNAUTHENTICATED");
    expect(result.body).not.toHaveProperty("responses");
  });

  test("TEST-174 owner errors take precedence over malformed query input", async () => {
    const owner = await loginAs(app, "ann.lee@classpulse.test");
    const result = await owner.get("/api/responses/mine?cursor=%");
    expect(result.status).toBe(403);
    expect(result.body.error.code).toBe("FORBIDDEN");
    expect(result.body).not.toHaveProperty("responses");
  });

  test("TEST-175 own detail preserves answers in question position order", async () => {
    const prior = await saved();
    const second = prior.survey.questions[1]; const first = prior.survey.questions[0];
    await prisma.answer.createMany({ data: [
      { responseId: prior.response.id, questionId: second.id, optionId: second.options[0].id },
      { responseId: prior.response.id, questionId: first.id, ratingValue: 3 }
    ] });
    const student = await loginAs(app, "student1@classpulse.test");
    const result = await student.get(`/api/responses/${prior.response.id}`);
    expect(result.status).toBe(200);
    expect(result.body.response.answers.map((answer: { questionId: number }) => answer.questionId)).toEqual([first.id, second.id]);
  });

  test("TEST-176 foreign and missing detail IDs have the same public 404 shape", async () => {
    const foreign = await saved(f.student2);
    const student = await loginAs(app, "student1@classpulse.test");
    const [other, missing] = await Promise.all([student.get(`/api/responses/${foreign.response.id}`), student.get("/api/responses/2147483647")]);
    expect(other.status).toBe(404); expect(missing.status).toBe(404);
    expect(other.body).toEqual(missing.body);
  });

  test("TEST-177 closed survey preserves the saved detail and list entry", async () => {
    const prior = await saved(f.student1, "CLOSED");
    const student = await loginAs(app, "student1@classpulse.test");
    const list = await student.get("/api/responses/mine");
    expect(list.status).toBe(200);
    expect(list.body.responses[0].id).toBe(prior.response.id);
    const detail = await student.get(`/api/responses/${prior.response.id}`);
    expect(detail.status).toBe(200);
  });
});
