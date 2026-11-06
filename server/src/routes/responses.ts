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
            ...(answer.optionId === undefined ? {} : { optionId: answer.optionId })
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

responsesRouter.get("/:id", asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  const response = await getPrisma().response.findFirst({
    where: { id, respondentId: req.user!.id },
    include: {
      answers: {
        include: {
          question: { select: { position: true, prompt: true, type: true } },
          option: { select: { label: true } }
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
          ...(answer.optionId === null ? {} : { optionId: answer.optionId, optionLabel: answer.option?.label })
        }))
    }
  });
}));
