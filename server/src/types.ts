export type Role = "OWNER" | "RESPONDENT";

/** The logged-in user as exposed to the API and to route handlers (never includes passwordHash). */
export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}
