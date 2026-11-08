import type { Answer, Question, QuestionOption } from "@prisma/client";

export type SummaryQuestion = Pick<Question, "id" | "position" | "prompt" | "type" | "required"> & {
  options: Array<Pick<QuestionOption, "id" | "position" | "label">>;
};

export type SummaryAnswer = Pick<Answer, "questionId" | "ratingValue" | "optionId">;

type RatingSummary = {
  average: number | null;
  distribution: { "1": number; "2": number; "3": number; "4": number; "5": number };
};

type QuestionSummary =
  | { questionId: number; prompt: string; type: "RATING"; rating: RatingSummary }
  | { questionId: number; prompt: string; type: "SINGLE_CHOICE"; choice: { options: Array<{ optionId: number; label: string; count: number }> } };

export type SurveySummary = {
  responseCount: number;
  questions: QuestionSummary[];
};

function roundHalfUpToTwoDecimals(sum: number, count: number): number | null {
  if (count === 0) return null;
  // Scale to cents using integer arithmetic; this avoids binary tie errors like 4.335 -> 4.33.
  const cents = Math.floor((sum * 200 + count) / (2 * count));
  return cents / 100;
}

/** Build aggregate-only results from the survey's questions and submitted answer values. */
export function summarize(
  questions: readonly SummaryQuestion[],
  answers: readonly SummaryAnswer[],
  responseCount: number
): SurveySummary {
  const orderedQuestions = [...questions].sort((a, b) => a.position - b.position);
  const byQuestion = new Map<number, SummaryAnswer[]>();
  for (const answer of answers) {
    const rows = byQuestion.get(answer.questionId) ?? [];
    rows.push(answer);
    byQuestion.set(answer.questionId, rows);
  }

  return {
    responseCount,
    questions: orderedQuestions.map(question => {
      const questionAnswers = byQuestion.get(question.id) ?? [];
      if (question.type === "RATING") {
        const ratings = questionAnswers
          .map(answer => answer.ratingValue)
          .filter((value): value is number => value !== null && value !== undefined);
        const distribution: RatingSummary["distribution"] = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
        for (const rating of ratings) {
          if (rating >= 1 && rating <= 5 && Number.isInteger(rating)) {
            distribution[String(rating) as keyof RatingSummary["distribution"]] += 1;
          }
        }
        const sum = ratings.reduce((total, rating) => total + rating, 0);
        return {
          questionId: question.id,
          prompt: question.prompt,
          type: "RATING",
          rating: { average: roundHalfUpToTwoDecimals(sum, ratings.length), distribution }
        };
      }

      const counts = new Map<number, number>();
      for (const answer of questionAnswers) {
        if (answer.optionId !== null && answer.optionId !== undefined) {
          counts.set(answer.optionId, (counts.get(answer.optionId) ?? 0) + 1);
        }
      }
      return {
        questionId: question.id,
        prompt: question.prompt,
        type: "SINGLE_CHOICE",
        choice: {
          options: [...question.options]
            .sort((a, b) => a.position - b.position)
            .map(option => ({ optionId: option.id, label: option.label, count: counts.get(option.id) ?? 0 }))
        }
      };
    })
  };
}
