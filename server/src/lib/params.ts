import { ApiError } from "./errors";

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
    throw new ApiError(404, "NOT_FOUND", "Record not found");
  }
  return id;
}
