import { afterAll, expect, test } from "vitest";

async function freshDatabase() {
  const { configureTestDatabase } = await import("../setup");
  configureTestDatabase();
  const { resetDb, seedFixture, makeSurvey } = await import("../helpers/fixture");
  const { getPrisma } = await import("../../src/prisma");
  await resetDb();
  return { prisma: getPrisma(), resetDb, seedFixture, makeSurvey };
}

let client: Awaited<ReturnType<typeof freshDatabase>>["prisma"] | undefined;
afterAll(async () => { await client?.$disconnect(); });

test("TEST-50 rejects a second response for the same survey and respondent", async () => {
  const { prisma, seedFixture, makeSurvey } = await freshDatabase();
  client = prisma;
  const f = await seedFixture();
  const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
  const data = { surveyId: survey.id, respondentId: f.student1.id };
  await prisma.response.create({ data });
  await expect(prisma.response.create({ data })).rejects.toMatchObject({ code: "P2002" });
  expect(await prisma.response.count({ where: data })).toBe(1);
});

test("TEST-51 rejects ratings outside 1–5 with the PostgreSQL check", async () => {
  const { prisma, seedFixture, makeSurvey } = await freshDatabase();
  client = prisma;
  const f = await seedFixture();
  const survey = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
  const rating = survey.questions.find(q => q.type === "RATING")!;
  const choice = survey.questions.find(q => q.type === "SINGLE_CHOICE")!;
  const response = await prisma.response.create({
    data: { surveyId: survey.id, respondentId: f.student1.id }
  });

  for (const value of [0, 6]) {
    await expect(prisma.$executeRawUnsafe(
      'INSERT INTO "Answer" ("responseId", "questionId", "rating_value") VALUES ($1, $2, $3)',
      response.id, rating.id, value
    )).rejects.toMatchObject({
      code: "P2010",
      meta: { code: "23514", message: expect.stringContaining("answer_rating_range") }
    });
    expect(await prisma.answer.count({ where: { responseId: response.id } })).toBe(0);
  }
  const answer = await prisma.answer.create({
    data: { responseId: response.id, questionId: rating.id, ratingValue: 1 }
  });
  expect(answer.ratingValue).toBe(1);
  expect((await prisma.answer.update({
    where: { id: answer.id }, data: { ratingValue: 5 }
  })).ratingValue).toBe(5);
  expect(await prisma.answer.create({
    data: { responseId: response.id, questionId: choice.id, optionId: choice.options[0].id }
  })).toMatchObject({ ratingValue: null, optionId: choice.options[0].id });
});

test("TEST-53 seeds the same fixture identities, relationships and credentials twice", async () => {
  const { prisma, resetDb, seedFixture } = await freshDatabase();
  client = prisma;
  const { seedDevelopment } = await import("../../prisma/seed");
  const { verifyPassword } = await import("../../src/lib/password");
  const password = process.env.SEED_PASSWORD;
  if (!password) throw new Error("TEST-53 needs a synthetic SEED_PASSWORD");

  await seedFixture();
  expect(await prisma.survey.count()).toBe(0);
  await resetDb();

  const expectedUsers = [
    ["ann.lee@classpulse.test", "Dr. Ann Lee", "OWNER"],
    ["ben.kim@classpulse.test", "Dr. Ben Kim", "OWNER"],
    ["student1@classpulse.test", "Student 1", "RESPONDENT"],
    ["student2@classpulse.test", "Student 2", "RESPONDENT"],
    ["student3@classpulse.test", "Student 3", "RESPONDENT"]
  ];
  for (let run = 0; run < 2; run++) {
    await seedDevelopment(prisma, password);
    const users = await prisma.user.findMany({ orderBy: { email: "asc" } });
    expect(users.map(({ email, fullName, role }) => [email, fullName, role])).toEqual(expectedUsers);
    for (const { passwordHash } of users) {
      expect(passwordHash).not.toBe(password);
      expect(await verifyPassword(password, passwordHash)).toBe(true);
    }
    const courses = await prisma.course.findMany({ orderBy: { code: "asc" }, include: { owner: true } });
    expect(courses.map(c => [c.code, c.owner.email])).toEqual([
      ["CPE231", "ben.kim@classpulse.test"], ["CPE334", "ann.lee@classpulse.test"]
    ]);
    const enrolments = await prisma.enrollment.findMany({ include: { course: true, user: true } });
    expect(enrolments.map(e => [e.user.email, e.course.code]).sort()).toEqual([
      ["student1@classpulse.test", "CPE334"],
      ["student2@classpulse.test", "CPE334"],
      ["student3@classpulse.test", "CPE231"]
    ]);
    const surveys = await prisma.survey.findMany({ include: { course: true, owner: true } });
    expect(surveys).toHaveLength(1);
    expect(surveys[0]).toMatchObject({
      title: "Week 1 pulse", status: "CLOSED", mode: "IDENTIFIED",
      course: { code: "CPE334" }, owner: { email: "ann.lee@classpulse.test" }
    });
  }
});
