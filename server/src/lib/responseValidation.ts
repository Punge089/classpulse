import type { QuestionType } from "@prisma/client";
import type { FieldError } from "./errors";

export type ValidationQuestion = {
  id: number;
  type: QuestionType;
  required: boolean;
  options: Array<{ id: number; position: number; label: string }>;
};

export type ValidatedAnswer = {
  questionId: number;
  ratingValue?: number;
  optionId?: number;
};

export type AnswerValidation =
  | { ok: true; value: ValidatedAnswer[] }
  | { ok: false; details: FieldError[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validate and normalize a response body against the questions belonging to one survey. */
export function validateAnswers(
  questions: readonly ValidationQuestion[],
  body: unknown
): AnswerValidation {
  if (!isRecord(body) || !Array.isArray(body.answers)) {
    return { ok: false, details: [{ field: "answers", message: "Answers must be an array" }] };
  }

  const byId = new Map(questions.map(question => [question.id, question]));
  const seen = new Set<number>();
  const details: FieldError[] = [];
  const value: ValidatedAnswer[] = [];

  body.answers.forEach((item: unknown, index: number) => {
    const prefix = `answers[${index}]`;
    if (!isRecord(item)) {
      details.push({ field: prefix, message: "Each answer must be an object" });
      return;
    }

    const questionId = item.questionId;
    if (typeof questionId !== "number" || !Number.isInteger(questionId) || questionId < 1) {
      details.push({ field: `${prefix}.questionId`, message: "Question ID must be a positive integer" });
      return;
    }

    const question = byId.get(questionId);
    if (!question) {
      details.push({ field: `${prefix}.questionId`, message: "Question does not belong to this survey" });
      return;
    }
    if (seen.has(questionId)) {
      details.push({ field: `${prefix}.questionId`, message: "Question may be answered only once" });
      return;
    }
    seen.add(questionId);

    const allowedKeys = question.type === "RATING"
      ? new Set(["questionId", "ratingValue"])
      : new Set(["questionId", "optionId"]);
    if (Object.keys(item).some(key => !allowedKeys.has(key))) {
      details.push({ field: prefix, message: "Answer has fields that do not match the question" });
      return;
    }

    if (question.type === "RATING") {
      const ratingValue = item.ratingValue;
      if (typeof ratingValue !== "number" || !Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        details.push({ field: `${prefix}.ratingValue`, message: "Rating must be an integer from 1 through 5" });
        return;
      }
      value.push({ questionId, ratingValue });
      return;
    }

    const optionId = item.optionId;
    if (typeof optionId !== "number" || !Number.isInteger(optionId) || optionId < 1) {
      details.push({ field: `${prefix}.optionId`, message: "Option ID must be a positive integer" });
      return;
    }
    if (!question.options.some(option => option.id === optionId)) {
      details.push({ field: `${prefix}.optionId`, message: "Option does not belong to this question" });
      return;
    }
    value.push({ questionId, optionId });
  });

  for (const question of questions) {
    if (question.required && !seen.has(question.id)) {
      details.push({ field: "answers", message: `Required question ${question.id} is missing` });
    }
  }

  return details.length > 0 ? { ok: false, details } : { ok: true, value };
}
