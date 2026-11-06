import type { SurveyStatus } from "@prisma/client";
import { ApiError } from "./errors";

export type SurveyAction = "publish" | "close";

/** BR-03: DRAFT → PUBLISHED on publish, PUBLISHED → CLOSED on close; everything else is 409 INVALID_TRANSITION. */
export function nextStatus(current: SurveyStatus, action: SurveyAction): SurveyStatus {
  if (action === "publish" && current === "DRAFT") return "PUBLISHED";
  if (action === "close" && current === "PUBLISHED") return "CLOSED";
  const verb = action === "publish" ? "published" : "closed";
  throw new ApiError(409, "INVALID_TRANSITION", `A ${current.toLowerCase()} survey cannot be ${verb}`);
}
