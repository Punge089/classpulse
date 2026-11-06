import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { ApiError, type FieldError } from "../lib/errors";
import { hashPassword, verifyPassword } from "../lib/password";
import {
  SESSION_COOKIE, createSession, deleteSession, readSessionToken,
  sessionCookieOptions, sessionMaxAgeMs
} from "../lib/session";
import { requireAuth } from "../middleware/auth";
import { getPrisma } from "../prisma";

/** Express 4 does not catch rejected promises, so forward them to the error handler. */
function route(handler: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };
}

// An unknown email still costs one hash comparison, so response time does not reveal whether it exists.
let dummyHash: Promise<string> | undefined;
const timingDummyHash = () => (dummyHash ??= hashPassword("not-a-real-password"));

const INVALID_LOGIN = new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");

export const authRouter = Router();

authRouter.post("/login", route(async (req, res) => {
  const body: Record<string, unknown> =
    typeof req.body === "object" && req.body !== null ? req.body : {};
  const details: FieldError[] = [];
  if (typeof body.email !== "string" || body.email.trim() === "") {
    details.push({ field: "email", message: "Enter your email address" });
  }
  if (typeof body.password !== "string" || body.password === "") {
    details.push({ field: "password", message: "Enter your password" });
  }
  if (details.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Enter your email and password", details);
  }

  const email = (body.email as string).trim().toLowerCase();
  const user = await getPrisma().user.findUnique({ where: { email } });
  const matches = await verifyPassword(body.password as string, user?.passwordHash ?? await timingDummyHash());
  if (!user || !user.isActive || !matches) throw INVALID_LOGIN;

  const { token } = await createSession(user.id);
  res.cookie(SESSION_COOKIE, token, { ...sessionCookieOptions(), maxAge: sessionMaxAgeMs() });
  res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
}));

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRouter.post("/logout", requireAuth, route(async (req, res) => {
  const token = readSessionToken(req);
  if (token) await deleteSession(token);
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  res.status(204).end();
}));
