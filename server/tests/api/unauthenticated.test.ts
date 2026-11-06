import request from "supertest";
import { expect, test } from "vitest";
import { createApp } from "../../src/app";

type Method = "get" | "post";

/** Every protected route; each feature Issue appends its own routes here. */
export const PROTECTED_ROUTES: Array<[Method, string]> = [
  ["get", "/api/auth/me"],
  ["post", "/api/auth/logout"],
  // F-05 owner summary route (I-09)
  ["get", "/api/owner/surveys/1/summary"]
];

const app = createApp();

test.each(PROTECTED_ROUTES)("TEST-07 %s %s requires login", async (method, path) => {
  const res = await request(app)[method](path);
  expect(res.status).toBe(401);
  expect(Object.keys(res.body)).toEqual(["error"]);
  expect(res.body.error.code).toBe("UNAUTHENTICATED");
});
