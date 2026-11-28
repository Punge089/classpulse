import { setTimeout as delay } from "node:timers/promises";
import request from "supertest";
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
afterAll(async () => {
  await prisma.$disconnect();
});

function exportPath(id: number): string {
  return `/api/owner/surveys/${id}/export.csv`;
}

// The synthetic fixture values contain no embedded line breaks.
function csvRecord(record: string): string[] {
  return [...record.matchAll(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g)].map(([, cell]) =>
    cell.startsWith('"') ? cell.slice(1, -1).replaceAll('""', '"') : cell
  );
}

describe("F-12 identified owner export", () => {
  test("TEST-240 exports saved answers as CSV and protects the same saved survey", async () => {
    const survey = await makeSurvey({ course: fixture.cpe334, owner: fixture.owner1 });
    const [rating, choice] = survey.questions;
    const selected = choice.options.find(option => option.position === 1)!;
    for (const [respondent, value] of [[fixture.student1, 4], [fixture.student2, 2]] as const) {
      const student = await loginAs(app, respondent.email);
      const submitted = await student.post(`/api/surveys/${survey.id}/responses`).send({
        answers: [{ questionId: rating.id, ratingValue: value }, { questionId: choice.id, optionId: selected.id }]
      });
      expect(submitted.status).toBe(201);
    }

    const stored = await prisma.response.findMany({
      where: { surveyId: survey.id },
      orderBy: [{ submittedAt: "asc" }, { id: "asc" }],
      include: { respondent: true }
    });
    expect(stored).toHaveLength(2);

    const owner = await loginAs(app, fixture.owner1.email);
    const exported = await owner.get(exportPath(survey.id));
    expect(exported.status).toBe(200);
    expect(exported.headers["content-type"]).toMatch(/^text\/csv;\s*charset=utf-8/i);
    expect(exported.headers["content-disposition"]).toMatch(new RegExp(`^attachment;.*classpulse-survey-${survey.id}\\.csv`, "i"));
    expect(exported.headers["cache-control"]).toBe("private, no-store");

    const lines = exported.text.trimEnd().split("\r\n").map(csvRecord);
    expect(lines).toEqual([
      ["response_id", "respondent_name", "respondent_email", "submitted_at", "question_position", "question_text", "question_type", "answer"],
      ...stored.flatMap(row => {
        const identity = [String(row.id), row.respondent.fullName, row.respondent.email, row.submittedAt.toISOString()];
        const value = row.respondentId === fixture.student1.id ? "4" : "2";
        return [
          [...identity, "1", rating.prompt, "RATING", value],
          [...identity, "2", choice.prompt, "SINGLE_CHOICE", JSON.stringify([selected.label])]
        ];
      })
    ]);

    const respondent = await loginAs(app, fixture.student1.email);
    const foreignOwner = await loginAs(app, fixture.owner2.email);
    const denied = await Promise.all([
      request(app).get(exportPath(survey.id)),
      respondent.get(exportPath(survey.id)),
      foreignOwner.get(exportPath(survey.id))
    ]);
    expect(denied.map(result => result.status)).toEqual([401, 403, 404]);
    for (const result of denied) {
      expect(result.headers["content-disposition"]).toBeUndefined();
      expect(result.text).not.toContain(fixture.student1.email);
    }
    expect(await prisma.response.count({ where: { surveyId: survey.id } })).toBe(2);
  });

  test("TEST-242 rejects an unexpected query parameter before sending CSV headers", async () => {
    const survey = await makeSurvey({ course: fixture.cpe334, owner: fixture.owner1 });
    const owner = await loginAs(app, fixture.owner1.email);
    const result = await owner.get(exportPath(survey.id)).query({ unsupported: "value" });
    expect(result.status).toBe(400);
    expect(result.headers["content-type"]).toMatch(/^application\/json/);
    expect(result.headers["content-disposition"]).toBeUndefined();
  });

  test("TEST-246 exports a coherent snapshot across a concurrent saved submission", async () => {
    const survey = await makeSurvey({
      course: fixture.cpe334, owner: fixture.owner1,
      questions: [{ prompt: "Optional rating", type: "RATING", required: false }]
    });
    const owner = await loginAs(app, fixture.owner1.email);
    const firstStudent = await loginAs(app, fixture.student1.email);
    const secondStudent = await loginAs(app, fixture.student2.email);
    const submitPath = `/api/surveys/${survey.id}/responses`;
    expect((await firstStudent.post(submitPath).send({ answers: [] })).status).toBe(201);

    let acquired!: () => void;
    let release!: () => void;
    const lockReady = new Promise<void>(resolve => { acquired = resolve; });
    const unlocked = new Promise<void>(resolve => { release = resolve; });
    const holder = prisma.$transaction(async tx => {
      await tx.$executeRaw`LOCK TABLE "Answer" IN ACCESS EXCLUSIVE MODE`;
      acquired();
      await unlocked;
    }, { timeout: 8_000 });
    await Promise.race([lockReady, holder]);
    const exported = Promise.all([holder, owner.get(exportPath(survey.id))]);
    void exported.catch(() => undefined);
    try {
      let observed = false;
      const stopAt = Date.now() + 2_000;
      do {
        const [lock] = await prisma.$queryRaw<{ waiting: boolean }[]>`
          SELECT EXISTS (
            SELECT 1 FROM pg_locks
            WHERE relation = '"Answer"'::regclass AND NOT granted AND mode = 'AccessShareLock'
          ) AS waiting
        `;
        observed = lock.waiting;
        if (!observed) await delay(15);
      } while (!observed && Date.now() < stopAt);
      expect(observed).toBe(true);
      expect((await secondStudent.post(submitPath).send({ answers: [] })).status).toBe(201);
    } finally {
      release();
    }
    const [, first] = await exported;
    const fresh = await owner.get(exportPath(survey.id));
    expect([first.status, fresh.status]).toEqual([200, 200]);
    expect(first.text).toContain(fixture.student1.email);
    expect(first.text).not.toContain(fixture.student2.email);
    expect(fresh.text).toContain(fixture.student1.email);
    expect(fresh.text).toContain(fixture.student2.email);
    expect(await prisma.response.count({ where: { surveyId: survey.id } })).toBe(2);
  }, 12_000);
});
