import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { asyncRoute } from "../lib/asyncRoute";
import { ApiError } from "../lib/errors";
import { parseId } from "../lib/params";
import { nextStatus, type SurveyAction } from "../lib/surveyLifecycle";
import { parseCourseId, validateSurveyInput } from "../lib/surveyValidation";
import { getPrisma } from "../prisma";
import { parseLifecycleQuery, parseReopenInput } from "../lib/surveyReopenValidation";

const surveyInclude = {
  course: { select: { code: true } },
  questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
} satisfies Prisma.SurveyInclude;
type SurveyRow = Prisma.SurveyGetPayload<{ include: typeof surveyInclude }>;

/** The survey object of contract F-03 §6. */
function toSurveyDto(survey: SurveyRow) {
  return {
    id: survey.id,
    courseId: survey.courseId,
    courseCode: survey.course.code,
    title: survey.title,
    description: survey.description,
    mode: survey.mode,
    status: survey.status,
    statusVersion: survey.statusVersion,
    updatedAt: survey.updatedAt,
    publishedAt: survey.publishedAt,
    closedAt: survey.closedAt,
    createdAt: survey.createdAt,
    questions: survey.questions.map(q => ({
      id: q.id,
      position: q.position,
      prompt: q.prompt,
      type: q.type,
      required: q.required,
      options: q.options.map(o => ({ id: o.id, position: o.position, label: o.label }))
    }))
  };
}

const notFound = () => new ApiError(404, "NOT_FOUND", "Survey not found");

/**
 * Lock the owned survey, conditionally transition and record its audit event in one transaction.
 * The explicit reopen version also protects against a close/reopen/close ABA cycle.
 */
function transition(action: SurveyAction) {
  return asyncRoute(async (req, res) => {
    const prisma = getPrisma();
    const ownerId = req.user!.id;
    const id = parseId(req.params.id);
    const updated = await prisma.$transaction(async tx => {
      const owned = await tx.$queryRaw<{ id: number }[]>`
        SELECT "id" FROM "Survey" WHERE "id" = ${id} AND "ownerId" = ${ownerId} FOR UPDATE`;
      if (owned.length !== 1) throw notFound();
      const survey = await tx.survey.findFirstOrThrow({ where: { id, ownerId } });
      const input = action === "reopen" ? parseReopenInput(req.body) : null;
      const stale = () => new ApiError(409, "STALE_SURVEY", "The survey changed; reload and explicitly try again");
      if (input && input.expectedVersion !== survey.statusVersion) throw stale();
      const to = nextStatus(survey.status, action);
      if (action === "reopen" && survey.publishedAt === null) {
        throw new ApiError(409, "INVALID_TRANSITION", "This survey has no original publication time");
      }
      if (survey.statusVersion >= 2147483647) throw stale();
      const now = new Date();
      const changed = await tx.survey.updateMany({
        where: { id, ownerId, status: survey.status, statusVersion: survey.statusVersion },
        data: {
          status: to,
          statusVersion: { increment: 1 },
          ...(action === "publish" ? { publishedAt: now } : action === "close" ? { closedAt: now } : { closedAt: null })
        }
      });
      if (changed.count !== 1) throw stale();
      await tx.surveyLifecycleEvent.create({
        data: {
          surveyId: id,
          actorId: ownerId,
          action: action === "publish" ? "PUBLISH" : action === "close" ? "CLOSE" : "REOPEN",
          fromStatus: survey.status,
          toStatus: to,
          version: survey.statusVersion + 1,
          occurredAt: now,
          reason: input?.reason ?? null,
          previousClosedAt: action === "reopen" ? survey.closedAt : null
        }
      });
      return tx.survey.findFirstOrThrow({ where: { id, ownerId }, include: surveyInclude });
    });
    res.json({ survey: toSurveyDto(updated) });
  });
}

/** Mounted at /api/owner behind requireAuth and requireRole("OWNER"). */
export const ownerSurveysRouter = Router();

ownerSurveysRouter.get("/courses", asyncRoute(async (req, res) => {
  const courses = await getPrisma().course.findMany({
    where: { ownerId: req.user!.id },
    orderBy: { code: "asc" },
    select: { id: true, code: true, title: true }
  });
  res.json({ courses });
}));

ownerSurveysRouter.get("/surveys", asyncRoute(async (req, res) => {
  const rows = await getPrisma().survey.findMany({
    where: { ownerId: req.user!.id },
    orderBy: { id: "desc" },
    select: {
      id: true, title: true, status: true,
      course: { select: { code: true } },
      _count: { select: { responses: true } }
    }
  });
  res.json({
    surveys: rows.map(s => ({
      id: s.id, title: s.title, status: s.status, courseCode: s.course.code, responseCount: s._count.responses
    }))
  });
}));

ownerSurveysRouter.post("/surveys", asyncRoute(async (req, res) => {
  const prisma = getPrisma();
  const ownerId = req.user!.id;

  // Order (plan §2.5): a malformed courseId is 400, a course that is not the caller's is 404 even when other
  // fields are invalid, and only then are the remaining fields validated (400).
  const courseId = parseCourseId(req.body);
  const course = await prisma.course.findFirst({ where: { id: courseId, ownerId }, select: { id: true } });
  if (!course) throw new ApiError(404, "NOT_FOUND", "Course not found");

  const result = validateSurveyInput(req.body);
  if (!result.ok) throw new ApiError(400, "VALIDATION_ERROR", "Check the highlighted fields", result.details);
  const { title, description, questions } = result.value;

  // One nested create is one transaction: a failure leaves no partial survey.
  const survey = await prisma.survey.create({
    data: {
      courseId: course.id,
      ownerId,
      title,
      description,
      questions: {
        create: questions.map((q, index) => ({
          position: index + 1,
          prompt: q.prompt,
          type: q.type,
          required: q.required,
          options: { create: q.options.map((label, i) => ({ position: i + 1, label })) }
        }))
      }
    },
    include: surveyInclude
  });
  res.status(201).json({ survey: toSurveyDto(survey) });
}));

ownerSurveysRouter.get("/surveys/:id", asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  const survey = await getPrisma().survey.findFirst({
    where: { id, ownerId: req.user!.id },
    include: surveyInclude
  });
  if (!survey) throw notFound();
  res.json({ survey: toSurveyDto(survey) });
}));

ownerSurveysRouter.put("/surveys/:id/questions", asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  const ownerId = req.user!.id;
  const prisma = getPrisma();
  const updated = await prisma.$transaction(async tx => {
    const owned = await tx.$queryRaw<{ id: number }[]>`
      SELECT "id" FROM "Survey" WHERE "id" = ${id} AND "ownerId" = ${ownerId} FOR UPDATE`;
    if (owned.length !== 1) throw notFound();
    const survey = await tx.survey.findFirstOrThrow({ where: { id, ownerId } });
    const invalid = (field: string, message: string): never => {
      throw new ApiError(400, "VALIDATION_ERROR", "Check the highlighted fields", [{ field, message }]);
    };
    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) invalid("body", "Send a JSON object");
    const body = req.body as Record<string, unknown>;
    if (Object.keys(body).some(key => key !== "expectedUpdatedAt" && key !== "questions")) invalid("body", "Unexpected field");
    const value = body.expectedUpdatedAt;
    if (typeof value !== "string") invalid("expectedUpdatedAt", "Use the current timestamp");
    const token = new Date(value as string);
    if (!Number.isFinite(token.getTime()) || token.toISOString() !== value) invalid("expectedUpdatedAt", "Use a canonical timestamp");
    if (Array.isArray(body.questions)) {
      body.questions.forEach((q: unknown, i: number) => {
        if (typeof q === "object" && q !== null && !Array.isArray(q) &&
          Object.keys(q).some(key => !["prompt", "type", "required", "options"].includes(key))) {
          invalid(`questions[${i}]`, "Unexpected field");
        }
      });
    }
    const parsed = validateSurveyInput({ courseId: survey.courseId, title: survey.title, questions: body.questions });
    if (!parsed.ok) throw new ApiError(400, "VALIDATION_ERROR", "Check the highlighted fields", parsed.details);
    if (survey.status !== "DRAFT") throw new ApiError(409, "INVALID_TRANSITION", "Only drafts may be edited");
    if (survey.updatedAt.getTime() !== token.getTime()) throw new ApiError(409, "STALE_SURVEY", "The survey changed; reload and try again");
    if (await tx.response.count({ where: { surveyId: id } }) > 0) {
      throw new ApiError(409, "DRAFT_HAS_RESPONSES", "This draft contains responses and cannot be edited");
    }
    const changed = await tx.survey.updateMany({ where: { id, ownerId, status: "DRAFT", updatedAt: token },
      data: { updatedAt: new Date(Math.max(Date.now(), token.getTime() + 1)) } });
    if (changed.count !== 1) throw new ApiError(409, "STALE_SURVEY", "The survey changed; reload and try again");
    await tx.questionOption.deleteMany({ where: { question: { surveyId: id } } });
    await tx.question.deleteMany({ where: { surveyId: id } });
    for (const [index, q] of parsed.value.questions.entries()) {
      await tx.question.create({ data: { surveyId: id, position: index + 1, prompt: q.prompt, type: q.type,
        required: q.required, options: { create: q.options.map((label, i) => ({ position: i + 1, label })) } } });
    }
    return tx.survey.findFirstOrThrow({ where: { id, ownerId }, include: surveyInclude });
  });
  res.json({ survey: toSurveyDto(updated) });
}));

ownerSurveysRouter.post("/surveys/:id/publish", transition("publish"));
ownerSurveysRouter.post("/surveys/:id/close", transition("close"));
ownerSurveysRouter.post("/surveys/:id/reopen", transition("reopen"));

ownerSurveysRouter.get("/surveys/:id/lifecycle", asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  const prisma = getPrisma();
  const survey = await prisma.survey.findFirst({ where: { id, ownerId: req.user!.id }, select: { id: true } });
  if (!survey) throw notFound();
  const { limit, before } = parseLifecycleQuery(req.query);
  const rows = await prisma.surveyLifecycleEvent.findMany({
    where: { surveyId: id, ...(before === undefined ? {} : { id: { lt: before } }) },
    orderBy: { id: "desc" },
    take: limit + 1,
    select: { id: true, version: true, action: true, fromStatus: true, toStatus: true, reason: true, occurredAt: true, previousClosedAt: true }
  });
  const events = rows.slice(0, limit);
  res.json({ events, nextCursor: rows.length > limit ? events[events.length - 1].id : null });
}));
