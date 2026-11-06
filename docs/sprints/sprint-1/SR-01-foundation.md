# SR-01 Foundation engineering contract

**Issue #5 (I-05) · Owner: book6349 (Student B) · Reviewer: Punge089 (Student A) · Sprint 1 · v1.1**

## 1. Feature and linked requirements

SR-01 provides the Express and TypeScript server, the Prisma and PostgreSQL data layer, the React and Vite client shell, and the local test harness. It supports BR-06 (one response per respondent per survey), BR-07 (rating bounds), NFR-01 (password hashes), NFR-05 (durable storage), and NFR-09 (environment-based configuration). I-05 starts from the data model in [plan §2.4](../../plan.md). Authentication, survey authoring, response submission, and summaries build on these shared interfaces.

## 2. Behaviour and workflow

1. Configure the server database URL and `SEED_PASSWORD` locally. Copy the test settings from `server/.env.test.example` to `server/.env.test`. The example documents `DATABASE_URL` for the separate `classpulse_test` database and a synthetic `SEED_PASSWORD` for fixture logins.
2. Apply the `sprint1_init` migration and seed the development database. Re-running the seed keeps the same fixture users, courses, enrolments, and closed demo survey.
3. Start Express on port 3000 and Vite on port 5173. Vite proxies `/api` to Express, so a request to `/api/health` works from the client origin.
4. Run database and API tests against a migrated test database. Reset test state between cases that mutate the database. Run client tests for `RatingDots` and configure Playwright to start both apps with one worker.

## 3. Business rules and validation

- Enforce BR-06 with a PostgreSQL unique constraint on `(surveyId, respondentId)`. A duplicate insert fails with Prisma `P2002`.
- Enforce the BR-07 rating bound in PostgreSQL with `CHECK (rating_value IS NULL OR rating_value BETWEEN 1 AND 5)`. A null rating is valid for a choice answer. I-08 validates answer completeness, question ownership, and the answer type in the application.
- `parseId(raw)` accepts a positive integer in the supported database ID range. Invalid IDs produce `404 NOT_FOUND`. A valid ID whose record is missing gets the same response after the caller's lookup.
- The seed takes its password from `SEED_PASSWORD`, hashes it with scrypt and a random salt, and fails with a configuration error when the value is missing. The repository contains only environment examples.

## 4. Permissions

`GET /api/health` is public and returns service status only. Feature issues add authentication, role checks, and record ownership checks on the backend. The seed and test harness are local commands.

## 5. UI spec

Shell only. Use Bootstrap, the Pulse theme tokens from plan §2.9, and placeholders for the routes in §2.7. Import `theme.css` after Bootstrap. `PulseLine` uses reduced-motion preferences. The shell must fit at 375 px and 1280 px.

`RatingDots` exposes five radio inputs labelled `Rating 1 of 5` through `Rating 5 of 5`. `value` determines the selected rating and the filled dots. In editable mode, clicking a dot or using the arrow keys reports the new value through `onChange`. In `readOnly` mode, the displayed rating stays fixed and input never calls `onChange`.

## 6. API spec

| Method and path | Access | Request | Success | Error |
|---|---|---|---|---|
| `GET /api/health` | Public | No body | `200` with `{"status":"ok"}` | Unexpected server failures use the shared `500 INTERNAL_ERROR` envelope. |

Shared errors use `{"error":{"code":"...","message":"..."}}` with optional `details` entries containing `field` and `message`. Malformed JSON returns `400 VALIDATION_ERROR`. Invalid IDs and missing records return `404 NOT_FOUND`. Responses never include a stack trace.

`createApp()` constructs the Express app without listening. `getPrisma()` provides the lazy Prisma client. `apiFetch` includes credentials and maps API failures to `ApiClientError` with `status`, `code`, `message`, and optional `details`.

| Shared helper | Contract |
|---|---|
| `resetDb(): Promise<void>` | Clears records only in the configured test database. |
| `seedFixture(): Promise<Fixture>` | Returns `owner1`, `owner2`, `student1`, `student2`, `student3` as `User` records and `cpe334`, `cpe231` as `Course` records. Creates the five accounts, two courses and three enrolments without creating any surveys. |
| `makeSurvey(opts): Promise<SurveyWithQuestions>` | Requires `course: Course` and `owner: User`. Optional `status: SurveyStatus` defaults to `PUBLISHED`. Optional `questions: QuestionSpec[]` defaults to one rating and one single-choice question with `Yes` and `No`; the result includes questions and their options. |
| `hashPassword(plain): Promise<string>` | Creates a scrypt hash with a random salt. |
| `verifyPassword(plain, hash): Promise<boolean>` | Checks the supplied password against the stored hash. |

Fixture helpers live in `server/tests/helpers/fixture.ts`. Password helpers live in `server/src/lib/password.ts`.

## 7. Data spec and migration

Apply plan §2.4 in `server/prisma/schema.prisma`: `User`, `Session`, `Course`, `Enrollment`, `Survey`, `Question`, `QuestionOption`, `Response`, and `Answer`. Use the specified foreign keys, unique pairs, enum values, defaults, and cascade rules. Add the named rating `CHECK` to `sprint1_init/migration.sql` because the Prisma schema does not express it.

Seed five synthetic users, two courses, and three enrolments. Owner 1 owns CPE334 and Owner 2 owns CPE231. Students 1 and 2 are enrolled in CPE334, and Student 3 is enrolled only in CPE231. The development seed also creates the closed CPE334 survey `Week 1 pulse`. `Week 1 pulse` is development-seed only. Upsert the fixture records or otherwise use stable keys so that rerunning the seed does not duplicate any of them.

| Email | `fullName` | Role |
|---|---|---|
| `ann.lee@classpulse.test` | Dr. Ann Lee | `OWNER` |
| `ben.kim@classpulse.test` | Dr. Ben Kim | `OWNER` |
| `student1@classpulse.test` | Student 1 | `RESPONDENT` |
| `student2@classpulse.test` | Student 2 | `RESPONDENT` |
| `student3@classpulse.test` | Student 3 | `RESPONDENT` |

Plan §2.4 gives the owner display names. The three student display names above are synthetic fixture values.

## 8. Failure and boundary cases

- A duplicate response leaves one row for that survey and respondent.
- Ratings 0 and 6 fail the database check. Ratings 1 and 5 pass it, as does a choice answer with a null rating.
- A malformed or out-of-range ID, or a well-formed ID with no matching record, returns 404. A malformed JSON request returns 400. Each response uses the error envelope.
- A missing seed password stops the seed before writing fixture records. Tests must verify the test database target before clearing any data.

## 9. Acceptance criteria

| ID | Observable outcome |
|---|---|
| AC-50 | PostgreSQL rejects a second `Response` for the same `(surveyId, respondentId)`. Exactly one matching response remains. |
| AC-51 | PostgreSQL rejects ratings outside 1–5 through the rating check constraint. Values 1 and 5 and a null rating on a choice answer are accepted. |
| AC-52 | The public health endpoint returns 200. Invalid or unknown IDs return the 404 error shape and malformed JSON returns the 400 error shape, with no stack trace. |
| AC-53 | Running the seed twice on a fresh database produces the fixture from plan §2.4 without duplicate records. Every fixture user has the specified email, display name, and role, and their stored hash verifies against `SEED_PASSWORD`. Only the development seed adds the demo survey. |
| AC-54 | `RatingDots` renders five labelled radios. Selecting dot n reports n, arrow keys change the value, and `readOnly` ignores input. |

## 10. Software Test Specification

| Test ID | AC | Level | Precondition and input | Action | Expected result | Planned file |
|---|---|---|---|---|---|---|
| TEST-50 | AC-50 | DB | Migrated test database, valid survey and eligible student | Insert the same response pair twice | Second insert fails with `P2002`; matching count is 1 | `server/tests/db/constraints.test.ts` |
| TEST-51 | AC-51 | DB | Valid response with rating and choice questions, and a valid option | Write ratings 0, 6, 1 and 5, and write a choice answer with a null rating | 0 and 6 fail the rating check and are not stored; 1, 5 and the null rating succeed | `server/tests/db/constraints.test.ts` |
| TEST-52 | AC-52 | API | Real app for health and a test-only Express app using `express.json()`, `parseId` and `errorHandler` for error paths | Request health, then send an invalid ID, a known-absent valid ID, and malformed JSON | Health returns 200 with `status: ok`. Errors are 404 `NOT_FOUND`, 404 `NOT_FOUND` and 400 `VALIDATION_ERROR`, respectively, with no stack | `server/tests/api/health.test.ts` |
| TEST-53 | AC-53 | DB | Empty migrated test database and synthetic `SEED_PASSWORD` | Run `seedFixture()` and confirm it adds no survey. Reset the test database, then run the development seed twice, checking records after each run | Exactly 5 users, 2 courses, 3 enrolments, and 1 closed demo survey with the specified course ownership and enrolments on both runs. Each user's email, `fullName`, and role match §7, and `verifyPassword(SEED_PASSWORD, passwordHash)` is true for every stored hash | `server/tests/db/constraints.test.ts` |
| TEST-54 | AC-54 | UI component | `RatingDots` rendered in editable and `readOnly` modes | Count and read the radios, select dot 4, change rating with an arrow key, and attempt pointer and keyboard input in `readOnly` | Five labelled radios, editable changes report the expected number, and `readOnly` calls no handler and retains its rating | `client/tests/RatingDots.test.tsx` |

## 11. Completion evidence

- [ ] Contract commit and C3 review recorded on Issue #5.
- [ ] Failing test commit and output in `evidence/SR-01-red.txt`.
- [ ] Passing output in `evidence/SR-01-green.txt` with the tested commit, commands, and pass/fail/skip counts.
- [ ] Server and client builds, health through the Vite proxy, and shell checks at 375 px and 1280 px.
- [ ] Teammate-reviewed PR into `sprint-1-staging` with a clean-setup check.

## 12. Version history

| Version | Date | Author | Change and reason |
|---|---|---|---|
| v1.0 | 2026-11-06 | book6349 | Initial contract and test design for I-05, before tests and implementation. |
| v1.1 | 2026-11-06 | book6349 | Applied Issue #5 C3. Specify fixture identity and password assertions in TEST-53, the test and password helper interfaces, and the test environment example so I-06 and I-07 can rely on repeatable fixtures. Keep the demo survey in the development seed only. |
