import type { SurveyStatus } from "@prisma/client";
import { ApiError, type FieldError } from "./errors";

export function scheduleAvailability(status: SurveyStatus, closesAt: Date | null, now: Date) {
  const closureReason = status === "DRAFT" ? "NOT_PUBLISHED"
    : status === "CLOSED" ? "MANUAL"
    : closesAt !== null && closesAt.getTime() <= now.getTime() ? "DEADLINE"
    : null;
  return { closesAt, acceptingResponses: closureReason === null, closureReason };
}

export function nextSurveyUpdateTime(previous: Date, now: Date): Date {
  return new Date(Math.max(now.getTime(), previous.getTime() + 1));
}

function canonicalUtc(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value ? parsed : null;
}

export function parseScheduleInput(body: unknown): { closesAt: Date | null; expectedUpdatedAt: Date } {
  const invalid = (details: FieldError[]) => new ApiError(400, "VALIDATION_ERROR", "Check the closing time", details);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw invalid([{ field: "body", message: "Expected an object" }]);
  }
  const input = body as Record<string, unknown>;
  const details: FieldError[] = [];
  if (Object.keys(input).some(key => key !== "closesAt" && key !== "expectedUpdatedAt")) {
    details.push({ field: "body", message: "Unexpected request field" });
  }
  const expectedUpdatedAt = canonicalUtc(input.expectedUpdatedAt);
  if (expectedUpdatedAt === null) {
    details.push({ field: "expectedUpdatedAt", message: "Use the current UTC survey update token" });
  }
  const closesAt = canonicalUtc(input.closesAt);
  if (input.closesAt !== null && (closesAt === null || closesAt.getUTCFullYear() < 2000)) {
    details.push({ field: "closesAt", message: "Use a valid UTC closing time in years 2000 through 9999, or null" });
  }
  if (expectedUpdatedAt === null || details.length > 0) throw invalid(details);
  return { closesAt, expectedUpdatedAt };
}
