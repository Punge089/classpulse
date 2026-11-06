import express, { type Express } from "express";
import { ApiError, errorHandler } from "./lib/errors";
import { authRouter } from "./routes/auth";

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);

  // Mount feature routers before the shared 404 and error handler.
  app.use("/api", (_req, _res, next) => {
    next(new ApiError(404, "NOT_FOUND", "Endpoint not found"));
  });
  app.use(errorHandler);
  return app;
}
