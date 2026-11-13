import { extname, resolve } from "node:path";
import express, { type Express } from "express";
import { ApiError, errorHandler } from "./lib/errors";
import { requireAuth, requireRole } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { ownerSummaryRouter } from "./routes/ownerSummary";
import { responsesRouter, surveyResponsesRouter } from "./routes/responses";
import { surveysRouter } from "./routes/surveys";
import { ownerSurveysRouter } from "./routes/ownerSurveys";
import { getPrisma } from "./prisma";

type CreateAppOptions = {
  clientDistPath?: string;
};

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/ready", async (_req, res) => {
    try {
      await getPrisma().$queryRaw`SELECT 1`;
      res.json({ status: "ready", db: "connected" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });

  app.use("/api/auth", authRouter);
  app.use("/api/owner/surveys", requireAuth, requireRole("OWNER"), ownerSummaryRouter);
  app.use("/api/surveys", requireAuth, requireRole("RESPONDENT"), surveysRouter);
  app.use("/api/surveys", requireAuth, requireRole("RESPONDENT"), surveyResponsesRouter);
  app.use("/api/responses", requireAuth, requireRole("RESPONDENT"), responsesRouter);
  app.use("/api/owner", requireAuth, requireRole("OWNER"), ownerSurveysRouter);

  if (process.env.NODE_ENV === "production") {
    const clientDistPath = options.clientDistPath ?? resolve(__dirname, "../../client/dist");
    const indexPath = resolve(clientDistPath, "index.html");
    app.use(express.static(clientDistPath));

    app.get("*", (req, res, next) => {
      const isApiPath = req.path === "/api" || req.path.startsWith("/api/");
      const isAssetPath = req.path === "/assets" || req.path.startsWith("/assets/");
      const isFileLikePath = extname(req.path) !== "";
      if (isApiPath || isAssetPath || isFileLikePath || !req.accepts("html")) {
        next();
        return;
      }
      res.sendFile(indexPath, error => {
        if (error) next(error);
      });
    });
  }

  // Keep unknown API paths in the established JSON error format.
  app.use("/api", (_req, _res, next) => {
    next(new ApiError(404, "NOT_FOUND", "Endpoint not found"));
  });
  app.use(errorHandler);
  return app;
}
