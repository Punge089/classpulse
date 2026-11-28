import { setTimeout as delay } from "node:timers/promises";
import { expect, test, vi } from "vitest";
import { createApp } from "../../src/app";
import { getPrisma } from "../../src/prisma";
import { loginAs } from "../helpers/auth";
import { makeSurvey, resetDb, seedFixture } from "../helpers/fixture";

test("TEST-180 saves and persists a canonical closing deadline on an owned draft", async () => {
  await resetDb();
  const fixture = await seedFixture();
  const draft = await makeSurvey({
    owner: fixture.owner1,
    course: fixture.cpe334,
    status: "DRAFT"
  });
  const owner = await loginAs(createApp(), fixture.owner1.email);
  const prisma = getPrisma();
  const original = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
  const closesAt = "2030-11-28T12:00:00.000Z";

  const response = await owner.put(`/api/owner/surveys/${draft.id}/schedule`).send({
    closesAt,
    expectedUpdatedAt: original.updatedAt.toISOString()
  });

  expect(response.status).toBe(200);
  expect(response.body.survey).toMatchObject({ id: draft.id, status: "DRAFT", closesAt });
  const stored = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
  expect(stored).toMatchObject({ status: "DRAFT", closesAt: new Date(closesAt) });
});

test("TEST-181 an owned draft accepts only one of two updates using the same schedule token", async () => {
  await resetDb();
  const fixture = await seedFixture();
  const draft = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const prisma = getPrisma();
  const before = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
  const path = `/api/owner/surveys/${draft.id}/schedule`;
  const [first, second] = await Promise.all([
    loginAs(createApp(), fixture.owner1.email), loginAs(createApp(), fixture.owner1.email)
  ]);
  const expectedUpdatedAt = before.updatedAt.toISOString();
  const deadlines = ["2030-11-28T12:00:00.000Z", "2030-11-29T12:00:00.000Z"];
  const responses = await Promise.all([
    first.put(path).send({ expectedUpdatedAt, closesAt: deadlines[0] }),
    second.put(path).send({ expectedUpdatedAt, closesAt: deadlines[1] })
  ]);
  expect(responses.map(response => response.status).sort()).toEqual([200, 409]);
  const winner = responses.findIndex(response => response.status === 200);
  expect(responses[1 - winner].body.error.code).toBe("STALE_SURVEY");
  expect(responses[winner].body.survey.closesAt).toBe(deadlines[winner]);

  const after = await prisma.survey.findUniqueOrThrow({
    where: { id: draft.id },
    include: { questions: { orderBy: { position: "asc" } } }
  });
  expect(after).toMatchObject({
    id: before.id, status: before.status, statusVersion: before.statusVersion,
    closesAt: new Date(deadlines[winner])
  });
  expect(after.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());
  expect(after.questions.map(question => question.id)).toEqual(draft.questions.map(question => question.id));
  expect(await prisma.surveyLifecycleEvent.count({ where: { surveyId: draft.id } })).toBe(0);
});

test("TEST-182 rejects a rollover closing date for an owned draft without changing rows", async () => {
  await resetDb();
  const fixture = await seedFixture();
  const draft = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const owner = await loginAs(createApp(), fixture.owner1.email);
  const prisma = getPrisma();
  const before = await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } });
  const response = await owner.put(`/api/owner/surveys/${draft.id}/schedule`).send({
    closesAt: "2030-02-30T12:00:00.000Z",
    expectedUpdatedAt: before.updatedAt.toISOString()
  });
  expect(response.status).toBe(400);
  expect(response.body.error).toMatchObject({
    code: "VALIDATION_ERROR",
    details: expect.arrayContaining([expect.objectContaining({ field: "closesAt" })])
  });
  expect(await prisma.survey.findUniqueOrThrow({ where: { id: draft.id } })).toEqual(before);
});

test("TEST-186 enforces the exact cutoff and retains saved history and summary", async () => {
  await resetDb();
  const fixture = await seedFixture();
  const app = createApp();
  const db = getPrisma();
  const deadline = Date.now() + 30_000;
  const survey = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "PUBLISHED" });
  await db.survey.update({ where: { id: survey.id }, data: { closesAt: new Date(deadline) } });
  const first = await loginAs(app, fixture.student1.email);
  const late = await loginAs(app, fixture.student2.email);
  const owner = await loginAs(app, fixture.owner1.email);
  const path = `/api/surveys/${survey.id}`;
  const [rating, choice] = survey.questions;
  const body = { answers: [
    { questionId: rating.id, ratingValue: 4 },
    { questionId: choice.id, optionId: choice.options[0].id }
  ] };

  vi.useFakeTimers({ toFake: ["Date"] });
  try {
    vi.setSystemTime(deadline - 1);
    expect((await first.get(path)).status).toBe(200);
    const saved = await first.post(`${path}/responses`).send(body);
    expect(saved.status).toBe(201);

    for (const now of [deadline, deadline + 1]) {
      vi.setSystemTime(now);
      const rejected = await late.post(`${path}/responses`).send(body);
      expect([rejected.status, rejected.body.error.code]).toEqual([409, "SURVEY_NOT_OPEN"]);
      expect((await late.get(path)).status).toBe(404);
    }
    const available = await late.get("/api/surveys");
    expect(available.status).toBe(200);
    expect(available.body.surveys).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: survey.id })]));

    const history = await first.get(`/api/responses/${saved.body.response.id}`);
    expect(history.status).toBe(200);
    const summary = await owner.get(`/api/owner/surveys/${survey.id}/summary`);
    expect(summary.status).toBe(200);
    expect(summary.body.summary.responseCount).toBe(1);
    expect(await db.response.count({ where: { surveyId: survey.id } })).toBe(1);
    expect(await db.answer.count({ where: { response: { surveyId: survey.id } } })).toBe(2);
  } finally {
    vi.useRealTimers();
  }
});

test("TEST-188 checks the deadline after a blocked respondent acquires the survey lock", async () => {
  await resetDb();
  const fixture = await seedFixture();
  const db = getPrisma();
  const app = createApp();
  const deadline = Date.now() + 30_000;
  const survey = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "PUBLISHED" });
  await db.survey.update({ where: { id: survey.id }, data: { closesAt: new Date(deadline) } });
  const student = await loginAs(app, fixture.student1.email);
  const [rating, choice] = survey.questions;

  let lockAcquired!: () => void;
  let releaseLock!: () => void;
  const locked = new Promise<void>(resolve => { lockAcquired = resolve; });
  const release = new Promise<void>(resolve => { releaseLock = resolve; });
  const holder = db.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "Survey" WHERE "id" = ${survey.id} FOR UPDATE`;
    lockAcquired();
    await release;
  }, { timeout: 8_000 });
  await Promise.race([locked, holder]);

  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(deadline - 1);
  const submitted = Promise.all([holder, student.post(`/api/surveys/${survey.id}/responses`).send({ answers: [
    { questionId: rating.id, ratingValue: 4 },
    { questionId: choice.id, optionId: choice.options[0].id }
  ] })]);
  void submitted.catch(() => undefined);
  try {
    try {
      let observed = false;
      for (let attempt = 0; attempt < 100 && !observed; attempt++) {
        const [block] = await db.$queryRaw<{ waiting: boolean }[]>`
          SELECT EXISTS (
            SELECT 1 FROM pg_stat_activity
            WHERE wait_event_type = 'Lock' AND query LIKE '%FROM "Survey"%FOR UPDATE%'
          ) AS waiting
        `;
        observed = block.waiting;
        if (!observed) await delay(15);
      }
      expect(observed).toBe(true);
      vi.setSystemTime(deadline);
    } finally {
      releaseLock();
    }
    const [, response] = await submitted;
    expect([response.status, response.body.error.code]).toEqual([409, "SURVEY_NOT_OPEN"]);
    expect(await db.response.count({ where: { surveyId: survey.id } })).toBe(0);
  } finally {
    vi.useRealTimers();
  }
}, 12_000);

test("TEST-184/195 rejects expired publication and reopening after existing lifecycle validation", async () => {
  await resetDb();
  const fixture = await seedFixture();
  const app = createApp();
  const db = getPrisma();
  const deadline = new Date(Date.now() + 30_000);
  const draft = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "DRAFT" });
  const closed = await makeSurvey({ owner: fixture.owner1, course: fixture.cpe334, status: "CLOSED" });
  const [draftBefore, closedBefore] = await Promise.all([
    db.survey.update({ where: { id: draft.id }, data: { closesAt: deadline } }),
    db.survey.update({ where: { id: closed.id }, data: { closesAt: deadline } })
  ]);
  const owner = await loginAs(app, fixture.owner1.email);
  const publish = `/api/owner/surveys/${draft.id}/publish`;
  const reopen = `/api/owner/surveys/${closed.id}/reopen`;
  const reason = "Allow a second collection period";

  vi.useFakeTimers({ toFake: ["Date"] });
  try {
    vi.setSystemTime(deadline);
    const expiredDraft = await owner.post(publish);
    expect([expiredDraft.status, expiredDraft.body.error.code]).toEqual([409, "CLOSING_TIME_PASSED"]);
    const badReason = await owner.post(reopen).send({ reason: "short", expectedVersion: closedBefore.statusVersion });
    expect([badReason.status, badReason.body.error.code]).toEqual([400, "VALIDATION_ERROR"]);
    expect(badReason.body.error.details).toEqual(expect.arrayContaining([expect.objectContaining({ field: "reason" })]));
    const stale = await owner.post(reopen).send({ reason, expectedVersion: closedBefore.statusVersion + 1 });
    expect([stale.status, stale.body.error.code]).toEqual([409, "STALE_SURVEY"]);
    const expiredReopen = await owner.post(reopen).send({ reason, expectedVersion: closedBefore.statusVersion });
    expect([expiredReopen.status, expiredReopen.body.error.code]).toEqual([409, "CLOSING_TIME_PASSED"]);
    expect(await db.survey.findUniqueOrThrow({ where: { id: draft.id } })).toEqual(draftBefore);
    expect(await db.survey.findUniqueOrThrow({ where: { id: closed.id } })).toEqual(closedBefore);
    expect(await db.surveyLifecycleEvent.count({ where: { surveyId: { in: [draft.id, closed.id] } } })).toBe(0);

    vi.setSystemTime(deadline.getTime() - 1);
    expect((await owner.post(publish)).status).toBe(200);
    expect((await owner.post(reopen).send({ reason, expectedVersion: closedBefore.statusVersion })).status).toBe(200);
    expect(await db.surveyLifecycleEvent.count({ where: { surveyId: { in: [draft.id, closed.id] } } })).toBe(2);
  } finally {
    vi.useRealTimers();
  }
});
