import { ApiError, type FieldError } from "./errors";

/** Largest value of the database integer id columns. */
const MAX_ID = 2147483647;
const validCourseId = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_ID;

/** The `courseId` of a create-survey body, or a 400 naming `courseId`. The route calls this before it looks the course up. */
export function parseCourseId(body: unknown): number {
  const id = typeof body === "object" && body !== null ? (body as Record<string, unknown>).courseId : undefined;
  if (!validCourseId(id)) {
    const message = "Choose one of your courses";
    throw new ApiError(400, "VALIDATION_ERROR", message, [{ field: "courseId", message }]);
  }
  return id;
}

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

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 1000;
const MAX_QUESTIONS = 20;
const MAX_PROMPT = 300;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const MAX_OPTION = 100;

/** BR-02: validates a create-survey body and returns the trimmed values, or one detail per bad field. */
export function validateSurveyInput(body: unknown): SurveyValidation {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, details: [{ field: "body", message: "Send a JSON object" }] };
  }
  const input = body as Record<string, unknown>;
  const details: FieldError[] = [];
  const reported = new Set<string>();
  const fail = (field: string, message: string) => {
    if (!reported.has(field)) {
      reported.add(field);
      details.push({ field, message });
    }
  };

  const courseId = input.courseId;
  if (!validCourseId(courseId)) fail("courseId", "Choose one of your courses");

  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (title.length < 1 || title.length > MAX_TITLE) fail("title", `Title must be 1 to ${MAX_TITLE} characters`);

  let description: string | null = null;
  if (input.description !== undefined && input.description !== null) {
    if (typeof input.description !== "string" || input.description.trim().length > MAX_DESCRIPTION) {
      fail("description", `Description can be at most ${MAX_DESCRIPTION} characters`);
    } else {
      description = input.description.trim() === "" ? null : input.description.trim();
    }
  }

  const questions: QuestionInput[] = [];
  if (!Array.isArray(input.questions) || input.questions.length < 1 || input.questions.length > MAX_QUESTIONS) {
    fail("questions", `Add 1 to ${MAX_QUESTIONS} questions`);
  }
  if (Array.isArray(input.questions)) {
    input.questions.forEach((raw: unknown, index: number) => {
      const at = `questions[${index}]`;
      if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
        fail(at, "Each question must be an object");
        return;
      }
      const q = raw as Record<string, unknown>;

      const prompt = typeof q.prompt === "string" ? q.prompt.trim() : "";
      if (prompt.length < 1 || prompt.length > MAX_PROMPT) {
        fail(`${at}.prompt`, `Question text must be 1 to ${MAX_PROMPT} characters`);
      }

      const type = q.type === "RATING" || q.type === "SINGLE_CHOICE" ? q.type : undefined;
      if (!type) fail(`${at}.type`, "Choose Rating or Single choice");

      let required = true;
      if (q.required !== undefined) {
        if (typeof q.required === "boolean") required = q.required;
        else fail(`${at}.required`, "Required must be true or false");
      }

      const options: string[] = [];
      if (type === "RATING") {
        if (q.options !== undefined && !(Array.isArray(q.options) && q.options.length === 0)) {
          fail(`${at}.options`, "A rating question has no options");
        }
      } else if (type === "SINGLE_CHOICE") {
        const raws = q.options;
        const trimmed = Array.isArray(raws) ? raws.map(o => (typeof o === "string" ? o.trim() : "")) : [];
        const lowered = new Set(trimmed.map(o => o.toLowerCase()));
        const bad = !Array.isArray(raws)
          || raws.length < MIN_OPTIONS || raws.length > MAX_OPTIONS
          || trimmed.some(o => o.length < 1 || o.length > MAX_OPTION)
          || lowered.size !== trimmed.length;
        if (bad) {
          fail(`${at}.options`, `Give ${MIN_OPTIONS} to ${MAX_OPTIONS} different options of 1 to ${MAX_OPTION} characters`);
        } else {
          options.push(...trimmed);
        }
      }

      if (type) questions.push({ prompt, type, required, options });
    });
  }

  if (details.length > 0) return { ok: false, details };
  return { ok: true, value: { courseId: courseId as number, title, description, questions } };
}
