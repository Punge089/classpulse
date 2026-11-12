import { expect, test } from "vitest";

test("C-02 demonstration: a failing required check must block merging", () => {
  // Deliberately false on this disposable branch only. Never merge this PR.
  expect("required-check-failed").toBe("required-check-passed");
});
