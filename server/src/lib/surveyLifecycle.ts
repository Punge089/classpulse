import type { SurveyStatus } from "@prisma/client";

export type SurveyAction = "publish" | "close";

/** BR-03: DRAFT → PUBLISHED on publish, PUBLISHED → CLOSED on close; everything else is 409 INVALID_TRANSITION. */
export function nextStatus(_current: SurveyStatus, _action: SurveyAction): SurveyStatus {
  throw new Error("nextStatus has not been implemented");
}
