import { Prisma } from "@prisma/client";
import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { ApiError } from "../lib/errors";
import { parseId } from "../lib/params";
import { surveyAudience } from "../lib/sectionEligibility";
import { getPrisma } from "../prisma";

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req, res, next: NextFunction) => {
    void handler(req, res).catch(next);
  };
}

const notFound = () => new ApiError(404, "NOT_FOUND", "Survey not found");

export const surveysRouter = Router();

surveysRouter.get("/", asyncRoute(async (req, res) => {
  const userId = req.user!.id;
  const now = new Date();
  const surveys = await getPrisma().$transaction(async tx => tx.survey.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ closesAt: null }, { closesAt: { gt: now } }],
      ...await surveyAudience(tx, userId)
    },
    orderBy: { id: "asc" },
    select: {
      id: true,
      title: true,
      mode: true,
      status: true,
      closesAt: true,
      course: { select: { code: true } },
      responses: { where: { respondentId: userId }, select: { id: true }, take: 1 }
    }
  }), { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });

  res.json({
    surveys: surveys.map(({ id, title, mode, status, closesAt, course, responses }) => ({
      id, title, courseCode: course.code, mode, status, closesAt, hasResponded: responses.length > 0
    }))
  });
}));

surveysRouter.get("/:id", asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  const now = new Date();
  const survey = await getPrisma().$transaction(async tx => tx.survey.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      OR: [{ closesAt: null }, { closesAt: { gt: now } }],
      ...await surveyAudience(tx, req.user!.id)
    },
    include: {
      course: { select: { code: true } },
      questions: {
        orderBy: { position: "asc" },
        include: { options: { orderBy: { position: "asc" } } }
      }
    }
  }), { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  if (!survey) throw notFound();

  res.json({
    survey: {
      id: survey.id,
      courseId: survey.courseId,
      courseCode: survey.course.code,
      title: survey.title,
      description: survey.description,
      mode: survey.mode,
      status: survey.status,
      publishedAt: survey.publishedAt,
      closesAt: survey.closesAt,
      questions: survey.questions.map(question => ({
        id: question.id,
        position: question.position,
        prompt: question.prompt,
        type: question.type,
        required: question.required,
        options: question.options.map(option => ({
          id: option.id, position: option.position, label: option.label
        }))
      }))
    }
  });
}));
