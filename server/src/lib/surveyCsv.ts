import { ApiError } from "./errors";
import { getPrisma } from "../prisma";

const maxResponses = 5_000;
const maxRows = 100_000;
const columns = [
  "response_id", "respondent_name", "respondent_email", "submitted_at",
  "question_position", "question_text", "question_type", "answer"
];

function csvCell(text: string): string {
  const protectedText = /^[\s\p{Cc}\p{Cf}]*[=+\-@\t\r\n]/u.test(text)
    ? "'" + text
    : text;
  return /[",\r\n]/.test(protectedText) ? '"' + protectedText.replaceAll('"', '""') + '"' : protectedText;
}

function csvRow(values: string[]): string {
  return values.map(csvCell).join(",");
}

function invalidStoredAnswer(): never {
  throw new ApiError(500, "INTERNAL_ERROR", "The export could not be prepared");
}

/** Prepare one identified export from a coherent snapshot; the route owns HTTP headers. */
export async function readIdentifiedSurveyCsv(
  ownerId: number,
  surveyId: number,
  hasUnsupportedQuery = false
): Promise<string> {
  const prisma = getPrisma();
  return prisma.$transaction(async db => {
    const survey = await db.survey.findFirst({
      where: { id: surveyId, ownerId },
      select: {
        mode: true, status: true,
        questions: {
          orderBy: [{ position: "asc" }, { id: "asc" }],
          select: { id: true, position: true, type: true, prompt: true, required: true }
        }
      }
    });
    if (!survey) throw new ApiError(404, "NOT_FOUND", "Survey not found");
    if (hasUnsupportedQuery) {
      throw new ApiError(400, "VALIDATION_ERROR", "The export does not accept query parameters");
    }
    if (survey.mode !== "IDENTIFIED" || (survey.status !== "PUBLISHED" && survey.status !== "CLOSED")) {
      throw new ApiError(409, "EXPORT_NOT_AVAILABLE", "Export is unavailable for this survey");
    }
    const count = await db.response.count({ where: { surveyId } });
    if (count > maxResponses || count * survey.questions.length > maxRows) {
      throw new ApiError(409, "EXPORT_TOO_LARGE", "This survey exceeds the export size limit");
    }
    const responses = await db.response.findMany({
      where: { surveyId },
      orderBy: [{ submittedAt: "asc" }, { id: "asc" }],
      select: {
        id: true, submittedAt: true,
        respondent: { select: { fullName: true, email: true } },
        answers: {
          select: {
            questionId: true, ratingValue: true, optionId: true,
            option: { select: { questionId: true, label: true } }
          }
        }
      }
    });

    const lines = [csvRow(columns)];
    for (const response of responses) {
      const saved = new Map(response.answers.map(answer => [answer.questionId, answer]));
      const identity = [
        String(response.id), response.respondent.fullName, response.respondent.email, response.submittedAt.toISOString()
      ];
      for (const question of survey.questions) {
        if (question.type !== "RATING" && question.type !== "SINGLE_CHOICE") invalidStoredAnswer();
        const answer = saved.get(question.id);
        let value = "";
        if (!answer) {
          if (question.required) invalidStoredAnswer();
        } else if (question.type === "RATING") {
          const rating = answer.ratingValue;
          if (rating === null || !Number.isInteger(rating) || rating < 1 || rating > 5 || answer.optionId !== null) {
            invalidStoredAnswer();
          }
          value = String(rating);
        } else {
          if (answer.ratingValue !== null || !answer.option || answer.option.questionId !== question.id) {
            invalidStoredAnswer();
          }
          value = JSON.stringify([answer.option.label]);
        }
        saved.delete(question.id);
        lines.push(csvRow([...identity, String(question.position), question.prompt, question.type, value]));
      }
      if (saved.size !== 0) invalidStoredAnswer();
    }
    return lines.join("\r\n") + "\r\n";
  }, { isolationLevel: "RepeatableRead" });
}
