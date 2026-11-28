import { beforeEach, expect, test } from "vitest";
import { createApp } from "../../src/app";
import { getPrisma } from "../../src/prisma";
import { loginAs } from "../helpers/auth";
import { resetDb, seedFixture, type Fixture } from "../helpers/fixture";

const app = createApp();
const prisma = getPrisma();
let fixture: Fixture;

beforeEach(async () => {
  await resetDb();
  fixture = await seedFixture();
});

test("TEST-220 creates each supported mode and rejects an unsupported mode", async () => {
  const owner = await loginAs(app, fixture.owner1.email);
  const path = "/api/owner/surveys";
  const body = {
    courseId: fixture.cpe334.id,
    title: "Survey mode check",
    questions: [{ prompt: "Rate this class", type: "RATING" }]
  };

  const legacy = await owner.post(path).send(body);
  expect(legacy.status).toBe(201);
  expect(legacy.body.survey.mode).toBe("IDENTIFIED");

  const anonymous = await owner.post(path).send({ ...body, title: "Anonymous mode check", mode: "ANONYMOUS" });
  expect(anonymous.status).toBe(201);
  expect(anonymous.body.survey.mode).toBe("ANONYMOUS");
  const stored = await prisma.survey.findUniqueOrThrow({ where: { id: anonymous.body.survey.id } });
  expect(stored.mode).toBe("ANONYMOUS");

  const rejected = await owner.post(path).send({ ...body, title: "Invalid mode check", mode: "HIDDEN" });
  expect(rejected.status).toBe(400);
  expect(rejected.body.error.code).toBe("VALIDATION_ERROR");
  expect(rejected.body.error.details).toEqual(expect.arrayContaining([expect.objectContaining({ field: "mode" })]));
  expect(await prisma.survey.count()).toBe(2);
});
