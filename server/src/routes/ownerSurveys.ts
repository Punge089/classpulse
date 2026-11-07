import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { asyncRoute } from "../lib/asyncRoute";
import { ApiError } from "../lib/errors";
import { parseId } from "../lib/params";
import { nextStatus, type SurveyAction } from "../lib/surveyLifecycle";
import { parseCourseId, validateSurveyInput } from "../lib/surveyValidation";
import { getPrisma } from "../prisma";

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
 * Publish or close. The status change is a conditional update (id, owner and the status we just read), so two
 * simultaneous requests cannot both succeed.
 */
function transition(action: SurveyAction) {
  return asyncRoute(async (req, res) => {
    const prisma = getPrisma();
    const ownerId = req.user!.id;
    const id = parseId(req.params.id);
    const survey = await prisma.survey.findFirst({ where: { id, ownerId }, select: { status: true } });
    if (!survey) throw notFound();

    const to = nextStatus(survey.status, action);
    const now = new Date();
    const changed = await prisma.survey.updateMany({
      where: { id, ownerId, status: survey.status },
      data: action === "publish" ? { status: to, publishedAt: now } : { status: to, closedAt: now }
    });
    if (changed.count !== 1) {
      throw new ApiError(409, "INVALID_TRANSITION", "The survey changed while you were working; reload and try again");
    }
    const updated = await prisma.survey.findFirstOrThrow({ where: { id, ownerId }, include: surveyInclude });
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

ownerSurveysRouter.post("/surveys/:id/publish", transition("publish"));
ownerSurveysRouter.post("/surveys/:id/close", transition("close"));
