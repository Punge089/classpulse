import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { once } from "node:events";
import os from "node:os";
import { runSummaryRequests, validateBenchmarkTarget } from "../tools/performance/summary-benchmark.mjs";

const fromServer = createRequire(new URL("../server/package.json", import.meta.url));
const { PrismaClient } = fromServer("@prisma/client");
const { createApp } = fromServer("./dist/app.js");
const { hashPassword } = fromServer("./dist/lib/password.js");
const db = new PrismaClient();
const server = createApp().listen(0, "127.0.0.1");
let stage = "startup";
let fixture;
let result;

try {
  await once(server, "listening");
  const target = {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    databaseUrl: process.env.DATABASE_URL,
    approvedDatabasePort: Number(process.env.BENCH_DB_PORT)
  };
  const origin = validateBenchmarkTarget(target);
  const id = randomBytes(8).toString("hex");
  const password = randomBytes(24).toString("base64url");
  const passwordHash = await hashPassword(password);
  const email = name => `${id}.${name}@classpulse.test`;
  stage = "fixture guard";
  const baseline = await db.$transaction([db.user.count(), db.course.count(), db.survey.count(), db.response.count(), db.answer.count()]);
  if (baseline.some(Boolean)) throw new Error("Expected an empty dedicated fixture database");
  stage = "fixture transaction";
  fixture = await db.$transaction(async tx => {
    await tx.user.createMany({ data: [
      ...["owner", "foreign"].map(name => ({ email: email(name), fullName: name, passwordHash, role: "OWNER" })),
      ...Array.from({ length: 500 }, (_, index) => ({ email: email(index), fullName: "Synthetic respondent", passwordHash, role: "RESPONDENT" }))
    ] });
    const users = await tx.user.findMany({ where: { email: { startsWith: id + "." } }, orderBy: { id: "asc" } });
    const owner = users.find(u => u.email === email("owner"));
    const respondents = users.filter(u => u.role === "RESPONDENT");
    if (!owner || users.length !== 502 || respondents.length !== 500) throw new Error("Unexpected user count");
    const course = await tx.course.create({ data: { code: "BENCH-" + id, title: "Synthetic benchmark course", ownerId: owner.id } });
    await tx.enrollment.createMany({ data: respondents.map(u => ({ courseId: course.id, userId: u.id })) });
    const survey = await tx.survey.create({
      data: {
        courseId: course.id, ownerId: owner.id, title: "Synthetic benchmark survey", mode: "IDENTIFIED",
        status: "PUBLISHED", publishedAt: new Date(),
        questions: { create: Array.from({ length: 20 }, (_, index) => ({
          position: index + 1, prompt: `Synthetic question ${index + 1}`,
          type: index < 10 ? "RATING" : "SINGLE_CHOICE",
          ...(index < 10 ? {} : { options: { create: Array.from({ length: 6 }, (_, option) => ({
            position: option + 1, label: `Option ${option + 1}`
          })) } })
        })) }
      },
      include: { questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } } }
    });
    await tx.response.createMany({ data: respondents.map(u => ({ respondentId: u.id, surveyId: survey.id })) });
    const responses = await tx.response.findMany({ where: { surveyId: survey.id }, orderBy: { id: "asc" } });
    if (responses.length !== 500) throw new Error("Unexpected response count");
    const answers = responses.flatMap((response, index) => survey.questions.map(question => ({
      responseId: response.id, questionId: question.id,
      ...(question.type === "RATING" ? { ratingValue: index % 5 + 1 } : { optionId: question.options[index % 6].id })
    })));
    const inserted = await tx.answer.createMany({ data: answers });
    if (inserted.count !== 10000) throw new Error("Unexpected answer count");
    return { survey, courseId: course.id, userIds: users.map(u => u.id), responseIds: responses.map(r => r.id) };
  }, { timeout: 30000 });
  stage = "sign-in";
  async function signIn(name) {
    const response = await fetch(origin + "/api/auth/login", {
      method: "POST", redirect: "manual", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email(name), password })
    });
    const cookie = response.headers.getSetCookie().map(value => value.split(";", 1)[0]).find(value => value.startsWith("cp_session="));
    await response.arrayBuffer();
    if (response.status !== 200 || !cookie) throw new Error("Fixture sign-in failed");
    return cookie;
  }
  const [ownerCookie, foreignCookie, studentCookie] = await Promise.all([signIn("owner"), signIn("foreign"), signIn(0)]);
  stage = "access probes";
  const url = `${origin}/api/owner/surveys/${fixture.survey.id}/summary`;
  const statuses = [];
  for (const [cookie, expected] of [[null, 401], [studentCookie, 403], [foreignCookie, 404]]) {
    const response = await fetch(url, { redirect: "manual", headers: cookie ? { cookie } : {} });
    const denial = await response.json();
    if (response.status !== expected || !denial.error?.code || "summary" in denial) throw new Error("Unexpected access result");
    statuses.push(response.status);
  }
  stage = "HTTP measurement";
  const verifySummary = body => {
    const summary = body?.summary;
    if (summary?.surveyId !== fixture.survey.id || summary.responseCount !== 500 || summary.questions.length !== 20) return false;
    return summary.questions.every((actual, index) => {
      const question = fixture.survey.questions[index];
      if (actual.questionId !== question.id || actual.type !== question.type || actual.prompt !== question.prompt) return false;
      if (question.type === "RATING") return actual.rating?.average === 3 &&
        [1, 2, 3, 4, 5].every(bucket => actual.rating.distribution[bucket] === 100);
      return actual.choice?.options.length === 6 && actual.choice.options.every((option, position) =>
        option.optionId === question.options[position].id && option.label === question.options[position].label &&
        option.count === (position < 2 ? 84 : 83));
    });
  };
  const timing = await runSummaryRequests({ target, surveyId: fixture.survey.id, cookie: ownerCookie, verifySummary });
  result = { baseline, statuses: [...statuses, 200], surveyId: fixture.survey.id, courseId: fixture.courseId, questions: 20,
    eligibleRespondents: 500, answers: 10000, warmups: 5, os: os.platform() + " " + os.release(),
    cpu: os.cpus()[0]?.model, ramBytes: os.totalmem(), node: process.version, timeUtc: new Date().toISOString(), ...timing };
} catch {
  console.error("Benchmark failed during: " + stage);
  process.exitCode = 1;
} finally {
  try {
    if (fixture) {
      await db.$transaction(async tx => {
        const responses = await tx.response.deleteMany({ where: { surveyId: fixture.survey.id, id: { in: fixture.responseIds } } });
        if (responses.count !== 500) throw new Error("Unexpected fixture response cleanup count");
        await tx.survey.delete({ where: { id: fixture.survey.id } });
        await tx.enrollment.deleteMany({ where: { courseId: fixture.courseId, userId: { in: fixture.userIds } } });
        await tx.course.delete({ where: { id: fixture.courseId } });
        await tx.user.deleteMany({ where: { id: { in: fixture.userIds } } });
      });
    }
    if (result) {
      result.afterCleanup = await db.$transaction([db.user.count(), db.course.count(), db.survey.count(), db.response.count(), db.answer.count()]);
      if (result.afterCleanup.some(Boolean)) throw new Error("Fixture residue");
      console.log(JSON.stringify(result));
      if (!result.passed) process.exitCode = 1;
    }
  } catch {
    console.error("Benchmark fixture cleanup failed");
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
    await new Promise(resolve => server.close(resolve));
  }
}
