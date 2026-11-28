import { Router } from "express";
import { Prisma } from "@prisma/client";
import { asyncRoute } from "../lib/asyncRoute";
import { ApiError } from "../lib/errors";
import { parseId } from "../lib/params";
import { currentRosterRate } from "../lib/sectionEligibility";
import { summarize } from "../lib/summary";
import { getPrisma } from "../prisma";

export const ownerSummaryRouter = Router();

ownerSummaryRouter.get("/:id/summary", asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  const prisma = getPrisma();
  const aggregate = await prisma.$transaction(async tx => {
    const survey = await tx.survey.findFirst({
      where: { id, ownerId: req.user!.id },
      select: {
        id: true,
        status: true,
        courseId: true,
        questions: {
          orderBy: { position: "asc" },
          include: { options: { orderBy: { position: "asc" } } }
        }
      }
    });
    if (!survey) throw new ApiError(404, "NOT_FOUND", "Survey not found");
    const [responseCount, rows, responseRate] = await Promise.all([
      tx.response.count({ where: { surveyId: survey.id } }),
      tx.answer.findMany({
        where: { question: { surveyId: survey.id } },
        select: {
          questionId: true, ratingValue: true, optionId: true, textValue: true,
          selections: { select: { optionId: true } }
        }
      }),
      currentRosterRate(tx, survey.id, survey.courseId)
    ]);
    const answers = rows.map(row => ({ ...row, optionIds: row.selections.map(selection => selection.optionId) }));
    return { survey, summary: summarize(survey.questions, answers, responseCount), responseRate };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });

  res.json({
    summary: {
      surveyId: aggregate.survey.id,
      status: aggregate.survey.status,
      responseCount: aggregate.summary.responseCount,
      responseRate: aggregate.responseRate,
      questions: aggregate.summary.questions
    }
  });
}));
