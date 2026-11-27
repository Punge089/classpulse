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
  textValue?: string;
  optionIds?: number[];
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
      : question.type === "SINGLE_CHOICE"
        ? new Set(["questionId", "optionId"])
        : question.type === "TEXT"
          ? new Set(["questionId", "textValue"])
          : new Set(["questionId", "optionIds"]);
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

    if (question.type === "TEXT") {
      const rawText = item.textValue;
      if (typeof rawText !== "string") {
        details.push({ field: `${prefix}.textValue`, message: "Enter text for this question" });
        return;
      }
      const textValue = rawText.trim();
      const codePoints = [...textValue];
      const hasUnpairedSurrogate = codePoints.some(character => {
        const code = character.codePointAt(0)!;
        return code >= 0xd800 && code <= 0xdfff;
      });
      if (!textValue) {
        if (question.required) details.push({ field: `${prefix}.textValue`, message: "This question is required" });
        return;
      }
      if (codePoints.length > 500 || hasUnpairedSurrogate) {
        details.push({ field: `${prefix}.textValue`, message: "Text must contain 1 to 500 valid Unicode characters" });
        return;
      }
      value.push({ questionId, textValue });
      return;
    }

    if (question.type === "MULTI_CHOICE") {
      const optionIds = item.optionIds;
      if (!Array.isArray(optionIds) || optionIds.length < 1 || optionIds.length > question.options.length ||
          optionIds.some(id => typeof id !== "number" || !Number.isInteger(id) || id < 1) ||
          new Set(optionIds).size !== optionIds.length ||
          optionIds.some(id => !question.options.some(option => option.id === id))) {
        details.push({ field: `${prefix}.optionIds`, message: "Choose one or more distinct options for this question" });
        return;
      }
      const ordered = [...optionIds].sort((a, b) =>
        question.options.find(option => option.id === a)!.position - question.options.find(option => option.id === b)!.position
      );
      value.push({ questionId, optionIds: ordered });
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
