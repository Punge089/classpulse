import { Router } from "express";
import { Prisma } from "@prisma/client";
import { asyncRoute } from "../lib/asyncRoute";
import { ApiError } from "../lib/errors";
import { parseId } from "../lib/params";
import { currentRosterRate } from "../lib/sectionEligibility";
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
        courseId: true,
        questions: {
          orderBy: { position: "asc" },
          include: { options: { orderBy: { position: "asc" } } }
        }
      }
    });
    if (!survey) throw new ApiError(404, "NOT_FOUND", "Survey not found");
    const [responseCount, rows, selections, responseRate] = await Promise.all([
      tx.response.count({ where: { surveyId: survey.id } }),
      tx.answer.findMany({
        where: { question: { surveyId: survey.id } },
        select: { id: true, questionId: true, ratingValue: true, optionId: true, textValue: true }
      }),
      // Filter selections by survey instead of expanding thousands of composite answer keys.
      tx.answerSelectedOption.findMany({
        where: { answer: { question: { surveyId: survey.id } } },
        select: { answerId: true, optionId: true }
      }),
      currentRosterRate(tx, survey.id, survey.courseId)
    ]);
    const selectedOptions = new Map<number, number[]>();
    for (const { answerId, optionId } of selections) {
      const options = selectedOptions.get(answerId);
      if (options) options.push(optionId);
      else selectedOptions.set(answerId, [optionId]);
    }
    const answers = rows.map(row => ({ ...row, optionIds: selectedOptions.get(row.id) }));
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
