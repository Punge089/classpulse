import express, { type Express } from "express";
import { ApiError, errorHandler } from "./lib/errors";
import { requireAuth, requireRole } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { ownerSummaryRouter } from "./routes/ownerSummary";
import { responsesRouter, surveyResponsesRouter } from "./routes/responses";
import { surveysRouter } from "./routes/surveys";
import { ownerSurveysRouter } from "./routes/ownerSurveys";

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/owner/surveys", requireAuth, requireRole("OWNER"), ownerSummaryRouter);
  app.use("/api/surveys", requireAuth, requireRole("RESPONDENT"), surveysRouter);
  app.use("/api/surveys", requireAuth, requireRole("RESPONDENT"), surveyResponsesRouter);
  app.use("/api/responses", requireAuth, requireRole("RESPONDENT"), responsesRouter);
  app.use("/api/owner", requireAuth, requireRole("OWNER"), ownerSurveysRouter);

  // Mount feature routers before the shared 404 and error handler.
  app.use("/api", (_req, _res, next) => {
    next(new ApiError(404, "NOT_FOUND", "Endpoint not found"));
  });
  app.use(errorHandler);
  return app;
}
