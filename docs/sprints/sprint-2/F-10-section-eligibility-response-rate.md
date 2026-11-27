# F-10 Section eligibility and response rate

Issue #135 · v1.0 proposed for C3 · 27 November 2026. Driver: Bannasorn Thongkorn (A/Punge089). Reviewer: Papangkorn Jitvoottikrai (B/book6349). Contract base: staging `5fe00fd`. Shared implementation follows F-07 and F-08. Test design and implementation results are pending.

## 1. Requirements and scope

FR-14 lets an owner limit a survey to selected sections of its course. FR-15 gives that owner a response rate. BR-05 still requires course enrollment, BR-06 keeps one response per respondent per survey, BR-08 protects owner scope, and BR-09 preserves submitted responses. NFR-02/03/05/07/09 govern authentication, authorization, persistence, UI states and configuration. F-08 controls effective closing time and F-09 keeps the respondent's own saved history. The submission-time section snapshot supports later FR-18/F-13 work. The F-10 summary adds aggregate rate data; section-filter and anonymous presentation remain in their respective feature contracts.

## 2. Workflow and eligibility

An owner creates a survey with the existing flow. From its draft detail, they choose **All sections** or one or more course sections and explicitly save. A course without sections supports **All sections**. Legacy surveys with no selected rows continue to allow all otherwise eligible enrollees, including enrollees whose section is unknown. The choices and current server state are shown after reload. Publish, close and reopen retain the selection. Editing it is confined to DRAFT; the owner begins a different collection with a new survey if the audience must change after publication.

The current eligible population is the active RESPONDENT accounts with an enrollment in the survey's course and, when restricted, membership in a selected section. The list shows only eligible effectively open surveys, and the direct read uses the same predicate. Same-course movement between selected and unselected sections changes availability on the next request. F-09 history and existing confirmation access stay tied to response ownership and remain available after movement or unenrollment.

The response POST reads the current survey under F-08's survey lock and uses a current same-course enrollment. Lock an existing enrollment row for the admission check so a concurrent move is ordered with submission. If the move to an ineligible section commits first, reject. If valid admission precedes the move, retain the saved response and the section captured when it was admitted. F-08's locked time check, answer validation and database uniqueness still apply. A rejected operation writes no response, answer or section snapshot.

## 3. Rate and presentation

Numerator is the number of distinct **currently eligible** respondents who have a saved response to this survey. Denominator is the number of **currently eligible** respondents. Compute both from the same database snapshot so a roster move or submission cannot mix populations. The database response uniqueness rule remains authoritative. Preserve the separately displayed historical `responseCount` and aggregate answers. A response made by someone who later becomes ineligible remains in the historical count and aggregates, and is excluded from the current rate numerator. Becoming eligible again includes their saved response once.

`percent = round(10000 * numerator / denominator) / 100`, with half increments rounded up. A zero denominator returns 0/0 with `percent: null` and the UI says **No eligible respondents**. A zero numerator with positive denominator displays 0%. Status and schedule control further submissions. They do not force the eligible population to zero for a closed or expired survey. Add an owner-visible label **Current roster response rate**, the count pair and an explanation that roster changes can change the rate. Continue to show aggregate results under the current owner access rules. F-11 must recheck aggregate and count visibility when its privacy model is introduced.

## 4. API, roles and error order

| Operation | Contract delta |
|---|---|
| `GET /api/owner/courses` | Add `sections: [{id, code, label}]` to each already-owned course. Sort by code then ID. Use the existing session and owner role guards. |
| Owner survey detail and mutation DTO | Add stable `sectionIds: number[]`, ascending. Empty means all. Keep questions, schedule and lifecycle metadata. The original create request is unchanged. |
| `PUT /api/owner/surveys/:id/sections` | Accept exactly `{expectedUpdatedAt: string, sectionIds: number[]}`. Token must be the exact canonical ISO UTC timestamp. Each section ID is a distinct positive safe integer within database ID range and belongs to this course. Empty clears the restriction. On 200 return the owner detail projection and a strictly newer token. |
| Respondent `GET /api/surveys` and `GET /api/surveys/:id` | Add current eligible section predicate. List omits ineligible surveys; detail returns existing 404 for inaccessible or unavailable survey. Survey/answer payload shape and identified notice stay unchanged. |
| `POST /api/surveys/:id/responses` | Check current course/section eligibility under the existing authenticated respondent admission path. Use 401 unauthenticated, 403 wrong role, 404 missing record, 403 `NOT_ELIGIBLE` for course/section denial, then F-08's 409 `SURVEY_NOT_OPEN` before answer validation and duplicate handling. Existing uniqueness, saved response shape and history remain. |
| Owner `GET /api/owner/surveys/:id/summary` | Add `summary.responseRate: {respondedEligible: number, eligible: number, percent: number | null}` for the owner, with current aggregates and counts preserved. Keep the current owner session and owned-record access across all existing survey statuses. |

Section PUT order for valid JSON: authenticate and check OWNER; validate ID and acquire the owned survey row lock (404 on absent, malformed or foreign ID); validate request body/section IDs and course membership (400 `VALIDATION_ERROR` with field details, no foreign section labels); compare token (409 `STALE_SURVEY`); then require DRAFT (409 `INVALID_TRANSITION`). The transaction replaces the full selection atomically, advances `updatedAt` to at least previous +1 ms and does not increment lifecycle version or add an event. Preserve global JSON parser precedence. Rejected and failed writes leave target rows and timestamps unchanged. No respondent or other owner can see the roster or alter this configuration.

## 5. Data and migration

Add course-owned `CourseSection` with stable ID, per-course unique code and display label. Add optional `Enrollment.sectionId`; keep unique (courseId, userId) and use a composite section/course reference so a row cannot attach to another course's section. Store `SurveySection` targets in a join table keyed by (surveyId, sectionId). Carry courseId in the join and enforce matching section and survey course via composite keys. Empty selection is represented by zero target rows. Add nullable `Response.sectionIdAtSubmission` as a historical reference to a section. Capture the eligible enrollment’s section in the same transaction as the response. Retain historical references when a roster moves. Validate same-course snapshot from the locked admission data; no client-supplied section snapshot.

Migration is additive. Existing enrollments and responses retain null section references and every existing survey retains its cohort behavior with zero target rows. No production reset, seed or rewrite of saved answers. Synthetic fixtures create sections and roster movements in the isolated database only. Roster administration and section deletion are outside F-10. The snapshot is kept internally for downstream approved analysis; legacy/null snapshots must remain visibly unknown in that contract. Capture migration preservation counts, constraints and actual tested source.

## 6. UI states

Owner draft detail shows a labelled mode and course-local section choices, with loading, empty course, pending save, inline field errors and reload guidance for stale tokens. The two modes are distinguished. If the user explicitly chooses selected sections, require at least one choice before sending. A stale, network or validation failure retains local selections without automatically retrying; the owner can reload server state explicitly. Cancel leaves persisted state unchanged. Published/closed detail gives a read-only audience label. The student sees eligible surveys in the existing open list and no foreign section or roster details. The owner summary uses the existing loading/empty/error patterns and shows the correct independent historical count and current roster rate.

## 7. Acceptance criteria

| ID | Observable outcome |
|---|---|
| AC-200 | Owner selects or clears same-course sections on an owned draft; readback survives reload and subsequent lifecycle transitions. |
| AC-201 | Malformed bodies, duplicate/foreign section IDs, bad/stale token, non-draft changes and transaction failure leave the previous selection and timestamps intact. |
| AC-202 | Section configuration and rate enforce authentication, role and owner boundaries with no foreign roster disclosure. |
| AC-203 | List, detail and submission enforce the same section-aware admission and preserve all-course behavior for existing surveys with unsectioned enrollees. |
| AC-204 | Movement, F-08 cutoff and concurrent admission have an observable serial result; denial preserves saved data, history and response uniqueness. |
| AC-205 | Owner rate uses one current eligible population for count pair, handles zero and rounding, and stays between 0 and 100%. Historical count and totals are preserved. |
| AC-206 | Additive migration, guarded constraints and response snapshot preserve original rows and section-at-submission meaning. |
| AC-207 | Owner selection and rate UI have the agreed loading, empty, pending, error and readback states, with named controls. |
| AC-208 | F-06/F-07/F-08, response history, original answer/summary and Lab 7 lifecycle regressions keep their reviewed behavior. |
| AC-209 | Retained RED precedes implementation; required suites and B exact-head review identify the candidate and release evidence accurately. |

## 8. System test specification

These rows are test designs. B C3 is required before adding tests. The exact implementation and test file list will be approved in #135 before editing beyond the contract paths.

| Test | AC | Level | Input / expected result |
|---|---|---|---|
| TEST-200 | AC-200,209 | API/DB primary RED | With existing owner credentials and a draft, read the real update token from the existing Prisma survey row and PUT an empty selection. Assert 200 as the first new behavior expectation; existing route should give 404. Establish setup succeeded without importing future Prisma fields. Rerun this assertion unchanged after implementation. |
| TEST-201 | AC-200,201 | API/DB | Set two same-course sections and reload. Publish/close/reopen keeps the restricted audience, normal metadata and audit. On a separate draft, clear and read back all-course behavior. |
| TEST-202 | AC-201 | API/DB | Duplicate, unknown and foreign-course IDs, noncanonical timestamp, unknown fields, non-draft and stale payload. Assert exact status/order and atomic no-write snapshot, including a controlled insert failure. |
| TEST-203 | AC-201,204 | API/DB concurrency | Two valid same-token targeting writes yield one winner; test publish/targeting in each lock order and inspect committed state. |
| TEST-204 | AC-202 | API/DB | Anonymous, respondent, foreign owner and invalid ID requests to PUT and summary; assert 401/403/404 and no private data, including malformed body on foreign PUT. |
| TEST-205 | AC-203 | API/DB | Selected and unselected section, unsectioned legacy, other course, inactive and wrong-role fixtures; list/read/POST follow the allowed cohort. |
| TEST-206 | AC-204,208 | API/DB | Section move or unenrollment, cutoff t-1/t and duplicate submission. Updated admission follows locked state; existing own history and historical summary remain. |
| TEST-207 | AC-204,206 | API/DB concurrency | Use explicit barriers for a move before and after locked admission; assert no partial data and that admitted snapshot did not change. |
| TEST-208 | AC-205 | API/DB | Roster has 3 eligible with one response: 1/3 and 33.33%; owner sees separate historical count. Change eligible members and verify 0/0 null and 0% cases without changing saved responses. |
| TEST-209 | AC-205 | API/DB | Interleave a roster move and rate read, then verify each response's numerator and denominator describe one consistent snapshot. |
| TEST-210 | AC-206,208 | Migration/DB | Apply additive migration over existing seeded rows, confirm compatibility and cross-course constraint rejection; verify old response snapshots stay null and new ones record admission section. |
| TEST-211 | AC-207 | Client | Draft modes, selected course with no sections, pending/validation/stale/network, cancel/retry and preserved selection. Verify zero/unavailable rate independent of old summary. |
| TEST-212 | AC-200,203,205,207 | E2E | Owner restricts a draft and reloads; publishes; eligible student responds, ineligible student's direct attempt is denied; owner reads both count tracks. |
| TEST-213 | AC-208,209 | Regression | Run server/client/browser suites and builds on exact commit with F-07/F-08 integrated; preserve old successes and record actual passed, failed, skipped, CI, peer review and release. |

## 9. Definition of done and version history

- B C3 on this contract, including the live-roster interpretation of FR-15, lock ordering and snapshot scope. List concrete files before their implementation.
- Executable old behavior RED retained before feature code; unchanged meaningful assertion GREEN, isolated migration and scoped API/UI/E2E verification with actual counts.
- Tested commit and review evidence recorded per AC. Independent B review and required CI on exact head before staging. Reviewed main candidate and human release/submission workflow are separate gates.
- v1.0, 27 November 2026, A/Codex GPT-6. Proposes the section data model, eligibility rule, current-cohort rate and stable AC/TEST IDs. No test or app code added.
