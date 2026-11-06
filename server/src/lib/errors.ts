import type { ErrorRequestHandler } from "express";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_ELIGIBLE"
  | "NOT_FOUND"
  | "INVALID_TRANSITION"
  | "SURVEY_NOT_OPEN"
  | "ALREADY_RESPONDED"
  | "INTERNAL_ERROR";

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: FieldError[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    const { status, code, message, details } = error;
    res.status(status).json({ error: { code, message, details } });
    return;
  }

  if (error instanceof SyntaxError && "type" in error && error.type === "entity.parse.failed") {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Request body must be valid JSON" }
    });
    return;
  }

  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
};
