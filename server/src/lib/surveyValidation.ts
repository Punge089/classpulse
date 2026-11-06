import type { FieldError } from "./errors";

export interface QuestionInput {
  prompt: string;
  type: "RATING" | "SINGLE_CHOICE";
  required: boolean;
  options: string[];
}

export interface SurveyInput {
  courseId: number;
  title: string;
  description: string | null;
  questions: QuestionInput[];
}

export type SurveyValidation = { ok: true; value: SurveyInput } | { ok: false; details: FieldError[] };

/** BR-02: validates a create-survey body and returns the trimmed values or one detail per bad field. */
export function validateSurveyInput(_body: unknown): SurveyValidation {
  throw new Error("validateSurveyInput has not been implemented");
}
