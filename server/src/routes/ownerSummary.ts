import { Router } from "express";
import { Prisma } from "@prisma/client";
import { asyncRoute } from "../lib/asyncRoute";
import { ApiError } from "../lib/errors";
import { parseId } from "../lib/params";
import { summarize } from "../lib/summary";
import { readIdentifiedSurveyCsv } from "../lib/surveyCsv";
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
        questions: {
          orderBy: { position: "asc" },
          include: { options: { orderBy: { position: "asc" } } }
        }
      }
    });
    if (!survey) throw new ApiError(404, "NOT_FOUND", "Survey not found");
    const [responseCount, rows] = await Promise.all([
      tx.response.count({ where: { surveyId: survey.id } }),
      tx.answer.findMany({
        where: { question: { surveyId: survey.id } },
        select: {
          questionId: true, ratingValue: true, optionId: true, textValue: true,
          selections: { select: { optionId: true } }
        }
      })
    ]);
    const answers = rows.map(row => ({ ...row, optionIds: row.selections.map(selection => selection.optionId) }));
    return { survey, summary: summarize(survey.questions, answers, responseCount) };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });

  res.json({
    summary: {
      surveyId: aggregate.survey.id,
      status: aggregate.survey.status,
      responseCount: aggregate.summary.responseCount,
      questions: aggregate.summary.questions
    }
  });
}));

ownerSummaryRouter.get("/:id/export.csv", asyncRoute(async (req, res) => {
  const rawId = req.params.id;
  const id = Number(rawId);
  if (!/^\d+$/.test(rawId) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
    throw new ApiError(400, "VALIDATION_ERROR", "Choose a valid survey");
  }
  const csv = await readIdentifiedSurveyCsv(req.user!.id, id, Object.keys(req.query).length > 0);
  res.attachment(`classpulse-survey-${id}.csv`);
  res.set("Cache-Control", "private, no-store");
  res.type("text/csv").send(csv);
}));
