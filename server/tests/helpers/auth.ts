import type { Express } from "express";
import request from "supertest";

export type TestAgent = ReturnType<typeof request.agent>;

/** Logs in through the real endpoint and returns a Supertest agent that keeps the session cookie. */
export async function loginAs(app: Express, email: string): Promise<TestAgent> {
  const password = process.env.SEED_PASSWORD;
  if (!password) throw new Error("Set the test SEED_PASSWORD before logging in");
  const agent = request.agent(app);
  const response = await agent.post("/api/auth/login").send({ email, password });
  if (response.status !== 200) {
    throw new Error("loginAs(" + email + ") expected 200 but got " + response.status);
  }
  return agent;
}

/** All Set-Cookie header values of a response as an array (empty when there are none). */
export function setCookies(response: { headers: Record<string, unknown> }): string[] {
  const value = response.headers["set-cookie"];
  if (Array.isArray(value)) return value as string[];
  return typeof value === "string" ? [value] : [];
}

/** The full `cp_session=…` Set-Cookie line of a response, or undefined. */
export function sessionSetCookie(response: { headers: Record<string, unknown> }): string | undefined {
  return setCookies(response).find(line => line.startsWith("cp_session="));
}

/** The `cp_session=<token>` pair, ready to send back in a Cookie header. */
export function sessionCookiePair(response: { headers: Record<string, unknown> }): string {
  const line = sessionSetCookie(response);
  if (!line) throw new Error("Response did not set a cp_session cookie");
  return line.split(";")[0];
}
