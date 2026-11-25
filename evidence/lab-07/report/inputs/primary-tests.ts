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
