import { describe, expect, test } from "vitest";
import { summarize } from "../../src/lib/summary";

type SummaryQuestion = Parameters<typeof summarize>[0][number];
type SummaryAnswer = Parameters<typeof summarize>[1][number];

function ratingQuestion(id: number, position = 1): SummaryQuestion {
  return {
    id,
    surveyId: 1,
    position,
    prompt: "Pace of lectures",
    type: "RATING",
    required: true,
    options: []
  } as SummaryQuestion;
}

function choiceQuestion(id: number, position = 2): SummaryQuestion {
  return {
    id,
    surveyId: 1,
    position,
    prompt: "Would you recommend it?",
    type: "SINGLE_CHOICE",
    required: true,
    options: [
      { id: 21, questionId: id, position: 1, label: "Yes" },
      { id: 22, questionId: id, position: 2, label: "No" }
    ]
  } as SummaryQuestion;
}

function ratingAnswer(questionId: number, ratingValue: number, responseId: number): SummaryAnswer {
  return { id: responseId, responseId, questionId, ratingValue, optionId: null } as SummaryAnswer;
}

function choiceAnswer(questionId: number, optionId: number, responseId: number): SummaryAnswer {
  return { id: responseId, responseId, questionId, ratingValue: null, optionId } as SummaryAnswer;
}

const expectedDistribution = { "1": 0, "2": 0, "3": 0, "4": 2, "5": 1 };

describe("TEST-33 round-half-up rating averages (AC-30)", () => {
  test("[4,4,5] averages 4.33 with the literal distribution", () => {
    const question = ratingQuestion(10);
    const result = summarize(
      [question],
      [ratingAnswer(10, 4, 1), ratingAnswer(10, 4, 2), ratingAnswer(10, 5, 3)],
      3
    );
    expect(result.questions[0]).toMatchObject({
      questionId: 10,
      prompt: "Pace of lectures",
      type: "RATING",
      rating: { average: 4.33, distribution: expectedDistribution }
    });
  });

  test.each([
    [133, 4, 67, 5, 4.335, 4.34],
    [131, 4, 69, 5, 4.345, 4.35],
    [39, 1, 1, 2, 1.025, 1.03],
    [31, 4, 9, 5, 4.225, 4.23]
  ])("%i ratings of %i plus %i ratings of %i round %f half-up to %f", (countLow, lowValue, countHigh, highValue, _mean, expected) => {
    const question = ratingQuestion(10);
    const answers = [
      ...Array.from({ length: countLow }, (_value, index) => ratingAnswer(10, lowValue, index + 1)),
      ...Array.from({ length: countHigh }, (_value, index) => ratingAnswer(10, highValue, countLow + index + 1))
    ];
    const result = summarize([question], answers, answers.length);
    expect(result.questions[0]).toMatchObject({ rating: { average: expected } });
  });
});

describe("TEST-35 empty aggregates (AC-31)", () => {
  test("zero responses gives a null average and zero buckets, retaining every option", () => {
    const questions = [ratingQuestion(10), choiceQuestion(11)];
    const result = summarize(questions, [], 0);
    expect(result.responseCount).toBe(0);
    expect(result.questions[0]).toMatchObject({
      rating: { average: null, distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
    });
    expect(result.questions[1]).toMatchObject({
      choice: { options: [{ optionId: 21, label: "Yes", count: 0 }, { optionId: 22, label: "No", count: 0 }] }
    });
  });
});
