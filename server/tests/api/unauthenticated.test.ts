import request from "supertest";
import { expect, test } from "vitest";
import { createApp } from "../../src/app";

type Method = "get" | "post";

/** Every protected route; each feature Issue appends its own routes here. */
export const PROTECTED_ROUTES: Array<[Method, string]> = [
  ["get", "/api/auth/me"],
  ["post", "/api/auth/logout"],
  // F-04 respondent routes (I-08)
  ["get", "/api/surveys"],
  ["get", "/api/surveys/1"],
  ["post", "/api/surveys/1/responses"],
  ["get", "/api/responses/1"]
];

const app = createApp();

test.each(PROTECTED_ROUTES)("TEST-07 %s %s requires login", async (method, path) => {
  const res = await request(app)[method](path);
  expect(res.status).toBe(401);
  expect(Object.keys(res.body)).toEqual(["error"]);
  expect(res.body.error.code).toBe("UNAUTHENTICATED");
});
