# F-01 security review (Issue #6, I-06)

Run on branch `feature/6-auth` at commit `f30ed0f` with the `security-review` skill. Scope: the code added by F-01
(`server/src/lib/session.ts`, `server/src/middleware/auth.ts`, `server/src/routes/auth.ts`, `server/src/types.ts`,
`client/src/auth/*`, `client/src/pages/LoginPage.tsx`, `client/src/components/NavBar.tsx`). The review was done by
reading the code; no finding was reproduced because none was reported. This is an AI-assisted review that the owner
and the reviewing student must still verify (see `docs/ai-use.md`).

# Result: no HIGH or MEDIUM findings (confidence threshold 8/10)

## What was checked, and why it did not become a finding

* **SQL/NoSQL injection:** the only inputs are the login `email` (checked to be a string, then passed to Prisma `findUnique`) and the cookie token (format-checked, then hashed before `findUnique`). No raw SQL in the new code.
* **Authentication bypass and session handling:**
  * Tokens are 32 bytes from `crypto.randomBytes`; only the SHA-256 digest is stored, so a database read does not yield usable cookies.
  * Every login issues a new token (no session fixation); logout deletes the row, and `findSessionUser` rejects expired sessions and inactive users.
  * Wrong password, unknown email and inactive user return the same 401 body, and an unknown email still performs one scrypt comparison, so there is no practical account enumeration.
  * `verifyPassword` enforces the stored hash format before `timingSafeEqual`, so lengths always match.
* **Authorization:** `requireRole` checks `req.user.role` set by `requireAuth` from the server-side session; the client `RequireRole` guard only redirects. `req.user` and every response contain `{ id, email, fullName, role }` and never `passwordHash`.
* **CSRF:** the session cookie is `SameSite=Lax`, so browsers do not attach it to cross-site POSTs. Login and all feature routes need `Content-Type: application/json`, which a cross-site HTML form cannot send and a cross-origin fetch cannot send without a CORS preflight (no CORS headers are served), so login-CSRF and logout-CSRF are not practical.
* **XSS / data exposure:** React escapes all rendered values (error messages and user names are rendered as text; no `dangerouslySetInnerHTML`). The error handler returns no stack traces; unexpected errors return a generic 500 body.
* **Secrets:** no secret in code. `SEED_PASSWORD` and the database URL come from git-ignored `.env` files; the E2E helper reads `SEED_PASSWORD` from the environment or the local `server/.env` (test code only).

## Defense-in-depth notes (below the reporting threshold, not vulnerabilities)

* The `Secure` cookie flag is on when `COOKIE_SECURE=true`, or by default when `NODE_ENV=production`. A deployment that runs over HTTPS but is not marked production must set `COOKIE_SECURE=true` (to be decided and written into the SDS and F-01 contract; open in PR #16 review).
* There is no rate limiting or account lockout on `POST /api/auth/login` (out of scope for Sprint 1; excluded by the review rules).
* Sessions are not rotated on privilege change and old sessions of a user are not revoked on password change; Sprint 1 has no password-change feature.
