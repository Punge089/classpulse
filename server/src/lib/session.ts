import { createHash, randomBytes } from "node:crypto";
import type { CookieOptions, Request } from "express";
import { getPrisma } from "../prisma";
import type { AuthUser } from "../types";

export const SESSION_COOKIE = "cp_session";
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;

/** Session lifetime in hours from SESSION_TTL_HOURS (default 8). */
export function sessionTtlHours(): number {
  const hours = Number(process.env.SESSION_TTL_HOURS ?? "8");
  return Number.isFinite(hours) && hours > 0 ? hours : 8;
}

/** Only the SHA-256 digest of the token is stored; the raw token lives only in the cookie. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Secure flag: on when NODE_ENV=production (SDS §6, contract F-01 §3); production must be served over HTTPS. */
function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

export function sessionCookieOptions(): CookieOptions {
  return { httpOnly: true, sameSite: "lax", secure: cookieSecure(), path: "/" };
}

export function sessionMaxAgeMs(): number {
  return Math.round(sessionTtlHours() * 3_600_000);
}

export async function createSession(userId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionMaxAgeMs());
  await getPrisma().session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  return { token, expiresAt };
}

/** The user for a live session token, or null when it is unknown, expired, or the user is inactive. */
export async function findSessionUser(token: string): Promise<AuthUser | null> {
  if (!TOKEN_FORMAT.test(token)) return null;
  const session = await getPrisma().session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true }
  });
  if (!session || session.expiresAt.getTime() <= Date.now() || !session.user.isActive) return null;
  const { id, email, fullName, role } = session.user;
  return { id, email, fullName, role };
}

export async function deleteSession(token: string): Promise<void> {
  await getPrisma().session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

/** The raw session token from the Cookie header, if any. */
export function readSessionToken(req: Request): string | undefined {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === SESSION_COOKIE) return value.join("=");
  }
  return undefined;
}
