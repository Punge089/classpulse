import { afterAll, beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
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

const validReopen = { reason: "Extra class collection", expectedVersion: 0 };
const closedSurvey = () => makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "CLOSED" });
const ownerLogin = () => loginAs(app, fixture.owner1.email);

describe("Lab 7 boundaries, access, concurrency and preserved behavior", () => {
  test.each([
    { body: {}, field: "reason" },
    { body: [], field: "body" },
    { body: { ...validReopen, reason: " " }, field: "reason" },
    { body: { ...validReopen, reason: "R".repeat(9) }, field: "reason" },
    { body: { ...validReopen, reason: "R".repeat(301) }, field: "reason" },
    { body: { ...validReopen, reason: 10 }, field: "reason" },
    { body: { ...validReopen, expectedVersion: -1 }, field: "expectedVersion" },
    { body: { ...validReopen, expectedVersion: 0.5 }, field: "expectedVersion" },
    { body: { ...validReopen, expectedVersion: "0" }, field: "expectedVersion" },
    { body: { ...validReopen, expectedVersion: true }, field: "expectedVersion" },
    { body: { ...validReopen, expectedVersion: 2147483647 }, field: "expectedVersion" },
    { body: { ...validReopen, actorId: 123 }, field: "body" }
  ])("TEST-101 rejects invalid body $body without changing rows", async ({ body, field }) => {
    const original = await closedSurvey();
    const owner = await ownerLogin();
    const reply = await owner.post(`/api/owner/surveys/${original.id}/reopen`).send(body);
    expect(reply.status).toBe(400);
    expect(reply.body.error.code).toBe("VALIDATION_ERROR");
    expect(reply.body.error.details).toEqual(expect.arrayContaining([expect.objectContaining({ field })]));
    const stored = await prisma.survey.findUniqueOrThrow({
      where: { id: original.id },
      include: { questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } } }
    });
    expect(stored).toEqual(original);
  });

  test("TEST-101 trims and counts Unicode reasons in UTF-16 units", async () => {
    const original = await closedSurvey();
    const owner = await ownerLogin();
    const reason = "😀".repeat(5);
    expect(reason.length).toBe(10);
    const reply = await owner.post(`/api/owner/surveys/${original.id}/reopen`).send({ ...validReopen, reason: `  ${reason}  ` });
    expect(reply.status).toBe(200);
    const history = await owner.get(`/api/owner/surveys/${original.id}/lifecycle`);
    expect(history.body.events[0].reason).toBe(reason);
  });

  test.each(["DRAFT", "PUBLISHED"] as const)("TEST-104 refuses reopen from %s", async status => {
    const survey = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status });
    const owner = await ownerLogin();
    const reply = await owner.post(`/api/owner/surveys/${survey.id}/reopen`).send(validReopen);
    expect(reply.status).toBe(409);
    expect(reply.body.error.code).toBe("INVALID_TRANSITION");
    expect((await prisma.survey.findUniqueOrThrow({ where: { id: survey.id } })).status).toBe(status);
  });

  test("TEST-104 refuses legacy CLOSED without original publishedAt, without repair", async () => {
    const original = await closedSurvey();
    await prisma.survey.update({ where: { id: original.id }, data: { publishedAt: null } });
    const owner = await ownerLogin();
    const reply = await owner.post(`/api/owner/surveys/${original.id}/reopen`).send(validReopen);
    expect(reply.status).toBe(409);
    expect(reply.body.error.code).toBe("INVALID_TRANSITION");
    const stored = await prisma.survey.findUniqueOrThrow({ where: { id: original.id } });
    expect(stored.publishedAt).toBeNull();
    expect(stored.status).toBe("CLOSED");
  });

  test("TEST-105 two same-version reopens yield one winner and one event", async () => {
    const original = await closedSurvey();
    const [first, second] = await Promise.all([ownerLogin(), ownerLogin()]);
    const replies = await Promise.all([first, second].map(owner => owner.post(`/api/owner/surveys/${original.id}/reopen`).send(validReopen)));
    expect(replies.map(x => x.status).sort()).toEqual([200, 409]);
    expect(replies.find(x => x.status === 409)!.body.error.code).toBe("STALE_SURVEY");
    const history = await first.get(`/api/owner/surveys/${original.id}/lifecycle`);
    expect(history.status).toBe(200);
    expect(history.body.events).toHaveLength(1);
    expect(history.body.events[0].version).toBe(1);
  });

  test("TEST-105 stale version cannot reopen after close/reopen/close ABA", async () => {
    const original = await closedSurvey();
    const owner = await ownerLogin();
    expect((await owner.post(`/api/owner/surveys/${original.id}/reopen`).send(validReopen)).status).toBe(200);
    expect((await owner.post(`/api/owner/surveys/${original.id}/close`)).status).toBe(200);
    const before = await prisma.survey.findUniqueOrThrow({ where: { id: original.id } });
    const reply = await owner.post(`/api/owner/surveys/${original.id}/reopen`).send(validReopen);
    expect(reply.status).toBe(409);
    expect(reply.body.error.code).toBe("STALE_SURVEY");
    expect(await prisma.survey.findUniqueOrThrow({ where: { id: original.id } })).toEqual(before);
  });

  test("TEST-107 both endpoints enforce session, role and foreign ownership before validation", async () => {
    const original = await closedSurvey();
    const student = await loginAs(app, fixture.student1.email);
    const other = await loginAs(app, fixture.owner2.email);
    const base = `/api/owner/surveys/${original.id}`;
    for (const suffix of ["reopen", "lifecycle"]) {
      const reply = suffix === "reopen" ? await request(app).post(`${base}/${suffix}`).send({}) : await request(app).get(`${base}/${suffix}`);
      expect(reply.status).toBe(401);
      const wrongRole = suffix === "reopen" ? await student.post(`${base}/${suffix}`).send({}) : await student.get(`${base}/${suffix}`);
      expect(wrongRole.status).toBe(403);
      const foreign = suffix === "reopen" ? await other.post(`${base}/${suffix}`).send({}) : await other.get(`${base}/${suffix}?limit=invalid`);
      expect(foreign.status).toBe(404);
      expect(JSON.stringify(foreign.body)).not.toContain(original.title);
    }
  });

  test.each(["abc", "0", "2147483648", "99999999"])("TEST-107 missing/malformed id %s stays404", async id => {
    const owner = await ownerLogin();
    expect((await owner.post(`/api/owner/surveys/${id}/reopen`).send(validReopen)).status).toBe(404);
    expect((await owner.get(`/api/owner/surveys/${id}/lifecycle`)).status).toBe(404);
  });

  test.each(["limit=0", "limit=101", "limit=1.5", "limit=1&limit=2", "before=0", "before=2147483648", "before=abc", "other=1"])(
    "TEST-108 invalid query %s is400", async query => {
      const original = await closedSurvey();
      const owner = await ownerLogin();
      const reply = await owner.get(`/api/owner/surveys/${original.id}/lifecycle?${query}`);
      expect(reply.status).toBe(400);
      expect(reply.body.error.code).toBe("VALIDATION_ERROR");
    }
  );

  test("TEST-108 history is empty for legacy rows, then paginates without duplicates or foreign events", async () => {
    const original = await closedSurvey();
    const foreign = await makeSurvey({ owner: fixture.owner2, course: fixture.cpe231, status: "CLOSED" });
    const owner = await ownerLogin();
    const other = await loginAs(app, fixture.owner2.email);
    const empty = await owner.get(`/api/owner/surveys/${original.id}/lifecycle`);
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual({ events: [], nextCursor: null });
    expect((await other.post(`/api/owner/surveys/${foreign.id}/reopen`).send(validReopen)).status).toBe(200);
    for (let version = 0; version < 24; version += 2) {
      expect((await owner.post(`/api/owner/surveys/${original.id}/reopen`).send({ ...validReopen, expectedVersion: version })).status).toBe(200);
      expect((await owner.post(`/api/owner/surveys/${original.id}/close`)).status).toBe(200);
    }
    const firstPage = await owner.get(`/api/owner/surveys/${original.id}/lifecycle`);
    expect(firstPage.body.events).toHaveLength(20);
    const lastPage = await owner.get(`/api/owner/surveys/${original.id}/lifecycle?before=${firstPage.body.nextCursor}`);
    expect(lastPage.body.events).toHaveLength(4);
    expect(lastPage.body.nextCursor).toBeNull();
    const events = [...firstPage.body.events, ...lastPage.body.events];
    expect(events.map((e: { version: number }) => e.version)).toEqual(Array.from({ length: 24 }, (_, i) => 24 - i));
    expect(new Set(events.map((e: { id: number }) => e.id)).size).toBe(24);
    expect(events.every((e: Record<string, unknown>) => !["actorId", "email", "respondentId", "passwordHash"].some(k => k in e))).toBe(true);
  });

  test("TEST-109 publish/close/reopen retains complete versioned lifecycle", async () => {
    const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
    const owner = await ownerLogin();
    expect((await owner.post(`/api/owner/surveys/${original.id}/publish`)).status).toBe(200);
    expect((await owner.post(`/api/owner/surveys/${original.id}/close`)).status).toBe(200);
    expect((await owner.post(`/api/owner/surveys/${original.id}/reopen`).send({ reason: "First additional session", expectedVersion: 2 })).status).toBe(200);
    expect((await owner.post(`/api/owner/surveys/${original.id}/close`)).status).toBe(200);
    expect((await owner.post(`/api/owner/surveys/${original.id}/reopen`).send({ reason: "Second additional session", expectedVersion: 4 })).status).toBe(200);
    const history = await owner.get(`/api/owner/surveys/${original.id}/lifecycle`);
    expect(history.body.events.map((e: { version: number }) => e.version)).toEqual([5, 4, 3, 2, 1]);
    expect(history.body.events.map((e: { action: string }) => e.action)).toEqual(["REOPEN", "CLOSE", "REOPEN", "CLOSE", "PUBLISH"]);
    expect(history.body.events[0].reason).toBe("Second additional session");
    expect(history.body.events[2].reason).toBe("First additional session");
    expect(history.body.events.every((e: { occurredAt: string }) => Number.isFinite(Date.parse(e.occurredAt)))).toBe(true);
  });

  test("TEST-110 reopening preserves old answers/summary and forbids repeat response", async () => {
    const original = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334 });
    const owner = await ownerLogin();
    const one = await loginAs(app, fixture.student1.email);
    const two = await loginAs(app, fixture.student2.email);
    const outsider = await loginAs(app, fixture.student3.email);
    const body = { answers: original.questions.map(q => q.type === "RATING" ? { questionId: q.id, ratingValue: 4 } : { questionId: q.id, optionId: q.options[0].id }) };
    const submitted = await one.post(`/api/surveys/${original.id}/responses`).send(body);
    expect(submitted.status).toBe(201);
    const beforeResponse = await one.get(`/api/responses/${submitted.body.response.id}`);
    const beforeSummary = await owner.get(`/api/owner/surveys/${original.id}/summary`);
    expect((await owner.post(`/api/owner/surveys/${original.id}/close`)).status).toBe(200);
    expect((await owner.post(`/api/owner/surveys/${original.id}/reopen`).send({ ...validReopen, expectedVersion: 1 })).status).toBe(200);
    expect((await one.get(`/api/responses/${submitted.body.response.id}`)).body).toEqual(beforeResponse.body);
    const afterSummary = await owner.get(`/api/owner/surveys/${original.id}/summary`);
    expect(afterSummary.body.summary).toEqual(beforeSummary.body.summary);
    const duplicate = await one.post(`/api/surveys/${original.id}/responses`).send(body);
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("ALREADY_RESPONDED");
    expect((await two.post(`/api/surveys/${original.id}/responses`).send(body)).status).toBe(201);
    expect((await outsider.post(`/api/surveys/${original.id}/responses`).send(body)).status).toBe(403);
    expect((await owner.post(`/api/owner/surveys/${original.id}/close`)).status).toBe(200);
    expect((await two.post(`/api/surveys/${original.id}/responses`).send(body)).body.error.code).toBe("SURVEY_NOT_OPEN");
  });

  test("TEST-111 legacy null closedAt is retained without fabricating a timestamp", async () => {
    const original = await closedSurvey();
    await prisma.survey.update({ where: { id: original.id }, data: { closedAt: null } });
    const owner = await ownerLogin();
    expect((await owner.post(`/api/owner/surveys/${original.id}/reopen`).send(validReopen)).status).toBe(200);
    const history = await owner.get(`/api/owner/surveys/${original.id}/lifecycle`);
    expect(history.body.events[0].previousClosedAt).toBeNull();
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Lab 7 controlled reopening (AC-100, AC-102)", () => {
  test.each([
    { id: "TEST-100", length: 10 },
    { id: "TEST-101 upper reason boundary", length: 300 }
  ])("$id accepts a $length-character reason on a CLOSED survey", async ({ length }) => {
    const original = await makeSurvey({
      owner: fixture.owner1,
      course: fixture.cpe334,
      status: "CLOSED"
    });
    expect(original.publishedAt).not.toBeNull();
    expect(original.closedAt).not.toBeNull();
    const owner = await loginAs(app, fixture.owner1.email);
    const reason = "R".repeat(length);

    const reply = await owner.post(`/api/owner/surveys/${original.id}/reopen`).send({
      reason,
      expectedVersion: 0
    });

    // Primary RED: the old, healthy implementation lacks this operation and returns404.
    // Assert behavior before touching any future DTO/model fields so compilation/setup
    // failures cannot masquerade as the missing-behavior failure.
    expect(reply.status).toBe(200);
    expect(reply.body.survey).toMatchObject({
      id: original.id,
      courseId: original.courseId,
      status: "PUBLISHED",
      statusVersion: 1,
      publishedAt: original.publishedAt!.toISOString(),
      closedAt: null
    });

    const stored = await prisma.survey.findUniqueOrThrow({
      where: { id: original.id },
      include: {
        questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
      }
    });
    expect(stored.status).toBe("PUBLISHED");
    expect(stored.publishedAt).toEqual(original.publishedAt);
    expect(stored.closedAt).toBeNull();
    expect(stored.courseId).toBe(original.courseId);
    expect(stored.ownerId).toBe(original.ownerId);
    expect(stored.questions).toEqual(original.questions);

    const history = await owner.get(`/api/owner/surveys/${original.id}/lifecycle`);
    expect(history.status).toBe(200);
    expect(history.body.nextCursor).toBeNull();
    expect(history.body.events).toHaveLength(1);
    expect(history.body.events[0]).toMatchObject({
      version: 1,
      action: "REOPEN",
      fromStatus: "CLOSED",
      toStatus: "PUBLISHED",
      reason,
      previousClosedAt: original.closedAt!.toISOString()
    });
  });
});
