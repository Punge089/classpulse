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
  statusVersion: number;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  questions: SurveyQuestion[];
}

export interface SurveyLifecycleEvent {
  id: number;
  version: number;
  action: "PUBLISH" | "CLOSE" | "REOPEN";
  fromStatus: SurveyStatus;
  toStatus: SurveyStatus;
  reason: string | null;
  occurredAt: string;
  previousClosedAt: string | null;
}
