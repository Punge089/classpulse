import { describe, expect, test } from "vitest";
import { ApiError } from "../../src/lib/errors";
import { parseLifecycleQuery, parseReopenInput } from "../../src/lib/surveyReopenValidation";

describe("TEST-102 reopen input validation", () => {
  test.each([10, 300])("accepts trimmed boundary %i", length => {
    expect(parseReopenInput({ reason: ` ${"R".repeat(length)} `, expectedVersion: 0 }))
      .toEqual({ reason: "R".repeat(length), expectedVersion: 0 });
  });

  test("counts UTF-16 units consistently and accepts maximum version", () => {
    expect(parseReopenInput({ reason: "😀".repeat(5), expectedVersion: 2147483646 }))
      .toEqual({ reason: "😀".repeat(5), expectedVersion: 2147483646 });
  });

  test.each([
    null, [], 1, "request", {},
    { reason: "R".repeat(9), expectedVersion: 0 },
    { reason: "R".repeat(301), expectedVersion: 0 },
    { reason: 10, expectedVersion: 0 },
    { reason: "          ", expectedVersion: 0 },
    { reason: "Valid long reason", expectedVersion: -1 },
    { reason: "Valid long reason", expectedVersion: 0.1 },
    { reason: "Valid long reason", expectedVersion: "0" },
    { reason: "Valid long reason", expectedVersion: false },
    { reason: "Valid long reason", expectedVersion: 2147483647 },
    { reason: "Valid long reason", expectedVersion: Infinity },
    { reason: "Valid long reason", expectedVersion: NaN },
    { reason: "Valid long reason", expectedVersion: 0, actorId: 1 }
  ])("rejects malformed input %# with validation details", body => {
    let caught: unknown;
    try { parseReopenInput(body); } catch (error) { caught = error; }
    expect(caught).toBeInstanceOf(ApiError);
    expect(caught).toMatchObject({ status: 400, code: "VALIDATION_ERROR", details: expect.any(Array) });
  });
});

describe("TEST-108 private lifecycle pagination query", () => {
  test("accepts defaults, minimum and maximum limits/cursors", () => {
    expect(parseLifecycleQuery({})).toEqual({ limit: 20 });
    expect(parseLifecycleQuery({ limit: "1", before: "1" })).toEqual({ limit: 1, before: 1 });
    expect(parseLifecycleQuery({ limit: "100", before: "2147483647" })).toEqual({ limit: 100, before: 2147483647 });
  });

  test.each([
    { limit: "0" }, { limit: "101" }, { limit: "1.5" }, { limit: " 1 " },
    { limit: ["1", "2"] }, { limit: 1 }, { before: "0" }, { before: "2147483648" },
    { before: "NaN" }, { before: ["1", "2"] }, { unexpected: "1" }
  ])("rejects malformed query %#", query => {
    expect(() => parseLifecycleQuery(query)).toThrow(ApiError);
    try { parseLifecycleQuery(query); } catch (error) {
      expect(error).toMatchObject({ status: 400, code: "VALIDATION_ERROR" });
    }
  });
});
