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

function typedQuestion(
  id: number,
  type: "TEXT" | "MULTI_CHOICE",
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

describe("F-07 TEST-143/144 text and multi-choice answer validation", () => {
  const extended = [
    typedQuestion(40, "TEXT", true),
    typedQuestion(41, "TEXT", false),
    typedQuestion(42, "MULTI_CHOICE", true, [[51, "A"], [52, "B"], [53, "C"]])
  ];

  test("accepts trimmed text and multiple distinct options while leaving optional blanks omitted", () => {
    const result = validateAnswers(extended, {
      answers: [
        { questionId: 40, textValue: "  useful examples  " },
        { questionId: 42, optionIds: [53, 51] }
      ]
    });
    expect(result).toEqual({ ok: true, value: [
      { questionId: 40, textValue: "useful examples" },
      { questionId: 42, optionIds: [51, 53] }
    ] });
  });

  test.each([
    ["blank required text", { answers: [{ questionId: 40, textValue: "   " }, { questionId: 42, optionIds: [51] }] }, "answers[0].textValue"],
    ["text longer than 500 code points", { answers: [{ questionId: 40, textValue: "x".repeat(501) }, { questionId: 42, optionIds: [51] }] }, "answers[0].textValue"],
    ["unpaired surrogate", { answers: [{ questionId: 40, textValue: "\ud800" }, { questionId: 42, optionIds: [51] }] }, "answers[0].textValue"],
    ["duplicate multi-choice option", { answers: [{ questionId: 40, textValue: "ok" }, { questionId: 42, optionIds: [51, 51] }] }, "answers[1].optionIds"],
    ["foreign-question option", { answers: [{ questionId: 40, textValue: "ok" }, { questionId: 42, optionIds: [31] }] }, "answers[1].optionIds"],
    ["empty required multi-choice", { answers: [{ questionId: 40, textValue: "ok" }, { questionId: 42, optionIds: [] }] }, "answers[1].optionIds"]
  ])("rejects %s with the specific field", (_name, body, field) => {
    const result = validateAnswers(extended, body);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.details.map(detail => detail.field)).toContain(field);
  });

  test("accepts 500 Unicode code points and omits a blank optional text answer", () => {
    const text = "🙂".repeat(500);
    const result = validateAnswers(extended, {
      answers: [{ questionId: 40, textValue: text }, { questionId: 42, optionIds: [52] }]
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value[0]).toEqual({ questionId: 40, textValue: text });
  });
});
