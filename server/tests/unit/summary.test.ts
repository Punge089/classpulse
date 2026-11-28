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

describe("F-07 TEST-147 text and multi-choice aggregate summaries", () => {
  test("reports text answeredCount and per-option counts without exposing text values or response IDs", () => {
    const text = {
      ...ratingQuestion(40, 1), prompt: "What helped?", type: "TEXT", required: false, options: []
    } as SummaryQuestion;
    const multi = {
      ...choiceQuestion(41, 2), prompt: "Which formats?", type: "MULTI_CHOICE",
      options: [
        { id: 51, questionId: 41, position: 1, label: "Examples" },
        { id: 52, questionId: 41, position: 2, label: "Discussion" },
        { id: 53, questionId: 41, position: 3, label: "Practice" }
      ]
    } as SummaryQuestion;
    const answers = [
      { questionId: 40, ratingValue: null, optionId: null, textValue: "private free text", optionIds: [] },
      { questionId: 40, ratingValue: null, optionId: null, textValue: "another private answer", optionIds: [] },
      { questionId: 41, ratingValue: null, optionId: null, textValue: null, optionIds: [51, 53] },
      { questionId: 41, ratingValue: null, optionId: null, textValue: null, optionIds: [53] }
    ] as unknown as SummaryAnswer[];
    const result = summarize([text, multi], answers, 3);
    expect(result.questions[0]).toEqual({ questionId: 40, prompt: "What helped?", type: "TEXT", text: { answeredCount: 2 } });
    expect(result.questions[1]).toEqual({ questionId: 41, prompt: "Which formats?", type: "MULTI_CHOICE", multiChoice: { answeredCount: 2, options: [
      { optionId: 51, label: "Examples", count: 1 },
      { optionId: 52, label: "Discussion", count: 0 },
      { optionId: 53, label: "Practice", count: 2 }
    ] } });
    expect(JSON.stringify(result)).not.toMatch(/private free text|another private answer|responseId|respondentId/);
  });

  test("retains zero counts for unanswered extended questions", () => {
    const text = { ...ratingQuestion(60), type: "TEXT" } as SummaryQuestion;
    const multi = { ...choiceQuestion(61), type: "MULTI_CHOICE" } as SummaryQuestion;
    const result = summarize([text, multi], [], 0);
    expect(result.questions[0]).toMatchObject({ type: "TEXT", text: { answeredCount: 0 } });
    expect(result.questions[1]).toMatchObject({ type: "MULTI_CHOICE", multiChoice: { answeredCount: 0, options: [{ count: 0 }, { count: 0 }] } });
  });
});
