# F-01 Authentication, session and access control - engineering contract

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
| `GET /api/auth/me` | - | 200 `{ "user": {…} }` | 401 `UNAUTHENTICATED` |
| `POST /api/auth/logout` | - | 204, session row deleted, cookie cleared | 401 `UNAUTHENTICATED` |

Errors use `{ "error": { "code", "message", "details"? } }`.

## 7. Data spec and migration

No schema change: uses `User` and `Session` from SR-01. Logging in creates one new `Session` row per login (no per-user limit in Sprint 1). Logout deletes the row for the presented token. Expired rows are ignored when read; no cleanup job in Sprint 1.

## 8. Failure and boundary cases

- Missing or non-string `email` or `password`, and a non-JSON body → 400 `VALIDATION_ERROR` with no cookie and no new `Session` row (AC-09, added in v1.1 after C3).
- Logout clears the cookie in its response, so a client that obeys it stops sending the old token. The server must therefore reject the old token itself: the logout test replays the saved cookie instead of trusting the client (AC-04).
- Unknown email, wrong password and inactive user are indistinguishable (AC-02).
- A cookie holding a random or tampered token → 401, same as no cookie.
- A session exactly at `expiresAt` is treated as expired.
- Reload on any page keeps the user logged in while the cookie is valid (AC-08).

## 9. Acceptance criteria

| ID | Observable outcome |
|---|---|
| AC-01 | Valid login → 200 with `{ user }` (no `passwordHash`) and a `cp_session` cookie with `HttpOnly` and `SameSite=Lax`; the cookie (and the cookie that clears it on logout) carries `Secure` exactly when `NODE_ENV=production` |
| AC-02 | Wrong password and unknown email → both 401 `INVALID_CREDENTIALS` with identical message and no cookie; an inactive user gets the same 401 |
| AC-03 | `GET /api/auth/me` with a valid cookie returns the current user; without a cookie → 401 `UNAUTHENTICATED` |
| AC-04 | After logout the **same cookie value, replayed by hand**, gets 401 on `/api/auth/me`; the `Session` row no longer exists; the logout response clears the cookie |
| AC-05 | A session whose `expiresAt` is in the past → 401 |
| AC-06 | The stored `passwordHash` differs from the plaintext and verifies; a wrong password does not verify; and neither a password nor a session token appears in anything the server writes to its console during a successful login, a failed login, a malformed login, `/me` and logout (NFR-01) |
| AC-07 | Every route in `PROTECTED_ROUTES` without a cookie → 401 with a body that contains only `error` |
| AC-08 | UI: bad credentials show the error alert; a good login shows `fullName · ROLE` in the navbar and lands on `/owner` for an owner and on `/surveys` for a respondent; Logout returns to `/login`; a reload keeps the identity |
| AC-09 | A login request with a missing or non-string `email` or `password`, or a non-JSON body → 400 `VALIDATION_ERROR` (with a `details` entry per bad field when the body is JSON); no cookie is set and no `Session` row is created |

## 10. Software Test Specification

Fixture users are those of plan §2.4; `loginAs(app, email)` returns a Supertest agent that keeps the cookie.

| Test | AC | Level | Precondition and input | Action | Expected result | Planned file |
|---|---|---|---|---|---|---|
| TEST-01 | AC-01 | API/DB | seeded `ann.lee@classpulse.test`, correct password | POST login | 200; `user` has `id`, `email`, `fullName`, `role` and no `passwordHash`; `Set-Cookie` is `cp_session` with `HttpOnly` and `SameSite=Lax` and a lifetime of about `SESSION_TTL_HOURS` | `server/tests/api/auth.test.ts` |
| TEST-02 | AC-02 | API/DB | wrong password; unknown email; a user with `isActive=false` | POST login for each | all 401 `INVALID_CREDENTIALS` with the same `message`; no `Set-Cookie` | `server/tests/api/auth.test.ts` |
| TEST-03 | AC-03 | API/DB | student1 logged in via `loginAs`; a separate request without cookie | GET `/api/auth/me` for each | 200 with student1's user; 401 `UNAUTHENTICATED` | `server/tests/api/auth.test.ts` |
| TEST-04 | AC-04 | API/DB | student1 logs in with a plain request (not an agent); the `cp_session=…` cookie value is saved from the login response | POST logout with that cookie; then a **new request** GET `/api/auth/me` that sets the saved cookie by hand | logout 204 and its `Set-Cookie` clears `cp_session`; the replayed cookie gets 401 `UNAUTHENTICATED`; `Session` count for student1 is 0 | `server/tests/api/auth.test.ts` |
| TEST-05 | AC-05 | API/DB | student1 logged in; the session's `expiresAt` set to one minute in the past via Prisma | GET `/api/auth/me` | 401 `UNAUTHENTICATED` | `server/tests/api/auth.test.ts` |
| TEST-06 | AC-06 | unit + DB | `hashPassword("secret")`; the seeded owner1 row | verify | hash is not `"secret"`; `verifyPassword("secret", hash)` true; wrong password false; two hashes of the same password differ; owner1's stored hash is not the seed password | `server/tests/unit/password.test.ts` |
| TEST-07 | AC-07 | API | each `[method, path]` in `PROTECTED_ROUTES`, no cookie | request | 401 and `Object.keys(body)` equals `["error"]` | `server/tests/api/unauthenticated.test.ts` |
| TEST-08 | AC-08 | E2E | seeded owner1 | submit the login form with a wrong password | error alert with the server message is visible; still on `/login` | `e2e/auth.spec.ts` |
| TEST-09 | AC-08 | E2E | seeded owner1 and, in a second case, seeded student1 | log in, note the landing URL, reload the page, then press Logout | owner1: lands on `/owner`, navbar shows `Dr. Ann Lee · OWNER` after login and after reload. student1: lands on `/surveys`, navbar shows `Student 1 · RESPONDENT`. In both cases Logout ends on `/login` | `e2e/auth.spec.ts` |
| TEST-55 | AC-09 | API/DB | no cookie; bodies `{}`, `{ "email": "ann.lee@classpulse.test" }`, `{ "password": "x" }`, `{ "email": 123, "password": "x" }`, and a raw non-JSON body | POST login for each | every response 400 `VALIDATION_ERROR` (JSON bodies list the bad field in `details`); no `Set-Cookie`; `Session` count unchanged | `server/tests/api/auth.test.ts` |

| TEST-56 | AC-01 | API/DB | seeded student1; the process runs once with `NODE_ENV=production` and once with `NODE_ENV=test` (restored afterwards) | POST login, then POST logout with the saved cookie in production; POST login in test | in production the login `Set-Cookie` and the logout `Set-Cookie` both contain the `Secure` attribute; with `NODE_ENV=test` the login cookie has no `Secure` attribute | `server/tests/api/auth.test.ts` |

| TEST-57 | AC-06 | API/DB | `console.log`, `info`, `warn`, `error` and `debug` are spied on; seeded student1; a wrong password and an unknown email, both made up for the test | POST login (correct), POST login with the wrong password, POST login for the unknown email, POST login with a raw non-JSON body, GET `/api/auth/me` and POST logout with the session cookie | everything the server wrote to the console during those requests contains none of: the seed password, the wrong password, the unknown-email password, the session token (cookie value) | `server/tests/api/auth.test.ts` |

`TEST-55`, `TEST-56` and `TEST-57` are the next free IDs after SR-01's TEST-50…54 (TEST-10…21 belong to F-03), so F-01's AC-09, AC-01 (Secure flag) and AC-06 (logs) tests are numbered out of sequence on purpose. The server writes only through `console` (no other logger), which is what TEST-57 watches; if a logger is added later the test must watch it too.

`PROTECTED_ROUTES` starts with `GET /api/auth/me` and `POST /api/auth/logout`; I-07, I-08 and I-09 append their routes.

## 11. Completion evidence (filled as the work happens)

- [x] Contract commit (this file, v1.0 `e535f5e`; v1.1 after C3 `19c0d8d`) and `definition-of-done.md` (`e535f5e`)
- [x] Red output `docs/sprints/sprint-1/evidence/F-01-red.txt` (`87b40ca`), failing tests commit `8a97d0f`: 11 F-01 tests failed
- [x] Green output `docs/sprints/sprint-1/evidence/F-01-green.txt`, tested on implementation commit `f30ed0f`
- [x] Test counts on `f30ed0f` (passed / failed / skipped): server 13 / 0 / 0, client 1 / 0 / 0, Playwright 3 / 0 / 0; server and client builds exit 0
- [x] After the PR #17 review (contract v1.2 `c8e7c2e`, TEST-56 `98f0530`): server 14 / 0 / 0, client 1 / 0 / 0, Playwright 3 / 0 / 0; builds exit 0 (addendum in `F-01-green.txt`)
- [ ] PR #17: reviewer approval and merge commit on `sprint-1-staging`: filled after the review
- [ ] Traceability rows FR-01, NFR-01…04 updated with real test names (done in I-10 on the release commit)
- [x] security-review run on the diff: `docs/sprints/sprint-1/evidence/F-01-security-review.md` (no HIGH or MEDIUM findings)

## 12. Version history

| Version | Date | Author | Change and reason |
|---|---|---|---|
| v1.0 | 2026-11-06 | Punge089 | Initial contract draft for pair review, written before tests and code. |
| v1.1 | 2026-11-06 | Punge089 | After C3 review by book6349: added AC-09 and TEST-55 (400 on a malformed login body); TEST-04 now saves the cookie and replays it by hand, because a client agent drops the cleared cookie and could pass without the server rejecting the old session; TEST-09 now covers both roles' landing pages. |
| v1.2 | 2026-11-06 | Punge089 | After the review of PR #17 by book6349: the Secure rule already stated in §3 (NODE_ENV=production) had no test, so AC-01 now names it and TEST-56 asserts it for the login cookie and the logout cookie, in production and not in test. No behaviour change. |
| v1.3 | 2026-11-06 | Punge089 | After the review of PR #12 (SRS) by book6349: NFR-01 promises that no plaintext password appears in logs, but TEST-06 only checked the stored hash. AC-06 now includes the log promise and TEST-57 checks it by watching the console during login, failed login, malformed login, `/me` and logout. No behaviour change. |
