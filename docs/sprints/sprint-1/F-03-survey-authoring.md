# F-03 Survey authoring and lifecycle — engineering contract

**Issue #7 (I-07) · Owner: Punge089 (Student A) · Reviewer: book6349 (Student B) · Sprint 1**
Written and committed **before** any F-03 test or code (see version history).

## 1. Feature and linked requirements

F-03 lets a Survey Owner create a draft survey for a course they own, publish it, close it, and list their
own surveys.
Linked: FR-02, FR-03, FR-04, FR-05, FR-09 · BR-02, BR-03, BR-08 · NFR-02, NFR-03 (owner routes), NFR-07 (new-survey form).
Depends on: F-01 (login, `requireAuth`, `requireRole`) and SR-01 (schema, fixtures, error handling).

## 2. Behaviour and workflow

1. The owner logs in and lands on `/owner`, which lists their own surveys (title, course code, status badge, response count).
2. "New survey" opens `/owner/surveys/new`: pick one of their courses, enter a title, an optional description, and 1–20 questions (rating or single-choice with 2–6 options).
3. Submitting calls `POST /api/owner/surveys`. The server checks that the course is one the owner owns, validates the remaining fields, then creates the survey (status `DRAFT`, mode `IDENTIFIED`), its questions and its options in **one transaction**.
4. `/owner/surveys/:id` shows the survey. A draft shows **Publish**; a published survey shows **Close**; a closed survey shows neither.
5. Publish moves `DRAFT → PUBLISHED` and sets `publishedAt`; Close moves `PUBLISHED → CLOSED` and sets `closedAt`. Students then see (or stop seeing) the survey through F-04.

## 3. Business rules and validation

| Field | Rule (error `field` name in `details`) |
|---|---|
| `courseId` | positive integer (`courseId`); must be a course owned by the caller, otherwise 404 (see order below) |
| `title` | string, trimmed length 1–120 (`title`) |
| `description` | optional string, ≤ 1000 characters (`description`) |
| `questions` | array of 1–20 items (`questions`) |
| `questions[i].prompt` | string, trimmed length 1–300 (`questions[i].prompt`) |
| `questions[i].type` | `RATING` or `SINGLE_CHOICE` (`questions[i].type`) |
| `questions[i].required` | optional boolean, default `true` |
| `questions[i].options` | `RATING`: absent or empty. `SINGLE_CHOICE`: 2–6 strings, each trimmed 1–100 characters, no duplicates after trimming and ignoring case (`questions[i].options`) |

Status changes follow BR-03 only: publish needs `DRAFT`, close needs `PUBLISHED`. `nextStatus(current, action)` is the single place that decides it.

**Check order** for routes with an id in the path: 401 (not logged in) → 403 (wrong role) → 404 (survey missing, non-numeric id, or not owned) → 409 (transition rule). For `POST /api/owner/surveys` the order follows plan §2.5 (changed in v1.1 after C3; v1.0 validated the whole body first): (1) `courseId` must be a positive integer, otherwise 400 `VALIDATION_ERROR` naming `courseId`, because the server cannot look the course up without it; (2) the course must exist and belong to the caller, otherwise 404 `NOT_FOUND`, **even when other fields in the same request are also invalid**; (3) the remaining fields are validated and every bad field is listed in one 400; (4) the survey is created. `validateSurveyInput` checks every field including the shape of `courseId`; the route reads `courseId` and checks ownership before it calls it. Contract decisions (reviewer may challenge): duplicate options compare case-insensitively after trimming; position numbers follow array order starting at 1.

## 4. Permissions

| Operation | Anonymous | Respondent | Owner |
|---|---|---|---|
| list own courses / list own surveys / create / read / publish / close | 401 | 403 | own courses and own surveys only; anything else is 404 |

A hidden frontend button is not authorization; every cell is enforced on the server and tested.

## 5. UI spec

| Screen | Content and behaviour |
|---|---|
| `/owner` | Heading, `PulseLine` divider, "New survey" button, list of own surveys: title, course code, status badge (DRAFT muted outline, PUBLISHED ok fill, CLOSED ink outline), response count. States: loading (animated `PulseLine`), empty ("No surveys yet — create your first one"), error (alert with the server message). |
| `/owner/surveys/new` | Course select (own courses only), title, description, repeatable question block (prompt, type, required checkbox, options list for single-choice with add/remove). Field errors from `details` appear under the matching input. Buttons are disabled while sending. On 201 the page opens the new survey's detail. |
| `/owner/surveys/:id` | Title, course, status badge, question list with options, **Publish** or **Close** by status, link to the summary (F-05) once published. Shows the server error message on a rejected action. |

Theme, tokens and badge styles are those of plan §2.9. Role guards in the client only redirect for convenience.

## 6. API spec

Errors always use `{ "error": { "code", "message", "details"? } }`.

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `GET /api/owner/courses` | — | 200 `{ "courses": [{ "id", "code", "title" }] }` own courses only | 401, 403 |
| `GET /api/owner/surveys` | — | 200 `{ "surveys": [{ "id", "title", "status", "courseCode", "responseCount" }] }` own surveys only | 401, 403 |
| `POST /api/owner/surveys` | `{ "courseId", "title", "description"?, "questions": [{ "prompt", "type", "required"?, "options"?: string[] }] }` | 201 `{ "survey" }`, status `DRAFT` | 400 `VALIDATION_ERROR` (with `details`), 401, 403, 404 `NOT_FOUND` (course not owned) |
| `GET /api/owner/surveys/:id` | — | 200 `{ "survey" }` with questions and options | 401, 403, 404 |
| `POST /api/owner/surveys/:id/publish` | — | 200 `{ "survey" }`, `PUBLISHED`, `publishedAt` set | 401, 403, 404, 409 `INVALID_TRANSITION` |
| `POST /api/owner/surveys/:id/close` | — | 200 `{ "survey" }`, `CLOSED`, `closedAt` set | 401, 403, 404, 409 `INVALID_TRANSITION` |

`survey` object:

```json
{ "id": 1, "courseId": 1, "courseCode": "CPE334", "title": "Lecture feedback W10", "description": null,
  "mode": "IDENTIFIED", "status": "DRAFT", "publishedAt": null, "closedAt": null, "createdAt": "2026-11-07T09:00:00.000Z",
  "questions": [
    { "id": 10, "position": 1, "prompt": "Pace of lectures", "type": "RATING", "required": true, "options": [] },
    { "id": 11, "position": 2, "prompt": "Would you recommend it?", "type": "SINGLE_CHOICE", "required": true,
      "options": [{ "id": 20, "position": 1, "label": "Yes" }, { "id": 21, "position": 2, "label": "No" }] } ] }
```

## 7. Data spec and migration

No schema change. Uses `Survey`, `Question`, `QuestionOption` from SR-01. `ownerId` is the logged-in user; `courseId` must belong to that owner (BR-08), checked in the route. Questions and options are written in one `$transaction`, so a failure leaves no partial survey. No migration.

## 8. Failure and boundary cases

- Title 120 characters is accepted, 121 rejected; 20 questions accepted, 21 rejected; prompt 300 accepted, 301 rejected; options 2 and 6 accepted, 1 and 7 rejected.
- `RATING` with options, unknown `type`, `questions` not an array, empty or duplicate option, non-JSON body: 400, nothing stored.
- Create with a valid foreign `courseId` and an invalid title: 404 (ownership first); with the owner's own course and an invalid title: 400; with `courseId` `"abc"`: 400 naming `courseId`.
- Survey id that is not a positive integer, missing, or owned by another owner: 404 (a 404 does not reveal that the survey exists).
- Publish of a published or closed survey, and close of a draft or closed survey: 409, status unchanged.
- Design note: the status change is written as a conditional update (`where id, ownerId and the expected current status`) so two simultaneous requests cannot both succeed. Sprint 1 does not include a separate concurrency test for this; that is disclosed.

## 9. Acceptance criteria

| ID | Observable outcome |
|---|---|
| AC-10 | owner1 creates a survey for CPE334 with one RATING and one SINGLE_CHOICE question → 201, status `DRAFT`, rows stored with positions 1..n |
| AC-11 | Invalid input → 400 `VALIDATION_ERROR` with one `details` entry per bad field: empty or 121-character title; 0 or 21 questions; prompt empty or 301 characters; SINGLE_CHOICE with 1 option, 7 options, a duplicate or an empty option; RATING with options; unknown `type`; `questions` not an array |
| AC-12 | owner1 creating a survey for CPE231 (owner2's course) → 404 and nothing stored, **even when the title or questions in the same request are also invalid**; a `courseId` that is not a positive integer → 400 naming `courseId` |
| AC-13 | Publishing a `DRAFT` survey → 200, `PUBLISHED`, `publishedAt` set |
| AC-14 | Publishing a `PUBLISHED` or `CLOSED` survey, or closing a `DRAFT` or `CLOSED` survey → 409 `INVALID_TRANSITION`, status unchanged in the database |
| AC-15 | Closing a `PUBLISHED` survey → 200, `CLOSED`, `closedAt` set |
| AC-16 | student1 calling each of the six `/api/owner/*` routes → 403 `FORBIDDEN`, no survey created |
| AC-17 | owner2 reading, publishing or closing owner1's survey → 404, nothing changed |
| AC-18 | `GET /api/owner/surveys` returns only the caller's surveys with the correct `responseCount` |
| AC-19 | UI: the owner creates a two-question survey, sees it as Draft, publishes it and sees the "Published" badge; an empty title shows a message under the title field |

## 10. Software Test Specification

Levels: **unit** = pure function, no DB; **API/DB** = Supertest against the app with the test database; **E2E** = Playwright against the running app. Fixture users and courses are those of plan §2.4.

| Test | AC | Level | Precondition and input | Action | Expected result | Planned file |
|---|---|---|---|---|---|---|
| TEST-10 | AC-10 | API/DB | owner1 logged in; valid body (CPE334, 1 RATING, 1 SINGLE_CHOICE `["Yes","No"]`) | POST create | 201; `status` DRAFT; DB has 1 survey, 2 questions (positions 1, 2), 2 options (positions 1, 2) | `server/tests/api/ownerSurveys.test.ts` |
| TEST-11 | AC-11 | unit | each of the 18 cases listed under "TEST-11 cases" below, placed in an otherwise valid body | call `validateSurveyInput` | every invalid case returns `ok: false` with a `details` entry whose `field` is the one named in the list; every boundary case returns `ok: true` | `server/tests/unit/surveyValidation.test.ts` |
| TEST-12 | AC-11 | API/DB | owner1 logged in; invalid bodies incl. `questions: "x"` and a raw non-JSON body | POST create | 400 `VALIDATION_ERROR`, body has `error.details` (JSON-shape cases) and no `stack`; `survey` count unchanged | `server/tests/api/ownerSurveys.test.ts` |
| TEST-13 | AC-12, AC-11 | API/DB | owner1 logged in; five requests: (a) valid body, `courseId` of CPE231; (b) `courseId` of CPE231 **and** an empty `title`; (c) `courseId` of CPE334 and an empty `title`; (d) `courseId` `"abc"` and an empty `title`; (e) valid body, `courseId` 9999 (no such course) | POST create for each | (a) 404 `NOT_FOUND`; (b) 404 `NOT_FOUND` (ownership is checked before field validation); (c) 400 with `title` in `details`; (d) 400 with `courseId` in `details`; (e) 404 `NOT_FOUND`; survey count unchanged after all five | `server/tests/api/ownerSurveys.test.ts` |
| TEST-14 | AC-13 | API/DB | owner1's DRAFT survey | POST publish | 200; `PUBLISHED`; `publishedAt` not null; DB row matches | `server/tests/api/ownerSurveys.test.ts` |
| TEST-15 | AC-14 | unit | `nextStatus` with (DRAFT, publish), (PUBLISHED, close) and the four invalid pairs | call | the two valid pairs return `PUBLISHED` and `CLOSED`; the four invalid pairs throw `ApiError` status 409 `INVALID_TRANSITION` | `server/tests/unit/surveyLifecycle.test.ts` |
| TEST-16 | AC-14 | API/DB | owner1's surveys in PUBLISHED and CLOSED and DRAFT status | POST publish on PUBLISHED and CLOSED; POST close on DRAFT and CLOSED | each 409 `INVALID_TRANSITION`; DB status unchanged | `server/tests/api/ownerSurveys.test.ts` |
| TEST-17 | AC-15 | API/DB | owner1's PUBLISHED survey | POST close | 200; `CLOSED`; `closedAt` not null | `server/tests/api/ownerSurveys.test.ts` |
| TEST-18 | AC-16 | API/DB | student1 logged in | each of the six `/api/owner/*` routes | every response 403 `FORBIDDEN`; survey count unchanged | `server/tests/api/ownerSurveys.test.ts` |
| TEST-19 | AC-17 | API/DB | owner1's DRAFT survey; owner2 logged in | GET, publish and close that survey | each 404; DB status still `DRAFT` | `server/tests/api/ownerSurveys.test.ts` |
| TEST-20 | AC-18 | API/DB | owner1 has 2 surveys (one with 1 response), owner2 has 1 | GET list as owner1 | exactly owner1's 2 surveys, `responseCount` 1 and 0 | `server/tests/api/ownerSurveys.test.ts` |
| TEST-21 | AC-19 | E2E | seeded owner1 | log in, create a 2-question survey, publish; separately submit an empty title | list shows the survey as Draft, then the detail shows "Published"; the empty title shows a message under the title field | `e2e/owner-survey.spec.ts` |

**TEST-11 cases** (`field` is what `details` must name; each case changes one thing in an otherwise valid body):

| # | Input | Expected |
|---|---|---|
| 1 | `title` `""` | invalid, `title` |
| 2 | `title` `"   "` (spaces only) | invalid, `title` |
| 3 | `title` of 121 characters | invalid, `title` |
| 4 | `description` of 1001 characters | invalid, `description` |
| 5 | `questions` `[]` | invalid, `questions` |
| 6 | 21 questions | invalid, `questions` |
| 7 | `questions` `"x"` (not an array) | invalid, `questions` |
| 8 | prompt `""` | invalid, `questions[0].prompt` |
| 9 | prompt of 301 characters | invalid, `questions[0].prompt` |
| 10 | `type` `"TEXT"` (unknown) | invalid, `questions[0].type` |
| 11 | `RATING` with `options` `["a","b"]` | invalid, `questions[0].options` |
| 12 | `SINGLE_CHOICE` with 1 option | invalid, `questions[0].options` |
| 13 | `SINGLE_CHOICE` with 7 options | invalid, `questions[0].options` |
| 14 | `SINGLE_CHOICE` with an empty option `["Yes",""]` | invalid, `questions[0].options` |
| 15 | `SINGLE_CHOICE` with duplicates `["Yes"," yes "]` (same after trimming, ignoring case) | invalid, `questions[0].options` |
| 16 | `SINGLE_CHOICE` with an option of 101 characters | invalid, `questions[0].options` |
| 17 | `required` `"yes"` (not a boolean) | invalid, `questions[0].required` |
| 18 | `courseId` `"abc"`, `0`, `-1` and `1.5` (four sub-cases) | invalid, `courseId` |
| B | boundaries: `title` of 120, `description` of 1000, 20 questions, prompt of 300, 2 options and 6 options, an option of 100 characters, `required` omitted, `RATING` with `options: []` | valid (`ok: true`) |

All six owner routes are also appended to `PROTECTED_ROUTES` in `server/tests/api/unauthenticated.test.ts`, so the shared TEST-07 (F-01) proves each returns 401 without login.

## 11. Completion evidence (filled as the work happens)

- [ ] Contract commit (this file, v1.0; v1.1 after C3): `<sha>`
- [ ] Red output `docs/sprints/sprint-1/evidence/F-03-red.txt` and commit `<sha>`
- [ ] Green output `docs/sprints/sprint-1/evidence/F-03-green.txt` and commit `<sha>`
- [ ] Test counts (passed / failed / skipped): —
- [ ] PR `#<n>`, reviewer comment, merge commit on `sprint-1-staging`: —
- [ ] Traceability rows FR-02…05, FR-09, BR-02, BR-03, BR-08 updated with real test names

## 12. Version history

| Version | Date | Author | Change and reason |
|---|---|---|---|
| v1.0 | 2026-11-06 | Punge089 | Initial contract, written before tests and code. |
| v1.1 | 2026-11-06 | Punge089 | After C3 review by book6349: (1) the check order for create now follows plan §2.5 (course ownership 404 before field validation 400; a malformed `courseId` is 400), with a test case for a foreign course plus an invalid title; (2) TEST-11 lists its 18 cases explicitly, including the duplicate pair `"Yes"` and `" yes "`. |
