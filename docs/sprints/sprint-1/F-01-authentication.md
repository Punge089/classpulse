# F-01 Authentication, session and access control — engineering contract

**Issue #6 (I-06) · Pair work: Punge089 (Student A, drives the code) + book6349 (Student B, reviews the PR) · Sprint 1**
Drafted by A so there is something concrete to react to. B edits it freely; every change is logged in section 12.
Written and committed **before** any F-01 test or code.

## 1. Feature and linked requirements

F-01 provides real login, logout, current-user lookup, a server-side session with an expiry, and the role
middleware that every other feature uses.
Linked: FR-01 · NFR-01, NFR-02, NFR-03, NFR-04 · NFR-07 (login form).
Depends on: SR-01 (schema, seed, `hashPassword`/`verifyPassword`, error handling, fixtures).

## 2. Behaviour and workflow

1. A visitor opens `/login`, enters email and password, and submits.
2. `POST /api/auth/login` looks the user up by email, checks the password hash, and checks `isActive`. On success it creates a session and answers 200 with the user and a session cookie.
3. The SPA stores nothing; on every page load it calls `GET /api/auth/me`. A valid cookie returns the user, so identity survives a reload.
4. An owner lands on `/owner`, a respondent on `/surveys`. The navbar shows `fullName · ROLE` and a Logout button.
5. `POST /api/auth/logout` deletes the session row and clears the cookie; the old cookie is rejected immediately.
6. Every protected route runs `requireAuth` (401) and, where it is role-specific, `requireRole` (403).

## 3. Business rules and validation

- Passwords are stored only as scrypt hashes (16-byte random salt, stored as `salt:hash`). No plaintext in the database or logs (NFR-01).
- Wrong password, unknown email and inactive account all return the same 401 `INVALID_CREDENTIALS` with the same message, so accounts cannot be probed. When the email is unknown the server still performs a dummy hash comparison so response time does not reveal it (implementation requirement, not separately tested).
- Session token: 32 random bytes encoded base64url. Only its SHA-256 hex digest is stored (`Session.tokenHash`); the raw token exists only in the cookie.
- Lifetime: `SESSION_TTL_HOURS` (default 8). A session whose `expiresAt` has passed, or whose user is inactive, is treated as no session.
- Cookie `cp_session`: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age` equal to the lifetime, `Secure` when `NODE_ENV=production`.
- Raw tokens and passwords are never logged and never returned in a response body. The `user` object is `{ id, email, fullName, role }` and never contains `passwordHash`.

## 4. Permissions

| Operation | Anonymous | Respondent | Owner |
|---|---|---|---|
| `POST /api/auth/login` | allowed | allowed | allowed |
| `GET /api/auth/me`, `POST /api/auth/logout` | 401 | own session | own session |
| any other `/api/*` route except `/api/health` | 401 | per feature | per feature |

`requireRole(role)` answers 403 `FORBIDDEN`. A hidden frontend control is not authorization.

## 5. UI spec

| Screen | Content and behaviour |
|---|---|
| `/login` | Email and password inputs, submit button disabled while sending, error alert showing the server message on 401, field messages on 400. Styled per plan §2.9. |
| Navbar (all logged-in pages) | `fullName · ROLE`, Logout button. While `GET /api/auth/me` is loading the app shows the animated `PulseLine` instead of flashing the login page. |
| Route guards | `RequireRole` redirects to `/login` when there is no user and to the user's own home when the role is wrong. This is UX only; the server decides access. |

## 6. API spec

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `POST /api/auth/login` | `{ "email": string, "password": string }` | 200 `{ "user": { "id", "email", "fullName", "role" } }` + `Set-Cookie: cp_session=…` | 401 `INVALID_CREDENTIALS`; 400 `VALIDATION_ERROR` |
| `GET /api/auth/me` | — | 200 `{ "user": {…} }` | 401 `UNAUTHENTICATED` |
| `POST /api/auth/logout` | — | 204, session row deleted, cookie cleared | 401 `UNAUTHENTICATED` |

Errors use `{ "error": { "code", "message", "details"? } }`.

## 7. Data spec and migration

No schema change: uses `User` and `Session` from SR-01. Logging in creates one new `Session` row per login (no per-user limit in Sprint 1). Logout deletes the row for the presented token. Expired rows are ignored when read; no cleanup job in Sprint 1.

## 8. Failure and boundary cases

- Missing or non-string `email` or `password` → 400 `VALIDATION_ERROR` through the shared error handler. This has no acceptance criterion of its own in Sprint 1; adding **AC-09** is an open question for the reviewer (see Issue #6).
- Unknown email, wrong password and inactive user are indistinguishable (AC-02).
- A cookie holding a random or tampered token → 401, same as no cookie.
- A session exactly at `expiresAt` is treated as expired.
- Reload on any page keeps the user logged in while the cookie is valid (AC-08).

## 9. Acceptance criteria

| ID | Observable outcome |
|---|---|
| AC-01 | Valid login → 200 with `{ user }` (no `passwordHash`) and a `cp_session` cookie with `HttpOnly` and `SameSite=Lax` |
| AC-02 | Wrong password and unknown email → both 401 `INVALID_CREDENTIALS` with identical message and no cookie; an inactive user gets the same 401 |
| AC-03 | `GET /api/auth/me` with a valid cookie returns the current user; without a cookie → 401 `UNAUTHENTICATED` |
| AC-04 | After logout the old cookie gets 401 on `/api/auth/me` and the `Session` row no longer exists |
| AC-05 | A session whose `expiresAt` is in the past → 401 |
| AC-06 | The stored `passwordHash` differs from the plaintext and verifies; a wrong password does not verify |
| AC-07 | Every route in `PROTECTED_ROUTES` without a cookie → 401 with a body that contains only `error` |
| AC-08 | UI: bad credentials show the error alert; a good login shows `fullName · ROLE` in the navbar and lands on `/owner` or `/surveys` by role; Logout returns to `/login`; a reload keeps the identity |

## 10. Software Test Specification

Fixture users are those of plan §2.4; `loginAs(app, email)` returns a Supertest agent that keeps the cookie.

| Test | AC | Level | Precondition and input | Action | Expected result | Planned file |
|---|---|---|---|---|---|---|
| TEST-01 | AC-01 | API/DB | seeded `ann.lee@classpulse.test`, correct password | POST login | 200; `user` has `id`, `email`, `fullName`, `role` and no `passwordHash`; `Set-Cookie` is `cp_session` with `HttpOnly` and `SameSite=Lax` and a lifetime of about `SESSION_TTL_HOURS` | `server/tests/api/auth.test.ts` |
| TEST-02 | AC-02 | API/DB | wrong password; unknown email; a user with `isActive=false` | POST login for each | all 401 `INVALID_CREDENTIALS` with the same `message`; no `Set-Cookie` | `server/tests/api/auth.test.ts` |
| TEST-03 | AC-03 | API/DB | student1 logged in via `loginAs`; a separate request without cookie | GET `/api/auth/me` for each | 200 with student1's user; 401 `UNAUTHENTICATED` | `server/tests/api/auth.test.ts` |
| TEST-04 | AC-04 | API/DB | student1 logged in | POST logout, then GET `/api/auth/me` with the same agent | 204, then 401; `Session` count for student1 is 0 | `server/tests/api/auth.test.ts` |
| TEST-05 | AC-05 | API/DB | student1 logged in; the session's `expiresAt` set to one minute in the past via Prisma | GET `/api/auth/me` | 401 `UNAUTHENTICATED` | `server/tests/api/auth.test.ts` |
| TEST-06 | AC-06 | unit + DB | `hashPassword("secret")`; the seeded owner1 row | verify | hash is not `"secret"`; `verifyPassword("secret", hash)` true; wrong password false; two hashes of the same password differ; owner1's stored hash is not the seed password | `server/tests/unit/password.test.ts` |
| TEST-07 | AC-07 | API | each `[method, path]` in `PROTECTED_ROUTES`, no cookie | request | 401 and `Object.keys(body)` equals `["error"]` | `server/tests/api/unauthenticated.test.ts` |
| TEST-08 | AC-08 | E2E | seeded owner1 | submit the login form with a wrong password | error alert with the server message is visible; still on `/login` | `e2e/auth.spec.ts` |
| TEST-09 | AC-08 | E2E | seeded owner1 | log in, reload the page, then press Logout | navbar shows `Dr. Ann Lee · OWNER` after login and after reload; after Logout the URL is `/login` | `e2e/auth.spec.ts` |

`PROTECTED_ROUTES` starts with `GET /api/auth/me` and `POST /api/auth/logout`; I-07, I-08 and I-09 append their routes.

## 11. Completion evidence (filled as the work happens)

- [ ] Contract commit (this file, v1.0) and `definition-of-done.md`: `<sha>`
- [ ] Red output `docs/sprints/sprint-1/evidence/F-01-red.txt` and commit `<sha>`
- [ ] Green output `docs/sprints/sprint-1/evidence/F-01-green.txt` and commit `<sha>`
- [ ] Test counts (passed / failed / skipped): —
- [ ] PR `#<n>`, reviewer comment, merge commit on `sprint-1-staging`: —
- [ ] Traceability rows FR-01, NFR-01…04 updated with real test names; security-review run on the diff

## 12. Version history

| Version | Date | Author | Change and reason |
|---|---|---|---|
| v1.0 | 2026-11-06 | Punge089 | Initial contract draft for pair review, written before tests and code. |
