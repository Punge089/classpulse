import { ApiError, type FieldError } from "./errors";

export function parseReopenInput(body: unknown): { reason: string; expectedVersion: number } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Provide a reopen request", [{ field: "body", message: "Expected an object" }]);
  }
  const value = body as Record<string, unknown>;
  const details: FieldError[] = [];
  if (Object.keys(value).some(k => k !== "reason" && k !== "expectedVersion")) {
    details.push({ field: "body", message: "Unexpected request field" });
  }
  const reason = typeof value.reason === "string" ? value.reason.trim() : "";
  if (reason.length < 10 || reason.length > 300) {
    details.push({ field: "reason", message: "Enter a reason of 10 to 300 characters" });
  }
  const expectedVersion = value.expectedVersion;
  if (typeof expectedVersion !== "number" || !Number.isInteger(expectedVersion) || expectedVersion < 0 || expectedVersion > 2147483646) {
    details.push({ field: "expectedVersion", message: "Reload the survey to obtain its current version" });
  }
  if (details.length) throw new ApiError(400, "VALIDATION_ERROR", "Check the highlighted fields", details);
  return { reason, expectedVersion: expectedVersion as number };
}

export function parseLifecycleQuery(query: Record<string, unknown>): { limit: number; before?: number } {
  const details: FieldError[] = [];
  if (Object.keys(query).some(k => k !== "limit" && k !== "before")) {
    details.push({ field: "query", message: "Unexpected query field" });
  }
  const integer = (key: string, fallback?: number): number | undefined => {
    const value = query[key];
    if (value === undefined) return fallback;
    const max = key === "limit" ? 100 : 2147483647;
    if (typeof value !== "string" || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > max) {
      details.push({ field: key, message: key === "limit" ? "Limit must be 1 to 100" : "Provide a valid event cursor" });
      return undefined;
    }
    return Number(value);
  };
  const limit = integer("limit", 20);
  const before = integer("before");
  if (details.length) throw new ApiError(400, "VALIDATION_ERROR", "Check the history query", details);
  return { limit: limit!, ...(before === undefined ? {} : { before }) };
}
