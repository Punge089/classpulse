import type { SurveyStatus } from "@prisma/client";
import { ApiError } from "./errors";

export type SurveyAction = "publish" | "close" | "reopen";

/** BR-03: explicit reopen extends the lifecycle; publish on CLOSED still rejects. */
export function nextStatus(current: SurveyStatus, action: SurveyAction): SurveyStatus {
  if (action === "publish" && current === "DRAFT") return "PUBLISHED";
  if (action === "close" && current === "PUBLISHED") return "CLOSED";
  if (action === "reopen" && current === "CLOSED") return "PUBLISHED";
  const verb = action === "publish" ? "published" : action === "close" ? "closed" : "reopened";
  throw new ApiError(409, "INVALID_TRANSITION", `A ${current.toLowerCase()} survey cannot be ${verb}`);
}
