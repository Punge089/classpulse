import express from "express";
import request from "supertest";
import { expect, test } from "vitest";

test("TEST-52 health, invalid or unknown IDs, and malformed JSON use the API contract", async () => {
  const { createApp } = await import("../../src/app");
  const { ApiError, errorHandler } = await import("../../src/lib/errors");
  const { parseId } = await import("../../src/lib/params");

  const health = await request(createApp()).get("/api/health");
  expect(health.status).toBe(200);
  expect(health.body).toEqual({ status: "ok" });

  const app = express();
  app.use(express.json());
  app.post("/t/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id !== 1) throw new ApiError(404, "NOT_FOUND", "Record not found");
    res.json({ id });
  });
  app.use(errorHandler);

  for (const path of ["/t/abc", "/t/0", "/t/2147483648", "/t/2"]) {
    const result = await request(app).post(path).send({});
    expect(result.status).toBe(404);
    expect(result.body).toEqual({ error: { code: "NOT_FOUND", message: expect.any(String) } });
  }
  const malformed = await request(app).post("/t/1").set("Content-Type", "application/json").send("{");
  expect(malformed.status).toBe(400);
  expect(malformed.body).toEqual({ error: { code: "VALIDATION_ERROR", message: expect.any(String) } });
});
