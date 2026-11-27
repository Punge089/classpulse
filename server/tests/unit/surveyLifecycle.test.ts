import type { SurveyStatus } from "@prisma/client";
import { describe, expect, test } from "vitest";
import { ApiError } from "../../src/lib/errors";
import { nextStatus } from "../../src/lib/surveyLifecycle";

type Action = "publish" | "close";

describe("TEST-15 survey status transitions (BR-03)", () => {
  test.each<[SurveyStatus, Action, SurveyStatus]>([
    ["DRAFT", "publish", "PUBLISHED"],
    ["PUBLISHED", "close", "CLOSED"]
  ])("%s + %s → %s", (from, action, to) => {
    expect(nextStatus(from, action)).toBe(to);
  });

  test.each<[SurveyStatus, Action]>([
    ["PUBLISHED", "publish"],
    ["CLOSED", "publish"],
    ["DRAFT", "close"],
    ["CLOSED", "close"]
  ])("%s + %s is rejected with 409 INVALID_TRANSITION", (from, action) => {
    let caught: unknown;
    try {
      nextStatus(from, action);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect(caught).toMatchObject({ status: 409, code: "INVALID_TRANSITION" });
  });
});

describe("TEST-103 explicit reopen completes the state/action matrix", () => {
  test("CLOSED reopens to PUBLISHED through the explicit action", () => {
    expect(nextStatus("CLOSED", "reopen")).toBe("PUBLISHED");
  });
  test.each(["DRAFT", "PUBLISHED"] as const)("%s cannot reopen", status => {
    expect(() => nextStatus(status, "reopen")).toThrow(ApiError);
    try { nextStatus(status, "reopen"); } catch (error) {
      expect(error).toMatchObject({ status: 409, code: "INVALID_TRANSITION" });
    }
  });
});
