import type { Prisma } from "@prisma/client";
import { ApiError, type FieldError } from "./errors";

export async function surveyAudience(tx: Prisma.TransactionClient, userId: number): Promise<Prisma.SurveyWhereInput> {
  const enrollments = await tx.$queryRaw<{ courseId: number; sectionId: number | null }[]>`
    SELECT e."courseId", e."sectionId" FROM "Enrollment" e
    JOIN "User" u ON u."id" = e."userId"
    WHERE e."userId" = ${userId} AND u."isActive" = true AND u."role" = 'RESPONDENT'`;
  const sectionIds = enrollments.flatMap(enrollment => enrollment.sectionId === null ? [] : [enrollment.sectionId]);
  return {
    courseId: { in: enrollments.map(enrollment => enrollment.courseId) },
    AND: [{
      OR: [
        { sectionTargets: { none: {} } },
        { sectionTargets: { some: { sectionId: { in: sectionIds } } } }
      ]
    }]
  };
}

export async function currentRosterRate(tx: Prisma.TransactionClient, surveyId: number, courseId: number) {
  const [{ eligible, respondedEligible }] = await tx.$queryRaw<{ eligible: number; respondedEligible: number }[]>`
    SELECT count(*)::int AS "eligible",
      count(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM "Response" r WHERE r."surveyId" = ${surveyId} AND r."respondentId" = e."userId"
      ))::int AS "respondedEligible"
    FROM "Enrollment" e
    JOIN "User" u ON u."id" = e."userId"
    WHERE e."courseId" = ${courseId} AND u."isActive" = true AND u."role" = 'RESPONDENT'
      AND (NOT EXISTS (SELECT 1 FROM "SurveySection" s WHERE s."surveyId" = ${surveyId})
        OR EXISTS (SELECT 1 FROM "SurveySection" s
          WHERE s."surveyId" = ${surveyId} AND s."sectionId" = e."sectionId"))`;
  const percent = eligible === 0 ? null : Math.round(10000 * respondedEligible / eligible) / 100;
  return { respondedEligible, eligible, percent };
}

export function parseSectionTarget(body: unknown): { sectionIds: number[]; expectedUpdatedAt: Date } {
  const bad = (details: FieldError[]) => new ApiError(400, "VALIDATION_ERROR", "Check the selected sections", details);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw bad([{ field: "body", message: "Expected an object" }]);
  }
  const input = body as Record<string, unknown>;
  const details: FieldError[] = [];
  if (Object.keys(input).some(key => key !== "sectionIds" && key !== "expectedUpdatedAt")) {
    details.push({ field: "body", message: "Unexpected request field" });
  }
  const token = typeof input.expectedUpdatedAt === "string" ? new Date(input.expectedUpdatedAt) : null;
  if (!token || !Number.isFinite(token.getTime()) || token.toISOString() !== input.expectedUpdatedAt ||
      !/^\d{4}-/.test(input.expectedUpdatedAt)) {
    details.push({ field: "expectedUpdatedAt", message: "Use the current UTC survey update token" });
  }
  const ids = input.sectionIds;
  if (!Array.isArray(ids) || ids.some(id => !Number.isSafeInteger(id) || id < 1 || id > 2147483647) ||
      new Set(ids).size !== ids.length) {
    details.push({ field: "sectionIds", message: "Choose distinct valid sections" });
  }
  if (details.length) throw bad(details);
  return { sectionIds: ids as number[], expectedUpdatedAt: token! };
}
