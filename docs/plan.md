# ClassPulse — Deliverable 1 Implementation Plan

> **For agentic workers:** Each Issue below (I-01 … I-11) is run in its **own session**. Read
> *Global Constraints*, *Shared Contracts* and **only your Issue**, then follow its steps in
> order. Steps use checkbox (`- [ ]`) syntax. Stop at "open PR" — merging is the reviewer's job.

**Goal:** Submit CPE 334 Project Deliverable 1 (80 pts) for theme #10 — a complete product
baseline (Parts A–D) plus a tested, teammate-reviewed, tagged Sprint 1 release of
"ClassPulse" (Parts E–F) — by **8 Nov 2026 23:59**.

**Architecture:** Modular monolith. React SPA → Express JSON API (`/api/*`, all business rules
and authorization enforced here) → PostgreSQL via Prisma. Cookie session with server-side
session table. In dev, Vite proxies `/api` to the server so the cookie is same-origin; in
production (Lab 5) Express serves `client/dist`, so it stays same-origin.

**Tech Stack:** Node 22, TypeScript 5.7, Express 4.21, Prisma 5.22, PostgreSQL 16, React 18.3,
Vite 6, Bootstrap 5.3, react-router-dom 6.30, Vitest 2.1, Supertest 7, Testing Library,
Playwright 1.48 — identical to the team's TokTickIT labs.

**Spec:** `docs/design.md` (approved design) + course PDFs `project_deliverable_1_v1.pdf`
and `group_work_specs_v1.pdf` (theme 10, §5, §7, §8).

---

## 0. Reality check — does this fit the time?

Today is **Fri 6 Nov**; the deadline is **Sun 8 Nov 23:59** ≈ 2.5 days. Honest assessment:

- **It fits only if** the docs start today, Sprint 1 stays exactly at the scope below, each
  student is available ~10–12 h on 7 and 8 Nov, and PR reviews come back within ~1 hour.
- **Biggest risks:** (1) local PostgreSQL/test-DB setup on both laptops — do it in I-01, not
  later; (2) PDF assembly + screenshots take **4–6 h**, people usually budget 1 h;
  (3) the auth Issue blocks every API test — it has a hard checkpoint.
- **What does not fit and is deliberately out:** draft editing, text/multi-choice questions,
  anonymous mode, export, scheduled closing, polished UI, component tests for every screen,
  Docker/CI/GCP. They are allocated to Sprint 2/3/Lab 5 in the baseline docs, which is what the
  rubric asks for ("requirements in later sprints need a feature and sprint allocation now").
- **Cut order if behind at a checkpoint** (cut from the top, never below the line):
  1. Client component tests (keep the Playwright journeys).
  2. `responseCount` in the owner list and `hasResponded` in the respondent list (keep API ACs, drop UI display).
  3. Close button in the UI (keep the API endpoint + test; demo close via API/curl).
  4. UI polish.
  ──────── never cut ────────
  Auth/access tests, business-rule tests, TDD red/green evidence, contracts before code,
  teammate-reviewed PRs, release PR + tag, every Part A–F section of the PDF, honest disclosure.

### Checkpoints (hard)

| When | Must be true | If not |
|---|---|---|
| Fri 6 Nov 23:00 | I-01 done; I-02, I-03, I-04 drafts pushed; F-01 contract + DoD committed | Keep going tonight; docs can finish in parallel with I-05 tomorrow |
| Sat 7 Nov 12:00 | I-05 merged into `sprint-1-staging` | Pair on it immediately; nothing else matters |
| Sat 7 Nov 18:00 | I-06 (auth) merged | Pair on it; lanes write pure-logic tests meanwhile |
| Sun 8 Nov 12:00 | I-07, I-08, I-09 merged | Apply cut list items 1–3 |
| Sun 8 Nov 16:00 | I-10 merged; release PR open | Release what is merged; disclose the rest |
| Sun 8 Nov 18:00 | Tag `v1.0.0-sprint1` on `main`; final test run saved | — |
| Sun 8 Nov 23:00 | PDF uploaded to LEB2 (59 min buffer) | — |

---

## Global Constraints

- Deadline: LEB2 upload of **one self-contained PDF** by **8 Nov 2026 23:59**.
- Release: reviewed PR `sprint-1-staging → main`, then annotated tag **`v1.0.0-sprint1`** on that merge commit. Never move or re-create the tag; later commits must not replace the assessed version.
- Branches: `main` ← `sprint-1-staging` ← `feature/<github-issue-no>-<slug>` (e.g. `feature/8-response-submission`), always created from the current `sprint-1-staging`.
- Every PR targets `sprint-1-staging` (except the release PR), is reviewed **by the other student from their own GitHub account**, and the review contains a specific check, question, finding or reason for approval. Authors never approve their own PR. Pair Issues: the driver opens the PR, the other student reviews.
- Commits are made under the **author's own git identity** (`git config user.name/user.email`) so participation is visible. Pair-work commits end with a `Co-authored-by: Name <github-email>` trailer for the other student, and pair Issues/PRs carry the `pair` label and name both students in the body.
- Every Issue and PR follows the conversation protocol in §4.1. Comments are written **after** the thing they discuss exists, from the writer's own account, and describe what was actually checked. No pre-written or invented review dialogue.
- Order inside every feature Issue: **contract commit → failing-test commit (with saved red output) → implementation commit(s) → green output**. Never squash-merge feature PRs (it destroys this history); use "Create a merge commit".
- Never disable, skip, `.only`, or weaken a required test. Failures/skips are reported, not hidden.
- IDs are stable and never renumbered: `FR-xx`, `BR-xx`, `NFR-xx`, `F-xx`, `SR-xx`, `AC-xx`, `TEST-xx`, `DEMO-x`. The registry in §2 is the source of truth; additions get the next free number and a version-history line.
- Authorization is enforced only on the backend. Hidden buttons/route guards are UX only.
- Sprint 1 surveys are **identified**. UI must say "Identified survey — your name is stored with your answers". Never use the word "anonymous" for them.
- No real secrets in Git or the PDF. Commit only `.env.example`; seed password comes from `SEED_PASSWORD`. Synthetic data only, emails end in `@classpulse.test`.
- Ports: server `3000`, client `5173`. Tests use a separate DB configured in `server/.env.test` (TokTickIT pattern).
- Session: cookie `cp_session`, `httpOnly`, `SameSite=Lax`, `Secure` when `NODE_ENV=production`, lifetime `SESSION_TTL_HOURS` (default `8`).
- Error body is always `{ "error": { "code": string, "message": string, "details"?: [{ "field": string, "message": string }] } }`; never a stack trace.
- AI agents work only from the committed contract of their Issue; the human owner inspects the diff and the test assertions before opening the PR.

## Review Focus

Failure modes the spec implies but no AC names directly. Each has a test added to its owning Issue.

1. **Cookie lost across reloads/ports** — login "works" but a page reload shows logged-out. Expected: identity survives reload. → TEST-09 in I-06.
2. **Double-click on Submit** — second request returns 409 and the UI shows an error although the first succeeded. Expected: button disabled while sending; a 409 `ALREADY_RESPONDED` shows "You have already submitted this survey". → TEST-32 in I-08.
3. **Survey closed while the form is open** — Expected: clear message "This survey is not open for responses", no stack trace, nothing stored. → TEST-26 (API) + TEST-32 (UI) in I-08.
4. **Malformed input** — non-JSON body, `answers` not an array, `questionId` as string `"1"`, extra fields, non-numeric `:id` like `/api/owner/surveys/abc`. Expected: 400/404 with the error shape, never 500. → TEST-12 (I-07), TEST-28 (I-08), TEST-52 (I-05).
5. **Rounding and empty buckets in the summary** — ratings `[4,4,5]` → average `4.33`; an option nobody chose appears with `count: 0`. → TEST-33 in I-09.

---

## 1. Deliverable coverage (what the grader checks → where it is produced)

| Part (pts) | PDF must contain | Repo artifact | Issue(s) |
|---|---|---|---|
| Front matter | Names + student IDs, theme/context, repo URL, release tag + commit, **navigation table** (one row per Part with page range + IDs), **TOC with page numbers** | `docs/deliverable-1/report.md` | I-11 |
| A SRS (10) | Stakeholder problem, context, actors + responsibilities, scope + exclusions, numbered FR/BR, NFR with measurable target + verification method + sprint, assumptions, decisions, questions + resolutions | `docs/srs.md` | I-02 |
| B Features & traceability (10) | Feature inventory (ID, description, requirements, dependencies, sprint); requirement → feature/responsibility → sprint → AC/TEST table covering **every** FR/BR/important NFR; coverage gaps + approved changes shown explicitly | `docs/features.md`, `docs/traceability.md` | I-04 (rows updated by I-06…I-10) |
| C System SDS (15) | Stack + component responsibilities + where rules are enforced; data model (entities, fields, relations, constraints, ownership) + ER diagram; migrations + seed; screens/navigation + loading/empty/error/validation behaviour; API conventions + error handling; **role/permission matrix**; credential handling, hashing, session creation/expiry, current user, logout; env vars, secrets, DB config, planned GCP components | `docs/system-sds.md` | I-03 |
| D Three-sprint plan (5) | Per sprint: goal, feature IDs, dependencies, completion outcome; explain Sprint 1 scope | `docs/sprints/plan.md` | I-04 |
| E Sprint 1 contracts (20) | For F-01, F-03, F-04, F-05 (+ SR-01): feature SDS, UI/API/data spec (or "no change"), AC, STS (ID, AC, level, input/precondition, action, expected), **Product DoD**, version history showing contract before code | `docs/sprints/sprint-1/*.md` | I-05…I-09 (DoD in I-06) |
| F Working Sprint 1 (20) | Setup summary; DEMO-1…3 screenshots with labels; build/test commands, commit, pass/fail/skip counts; AC→test→result table (automated vs manual); 2 test excerpts + results; TDD red→green with versions; 2 Issue/PR chains; board status; release reference; history sequence with commit IDs/dates; contribution table; AI-use declaration; known limitations | `docs/sprints/sprint-1/test-results.md`, `evidence/`, `docs/contributions.md`, `docs/ai-use.md`, `README.md` | I-10, I-11 |

---

## 2. Shared Contracts (every session reads this)

### 2.1 Product context
**ClassPulse** — course feedback surveys for a university department.
- **Survey Owner** (role `OWNER`): a lecturer who owns one or more courses; creates, publishes and closes surveys for own courses; sees aggregate results of own surveys only.
- **Respondent** (role `RESPONDENT`): a student; sees published surveys of courses they are enrolled in; submits one response per survey; sees only their own response.
- Accounts, courses and enrolments are seeded (no self-registration in the product).

### 2.2 Requirement registry (whole product)

**Functional requirements**

| ID | Requirement | Sprint |
|---|---|---|
| FR-01 | A user logs in with email + password, sees their name and role, and logs out. | 1 |
| FR-02 | An owner creates a draft survey (title, optional description, 1–20 questions) for a course they own. | 1 |
| FR-03 | Questions are `RATING` (integer 1–5) or `SINGLE_CHOICE` (2–6 options); each is required by default. | 1 |
| FR-04 | An owner publishes a draft survey. | 1 |
| FR-05 | An owner closes a published survey. | 1 |
| FR-06 | A respondent lists published surveys of their enrolled courses and sees which they already answered. | 1 |
| FR-07 | A respondent submits a response and sees a confirmation with the submission time. | 1 |
| FR-08 | An owner views an aggregate summary of an own survey (count, rating average + distribution, choice counts). | 1 |
| FR-09 | An owner lists own surveys with status and response count. | 1 |
| FR-10 | An owner edits or deletes questions of a draft survey. | 2 |
| FR-11 | Additional question types: `TEXT` (≤ 500 chars) and `MULTI_CHOICE`. | 2 |
| FR-12 | An owner sets an optional closing time; the survey stops accepting responses after it. | 2 |
| FR-13 | A respondent views their own past responses. | 2 |
| FR-14 | An owner limits eligibility to selected course sections. | 2 |
| FR-15 | An owner views response rate (responses ÷ eligible respondents). | 2 |
| FR-16 | An owner creates an anonymous survey; respondents are told before answering. | 3 |
| FR-17 | An owner exports responses as CSV (identified: with respondent; anonymous: without). | 3 |
| FR-18 | An owner filters the summary by section and reads text answers. | 3 |

**Business rules**

| ID | Rule | Sprint |
|---|---|---|
| BR-01 | Only `DRAFT` surveys may have questions added, changed or removed. | 2 |
| BR-02 | A survey has 1–20 questions; prompt 1–300 chars; a `SINGLE_CHOICE` question has 2–6 distinct, non-empty options (≤ 100 chars); a `RATING` question has no options. Title 1–120 chars, description ≤ 1000. | 1 |
| BR-03 | Status changes only `DRAFT → PUBLISHED` (publish) and `PUBLISHED → CLOSED` (close). Any other request is rejected and the status is unchanged. | 1 |
| BR-04 | Responses are accepted only while the survey is `PUBLISHED`. | 1 |
| BR-05 | Only respondents enrolled in the survey's course may respond. | 1 |
| BR-06 | At most one response per respondent per survey, including simultaneous attempts. | 1 |
| BR-07 | A response answers every required question exactly once; a rating is an integer 1–5; a choice is an option of that question; answers to questions not in the survey are rejected. | 1 |
| BR-08 | An owner may create and manage surveys only for courses they own. | 1 |
| BR-09 | A submitted response cannot be edited or deleted by the respondent. | 1 |
| BR-10 | Identified surveys are labelled "Identified" before answering; identifiable responses are never labelled anonymous. | 1 |
| BR-11 | Closing time, if set, must be in the future when publishing; after it, responses are rejected. | 2 |
| BR-12 | `TEXT` answers ≤ 500 chars; `MULTI_CHOICE` answers pick 1…n distinct options of that question. | 2 |
| BR-13 | Anonymous mode: no stored link between a respondent and their answers; participation is recorded separately; mode cannot change after publish. | 3 |
| BR-14 | Aggregate results of an anonymous survey are hidden until it has ≥ 5 responses. | 3 |

**Non-functional requirements**

| ID | Requirement and measurable target | Verification | Sprint |
|---|---|---|---|
| NFR-01 | Passwords stored only as scrypt hashes; no plaintext anywhere in DB or logs. | DB/unit test TEST-06 | 1 |
| NFR-02 | 100 % of protected endpoints return 401 with no private data when unauthenticated. | Table-driven API test TEST-07 | 1 |
| NFR-03 | 100 % of protected operations in the role/permission matrix have at least one passing negative API test (wrong role and, where records are owned, wrong owner). | API tests TEST-18, 19, 30, 31, 36 + matrix-to-test check in `test-results.md` | 1 |
| NFR-04 | Session expires after `SESSION_TTL_HOURS` (8 h); logout invalidates it server-side immediately. | API tests TEST-04, TEST-05 | 1 |
| NFR-05 | Saved surveys/responses survive an application restart (and, from Lab 5, redeployment). | Sprint 1: DEMO-1 restart check; Lab 5: redeploy check | 1 / Lab 5 |
| NFR-06 | Summary endpoint responds in ≤ 500 ms (p95 of 20 calls) for a survey with 500 responses, local machine. | Measurement script | 3 |
| NFR-07 | 3/3 Sprint 1 forms (login, new survey, answer survey) show a message for each invalid field, and 3/3 lists (owner surveys, respondent surveys, summary) show loading, empty and error states. | Sprint 1: E2E (TEST-08, 21, 32) + manual checklist in `test-results.md`; Sprint 3: all screens | 1 / 3 |
| NFR-08 | In anonymous mode no API response or export can relate a respondent to their answers. | API + DB tests | 3 |
| NFR-09 | All configuration via environment variables; no secrets in Git or client bundle. | Review checklist in PR template + `git grep` check in I-11 | 1 |
| NFR-10 | Usable at 375 px width (no horizontal scroll on core screens). | Playwright mobile viewport | 3 |

### 2.3 Feature inventory (whole product)

| ID | Feature / responsibility | Requirements | Depends on | Sprint |
|---|---|---|---|---|
| SR-01 | Persistence foundation: schema, migrations, seed, test DB | NFR-05, NFR-09 | — | 1 |
| F-01 | Authentication, session and access control | FR-01, NFR-01, NFR-02, NFR-03, NFR-04 | SR-01 | 1 |
| F-03 | Survey authoring and lifecycle | FR-02, FR-03, FR-04, FR-05, FR-09, BR-02, BR-03, BR-08 | F-01 | 1 |
| F-04 | Response submission | FR-06, FR-07, BR-04, BR-05, BR-06, BR-07, BR-09, BR-10 | F-01, SR-01 (F-03 only for the UI journey) | 1 |
| F-05 | Aggregate summary | FR-08 | F-01, SR-01 | 1 |
| F-06 | Draft editing | FR-10, BR-01 | F-03 | 2 |
| F-07 | Extended question types | FR-11, BR-12 | F-03, F-04, F-05 | 2 |
| F-08 | Scheduled closing | FR-12, BR-11 | F-03, F-04 | 2 |
| F-09 | My responses | FR-13 | F-04 | 2 |
| F-10 | Eligibility by section + response rate | FR-14, FR-15 | F-04, F-05 | 2 |
| F-11 | Anonymous mode | FR-16, BR-13, BR-14, NFR-08 | F-04, F-05 | 3 |
| F-12 | CSV export | FR-17 | F-05, F-11 | 3 |
| F-13 | Analysis filters + text answers | FR-18 | F-07, F-10 | 3 |
| F-14 | Hardening: performance, responsive UI, error handling | NFR-06, NFR-07, NFR-10 | all | 3 |

(`F-02` is intentionally unused; record that in `docs/features.md` so the gap is explained.)

### 2.4 Data model (Sprint 1) — `server/prisma/schema.prisma`

| Model | Fields (type, constraint) | Notes |
|---|---|---|
| `User` | `id` Int PK; `email` String **unique**; `fullName` String; `role` enum `Role { OWNER RESPONDENT }`; `passwordHash` String; `isActive` Boolean default true; `createdAt` | |
| `Session` | `id` Int PK; `tokenHash` String **unique**; `userId` → User (cascade); `createdAt`; `expiresAt` DateTime; index `userId` | Token itself never stored |
| `Course` | `id`; `code` String **unique** (e.g. `CPE334`); `title`; `ownerId` → User | Owner = lecturer |
| `Enrollment` | `id`; `courseId` → Course; `userId` → User; **unique(courseId, userId)** | Eligibility source |
| `Survey` | `id`; `courseId` → Course; `ownerId` → User; `title` String; `description` String?; `mode` enum `SurveyMode { IDENTIFIED }`; `status` enum `SurveyStatus { DRAFT PUBLISHED CLOSED }` default DRAFT; `publishedAt`?; `closedAt`?; `createdAt`; `updatedAt` | `ownerId` must equal `course.ownerId` (BR-08, checked in API) |
| `Question` | `id`; `surveyId` → Survey (cascade); `position` Int; `prompt` String; `type` enum `QuestionType { RATING SINGLE_CHOICE }`; `required` Boolean default true; **unique(surveyId, position)** | |
| `QuestionOption` | `id`; `questionId` → Question (cascade); `position` Int; `label` String; **unique(questionId, position)** | |
| `Response` | `id`; `surveyId` → Survey; `respondentId` → User; `submittedAt` default now; **unique(surveyId, respondentId)** | BR-06 enforced by DB |
| `Answer` | `id`; `responseId` → Response (cascade); `questionId` → Question; `ratingValue` Int?; `optionId` → QuestionOption?; **unique(responseId, questionId)**; SQL `CHECK (rating_value IS NULL OR rating_value BETWEEN 1 AND 5)` added by hand in the migration SQL | Prisma cannot express CHECK; add it to `migration.sql` |

**Seed / test fixture** (same people in `prisma/seed.ts` and `tests/helpers/fixture.ts`; password = `SEED_PASSWORD`):

| Key | Email | Role | Owns / enrolled |
|---|---|---|---|
| `owner1` | `ann.lee@classpulse.test` (Dr. Ann Lee) | OWNER | owns `CPE334` |
| `owner2` | `ben.kim@classpulse.test` (Dr. Ben Kim) | OWNER | owns `CPE231` |
| `student1` | `student1@classpulse.test` | RESPONDENT | enrolled `CPE334` |
| `student2` | `student2@classpulse.test` | RESPONDENT | enrolled `CPE334` |
| `student3` | `student3@classpulse.test` | RESPONDENT | enrolled `CPE231` only |

Dev seed also creates one `CLOSED` survey "Week 1 pulse" in `CPE334` (for DEMO-2).

### 2.5 API contract (Sprint 1)

All paths under `/api`, JSON in/out. Check order on every protected route: **401 → 403 role → 404 resource/ownership → rule checks → 400 validation → persistence**.

| Error code | HTTP | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Malformed body/fields (`details[]` lists each field) |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password (same message for both) |
| `UNAUTHENTICATED` | 401 | No/expired/invalid session |
| `FORBIDDEN` | 403 | Wrong role for the endpoint |
| `NOT_ELIGIBLE` | 403 | Respondent not enrolled in the survey's course |
| `NOT_FOUND` | 404 | Missing, non-numeric id, or not owned by caller (never reveal other owners' data) |
| `INVALID_TRANSITION` | 409 | BR-03 violated |
| `SURVEY_NOT_OPEN` | 409 | Response to DRAFT/CLOSED survey (BR-04) |
| `ALREADY_RESPONDED` | 409 | BR-06 (mapped from Prisma `P2002` on `Response`) |

| Method + path | Role | Request | Success | Feature |
|---|---|---|---|---|
| `GET /api/health` | public | — | 200 `{status:"ok"}` | SR-01 |
| `POST /api/auth/login` | public | `{email, password}` | 200 `{user}` + `Set-Cookie: cp_session` | F-01 |
| `POST /api/auth/logout` | any logged-in | — | 204, session row deleted, cookie cleared | F-01 |
| `GET /api/auth/me` | any logged-in | — | 200 `{user}` | F-01 |
| `GET /api/owner/courses` | OWNER | — | 200 `{courses:[{id,code,title}]}` own only | F-03 |
| `GET /api/owner/surveys` | OWNER | — | 200 `{surveys:[{id,title,status,courseCode,responseCount}]}` own only | F-03 |
| `POST /api/owner/surveys` | OWNER | `{courseId,title,description?,questions:[{prompt,type,required?,options?:string[]}]}` | 201 `{survey}` status DRAFT | F-03 |
| `GET /api/owner/surveys/:id` | OWNER | — | 200 `{survey}` with questions/options | F-03 |
| `POST /api/owner/surveys/:id/publish` | OWNER | — | 200 `{survey}` status PUBLISHED, `publishedAt` set | F-03 |
| `POST /api/owner/surveys/:id/close` | OWNER | — | 200 `{survey}` status CLOSED, `closedAt` set | F-03 |
| `GET /api/owner/surveys/:id/summary` | OWNER | — | 200 `{summary}` (shape in I-09) | F-05 |
| `GET /api/surveys` | RESPONDENT | — | 200 `{surveys:[{id,title,courseCode,mode,status,hasResponded}]}` PUBLISHED + enrolled only | F-04 |
| `GET /api/surveys/:id` | RESPONDENT | — | 200 `{survey}` with questions; 404 if DRAFT or not enrolled | F-04 |
| `POST /api/surveys/:id/responses` | RESPONDENT | `{answers:[{questionId, ratingValue?} \| {questionId, optionId?}]}` | 201 `{response:{id,surveyId,submittedAt}}` | F-04 |
| `GET /api/responses/:id` | RESPONDENT | — | 200 own response with answers; 404 if not own | F-04 |

`user` object everywhere: `{ id, email, fullName, role }` — never `passwordHash`.

### 2.6 Shared code interfaces (names every Issue uses)

| Symbol | File | Signature | Produced by |
|---|---|---|---|
| `createApp` | `server/src/app.ts` | `createApp(): Express` (no `listen`) | I-05 |
| `getPrisma` | `server/src/prisma.ts` | `getPrisma(): PrismaClient` lazy singleton | I-05 |
| `ApiError` | `server/src/lib/errors.ts` | `class ApiError extends Error { constructor(status: number, code: ErrorCode, message: string, details?: FieldError[]) }` | I-05 |
| `errorHandler` | `server/src/lib/errors.ts` | Express error middleware → error shape; unknown errors → 500 `INTERNAL_ERROR` without stack | I-05 |
| `parseId` | `server/src/lib/params.ts` | `parseId(raw: string): number` — positive int or throws `ApiError(404,'NOT_FOUND')` | I-05 |
| `resetDb` / `seedFixture` | `server/tests/helpers/fixture.ts` | `resetDb(): Promise<void>`; `seedFixture(): Promise<Fixture>` where `Fixture = { owner1, owner2, student1, student2, student3: User; cpe334, cpe231: Course }` | I-05 |
| `makeSurvey` | `server/tests/helpers/fixture.ts` | `makeSurvey(opts: { course: Course; owner: User; status?: SurveyStatus; questions?: QuestionSpec[] }): Promise<SurveyWithQuestions>` — default 1 RATING + 1 SINGLE_CHOICE(`["Yes","No"]`), status PUBLISHED | I-05 |
| `hashPassword` / `verifyPassword` | `server/src/lib/password.ts` | `(plain: string) => Promise<string>`; `(plain: string, hash: string) => Promise<boolean>` (scrypt, random salt) | I-05 (seed needs it); tested in I-06 |
| `AuthUser` | `server/src/types.ts` | `{ id: number; email: string; fullName: string; role: 'OWNER' \| 'RESPONDENT' }`; `req.user?: AuthUser` via declaration merging | I-06 |
| `createSession` / `findSessionUser` / `deleteSession` | `server/src/lib/session.ts` | `(userId) => Promise<{ token: string; expiresAt: Date }>`; `(token) => Promise<AuthUser \| null>` (null if expired/inactive); `(token) => Promise<void>` | I-06 |
| `requireAuth` / `requireRole` | `server/src/middleware/auth.ts` | `requireAuth: RequestHandler` (401 `UNAUTHENTICATED`); `requireRole(role: AuthUser['role']): RequestHandler` (403 `FORBIDDEN`) | I-06 |
| `loginAs` | `server/tests/helpers/auth.ts` | `loginAs(app: Express, email: string): Promise<TestAgent>` (supertest agent holding the cookie) | I-06 |
| `PROTECTED_ROUTES` | `server/tests/api/unauthenticated.test.ts` | `const PROTECTED_ROUTES: Array<[method, path]>` — each later Issue **appends** its routes | I-06 |
| `apiFetch` | `client/src/api.ts` | `apiFetch<T>(path: string, init?: RequestInit): Promise<T>`; throws `ApiClientError { status; code; message; details? }` | I-05 |
| `AuthProvider` / `useAuth` / `RequireRole` | `client/src/auth/` | `useAuth(): { user: AuthUser \| null; loading: boolean; login(email,pw): Promise<void>; logout(): Promise<void> }`; `<RequireRole role="OWNER">` | I-06 |
| `nextStatus` | `server/src/lib/surveyLifecycle.ts` | `nextStatus(current: SurveyStatus, action: 'publish' \| 'close'): SurveyStatus` throws `ApiError(409,'INVALID_TRANSITION')` | I-07 |
| `validateSurveyInput` | `server/src/lib/surveyValidation.ts` | `(body: unknown) => { ok: true; value: SurveyInput } \| { ok: false; details: FieldError[] }` | I-07 |
| `validateAnswers` | `server/src/lib/responseValidation.ts` | `(questions: QuestionWithOptions[], body: unknown) => { ok: true; value: AnswerInput[] } \| { ok: false; details: FieldError[] }` | I-08 |
| `summarize` | `server/src/lib/summary.ts` | `(questions: QuestionWithOptions[], answers: Answer[], responseCount: number) => SurveySummary` (pure) | I-09 |

### 2.7 Screens (Sprint 1)

| Route | Role | Purpose | Issue |
|---|---|---|---|
| `/login` | public | email + password, error alert | I-06 |
| `/owner` | OWNER | my surveys (title, course, status badge, response count), "New survey" | I-07 |
| `/owner/surveys/new` | OWNER | form: course select, title, description, add RATING/SINGLE_CHOICE questions | I-07 |
| `/owner/surveys/:id` | OWNER | detail, Publish / Close buttons by status, link to summary | I-07 |
| `/owner/surveys/:id/summary` | OWNER | counts, averages, bar list per question; empty state "No responses yet" | I-09 |
| `/surveys` | RESPONDENT | open surveys of my courses; "Submitted" badge | I-08 |
| `/surveys/:id` | RESPONDENT | identified banner, answer form, Submit | I-08 |
| `/responses/:id` | RESPONDENT | confirmation: "Response submitted", time, my answers | I-08 |

Shared behaviour: navbar shows `fullName · role` + Logout; loading spinner while fetching;
empty-state text on empty lists; `ApiClientError.message` in a Bootstrap alert; field
`details` shown under the matching input; buttons disabled while a request is in flight.
Every page uses the visual identity in §2.9 (no ad-hoc colours, no per-page styling).

### 2.9 Visual identity — "Pulse"

A calm paper-and-ink look with one coral accent and a heartbeat-line motif (the name = the pulse
of the classroom). Bootstrap 5 stays as the layout base. Everything below is a CSS variable in
`client/src/theme.css`, imported **after** Bootstrap, so no page hard-codes a colour.

| Token | Value | Use | Contrast (measured) |
|---|---|---|---|
| `--cp-paper` | `#FAF7F2` | page background | — |
| `--cp-card` | `#FFFFFF` | cards, forms | — |
| `--cp-ink` | `#14213D` | body text, headings | 14.95 : 1 on paper |
| `--cp-muted` | `#5B6478` | secondary text | 5.55 : 1 on paper |
| `--cp-accent` | `#C8431D` | primary buttons, links, active rating dot | white on it 4.91 : 1; as text on paper 4.60 : 1 |
| `--cp-accent-soft` | `#FBE3DA` | selected / hover tint | ink on it 13.01 : 1 |
| `--cp-line` | `#E3DDD2` | borders, dividers | decorative only |
| `--cp-ok` / `--cp-danger` | `#2F7D5B` / `#B3261E` | success and error alerts, status badges | 4.67 : 1 / 6.12 : 1 on paper |

Do **not** use `#E4572E` (brighter coral): white text on it is only 3.68 : 1, which fails.

- **Type:** headings Fraunces 600, body Inter 400/500 (Google Fonts `<link>` in `client/index.html`;
  fallbacks `Georgia, serif` and `system-ui, sans-serif`, so offline and test runs still render).
- **Shape:** 12 px radius on cards, 8 px on inputs and buttons, 1 px `--cp-line` borders, no heavy shadows.
- **Two signature components** (in `client/src/components/pulse/`):
  - `PulseLine`: a thin SVG heartbeat line, props `{ width?: number | string; animate?: boolean }`. Used
    as the divider under page titles, and as the loading indicator (animated only when `animate` and
    `prefers-reduced-motion` is not set).
  - `RatingDots`: `{ value: number | null; onChange?: (n: 1|2|3|4|5) => void; readOnly?: boolean; name: string }`.
    Five round buttons (min 40 px hit area, 44 px on touch), filled up to `value`. Real `<input type="radio">`
    underneath so keyboard and screen readers work; `aria-label="Rating 1 of 5"` … `"Rating 5 of 5"`.
    Used in the answer form (I-08), the confirmation page (I-08) and the summary (I-09, read-only).
- **Summary charts (I-09):** one horizontal bar per option or rating value drawn as a thin coral line on a
  `--cp-line` track, with the count and percentage as text next to it (never colour alone).
- **Status badges:** DRAFT = muted outline, PUBLISHED = `--cp-ok` fill, CLOSED = ink outline.
- **Layout:** one centred column, max width 760 px; at 375 px width no horizontal scroll (NFR-10 is checked
  properly in Sprint 3, but do not break it now).
- **Copy tone:** short and friendly ("Thanks — your response is in."), but identified surveys always show
  "Identified survey — your name is stored with your answers".

### 2.8 Contract template — `docs/sprints/sprint-1/<ID>-<slug>.md`

Every feature contract has these headings, in order (Part E is graded on them):
1. Feature, owner, linked FR/BR/NFR · 2. Behaviour and workflow (numbered steps) ·
3. Business rules and validation · 4. Permissions (who / which records) · 5. UI spec
(or "No UI change") · 6. API spec (method, path, request, responses incl. every error) ·
7. Data spec / migration (or "No schema change") · 8. Failure and boundary cases ·
9. Acceptance criteria (`AC-xx`, observable outcome) · 10. STS table: `Test ID | AC | Level
(unit / API-DB / E2E) | Precondition & input | Action | Expected result | Planned file` ·
11. Completion evidence checklist (links to red/green output, PR, commit) ·
12. Version history (`v1.0 date author — initial contract`; later rows say what changed and why).

---

## 3. GitHub setup (I-01 creates it)

- Labels: `sprint-1`, `sprint-2`, `sprint-3`, `docs`, `feature`, `test`, `release`, `pair`, `owner:A`, `owner:B`.
- Project board (Projects v2) columns: **Backlog → Ready → In progress → In review → Done**.
- Milestone: `Sprint 1 — Deliverable 1 (8 Nov)`.
- PR template `.github/pull_request_template.md`: Issue link (`Closes #n`), feature/contract IDs, AC covered, test command + result, "contract committed before code? (commit id)", "no secrets / no skipped tests" checkboxes, reviewer checklist.
- Sprint 2/3 Issues are **not** created now (they come with D2); only F-06…F-14 rows in docs.

**Student A** = GitHub `Punge089`. **Student B** = GitHub `book6349`. Real names and student IDs go in I-02 and the PDF cover.

**Created on 6 Nov 2026:** repo https://github.com/Punge089/classpulse (public), project board
https://github.com/users/Punge089/projects/5 (Backlog → Ready → In progress → In review → Done),
milestone "Sprint 1 — Deliverable 1 (8 Nov)", labels as above. Issue numbers match the plan IDs:
**I-01 = #1, I-02 = #2, … I-11 = #11**, so branch names are `feature/<n>-<slug>` with n = the I-number
(e.g. `feature/8-response-submission`). B's Issues get assigned to `book6349` once the invitation is accepted.

---

## 4. Issues

Ownership: **A** = I-02, I-04, I-07, I-10 · **B** = I-03, I-05, I-08, I-09 · **Pair** = I-01, I-06, I-11.
Cross review: every A PR reviewed by B and vice versa; pair PRs reviewed by the non-driver.

```
I-01 (pair) ─┬─ I-02 SRS (A) ───────┐
             ├─ I-03 SDS (B) ───────┼─ I-05 Foundation (B) ── I-06 Auth (pair, A drives) ─┬─ I-07 Survey authoring (A) ─┐
             └─ I-04 Features/Trace/Plan (A) ┘                                            ├─ I-08 Responses (B) ──────────┼─ I-10 E2E + README (A) ── I-11 Release + PDF (pair)
                                                                                          └─ I-09 Summary (B) ───────────┘
```
I-02/I-03/I-04 run in parallel because IDs are fixed in §2. Contracts for I-07/I-08/I-09 may be
written while I-05/I-06 are in progress (contract commits do not depend on code).

### 4.1 Issue and PR conversation protocol (real exchanges, not scripted)

Graders sample reviews for "a specific check, question, finding or reason for approval" and may
ask either student to explain them. So every Issue has the thread below. Each message is written
when its event has actually happened. **Every message is pre-written in
`docs/comment-playbook.md`** (templates C1–C10 plus per-Issue values and reviewer checks). The AI
fills the slots only from real data, shows the text, and posts it with `gh` once the account owner
says ok. AI-assisted commenting and reviewing is declared in `docs/ai-use.md`.

| # | Where | Who | Trigger | Must contain |
|---|---|---|---|---|
| C1 | Issue | owner | work starts | branch name; what the contract will cover; ETA |
| C2 | Issue | owner | contract commit pushed | link to the contract commit; AC list; one thing the owner is unsure about |
| C3 | Issue | reviewer | within ~1 h of C2, **before tests are written** | contract review: a missing case, unclear rule or a question that names an AC/BR, or "checked AC-xx…yy against BR-xx: complete because …" |
| C4 | Issue | owner | reply to C3 | answer; if the contract changed, link the `v1.1` commit and its version-history line |
| C5 | Issue | owner | red commit pushed | commit link; "n failed / m total" from the saved red output |
| C6 | PR | owner | green, PR opened | PR template filled (Issue, IDs, AC, command + counts, contract commit SHA) and a short self-review note |
| C7 | PR review | reviewer | within ~1 h of C6 | what they **ran** (command + result); at least one inline comment on a specific `file:line` (question, finding or confirmation); decision: *Approve* with a reason, or *Request changes* with what must change |
| C8 | PR | owner | each C7 comment | fix commit link, or a reasoned answer if no change is needed |
| C9 | PR review | reviewer | after C8 | re-check what changed; approve with reason; merge with a merge commit |
| C10 | Issue | owner | after merge | merge SHA on `sprint-1-staging`; close the Issue; card → Done |

Rules: request changes only for real problems. If a review genuinely finds nothing, approve and
list the checks performed (that counts as a "reason for approval"). Never post a comment about code,
tests or results that do not exist yet. Reference IDs (`AC-22`, `BR-06`) so the PDF can quote the thread.

**Review guide by Issue:** what the reviewer actually runs, and questions worth asking if they apply.

| Issue | Reviewer | Check to run | Questions to ask (only if they apply) |
|---|---|---|---|
| I-02 SRS | B | Pick 3 BRs and write one test idea for each; check every NFR has a target, a method and a sprint | Is any FR only "manage X"? Does BR-07 say what happens to an optional question left blank? |
| I-03 SDS | A | Compare every role-matrix row with the §2.5 routes; compare the ER diagram with §2.4 | Where exactly is BR-06 enforced: API, DB or both? Why 404 rather than 403 for another owner's survey? |
| I-04 Trace/plan | B | Count the rows (must be 42); follow 3 random requirements to feature, sprint and AC/test | Which requirements are uncovered, and is that shown in *Coverage gaps*? |
| I-05 Foundation | A | Fresh clone → follow the README → `npx vitest run`; check the CHECK constraint is in `migration.sql` | What happens if `SEED_PASSWORD` is missing? |
| I-06 Auth | B | `curl` login and check the `Set-Cookie` flags; log out, reuse the old cookie → expect 401; run the security-review skill on the diff | Is the raw token ever logged or stored? What does `/me` do for an inactive user? |
| I-07 Authoring | B | `curl` an invalid transition and check the DB status is unchanged; read the ownership `where` clause | Can owner1 create a survey for CPE231 by changing `courseId`? |
| I-08 Responses | A | Run TEST-25 5×; submit to the CLOSED seed survey in the UI | Why does the unique constraint, and not the pre-check, make TEST-25 pass? |
| I-09 Summary | A | Recompute AC-30's average by hand; search the JSON for identity fields | Does round-half-up hold for 4.335 vs 4.345? |
| I-10 E2E/README | B | Fresh clone → README only → full test suite | Are any tests skipped, and is that disclosed? |
| I-11 Release PR | non-opener | All Sprint 1 Issues closed; secret grep empty; counts in the PR body match `evidence/` | Is the tag going on the merge commit? |

---

### I-01 [Pair] Repository, board, branches, local environment
**Owner:** A + B together (A drives) · **When:** Fri 6 Nov, first 1–2 h · **Part:** F (workflow)

**Files:** Create `README.md` (title + "setup coming in I-05"), `docs/plan.md` (this file), `docs/design.md`, `docs/partner-guide.md`, `docs/comment-playbook.md`, `.github/pull_request_template.md`, `.gitignore` (node_modules, dist, .env, .env.test, test-results, playwright-report), `CLAUDE.md` + identical `AGENTS.md` (≤ 30 lines: "read docs/plan.md Global Constraints + §2 + your Issue; contract → red → green; never skip tests; never merge; AI drafts, humans post comments").

- [x] **Step 1 (human):** Public repo `Punge089/classpulse` created; `book6349` invited with write access (6 Nov).
- [x] **Step 2:** Baseline commit `2fa7ae0` on `main`; `sprint-1-staging` created from it; both pushed.
- [x] **Step 3:** Labels, milestone, board (projects/5) and Issues #1–#11 created; mapping in §3.
- [ ] **Step 4 (both laptops):** Node 22 or newer (A has 24) + PostgreSQL 16 or newer (A has 18). Create the local dev role and both DBs with one command (asks for your own `postgres` password; `classpulse`/`classpulse` is a local-only dev credential, the same on both laptops and in `server/.env.example`):
  ```bash
  psql -h localhost -U postgres -c "CREATE ROLE classpulse LOGIN PASSWORD 'classpulse' CREATEDB;" -c "CREATE DATABASE classpulse OWNER classpulse;" -c "CREATE DATABASE classpulse_test OWNER classpulse;"
  ```
  Verify: `psql "postgresql://classpulse:classpulse@localhost:5432/classpulse_test" -c "select 1"`. I-05 uses
  `DATABASE_URL="postgresql://classpulse:classpulse@localhost:5432/classpulse?schema=public"` (`.env`) and `…/classpulse_test…` (`.env.test`).
  Each student sets `git config user.name/user.email` to the identity linked to their GitHub account.
- [ ] **Step 5:** Verify: `gh issue list --state all` shows 11 Issues; board shows them in Backlog; both students can push a test branch (delete it after).

---

### I-02 [A] SRS — Part A
**Owner:** A · **Reviewer:** B · **Branch:** `feature/<n>-srs` · **Depends on:** I-01 · **Target:** Fri 6 Nov 23:00

**Files:** Create `docs/srs.md`.

- [ ] **Step 1:** Write sections in this order: 1 Stakeholder problem; 2 Chosen context (course feedback, why); 3 Actors & responsibilities (Owner, Respondent; + "System" for seeding; future Department Admin listed as out of scope); 4 Scope & explicit exclusions (no self-registration, password recovery, email, real identity provider, grading); 5 FR table (copy §2.2 FR-01…FR-18, add 1 line of observable behaviour each); 6 BR table (BR-01…BR-14); 7 NFR table (target + verification + sprint, exactly as §2.2); 8 Assumptions (e.g. one owner per course; students may be in several courses; enrolments seeded); 9 Decisions log `D-01…` (context choice; identified-only in Sprint 1; aggregates-only for owners in S1; one response, no edit; 404 vs 403 policy; cookie session vs JWT); 10 Open questions & resolution (`Q-01` "Can owners see raw identified answers?" → "Not in S1; S3 export with FR-17"; `Q-02` "Edit after submit?" → "No, BR-09"; `Q-03` "Is anonymity needed in S1?" → "No; spec allows later").
- [ ] **Step 2:** Self-check: every FR/BR/NFR from §2.2 present with identical ID and wording; no "manage records"-style vague requirement.
- [ ] **Step 3:** Commit `docs(srs): SRS v1.0`, open PR → `sprint-1-staging`, request B.
- [ ] **Step 4 (B, human):** Review: pick 2 BRs and check each is testable; comment specifically.

---

### I-03 [B] System-Level SDS — Part C
**Owner:** B · **Reviewer:** A · **Branch:** `feature/<n>-system-sds` · **Depends on:** I-01 · **Target:** Sat 7 Nov 10:00

**Files:** Create `docs/system-sds.md`, `docs/diagrams/architecture.md` (Mermaid), `docs/diagrams/er.md` (Mermaid `erDiagram`).

- [ ] **Step 1:** §1 Architecture: stack table with reason (reuse of TokTickIT skills); component responsibilities (SPA = presentation + UX validation only; API = authentication, authorization, all BRs, transactions; DB = integrity constraints incl. unique response and rating CHECK); communication (JSON over HTTP, cookie session; Vite proxy in dev, same-origin in prod); Mermaid component diagram.
- [ ] **Step 2:** §2 Data model: copy §2.4 table, add ER diagram, ownership links (Survey.ownerId, Response.respondentId), Sprint 2/3 planned additions (`closesAt`, `Section`, `ParticipationRecord`, `AnonymousResponse` with no user FK — just named, marked "planned"); migrations (`prisma migrate dev` / `deploy`), seed (`npm run prisma:seed`, deterministic, `SEED_PASSWORD`).
- [ ] **Step 3:** §3 UI: screens table §2.7 + navigation diagram + shared states (loading / empty / error / validation / disabled-while-sending).
- [ ] **Step 4:** §4 API conventions: §2.5 error table, check order, status-code policy (404 for others' records), JSON only, ids numeric, no stack traces.
- [ ] **Step 5:** §5 Role/permission matrix — rows = operations, columns = Anonymous / Respondent / Owner, cells say *which records*:

  | Operation | Anonymous | Respondent | Owner |
  |---|---|---|---|
  | login | ✔ | ✔ | ✔ |
  | me / logout | ✘ 401 | own session | own session |
  | list/create/publish/close survey | ✘ 401 | ✘ 403 | own courses only (else 404) |
  | view summary | ✘ 401 | ✘ 403 | own surveys only (else 404) |
  | list/open published surveys | ✘ 401 | enrolled courses only | ✘ 403 |
  | submit response | ✘ 401 | enrolled + PUBLISHED + once | ✘ 403 |
  | read a response | ✘ 401 | own only (else 404) | ✘ 403 (aggregates only in S1) |

  plus the sentence "A hidden frontend control is not authorization; every cell is enforced in `server/src/middleware/auth.ts` + route handlers and tested".
- [ ] **Step 6:** §6 Authentication: scrypt (node:crypto, 16-byte salt, stored `salt:hash`), login flow, 32-byte random token → cookie, SHA-256 hash in `Session`, expiry `SESSION_TTL_HOURS`, `/me`, logout deletes row + clears cookie, inactive users rejected, same error for unknown email/wrong password.
- [ ] **Step 7:** §7 Configuration & deployment: env var table (`DATABASE_URL`, `PORT`, `SESSION_TTL_HOURS`, `SEED_PASSWORD`, `NODE_ENV`, `COOKIE_SECURE`), `.env.example` only, test DB via `.env.test`; planned GCP (Lab 5): one Docker image (Express serving `client/dist`) on **Cloud Run**, **Cloud SQL for PostgreSQL**, secrets in **Secret Manager**, images in **Artifact Registry**, migrations via `prisma migrate deploy` at release; durable data in Cloud SQL, nothing on container disk.
- [ ] **Step 8:** Commit `docs(sds): System SDS v1.0`, PR, request A. **A reviews:** checks matrix against §2.5 routes and asks one concrete question.

---

### I-04 [A] Feature inventory, traceability, three-sprint plan — Parts B + D
**Owner:** A · **Reviewer:** B · **Branch:** `feature/<n>-features-trace-plan` · **Depends on:** I-01 · **Target:** Sat 7 Nov 10:00

**Files:** Create `docs/features.md`, `docs/traceability.md`, `docs/sprints/plan.md`.

- [ ] **Step 1:** `features.md`: §2.3 table + 2–3 line description per feature + note on unused `F-02`.
- [ ] **Step 2:** `traceability.md`: one row per FR/BR/NFR (all 42): `Requirement | Feature/responsibility | Sprint | AC | Planned test | Actual test file::name | Result @ commit`. Sprint 1 rows take AC/TEST IDs from Issues I-05…I-09; Sprint 2/3 rows say "AC to be defined in Sprint 2/3 contract" (allowed by the rubric). Add sections **Coverage gaps** (e.g. NFR-05 redeploy part → Lab 5; NFR-06 → S3) and **Approved changes** (empty table with columns `Change | Date | Reason | Approved by`).
- [ ] **Step 3:** `sprints/plan.md`: per sprint — goal, feature IDs, dependencies, completion outcome, checkpoint date:
  - Sprint 1 (→ 8 Nov, D1): SR-01, F-01, F-03, F-04, F-05 — "owner publishes identified survey, enrolled student answers once, owner sees aggregates; auth + backend permissions; tagged release".
  - Sprint 2 (→ 29 Nov, D2): F-06, F-07, F-08, F-09, F-10 (+ Lab 5 Docker/CI/GCP, Lab 6 UAT fixes).
  - Sprint 3 (contracts + progress by 29 Nov; complete 13 Dec): F-11, F-12, F-13, F-14 — anonymous mode is Sprint 3 because it needs F-07 types and a privacy design.
  - Explain why Sprint 1 scope is this slice (= theme example; smallest slice with auth + transition + rule).
- [ ] **Step 4:** Commit `docs: feature inventory, traceability v1.0, sprint plan`, PR, request B. **B reviews:** samples 3 rows of the matrix against SRS.

---

### I-05 [B] SR-01 Foundation: skeleton, schema, migration, seed, test harness
**Owner:** B · **Reviewer:** A · **Branch:** `feature/<n>-foundation` · **Depends on:** I-03 data model (may start from §2.4 before I-03 merges) · **Checkpoint:** merged Sat 7 Nov 12:00

**Files:**
- Create: `server/` (package.json scripts as TokTickIT: `dev`, `build`, `start`, `prisma:migrate`, `prisma:seed`, `test`), `server/src/{index.ts,app.ts,prisma.ts,lib/errors.ts,lib/params.ts,lib/password.ts}`, `server/prisma/{schema.prisma,seed.ts}`, `server/tests/{setup.ts,helpers/fixture.ts}`, `server/tests/db/constraints.test.ts`, `server/tests/api/health.test.ts`, `server/.env.example`, `client/` (Vite React TS + Bootstrap + react-router, `src/api.ts`, `src/theme.css` + `src/components/pulse/{PulseLine,RatingDots}.tsx` per §2.9, placeholder pages per §2.7, `vite.config.ts` proxy `/api → http://localhost:3000`), root `package.json` + `playwright.config.ts` (TokTickIT config, `webServer` for both apps, 1 worker).
- Create: `docs/sprints/sprint-1/SR-01-foundation.md` (contract template §2.8; UI: "shell only").

- [ ] **Step 1:** Commit contract `SR-01-foundation.md` with AC-50 "DB rejects a second Response for the same (survey, respondent)", AC-51 "DB rejects rating outside 1–5", AC-52 "non-numeric or unknown ids return 404 error shape, malformed JSON returns 400 error shape, never 500", AC-53 "seed is repeatable and creates the §2.4 fixture", AC-54 "`RatingDots` renders five radios, selecting dot n reports n, `readOnly` ignores input, arrow keys change the value (§2.9)". Commit `docs(SR-01): contract v1.0`.
- [ ] **Step 2: Write failing tests**

```ts
// server/tests/db/constraints.test.ts
test("TEST-50 DB rejects duplicate response for same survey+respondent", async () => {
  const f = await seedFixture();
  const s = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
  await prisma.response.create({ data: { surveyId: s.id, respondentId: f.student1.id } });
  await expect(prisma.response.create({ data: { surveyId: s.id, respondentId: f.student1.id } }))
    .rejects.toMatchObject({ code: "P2002" });
});
test("TEST-51 DB rejects rating 6 via CHECK constraint", async () => { /* insert Answer ratingValue 6 → rejects */ });
// server/tests/api/health.test.ts
test("TEST-52 bad id / bad JSON give error shape not 500", async () => {
  // GET /api/health → 200 {status:"ok"}.
  // In the test file only, build a tiny app: express.json() + POST /t/:id calling parseId(req.params.id)
  // + errorHandler (no test routes in production code).
  // POST /t/abc → 404 NOT_FOUND; POST /t/1 with raw body "{" and JSON content-type → 400 VALIDATION_ERROR;
  // both bodies have error.code and no "stack" key.
});
test("TEST-53 seed twice yields exactly 5 users and 2 courses", async () => {});
```
- [ ] **Step 3:** Run `cd server && npx vitest run 2>&1 | tee ../docs/sprints/sprint-1/evidence/SR-01-red.txt` → expected FAIL (no schema/app). Commit `test(SR-01): failing foundation tests (red)`.
- [ ] **Step 4:** Implement schema (§2.4), `prisma migrate dev --name sprint1_init`, hand-add the CHECK to the generated `migration.sql`, `seed.ts` (upsert by email/code, `hashPassword(process.env.SEED_PASSWORD)`), `createApp`, `errorHandler` (JSON parse error → 400 `VALIDATION_ERROR`), `parseId`, fixture helpers, client shell + `apiFetch` (`credentials: "include"`, throws `ApiClientError`).
- [ ] **Step 5:** Run `npx vitest run 2>&1 | tee ../docs/sprints/sprint-1/evidence/SR-01-green.txt` → PASS 4/4 server tests plus the client `TEST-54` tests (`cd client && npx vitest run`); `npm run build` in `server` and `client` succeed; `npm run dev` in both → browser shows shell at :5173, `/api/health` via proxy returns ok.
- [ ] **Step 5b: Visual identity** (use the `frontend-design` and `ui-ux-pro-max` skills, but §2.9 is the decision, so do not invent a new look). Add `theme.css` with the §2.9 tokens overriding Bootstrap (`--bs-body-bg`, `--bs-body-color`, `--bs-primary` …), the font `<link>`, and `PulseLine` + `RatingDots`. Add client component tests `TEST-54 RatingDots` (renders 5 radios; clicking dot 4 calls `onChange(4)`; `readOnly` ignores clicks; arrow keys move the value) in `client/tests/RatingDots.test.tsx`; write them failing first like every other test (red output → `SR-01-red.txt`), then make them pass. Check by eye at 1280 px and 375 px that the shell has no horizontal scroll, and save two screenshots to `docs/sprints/sprint-1/evidence/theme-*.png`.
- [ ] **Step 6:** README "Local setup" section: prerequisites, `cp .env.example .env` (+ `.env.test`), migrate, seed, run, test commands. Commit `feat(SR-01): skeleton, schema, seed, harness, Pulse theme (green)`.
- [ ] **Step 7:** PR → staging; **A reviews by running setup from scratch on A's laptop** and reports the result in the review (strong, specific evidence).

---

### I-06 [Pair] F-01 Authentication, session, access control + Product DoD
**Owner:** A + B (contract and test list together; **A drives code**, B reviews PR) · **Branch:** `feature/<n>-auth` · **Depends on:** I-05 · **Checkpoint:** merged Sat 7 Nov 18:00

**Files:**
- Create: `docs/sprints/sprint-1/F-01-authentication.md`, `docs/sprints/sprint-1/definition-of-done.md`
- Create: `server/src/{types.ts,lib/session.ts,middleware/auth.ts,routes/auth.ts}`, `server/tests/helpers/auth.ts`, `server/tests/unit/password.test.ts`, `server/tests/api/auth.test.ts`, `server/tests/api/unauthenticated.test.ts`
- Create: `client/src/auth/{AuthProvider.tsx,RequireRole.tsx}`, `client/src/pages/LoginPage.tsx`, `client/src/components/NavBar.tsx`, `e2e/auth.spec.ts`

**AC (put verbatim in the contract):**
AC-01 valid login → 200 `{user}` (no `passwordHash`) and `cp_session` cookie with `HttpOnly`, `SameSite=Lax` ·
AC-02 wrong password and unknown email → both 401 `INVALID_CREDENTIALS`, identical message, no cookie; inactive user → same 401 ·
AC-03 `/me` with valid cookie → current user; without → 401 `UNAUTHENTICATED` ·
AC-04 after logout the old cookie gets 401 on `/me` and the `Session` row is gone ·
AC-05 session whose `expiresAt` is past → 401 ·
AC-06 stored `passwordHash` ≠ plaintext and verifies; wrong password does not verify ·
AC-07 every route in `PROTECTED_ROUTES` without cookie → 401 with body containing only `error` ·
AC-08 UI: bad credentials show the error alert; good login shows `fullName · role` in navbar and lands on `/owner` or `/surveys` by role; Logout returns to `/login`; reload keeps identity.

- [ ] **Step 1 (pair, ~45 min):** Write contract (template §2.8, STS rows TEST-01…TEST-09) and `definition-of-done.md`: *required behaviour implemented; every AC has an executed test or a documented manual check; tests meaningful and passing (no skips); PR reviewed by teammate with specific comment; merged to `sprint-1-staging` and passes integration run; README/docs/traceability updated; incomplete work disclosed; evidence = saved output + commit ids, not an AI statement.* Commit `docs(F-01): contract v1.0 + Product DoD`.
- [ ] **Step 2: Write failing tests**

```ts
// server/tests/api/auth.test.ts
test("TEST-02 wrong password and unknown email are indistinguishable", async () => {
  const a = await request(app).post("/api/auth/login").send({ email: "ann.lee@classpulse.test", password: "nope" });
  const b = await request(app).post("/api/auth/login").send({ email: "ghost@classpulse.test", password: "nope" });
  expect(a.status).toBe(401); expect(b.status).toBe(401);
  expect(a.body.error.code).toBe("INVALID_CREDENTIALS");
  expect(a.body.error.message).toBe(b.body.error.message);
  expect(a.headers["set-cookie"]).toBeUndefined();
});
test("TEST-04 logout invalidates the session server-side", async () => {
  const agent = await loginAs(app, "student1@classpulse.test");
  expect((await agent.post("/api/auth/logout")).status).toBe(204);
  expect((await agent.get("/api/auth/me")).status).toBe(401);
  expect(await prisma.session.count({ where: { userId: f.student1.id } })).toBe(0);
});
// server/tests/api/unauthenticated.test.ts
export const PROTECTED_ROUTES: Array<["get" | "post", string]> = [
  ["get", "/api/auth/me"], ["post", "/api/auth/logout"],
  // I-07, I-08, I-09 append their routes here
];
test.each(PROTECTED_ROUTES)("TEST-07 %s %s requires login", async (m, p) => {
  const res = await request(app)[m](p);
  expect(res.status).toBe(401);
  expect(Object.keys(res.body)).toEqual(["error"]);
});
```
  Also TEST-01 (cookie attributes), TEST-03, TEST-05 (update `expiresAt` to past via Prisma), TEST-06 unit (`password.test.ts`), TEST-08 + TEST-09 Playwright (`e2e/auth.spec.ts`: bad login alert; login → navbar text `Dr. Ann Lee · OWNER`; `page.reload()` still shows it; logout → `/login`).
- [ ] **Step 3:** Run `cd server && npx vitest run 2>&1 | tee ../docs/sprints/sprint-1/evidence/F-01-red.txt` → FAIL (routes missing). Commit `test(F-01): failing auth tests (red)`.
- [ ] **Step 4:** Implement §2.6 symbols for I-06: `session.ts` (32-byte `randomBytes` base64url token, store SHA-256 hex, TTL from env), `requireAuth` (reads `cp_session`, attaches `req.user`), `requireRole`, `routes/auth.ts`, `loginAs` helper; client `AuthProvider` (calls `/api/auth/me` on load), `LoginPage`, `NavBar`, `RequireRole` (redirect to `/login` — UX only).
- [ ] **Step 5:** Run server tests → PASS; `npm run test:e2e -- e2e/auth.spec.ts` → PASS; save green output to `evidence/F-01-green.txt`. Commit `feat(F-01): login, logout, me, role middleware (green)`.
- [ ] **Step 6:** Update traceability rows FR-01, NFR-01…04 with actual test files. PR → staging; **B reviews** (B must be able to explain the cookie/session lifecycle — write it in the review in 2–3 sentences).

---

### I-07 [A] F-03 Survey authoring and lifecycle
**Owner:** A · **Reviewer:** B · **Branch:** `feature/<n>-survey-authoring` · **Depends on:** I-06 for API tests (contract + unit tests can start after I-05)

**Files:**
- Create: `docs/sprints/sprint-1/F-03-survey-authoring.md`
- Create: `server/src/lib/{surveyLifecycle.ts,surveyValidation.ts}`, `server/src/routes/ownerSurveys.ts`, `server/tests/unit/{surveyLifecycle.test.ts,surveyValidation.test.ts}`, `server/tests/api/ownerSurveys.test.ts`
- Modify: `server/src/app.ts` (mount `/api/owner` with `requireAuth, requireRole("OWNER")`), `server/tests/api/unauthenticated.test.ts` (append 6 owner routes)
- Create: `client/src/pages/owner/{OwnerSurveysPage.tsx,NewSurveyPage.tsx,SurveyDetailPage.tsx}`, `e2e/owner-survey.spec.ts`

**AC:**
AC-10 owner1 creates a survey for CPE334 with 1 RATING + 1 SINGLE_CHOICE question → 201, status `DRAFT`, rows persisted with positions 1..n ·
AC-11 invalid input → 400 `VALIDATION_ERROR` with a `details` entry per bad field: empty/121-char title; 0 or 21 questions; prompt empty/301 chars; SINGLE_CHOICE with 1 option, 7 options, duplicate or empty option; RATING with options; unknown `type`; `questions` not an array ·
AC-12 owner1 creating for CPE231 (owner2's course) → 404, nothing stored ·
AC-13 publish DRAFT → 200 `PUBLISHED`, `publishedAt` set ·
AC-14 publish PUBLISHED/CLOSED and close DRAFT/CLOSED → 409 `INVALID_TRANSITION`, status unchanged in DB ·
AC-15 close PUBLISHED → 200 `CLOSED`, `closedAt` set ·
AC-16 student1 calling each `/api/owner/*` route → 403 `FORBIDDEN`, no survey created ·
AC-17 owner2 GET/publish/close owner1's survey → 404, unchanged ·
AC-18 `GET /api/owner/surveys` returns only caller's surveys with correct `responseCount` ·
AC-19 UI: owner creates a 2-question survey, sees it as Draft, publishes, sees "Published" badge; validation messages appear under the fields for an empty title.

- [ ] **Step 1:** Contract (STS TEST-10…TEST-21) → commit `docs(F-03): contract v1.0`.
- [ ] **Step 2: Write failing tests** (unit first — they need no auth):

```ts
// server/tests/unit/surveyLifecycle.test.ts
test.each([["DRAFT","publish","PUBLISHED"],["PUBLISHED","close","CLOSED"]])(
  "TEST-15 %s + %s → %s", (from, action, to) => expect(nextStatus(from, action)).toBe(to));
test.each([["PUBLISHED","publish"],["CLOSED","publish"],["DRAFT","close"],["CLOSED","close"]])(
  "TEST-15 %s + %s is rejected", (from, action) => {
    let err: unknown;
    try { nextStatus(from, action); } catch (e) { err = e; }
    expect(err).toMatchObject({ status: 409, code: "INVALID_TRANSITION" });
  });
// server/tests/api/ownerSurveys.test.ts
test("TEST-19 another owner cannot publish my survey", async () => {
  const s = await makeSurvey({ course: f.cpe334, owner: f.owner1, status: "DRAFT" });
  const res = await (await loginAs(app, "ben.kim@classpulse.test")).post(`/api/owner/surveys/${s.id}/publish`);
  expect(res.status).toBe(404);
  expect((await prisma.survey.findUniqueOrThrow({ where: { id: s.id } })).status).toBe("DRAFT");
});
```
  STS mapping (use exactly): TEST-10 AC-10 API/DB · TEST-11 AC-11 unit (table of every invalid input in AC-11) · TEST-12 AC-11 API 400 (incl. `questions: "x"` and a non-JSON body) · TEST-13 AC-12 · TEST-14 AC-13 · TEST-15 AC-14 unit · TEST-16 AC-14 API (status unchanged in DB) · TEST-17 AC-15 · TEST-18 AC-16 (`test.each` over owner routes as student1 → 403, `survey.count()` unchanged) · TEST-19 AC-17 · TEST-20 AC-18 · TEST-21 AC-19 Playwright.
- [ ] **Step 3:** Run unit tests → FAIL; save `evidence/F-03-red.txt`; commit `test(F-03): failing lifecycle/validation/API tests (red)`.
- [ ] **Step 4:** Implement `nextStatus`, `validateSurveyInput`, routes (load survey with `where: { id, ownerId: req.user.id }` → 404 if null; create in one `prisma.$transaction`); append owner routes to `PROTECTED_ROUTES`; client pages.
- [ ] **Step 5:** Server tests + `e2e/owner-survey.spec.ts` PASS; save `evidence/F-03-green.txt`; commit `feat(F-03): survey authoring and lifecycle (green)`.
- [ ] **Step 6:** Update traceability rows; PR; **B reviews** (try one invalid transition by hand with curl and paste the response in the review).

---

### I-08 [B] F-04 Response submission
**Owner:** B · **Reviewer:** A · **Branch:** `feature/<n>-response-submission` · **Depends on:** I-06 for API tests (unit tests after I-05)

**Files:**
- Create: `docs/sprints/sprint-1/F-04-response-submission.md`
- Create: `server/src/lib/responseValidation.ts`, `server/src/routes/{surveys.ts,responses.ts}`, `server/tests/unit/responseValidation.test.ts`, `server/tests/api/responses.test.ts`
- Modify: `server/src/app.ts` (mount `/api/surveys`, `/api/responses` with `requireAuth, requireRole("RESPONDENT")`), `server/tests/api/unauthenticated.test.ts` (append 4 routes)
- Create: `client/src/pages/respondent/{SurveyListPage.tsx,AnswerSurveyPage.tsx,ConfirmationPage.tsx}` (rating questions use `RatingDots` from I-05, §2.9), `e2e/respond.spec.ts`

**AC:**
AC-20 student1 list shows PUBLISHED CPE334 surveys only (no DRAFT, no CPE231), each with `hasResponded` ·
AC-21 valid submission → 201; one `Response` + one `Answer` per question stored; `GET /api/responses/:id` returns them ·
AC-22 second submission → 409 `ALREADY_RESPONDED`, still exactly 1 response; two **simultaneous** submissions → exactly one 201 and one 409 ·
AC-23 submit to DRAFT or CLOSED survey → 409 `SURVEY_NOT_OPEN`, nothing stored ·
AC-24 student3 (not enrolled in CPE334) → 403 `NOT_ELIGIBLE`, nothing stored ·
AC-25 invalid answers → 400 with details: missing required question; rating 0, 6, 2.5, `"3"`; optionId of another question; unknown questionId; same questionId twice; `answers` not an array. Ratings 1 and 5 accepted ·
AC-26 student2 `GET /api/responses/<student1's id>` → 404; `PUT`/`DELETE /api/responses/:id` do not exist (404) — BR-09 ·
AC-27 owner1 calling `POST /api/surveys/:id/responses` or `GET /api/responses/:id` → 403 ·
AC-28 UI: banner "Identified survey — your name is stored with your answers" shown before answering; submit → confirmation page with time; list then shows "Submitted"; Submit disabled while sending; a 409 shows the server message, no form resubmission.

- [ ] **Step 1:** Contract (STS TEST-22…TEST-32) → commit `docs(F-04): contract v1.0`.
- [ ] **Step 2: Write failing tests**

```ts
// server/tests/api/responses.test.ts
test("TEST-25 simultaneous submissions store exactly one response", async () => {
  const s = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
  const agent = await loginAs(app, "student1@classpulse.test");
  const body = validAnswers(s);
  const [r1, r2] = await Promise.all([
    agent.post(`/api/surveys/${s.id}/responses`).send(body),
    agent.post(`/api/surveys/${s.id}/responses`).send(body),
  ]);
  expect([r1.status, r2.status].sort()).toEqual([201, 409]);
  expect(await prisma.response.count({ where: { surveyId: s.id } })).toBe(1);
});
test("TEST-30 a student cannot read another student's response", async () => {
  const s = await makeSurvey({ course: f.cpe334, owner: f.owner1 });
  const r = await (await loginAs(app, "student1@classpulse.test")).post(`/api/surveys/${s.id}/responses`).send(validAnswers(s));
  const res = await (await loginAs(app, "student2@classpulse.test")).get(`/api/responses/${r.body.response.id}`);
  expect(res.status).toBe(404);
  expect(JSON.stringify(res.body)).not.toContain("ratingValue");
});
```
  Plus TEST-22, 23, 24 (sequential duplicate), 26 (DRAFT and CLOSED via `makeSurvey({status})`), 27, 28 (unit table for AC-25), 29 (API boundaries 1 and 5 accepted, 0/6 rejected), 31, TEST-32 Playwright (`e2e/respond.spec.ts`, survey seeded through `makeSurvey`-equivalent SQL or the owner UI once I-07 is merged; double-click Submit → still one confirmation).
- [ ] **Step 3:** Run → FAIL; save `evidence/F-04-red.txt`; commit `test(F-04): failing response rule tests (red)`.
- [ ] **Step 4:** Implement `validateAnswers`; POST handler in the §2.5 check order; insert `Response` + `Answer`s in one `$transaction`; map Prisma `P2002` on `Response` to 409 `ALREADY_RESPONDED` (the DB constraint, not a pre-check, guarantees TEST-25); client pages.
- [ ] **Step 5:** All tests PASS (run TEST-25 5× to check it is not flaky: `for i in 1 2 3 4 5; do npx vitest run -t "TEST-25" || break; done`); save `evidence/F-04-green.txt`; commit `feat(F-04): response submission (green)`.
- [ ] **Step 6:** Update traceability; PR; **A reviews** (A reads TEST-25 and explains in the review why the unique constraint, not the pre-check, makes it pass).

---

### I-09 [B] F-05 Aggregate summary
**Owner:** B · **Reviewer:** A · **Branch:** `feature/<n>-summary` · **Depends on:** I-06 (API), I-05 (unit)

**Files:**
- Create: `docs/sprints/sprint-1/F-05-aggregate-summary.md`, `server/src/lib/summary.ts`, `server/src/routes/ownerSummary.ts` (own router, so it does not depend on or conflict with I-07's `ownerSurveys.ts`), `server/tests/unit/summary.test.ts`, `server/tests/api/summary.test.ts`, `client/src/pages/owner/SurveySummaryPage.tsx` (bars and read-only `RatingDots` per §2.9)
- Modify: `server/src/app.ts` (mount `ownerSummary` at `/api/owner/surveys` behind `requireAuth, requireRole("OWNER")`; one line — expect a trivial merge with I-07), `unauthenticated.test.ts` (append 1 route)

**Response shape:**
```json
{ "summary": { "surveyId": 1, "status": "PUBLISHED", "responseCount": 3,
  "questions": [
    { "questionId": 10, "prompt": "Pace of lectures", "type": "RATING",
      "rating": { "average": 4.33, "distribution": { "1": 0, "2": 0, "3": 0, "4": 2, "5": 1 } } },
    { "questionId": 11, "prompt": "Would you recommend?", "type": "SINGLE_CHOICE",
      "choice": { "options": [ { "optionId": 5, "label": "Yes", "count": 3 }, { "optionId": 6, "label": "No", "count": 0 } ] } } ] } }
```

**AC:**
AC-30 ratings `[4,4,5]` → average `4.33` (round half-up, 2 dp), distribution as above; choice counts include zero-count options in option order ·
AC-31 zero responses → `responseCount 0`, `average null`, all counts 0 ·
AC-32 owner2 → 404; student1 → 403 ·
AC-33 summary JSON contains no `respondentId`, `email`, `fullName` or per-response rows ·
AC-34 UI: summary page shows count and per-question results; "No responses yet" empty state.

- [ ] **Step 1:** Contract (STS TEST-33…TEST-38) → commit `docs(F-05): contract v1.0`.
- [ ] **Step 2: Write failing tests** — TEST-33/35 unit on `summarize` with literal inputs from AC-30/31; TEST-34 API (3 responses inserted via Prisma); TEST-36 (owner2 404, student1 403); TEST-37:

```ts
test("TEST-37 summary leaks no respondent identity", async () => {
  const text = JSON.stringify((await ownerAgent.get(`/api/owner/surveys/${s.id}/summary`)).body);
  for (const k of ["respondentId", "email", "fullName", "student1"]) expect(text).not.toContain(k);
});
```
  TEST-38 is covered inside I-10's journey (E2E) — note that in the STS.
- [ ] **Step 3:** Run → FAIL; save `evidence/F-05-red.txt`; commit `test(F-05): failing summary tests (red)`.
- [ ] **Step 4:** Implement `summarize` (pure) + handler (ownership 404 like I-07); summary page.
- [ ] **Step 5:** PASS; save `evidence/F-05-green.txt`; commit `feat(F-05): aggregate summary (green)`.
- [ ] **Step 6:** Traceability; PR; **A reviews** (recomputes AC-30 by hand in the review).

---

### I-10 [A] Full-journey E2E, README, integration run
**Owner:** A · **Reviewer:** B · **Branch:** `feature/<n>-journey-e2e` · **Depends on:** I-07, I-08, I-09 merged

**Files:** Create `e2e/journey.spec.ts`, `docs/sprints/sprint-1/test-results.md`; Modify `README.md`, `docs/traceability.md`.

- [ ] **Step 1: Write the journey test** `TEST-40 full Sprint 1 journey`: owner1 logs in → creates "Lecture feedback W10" (1 RATING, 1 SINGLE_CHOICE) → publishes → logs out; student1 logs in → sees banner → rates 4, chooses "Yes" → confirmation → logs out; owner1 opens summary → `responseCount` text "1", average "4.00". Covers AC-19, AC-28, AC-34 (= TEST-38).
- [ ] **Step 2:** Run on `sprint-1-staging` → if it fails, open a fix Issue for the owning lane (do not patch other people's code silently).
- [ ] **Step 3:** README final: dependencies, env-var table, DB create/migrate/seed, run, all test commands, seeded account emails (password = value of `SEED_PASSWORD` you set locally — never the real value in Git), troubleshooting.
- [ ] **Step 4: Integration run** on the staging head commit, saving everything:
```bash
cd server && npm run build && npx vitest run 2>&1 | tee ../docs/sprints/sprint-1/evidence/integration-server.txt
cd client && npm run build && npx vitest run 2>&1 | tee ../docs/sprints/sprint-1/evidence/integration-client.txt
npx playwright test 2>&1 | tee docs/sprints/sprint-1/evidence/integration-e2e.txt
```
  Expected: 0 failed, 0 skipped. Fill `test-results.md`: commit SHA, commands, counts, AC → TEST → file::name → result table (mark manual checks as *manual*).
- [ ] **Step 5:** Commit, PR; **B reviews** by running the README from a fresh clone.

---

### I-11 [Pair] Release, evidence, PDF, submission
**Owner:** A + B · **When:** Sun 8 Nov 14:00–23:00 · **Parts:** front matter, F (and assembling A–E)

- [ ] **Step 1:** Open release PR `sprint-1-staging → main` titled "Release v1.0.0-sprint1"; body lists Issues, features, test counts, known limitations. Reviewer = the student who did **not** open it; review checks: all Sprint 1 Issues Done, integration output attached, no secrets (`git grep -nE "SEED_PASSWORD=.+|postgresql://[^\"]*:[^@\"]+@" -- ':!*.example'` returns nothing).
- [ ] **Step 2:** Merge (merge commit), then on `main`: `git tag -a v1.0.0-sprint1 -m "CPE334 D1 Sprint 1 release" && git push origin v1.0.0-sprint1`. Re-run the three test commands **on the tag** and save to `evidence/release-*.txt` (this is the result the PDF quotes).
- [ ] **Step 3: Demonstrations** (screenshots at the tag, each labelled: feature/AC IDs, role, starting state, steps, expected, actual):
  - **DEMO-1** normal journey: owner creates + publishes (AC-10, 13, 19) → student submits (AC-21, 28) → **restart server**, reload `/responses/:id` (NFR-05) → owner summary (AC-30).
  - **DEMO-2** rule rejections: student1 resubmits → `ALREADY_RESPONDED` (AC-22); submit to "Week 1 pulse" (CLOSED) → `SURVEY_NOT_OPEN` (AC-23).
  - **DEMO-3** access: login/logout (AC-01, 04); student `curl -b cookie -X POST /api/owner/surveys` → 403 (AC-16); owner2 opens owner1's summary URL → 404 (AC-32); plus the TEST-07/18/30 output lines.
- [ ] **Step 4: Process evidence:** screenshots of I-07 and I-08 Issue → branch → PR (author/reviewer, review comment) → merge into staging → release PR → tag (one chain per student); final board; `git log --graph --date=iso --format="%h %ad %an %s" main` excerpt showing for F-03 and F-04: contract commit → red commit → green commit with dates.
- [ ] **Step 5: Write** `docs/contributions.md` (table: Issue, author, reviewer, pair?, summary) and `docs/ai-use.md` (each student lists tools + tasks assisted; "all AI output was reviewed and tests run by the owner").
- [ ] **Step 6: Assemble the PDF** in `docs/deliverable-1/report.md` with these headings in this order: Cover (names, IDs, theme #10 + ClassPulse context, repo URL, tag + commit SHA) · Navigation table (Part, pages, IDs) · Table of contents · **Part A SRS** · **Part B Feature inventory and traceability** · **Part C System-Level SDS** · **Part D Three-sprint plan** · **Part E Sprint 1 engineering contracts** (SR-01, F-01, F-03, F-04, F-05, Product DoD) · **Part F Working Sprint 1 and verification** (F.1 setup summary, F.2 demonstrations, F.3 build/test results, F.4 AC→test results table, F.5 two test excerpts — TEST-25 (domain rule) and TEST-19 (ownership) — with their results and red→green versions, F.6 Issue/PR chains + board + release, F.7 history sequence, F.8 contributions, F.9 AI-use, F.10 known limitations & failed/skipped tests). **Tooling already prepared (PR for Issue #11):** `tools/build_report.py` assembles exactly these Parts from the repo docs, prints the PDF with Edge, finds each heading's real page with PyMuPDF so the navigation table and TOC carry correct page numbers, and stamps "page n / N" on every page. Fill `docs/deliverable-1/front-matter.md` (names, IDs, SHA) and the `TODO` markers in `docs/deliverable-1/part-f.md`, then run from **PowerShell** (not a sandboxed shell, which blocks Edge): `pip install -r tools/requirements.txt; python tools/build_report.py` for a draft with visible placeholders, and `python tools/build_report.py --final` for the submission (it refuses while any `TODO` or missing document remains). Open the PDF and check every page for readability before uploading.
- [ ] **Step 7:** Final checklist (§5 of the D1 PDF) item by item; upload to LEB2 by 23:00; do not push to `main` after submission.

---

## 5. Done by humans only (AI cannot or must not do these)

| # | Task | Who | When |
|---|---|---|---|
| H-1 | Create the GitHub repo, add partner (and TAs if private); decide public/private | A | I-01 |
| H-2 | Set each person's git identity; install Node/PostgreSQL locally | both | I-01 |
| H-3 | Approve creation of the GitHub Issues/labels/board (Claude can run `gh` after you say yes) | A | I-01 |
| H-4 | **Every PR review**: read the diff and tests, run something, write a specific comment, approve from your own account | reviewer of each PR | continuous |
| H-5 | Inspect test assertions and failure output yourself before trusting "green" | each owner | each Issue |
| H-6 | 30-min walkthrough where each explains the other's lane (graders may ask either of you) | both | Sun 8 Nov morning |
| H-7 | Merge the release PR and push tag `v1.0.0-sprint1` | release reviewer | I-11 |
| H-8 | Take program screenshots (DEMO-1…3) and GitHub screenshots (Issues, PRs, reviews, board, tag) | both | I-11 |
| H-9 | Fill names + student IDs; write own lines in contribution table and AI-use declaration | both | I-11 |
| H-10 | Assemble PDF, add TOC/page numbers, check readability, run the D1 submission checklist | both | I-11 |
| H-11 | Upload to LEB2; keep repo accessible; share test accounts only via private course handoff | A (upload), both check | by 23:00 8 Nov |
| H-12 | Ask the TA if anything about the slice is doubted (ours matches the theme example, so no approval should be needed) | either | only if needed |

## 6. Running an Issue in a separate session

### 6.1 Prompt to paste (works with Claude Code and other coding agents)

> Work on Issue **I-0X** of `docs/plan.md` in this repository. Read *Global Constraints*,
> *§2 Shared Contracts*, *§4.1* and *I-0X* in `docs/plan.md`, and `docs/comment-playbook.md`.
> Use the skills listed for I-0X in §6.2 if you have them. Create branch
> `feature/<github-no>-<slug>` from `sprint-1-staging`. Follow the steps in order, committing at
> each "commit" step (contract → failing tests with saved red output → implementation → green
> output). At each owner event, fill the playbook message (C1, C2, C4, C5, C6, C8, C10) from real
> `git`/`gh`/evidence data, show it to me, and post it with `gh` when I say ok. After C2, wait
> for the reviewer's C3 (check with `gh issue view`) before writing tests. Do not touch files
> owned by other Issues except those listed under *Modify*. Never merge. Report test counts and commit IDs.

**Reviewer prompt** (in the reviewer's own session):

> I review Issue I-0X / PR #N. Use `docs/comment-playbook.md` Part B for I-0X. For C3: read the
> contract commit and run the `contract_check`. For C7: `gh pr checkout N`, run the tests and the
> `pr_check`, and read the diff. Fill the C3/C7/C9 template only with what you actually ran,
> saw and found, citing `file:line`. Show it to me and post it with `gh` when I say ok. Never invent a finding.

### 6.2 Skills scanned and chosen

All installed skills were scanned. Chosen per Issue (✔ = use), with the reason:

| Skill | Use in | Why |
|---|---|---|
| brainstorming, writing-plans | Planning (done, this file) | Settle the design, then write the plan |
| test-driven-development | I-05, I-06, I-07, I-08, I-09 | The rubric needs red → green evidence for rule work |
| verification-before-completion | every Issue, before C6 | "Completion must be supported by evidence, not an AI agent's claim" |
| systematic-debugging | any unexpected failure; I-10 integration | Fix the root cause instead of weakening tests |
| ponytail (lite) | I-05…I-09 implementation | Keep Sprint 1 code minimal under time pressure |
| ui-ux-pro-max | I-03 §3, I-06, I-07, I-08 pages | Forms, validation, loading/empty/error states, accessibility (NFR-07) |
| frontend-design | I-05 client shell only | One visual direction, so every later page matches |
| dataviz | I-09 summary page | Rating distribution and choice-count bars |
| requesting-code-review | owner, before C6 | Self-review before asking the teammate |
| code-review (medium) | reviewer's session, C7 | AI-assisted pass on the real diff; the human verifies each finding before posting |
| security-review | I-06 PR, I-11 release PR | Auth/session code and the release for secrets |
| run | I-10, I-11 DEMO screenshots | Launch and drive the real app |
| verify-work | I-02, I-03, I-04 docs; I-11 final PDF | Checks the work against the D1 rubric and checklist, item by item |
| docx | I-11 | Build the report with a real TOC and page numbers |
| pdf | I-11 | Check the exported PDF (pages, readable text, embedded screenshots) |

Not used: skill-router (meta-routing; the table above already routes), simplify (optional after
green if time remains), docs (Claude Docs has no page numbers; the PDF needs them), compare-work
(nothing to compare), pptx/xlsx (no slides or spreadsheets), claude-api (no LLM in the product),
init (CLAUDE.md is written by hand in I-01 because there is no code yet), the artifact-*,
caveman*, memory, scheduling, plugin and settings skills (unrelated to this deliverable).
If a partner's AI lacks these skills, the prompt in §6.1 still carries every rule it needs.

## 7. Self-check against the deliverable

| D1 requirement | Covered by | Fits time? |
|---|---|---|
| Complete domain journey UI → API → DB + retrieval | I-07, I-08, I-09, TEST-40, DEMO-1 | Yes, if I-06 lands by Sat 18:00 |
| Real login/logout/current user, 2 roles | I-06 | Yes |
| Meaningful transition + business-rule validation | BR-03 (I-07), BR-04…07 (I-08) | Yes |
| Tests: domain rules, persistence, access, selected UI journeys | unit + API/DB + Playwright in I-05…I-10 | Yes; component tests are first to cut |
| Issues, feature branches, reviewed PRs, staging, release on main | §3, every Issue, I-11 | Yes — reviews are the bottleneck; answer within 1 h |
| Part A–D whole-product docs | I-02, I-03, I-04 | Yes, concise versions (≈ 3–6 pages each) |
| Contracts before code + TDD red/green evidence | contract/red/green commits + `evidence/` | Yes, built into every Issue |
| PDF with A–F, navigation table, TOC, evidence | I-11 | **Tightest part** — start the report skeleton Sat evening, fill as Issues close |
| Docker/CI/GCP | Not required (Lab 5); designed in I-03 §7 | — |
| Honest disclosure | F.10, test-results.md | Yes |

**Not covered / disclosed:** Sprint 2–3 features (allocated, not built); NFR-05 redeploy part
(Lab 5); NFR-06/NFR-10 (Sprint 3); client component tests if cut.

## 8. Can this plan reach 80/80?

No plan can guarantee full marks: TAs grade what is actually submitted. What this plan does is
put every rubric item somewhere concrete. The remaining risk is in execution:

| Part | Full marks needs | Plan provides | Where points are usually lost | Guard |
|---|---|---|---|---|
| A (10) | Observable FR/BR with IDs, measurable NFR + method + sprint, decisions | §2.2 registry; NFR-03/07 rewritten as measurable | Vague FRs; NFRs with no number | I-02 self-check + reviewer check |
| B (10) | Every FR/BR/NFR → feature → sprint; gaps + changes shown | 42-row matrix, gaps, changes table | Rows not updated with actual tests after coding | I-10 updates them on the release commit |
| C (15) | Architecture, data, UI/API, role matrix, auth, config/GCP | I-03 steps 1–7 | Unreadable diagrams; matrix not matching code | Render Mermaid to PNG for the PDF; reviewer compares matrix with routes |
| D (5) | Goals, features, dependencies, outcomes, Sprint 1 rationale | I-04 step 3 | Missing "why this Sprint 1 scope" | Explicit paragraph in I-04 |
| E (20) | All Sprint 1 contracts + AC + STS + DoD, versioned **before** code | Template §2.8; C2/C3 timestamps; red commits | Contract committed together with code; no red evidence | Commit order + C3 review before tests |
| F (20) | Demos, counts, AC→test table, excerpts, TDD, 2 Issue/PR chains, contributions, AI-use, limits | I-10, I-11 | **Generic reviews**, missing counts/commit, unlabeled screenshots, one student doing everything | §4.1 protocol; labels on DEMO-1…3; H-6 walkthrough |

The two biggest threats to 80/80 are **time** (§0 checkpoints) and **review credibility**. A
review conversation scripted in advance would *lower* the score if noticed: it cannot cite real
lines or results, it reads as generic, and a TA may ask either student to explain it.
