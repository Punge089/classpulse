import { Prisma } from "@prisma/client";
import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { ApiError } from "../lib/errors";
import { parseId } from "../lib/params";
import { validateAnswers } from "../lib/responseValidation";
import { getPrisma } from "../prisma";

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req, res, next: NextFunction) => {
    void handler(req, res).catch(next);
  };
}

const notFound = () => new ApiError(404, "NOT_FOUND", "Record not found");
type HistoryCursor = { submittedAt: Date; id: number };
type HistoryQuery = { limit: number; cursor: HistoryCursor | null };

function invalidQuery(field: string, message: string): ApiError {
  return new ApiError(400, "VALIDATION_ERROR", "Invalid response history query", [{ field, message }]);
}

function queryField(key: string): string {
  if (key === "limit" || key.startsWith("limit[")) return "limit";
  if (key === "cursor" || key.startsWith("cursor[")) return "cursor";
  return key || "query";
}

function decodeQueryComponent(raw: string, field: string): string {
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    throw invalidQuery(field, "Query parameter encoding is malformed");
  }
}

function parseHistoryCursor(value: string): HistoryCursor {
  if (!value || value.length > 256 || !/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) {
    throw invalidQuery("cursor", "Cursor must be unpadded canonical base64url of at most 256 characters");
  }

  let decoded: string;
  try {
    const bytes = Buffer.from(value, "base64url");
    if (bytes.toString("base64url") !== value) throw new Error("noncanonical base64url");
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw invalidQuery("cursor", "Cursor encoding is invalid");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(decoded) as unknown;
  } catch {
    throw invalidQuery("cursor", "Cursor payload is not valid JSON");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw invalidQuery("cursor", "Cursor payload must contain submittedAt and id");
  }
  const keys = Object.keys(payload);
  if (keys.length !== 2 || !keys.includes("submittedAt") || !keys.includes("id")) {
    throw invalidQuery("cursor", "Cursor payload must contain exactly submittedAt and id");
  }

  const candidate = payload as { submittedAt?: unknown; id?: unknown };
  if (typeof candidate.submittedAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(candidate.submittedAt)) {
    throw invalidQuery("cursor", "submittedAt must be a canonical UTC timestamp with milliseconds");
  }
  const submittedAt = new Date(candidate.submittedAt);
  if (Number.isNaN(submittedAt.getTime()) || submittedAt.toISOString() !== candidate.submittedAt) {
    throw invalidQuery("cursor", "submittedAt must be a real canonical UTC timestamp");
  }
  if (typeof candidate.id !== "number" || !Number.isInteger(candidate.id) || candidate.id < 1 || candidate.id > 2147483647) {
    throw invalidQuery("cursor", "id must be a positive PostgreSQL Int");
  }
  return { submittedAt, id: candidate.id };
}

function parseHistoryQuery(originalUrl: string): HistoryQuery {
  const question = originalUrl.indexOf("?");
  const rawQuery = question < 0 ? "" : originalUrl.slice(question + 1);
  const values = new Map<string, string>();
  if (rawQuery) {
    for (const pair of rawQuery.split("&")) {
      const equals = pair.indexOf("=");
      const rawKey = equals < 0 ? pair : pair.slice(0, equals);
      let key: string;
      try {
        key = decodeURIComponent(rawKey.replace(/\+/g, " "));
      } catch {
        throw invalidQuery("query", "Query parameter name encoding is malformed");
      }
      const field = queryField(key);
      if (key !== "limit" && key !== "cursor") throw invalidQuery(field, "Unexpected query parameter");
      if (values.has(key)) throw invalidQuery(field, "Query parameter must not be repeated");
      const rawValue = equals < 0 ? "" : pair.slice(equals + 1);
      values.set(key, decodeQueryComponent(rawValue, field));
    }
  }

  const rawLimit = values.get("limit") ?? "20";
  if (!/^[1-9]\d*$/.test(rawLimit)) throw invalidQuery("limit", "limit must be an integer from 1 to 50");
  const limit = Number(rawLimit);
  if (!Number.isSafeInteger(limit) || limit > 50) throw invalidQuery("limit", "limit must be an integer from 1 to 50");
  const rawCursor = values.get("cursor");
  return { limit, cursor: rawCursor === undefined ? null : parseHistoryCursor(rawCursor) };
}

function encodeHistoryCursor(row: { submittedAt: Date; id: number }): string {
  return Buffer.from(JSON.stringify({ submittedAt: row.submittedAt.toISOString(), id: row.id })).toString("base64url");
}

export const surveyResponsesRouter = Router();
export const responsesRouter = Router();

surveyResponsesRouter.post("/:surveyId/responses", asyncRoute(async (req, res) => {
  const surveyId = parseId(req.params.surveyId);
  const userId = req.user!.id;
  const prisma = getPrisma();
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: {
      id: true,
      courseId: true,
      status: true,
      course: { select: { enrollments: { where: { userId }, select: { id: true }, take: 1 } } },
      questions: {
        orderBy: { position: "asc" },
        select: {
          id: true, type: true, required: true,
          options: { orderBy: { position: "asc" }, select: { id: true, position: true, label: true } }
        }
      }
    }
  });
  if (!survey) throw notFound();
  if (survey.course.enrollments.length === 0) {
    throw new ApiError(403, "NOT_ELIGIBLE", "You are not enrolled in this course");
  }
  if (survey.status !== "PUBLISHED") {
    throw new ApiError(409, "SURVEY_NOT_OPEN", "This survey is not open for responses");
  }

  const validated = validateAnswers(survey.questions, req.body);
  if (!validated.ok) {
    throw new ApiError(400, "VALIDATION_ERROR", "Please correct the answers", validated.details);
  }

  try {
    const response = await prisma.$transaction(tx => tx.response.create({
      data: {
        surveyId: survey.id,
        respondentId: userId,
        answers: {
          create: validated.value.map(answer => ({
            questionId: answer.questionId,
            ...(answer.ratingValue === undefined ? {} : { ratingValue: answer.ratingValue }),
            ...(answer.optionId === undefined ? {} : { optionId: answer.optionId }),
            ...(answer.textValue === undefined ? {} : { textValue: answer.textValue }),
            ...(answer.optionIds === undefined ? {} : {
              selections: { create: answer.optionIds.map(optionId => ({ questionId: answer.questionId, optionId })) }
            })
          }))
        }
      },
      select: { id: true, surveyId: true, submittedAt: true }
    }));
    res.status(201).json({ response });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, "ALREADY_RESPONDED", "You have already submitted this survey");
    }
    throw error;
  }
}));

responsesRouter.get("/mine", asyncRoute(async (req, res) => {
  const { limit, cursor } = parseHistoryQuery(req.originalUrl);
  const where: Prisma.ResponseWhereInput = { respondentId: req.user!.id };
  if (cursor) {
    where.OR = [
      { submittedAt: { lt: cursor.submittedAt } },
      { submittedAt: cursor.submittedAt, id: { lt: cursor.id } }
    ];
  }
  const rows = await getPrisma().response.findMany({
    where,
    orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: {
      id: true,
      surveyId: true,
      submittedAt: true,
      survey: { select: {
        title: true,
        status: true,
        course: { select: { code: true, title: true } }
      } }
    }
  });
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  res.json({
    responses: page.map(row => ({
      id: row.id,
      surveyId: row.surveyId,
      surveyTitle: row.survey.title,
      surveyStatus: row.survey.status,
      courseCode: row.survey.course.code,
      courseTitle: row.survey.course.title,
      submittedAt: row.submittedAt
    })),
    nextCursor: hasMore && page.length ? encodeHistoryCursor(page[page.length - 1]) : null
  });
}));
responsesRouter.get("/:id", asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  const response = await getPrisma().response.findFirst({
    where: { id, respondentId: req.user!.id },
    include: {
      answers: {
        include: {
          question: { select: { position: true, prompt: true, type: true } },
          option: { select: { label: true } },
          selections: { orderBy: [{ option: { position: "asc" } }, { optionId: "asc" }], include: { option: { select: { label: true } } } }
        }
      }
    }
  });
  if (!response) throw notFound();

  res.json({
    response: {
      id: response.id,
      surveyId: response.surveyId,
      submittedAt: response.submittedAt,
      answers: [...response.answers]
        .sort((a, b) => a.question.position - b.question.position)
        .map(answer => ({
          questionId: answer.questionId,
          prompt: answer.question.prompt,
          type: answer.question.type,
          ...(answer.ratingValue === null ? {} : { ratingValue: answer.ratingValue }),
          ...(answer.optionId === null ? {} : { optionId: answer.optionId, optionLabel: answer.option?.label }),
          ...(answer.textValue === null ? {} : { textValue: answer.textValue }),
          ...(answer.selections.length === 0 ? {} : { selectedOptions: answer.selections.map(selection => ({
            optionId: selection.optionId, label: selection.option.label
          })) })
        }))
    }
  });
}));
