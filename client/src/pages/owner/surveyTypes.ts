export type SurveyStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type QuestionType = "RATING" | "SINGLE_CHOICE";

export interface Course {
  id: number;
  code: string;
  title: string;
}

export interface SurveyListItem {
  id: number;
  title: string;
  status: SurveyStatus;
  courseCode: string;
  responseCount: number;
}

export interface SurveyQuestion {
  id: number;
  position: number;
  prompt: string;
  type: QuestionType;
  required: boolean;
  options: Array<{ id: number; position: number; label: string }>;
}

export interface SurveyDetail {
  id: number;
  courseId: number;
  courseCode: string;
  title: string;
  description: string | null;
  mode: "IDENTIFIED";
  status: SurveyStatus;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  questions: SurveyQuestion[];
}
