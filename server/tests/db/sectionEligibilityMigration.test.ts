import { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, test } from "vitest";
import { configureTestDatabase } from "../setup";

const migrationName = "20261129000000_section_eligibility";

test("TEST-210 applies the section migration to existing rows in an isolated PostgreSQL schema", async () => {
  configureTestDatabase();
  const url = new URL(process.env.DATABASE_URL!);
  const namespace = `test210_${randomUUID().replaceAll("-", "")}`;
  url.searchParams.set("schema", namespace);
  const db = new PrismaClient({ datasourceUrl: url.toString() });
  const scratch = mkdtempSync(join(tmpdir(), "classpulse-test210-"));
  const source = resolve("prisma/migrations");
  const destination = join(scratch, "migrations");
  const schemaPath = join(scratch, "schema.prisma");

  function copyMigration(name: string) {
    mkdirSync(join(destination, name));
    copyFileSync(join(source, name, "migration.sql"), join(destination, name, "migration.sql"));
  }

  function deploy(label: string) {
    try {
      execFileSync(process.execPath, [
        require.resolve("prisma/build/index.js"), "migrate", "deploy", "--schema", schemaPath
      ], {
        env: { ...process.env, DATABASE_URL: url.toString() },
        stdio: "ignore",
        timeout: 25_000
      });
    } catch {
      throw new Error(`TEST-210 could not deploy ${label} in the isolated test schema`);
    }
  }

  try {
    mkdirSync(destination);
    copyFileSync(resolve("prisma/schema.prisma"), schemaPath);
    copyFileSync(join(source, "migration_lock.toml"), join(destination, "migration_lock.toml"));
    for (const entry of readdirSync(source, { withFileTypes: true }).filter(entry => entry.isDirectory() && entry.name < migrationName)) {
      copyMigration(entry.name);
    }
    deploy("prior migrations");

    const owner = await db.user.create({
      data: { email: "test210-owner@classpulse.test", fullName: "Migration owner", role: "OWNER", passwordHash: "unused-test-value" }
    });
    const [oldRespondent, newRespondent] = await Promise.all(["old", "new"].map(member => db.user.create({
      data: { email: `test210-${member}@classpulse.test`, fullName: "Migration respondent", role: "RESPONDENT", passwordHash: "unused-test-value" }
    })));
    const course = await db.course.create({ data: { ownerId: owner.id, code: "LEGACY", title: "Legacy course" } });
    const other = await db.course.create({ data: { ownerId: owner.id, code: "OTHER", title: "Other course" } });
    const oldEnrollment = await db.enrollment.create({ data: { courseId: course.id, userId: oldRespondent.id } });
    const newEnrollment = await db.enrollment.create({ data: { courseId: course.id, userId: newRespondent.id } });
    const survey = await db.survey.create({
      data: { courseId: course.id, ownerId: owner.id, title: "Existing survey", status: "PUBLISHED",
        publishedAt: new Date("2026-11-28T00:00:00.000Z") }
    });
    const question = await db.question.create({
      data: { surveyId: survey.id, type: "RATING", position: 1, prompt: "Existing question" }
    });
    const legacyResponse = await db.response.create({
      data: { surveyId: survey.id, respondentId: oldRespondent.id },
      select: { id: true, surveyId: true, respondentId: true, submittedAt: true }
    });
    const oldAnswer = await db.answer.create({ data: { responseId: legacyResponse.id, questionId: question.id, ratingValue: 4 } });

    copyMigration(migrationName);
    deploy("the F-10 migration");

    expect(await db.survey.findUnique({ where: { id: survey.id } })).toEqual(survey);
    expect(await db.answer.findUnique({ where: { id: oldAnswer.id } })).toEqual(oldAnswer);
    expect(await db.response.findUnique({ where: { id: legacyResponse.id } })).toEqual({
      ...legacyResponse, sectionIdAtSubmission: null
    });
    expect(await db.enrollment.findUnique({ where: { id: oldEnrollment.id } })).toEqual(oldEnrollment);
    expect(await db.$queryRaw`SELECT "sectionId" FROM "Enrollment" WHERE id = ${oldEnrollment.id}`)
      .toEqual([{ sectionId: null }]);
    expect(await db.surveySection.count({ where: { surveyId: survey.id } })).toBe(0);

    const [alpha, foreign] = await Promise.all([
      db.courseSection.create({ data: { courseId: course.id, code: "A", label: "Alpha" } }),
      db.courseSection.create({ data: { courseId: other.id, code: "B", label: "Foreign" } })
    ]);
    await expect(db.$executeRaw`UPDATE "Enrollment" SET "sectionId" = ${foreign.id} WHERE id = ${newEnrollment.id}`)
      .rejects.toMatchObject({ code: "P2010", meta: { code: "23503" } });
    await expect(db.surveySection.create({ data: { surveyId: survey.id, courseId: course.id, sectionId: foreign.id } }))
      .rejects.toMatchObject({ code: "P2003" });
    await expect(db.surveySection.create({ data: { surveyId: survey.id, courseId: other.id, sectionId: foreign.id } }))
      .rejects.toMatchObject({ code: "P2003" });
    expect(await db.$queryRaw`SELECT "sectionId" FROM "Enrollment" WHERE id = ${newEnrollment.id}`)
      .toEqual([{ sectionId: null }]);
    expect(await db.surveySection.count({ where: { surveyId: survey.id } })).toBe(0);

    await db.$executeRaw`UPDATE "Enrollment" SET "sectionId" = ${alpha.id} WHERE id = ${newEnrollment.id}`;
    await db.surveySection.create({ data: { surveyId: survey.id, courseId: course.id, sectionId: alpha.id } });
    const admitted = await db.response.create({
      data: { surveyId: survey.id, respondentId: newRespondent.id, sectionIdAtSubmission: alpha.id }
    });
    await db.$executeRaw`UPDATE "Enrollment" SET "sectionId" = NULL WHERE id = ${newEnrollment.id}`;
    expect(await db.response.findUnique({ where: { id: admitted.id } })).toEqual(admitted);
    expect(await db.response.count({ where: { surveyId: survey.id } })).toBe(2);
  } finally {
    try {
      await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${namespace}" CASCADE`);
    } finally {
      await db.$disconnect();
      rmSync(scratch, { recursive: true, force: true });
    }
  }
}, 65_000);
