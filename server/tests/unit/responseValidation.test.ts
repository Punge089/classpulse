import { describe, expect, test } from "vitest";
import { validateAnswers } from "../../src/lib/responseValidation";

type ValidationQuestion = Parameters<typeof validateAnswers>[0][number];

function question(
  id: number,
  type: "RATING" | "SINGLE_CHOICE",
  required: boolean,
  options: Array<[number, string]> = []
): ValidationQuestion {
  return {
    id,
    prompt: "Question " + id,
    type,
    required,
    options: options.map(([optionId, label], index) => ({ id: optionId, position: index + 1, label }))
  } as ValidationQuestion;
}

const questions: ValidationQuestion[] = [
  question(10, "RATING", true),
  question(11, "RATING", false),
  question(12, "SINGLE_CHOICE", true, [[21, "Yes"], [22, "No"]]),
  question(13, "SINGLE_CHOICE", false, [[31, "A"], [32, "B"]])
];

describe("TEST-28 invalid answer collections and fields (AC-25)", () => {
  const invalid: Array<[string, unknown, string]> = [
    ["rating 0", { answers: [{ questionId: 10, ratingValue: 0 }] }, "answers[0].ratingValue"],
    ["rating 6", { answers: [{ questionId: 10, ratingValue: 6 }] }, "answers[0].ratingValue"],
    ["decimal rating", { answers: [{ questionId: 10, ratingValue: 2.5 }] }, "answers[0].ratingValue"],
    ["string rating", { answers: [{ questionId: 10, ratingValue: "3" }] }, "answers[0].ratingValue"],
    ["string question id", { answers: [{ questionId: "10", ratingValue: 3 }] }, "answers[0].questionId"],
    ["option from a different question", { answers: [{ questionId: 12, optionId: 31 }] }, "answers[0].optionId"],
    ["unknown question id", { answers: [{ questionId: 999, ratingValue: 3 }] }, "answers[0].questionId"],
    ["duplicate question id", { answers: [{ questionId: 10, ratingValue: 3 }, { questionId: 10, ratingValue: 4 }, { questionId: 12, optionId: 21 }] }, "answers[1].questionId"],
    ["unexpected answer field", { answers: [{ questionId: 10, ratingValue: 3, extra: true }, { questionId: 12, optionId: 21 }] }, "answers[0]"],
    ["answers is not an array", { answers: "x" }, "answers"]
  ];

  test("a missing required question is rejected with a field detail", () => {
    const result = validateAnswers(questions, { answers: [{ questionId: 10, ratingValue: 4 }] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.details.length).toBeGreaterThan(0);
  });

  test.each(invalid)("%s is rejected with its field detail", (_name, body, field) => {
    const result = validateAnswers(questions, body);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.details.map(detail => detail.field)).toContain(field);
  });
});

describe("TEST-28 valid answer boundaries and optional questions (AC-25, BR-07)", () => {
  test.each([1, 5])("rating %i is accepted; omitted optional answers stay omitted", ratingValue => {
    const result = validateAnswers(questions, {
      answers: [
        { questionId: 10, ratingValue },
        { questionId: 12, optionId: 21 }
      ]
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.map(answer => answer.questionId).sort()).toEqual([10, 12]);
  });
});
