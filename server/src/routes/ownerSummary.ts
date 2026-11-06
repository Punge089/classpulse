import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { ApiError } from "../lib/errors";
import { parseId } from "../lib/params";
import { summarize } from "../lib/summary";
import { getPrisma } from "../prisma";

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req, res, next: NextFunction) => {
    void handler(req, res).catch(next);
  };
}

export const ownerSummaryRouter = Router();

ownerSummaryRouter.get("/:id/summary", asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  const prisma = getPrisma();
  const survey = await prisma.survey.findFirst({
    where: { id, ownerId: req.user!.id },
    select: {
      id: true,
      status: true,
      questions: {
        orderBy: { position: "asc" },
        include: { options: { orderBy: { position: "asc" } } }
      }
    }
  });
  if (!survey) throw new ApiError(404, "NOT_FOUND", "Survey not found");

  const [responseCount, answers] = await Promise.all([
    prisma.response.count({ where: { surveyId: survey.id } }),
    prisma.answer.findMany({
      where: { question: { surveyId: survey.id } },
      select: { questionId: true, ratingValue: true, optionId: true }
    })
  ]);
  const aggregate = summarize(survey.questions, answers, responseCount);

  res.json({
    summary: {
      surveyId: survey.id,
      status: survey.status,
      responseCount: aggregate.responseCount,
      questions: aggregate.questions
    }
  });
}));
