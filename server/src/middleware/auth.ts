import type { RequestHandler } from "express";
import { ApiError } from "../lib/errors";
import { findSessionUser, readSessionToken } from "../lib/session";
import type { AuthUser } from "../types";

/** 401 UNAUTHENTICATED unless the request carries a live session; attaches req.user otherwise. */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = readSessionToken(req);
    const user = token ? await findSessionUser(token) : null;
    if (!user) throw new ApiError(401, "UNAUTHENTICATED", "Please sign in to continue");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/** 403 FORBIDDEN unless the logged-in user has exactly this role. Use after requireAuth. */
export function requireRole(role: AuthUser["role"]): RequestHandler {
  return (req, _res, next) => {
    if (req.user?.role !== role) {
      next(new ApiError(403, "FORBIDDEN", "You do not have permission to do that"));
      return;
    }
    next();
  };
}
