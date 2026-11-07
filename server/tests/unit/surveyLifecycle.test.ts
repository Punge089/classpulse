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
