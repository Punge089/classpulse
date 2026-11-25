# Lab 7 / F-03: controlled reopening and lifecycle audit

Issue #87. Version 1.0, 25 November 2026. Author/driver: Bannasorn Thongkorn (Punge089, A), assisted by Codex GPT-6. Reviewer: Papangkorn Jitvoottikrai (book6349, B), review and agreement PENDING. Branch `feature/87-lab7-survey-reopening`. Contract only: no new tests, schema or application implementation yet.

## 1. Change request and requirements

Old implemented BR-03: only `DRAFT -> PUBLISHED` through publish and `PUBLISHED -> CLOSED` through close. CLOSED is terminal. F-03 v1.2, `surveyLifecycle.ts`, owner routes and detail UI implement this correctly. This proposal is not a UAT bugfix and does not claim an actual stakeholder incident.

Proposed need: after an interrupted class or outage, the owner can reopen the same survey for remaining eligible students without cloning questions or losing previous answers/summary. New FR-19 extends F-03 with explicit owner-only reopening and readable lifecycle history. Revised BR-03 adds `CLOSED -> PUBLISHED` **through reopen only**; `/publish` on CLOSED remains invalid. New BR-15 requires a reason, current lifecycle version, and atomic durable event for every new lifecycle transition. No reopening into DRAFT or editing historical questions/answers.

Linked preserved requirements: FR-02..09, BR-01/02/04..10, NFR-01..05/09; UX NFR-07. F-06/F-07/F-08/F-10 remain separate features. No anonymous mode or new account/role. Team selection and B C3 are pending. A's supplied newer announcement removes individual instructor/TA approval; [source record in coordination commit](https://github.com/Punge089/classpulse/blob/1354a2a/docs/labs/lab-07/assignment-changes.md). Original announcement publisher/time is unverified; do not invent approval.

## 2. Baseline and sequence

| Reference | State |
|---|---|
| Original submitted Sprint 1 | `v1.0.0-sprint1`, `d4bad74211729032697164f378638efb834a67b6`, immutable |
| Lab 6 CP-V01 source | `1fe3e3b82dfb0537be30223c9b598b3479b4affe`, attributed historical mapping; not freshly checked here |
| Lab 6 final accepted version | PENDING; current final acceptance must come from Lab 6 evidence, not this contract |
| Contract branch base | `c99748c`, latest staging at branch creation; contains Lab 5/6 infrastructure/docs/provisioner work |
| Actual RED implementation base / test commit | PENDING; pin full SHA and confirm still-old lifecycle before tests |
| GREEN, review, staging/main/CI/deployment | PENDING |

Contract commit/C2 -> actual B C3 -> test-only RED commit/output -> implementation/same tests GREEN -> B exact-head PR review/current CI -> merge commit into staging -> coordinated reviewed main release -> actual changed/preserved post-deployment checks. Spec and test changes precede code. If later staging changes the pre-change behavior, inspect and revise this record before RED. Preparation can proceed while Lab 6 completes; final accepted-baseline trace cannot be fabricated.

## 3. State and transaction behavior

| Current status | publish | close | reopen |
|---|---|---|---|
| DRAFT | PUBLISHED | 409 INVALID_TRANSITION | 409 INVALID_TRANSITION |
| PUBLISHED | 409 INVALID_TRANSITION | CLOSED | 409 INVALID_TRANSITION |
| CLOSED | 409 INVALID_TRANSITION | 409 INVALID_TRANSITION | PUBLISHED, valid reason + current version required |

All three transitions run in one database transaction. Read the caller-owned row, validate the action, then conditional-update by id/owner/status/**statusVersion**. Increment statusVersion by exactly one. Insert exactly one event with the resulting version and fetch the response DTO within that transaction. Zero changed rows gives 409 `STALE_SURVEY`; audit insert failure rolls back the update. No automatic retries that could turn a stale user intent into a later action. Concurrent reopen calls on the same version yield one 200 and one 409; there is one corresponding event.

For existing publish/close requests, keep the bodyless request contract. The version read inside their transaction guards the update; callers do not have to send a version. Existing invalid action/status combinations retain `INVALID_TRANSITION`. For reopen, compare the explicit expectedVersion before status validation: stale version yields `STALE_SURVEY`; a matching version with wrong status yields `INVALID_TRANSITION`.

Reopen preserves the first `publishedAt`, sets current `closedAt` to null, and preserves the preceding close timestamp in the reopen event's `previousClosedAt`. A later close sets a new `closedAt`. No rows are cloned/deleted; original survey, question, option, response and answer IDs/values remain. Repeated close/reopen cycles append events; nothing overwrites prior events. Existing CLOSED rows with a null closedAt are allowed (historical null retained), with no invented closure timestamp. Reopening requires a non-null original publishedAt; inconsistent legacy CLOSED rows without it fail 409 `INVALID_TRANSITION`, with no automatic data repair.

F-04 still accepts a response only when open and eligible; one response per respondent/survey remains enforced by the existing unique constraint. Previously answered students cannot answer again after reopening. Students who had not answered may submit on the reopened survey. Closed surveys remain rejected and absent from the open list. Summaries/history remain unchanged by reopening alone.

## 4. Permissions and error order

| Operation | Unauthenticated | RESPONDENT | OWNER |
|---|---|---|---|
| POST reopen | 401 UNAUTHENTICATED | 403 FORBIDDEN | own survey only; missing/foreign/malformed id 404 NOT_FOUND |
| GET lifecycle history | 401 UNAUTHENTICATED | 403 FORBIDDEN | own survey only; missing/foreign/malformed id 404 NOT_FOUND |

Existing auth/role middleware executes first. After ownership, validate request body/query (400), then reopen version (409), then status/legacy invariant (409), then conditional transaction (409 on race). Invalid body/query on someone else's valid survey ID must still produce 404. Do not return another owner's survey, reasons, lifecycle version or event count. Invalid JSON is rejected by the existing global JSON parser before route-specific checks; do not change that global behavior in this issue. Unexpected storage failures use the existing sanitized 500 error path, with no stack/connection/secret in the response.

## 5. UI behavior

The existing owner detail page shows Reopen only for CLOSED. Reveal a labeled reason textarea, validation message and explicit Confirm reopen/Cancel controls. Explain that previous answers remain and students cannot submit twice. Use trimmed length 10-300 UTF-16 code units (same JavaScript length semantics on client and server); show a count/limit. Send the latest loaded statusVersion. Disable mutation controls while pending; preserve entered reason on network/validation failure. On successful response update status and version, clear the form and refresh lifecycle history.

On `STALE_SURVEY`, keep the reason, explain that the survey changed and require reload/explicit retry using new details; never retry automatically. CLOSED-to-publish remains unavailable. The page shows loading/empty/error/history states, reason as escaped text, action/from/to/time/version, and Load older for pagination. Historic rows with no recorded events display "No lifecycle events recorded for this version"; do not imply they were never published/closed. Event history and form must be keyboard accessible. Existing identified notice, summary link and question display remain.

## 6. API contract

All errors retain `{ "error": { "code", "message", "details"? } }`.

`POST /api/owner/surveys/:id/reopen`

- Body exactly `{ "reason": string, "expectedVersion": integer }`; reject arrays/null/unknown keys, absent/non-string reason, absent/non-integer/negative version, booleans/numeric strings and unsafe/out-of-range integers. expectedVersion range is 0..2147483646; overflow transition at stored max is rejected 409 `STALE_SURVEY`, without writes.
- Trim reason; length 10 and 300 accepted, 0/9/301 rejected; whitespace-only rejected. Do not treat a client supplied actorId/time/status as trusted input.
- 200 `{ "survey": <existing owner detail plus statusVersion> }`, status PUBLISHED, unchanged first publishedAt, closedAt null, version +1. New property `statusVersion: number` is included in create/detail/publish/close/reopen owner survey DTOs; existing callers tolerate the additive field.
- 400 `VALIDATION_ERROR`, details fields `reason`/`expectedVersion`/`body`; 401/403/404 as above; 409 `STALE_SURVEY` or `INVALID_TRANSITION` as specified.

`GET /api/owner/surveys/:id/lifecycle?limit=20&before=<eventId>`

- Query limit optional decimal integer 1..100, default 20; before optional positive decimal integer <=2147483647. Reject arrays, repeated values, unknown keys and malformed bounds with 400 `VALIDATION_ERROR` after ownership. No external cursor can widen survey scope.
- 200 `{ "events": [{ "id", "version", "action", "fromStatus", "toStatus", "reason", "occurredAt", "previousClosedAt" }], "nextCursor": number|null }`. Events newest first by id; query id < before, fixed surveyId; fetch limit+1 to determine nextCursor. No actor email/password/session/respondent or answer data. Return null reason for publish/close. Times are ISO UTC; UI formats local display clearly.
- 401/403/404 as above. Invalid query errors include `limit`/`before`/`query`. Empty history is 200, events [], nextCursor null. Existing survey detail/list access rules are unchanged.

## 7. Data and migration

Add `Survey.statusVersion Int @default(0)` and `SurveyLifecycleEvent` with id PK, surveyId FK, actorId FK to User, action (`PUBLISH`, `CLOSE`, `REOPEN`), fromStatus/toStatus, version Int, occurredAt, reason nullable <=300, previousClosedAt nullable. Unique `(surveyId, version)`; index `(surveyId, id)`; database CHECK version >0 and reason trimmed length bounds for REOPEN / null for other actions. SQL length must match JS UTF-16 semantics or be a safe upper bound: enforce stored reason nonempty and <=300 characters in SQL, with exact 10..300 UTF-16 boundary enforced/tested in API. Do not claim SQL alone enforces identical Unicode semantics.

Additive forward migration `*_survey_lifecycle_audit`: existing surveys get version0, current timestamps/questions/answers unchanged, event table starts empty. No fake historical events/backfill or live seed/reset. Existing data with no audit is marked as pre-audit in report/UI. Foreign keys restrict deleting referenced actors/surveys in normal product use; no event update/delete API. Existing test helper deletes events first only in its already-guarded isolated test DB. Production schema changes are human-executed under the reviewed deployment procedure.

Rollback policy: previous app can read added columns/tables but would not write audit events; therefore an app rollback after new writes is not automatically audit-safe. Freeze lifecycle mutations and assess migration/data effects before reverting a serving revision; use a reviewed forward fix where practical. No down migration drops audit history. Validate the additive migration on a local copy containing existing survey/response data and compare IDs/values before and after.

## 8. Impact and preserved behavior

| Requirement/feature | Contract sections affected | AC / STS | Code/data/callers and regression |
|---|---|---|---|
| BR-03 / FR-19 / F-03 | SRS §§5/6/D-08; F-03 versioned addendum; system SDS lifecycle/UI/API/permissions | AC-100/101; TEST-100/103/104/114 | lifecycle function, owner routes/detail/types; existing TEST-14..17 remain |
| BR-15 / F-03 | system SDS data/migration; contract §§3/6/7 | AC-102/103/104/107/109; TEST-101/105/106/109/111/114 | transaction/version/audit table, fixture cleanup; existing lifecycle invalid actions still protected |
| NFR-02/03/09, BR-08 | role matrix, error order, history privacy | AC-105/106; TEST-107/108 | existing auth, params/error helpers unchanged; new endpoints and foreign records covered |
| BR-04/05/06/07/09/10, F-04/F-05 | preserved input/eligibility/answers/summary/identified rules | AC-108; TEST-110 | existing response/list/summary modules unchanged; full response/summary/DB regression |
| NFR-05, historical data | additive migration and release mapping | AC-109/111; TEST-111/113 | migration + redeployed data readback; no historical event fabrication |
| NFR-07, F-03 UI | closed reason form, conflict, history states | AC-110; TEST-112/113 | owner detail page tests/browser; existing author/create/close flows remain |

No rounding change: summary arithmetic is untouched and old/new response count/bucket/average comparisons protect it. No eligibility/account/password/session changes. No schedule exists at this base: F-08 must explicitly revise this contract before integrating a closing time. Intended integration decision: a reopen cannot silently bypass an expired deadline; F-08 must define explicit renewed future cutoff or explicit removal and test before/at/after cutoff. This issue does not introduce schedule fields early.

F-06 still only edits DRAFT; a reopened PUBLISHED survey never becomes editable. F-07 extended types preserve event/answer IDs, and F-10 membership/rate rules still govern new responses. Shared schema/routes are serialized under #86; implementations do not race on the same files.

## 9. Acceptance criteria

| ID | Observable result |
|---|---|
| AC-100 | Owning owner reopens a valid CLOSED survey with current version and 10..300 trimmed reason: 200 PUBLISHED, version +1, same first publishedAt, closedAt null; one event records previousClosedAt. |
| AC-101 | Full 3x3 state/action matrix is enforced; publish CLOSED still 409; reopening never creates a draft or repairs missing publishedAt. |
| AC-102 | Body/reason/version boundaries produce field errors and zero survey/event/answer changes; Unicode length semantics are consistent. |
| AC-103 | Stale version, including close/reopen/close ABA, yields 409 with no writes; two same-version concurrent reopens produce one success, one conflict and one event. |
| AC-104 | Audit write failure rolls back status/version/timestamps; failed conditional update leaves no orphan event. Existing publish/close also atomically create events. |
| AC-105 | New endpoints deny unauthenticated/wrong-role/foreign/nonexistent/malformed-id access with 401/403/404, including invalid bodies/queries on foreign IDs, and disclose no private data. |
| AC-106 | Own history is ordered/paginated without duplicates or foreign data; boundary/invalid queries are rejected and empty histories are honestly labeled. |
| AC-107 | Repeated close/reopen cycles retain prior event reasons/times/versions; actor/time derive from trusted server context, no client override or update/delete API. |
| AC-108 | Existing response IDs/answers/summary remain identical across reopen alone; original respondent still gets ALREADY_RESPONDED; eligible new respondent can answer; closed/unenrolled/wrong-owner paths remain rejected. |
| AC-109 | Additive migration preserves legacy rows/IDs/values/timestamps and assigns version0 without fake events; nullable historic closedAt remains null in captured event. |
| AC-110 | Owner can explicitly confirm/cancel reopen, sees validation/loading/error/stale states and retained reason, then sees persisted history after reload; respondent never sees controls/history. |
| AC-111 | Relevant existing unit/API-DB/client/E2E suites, exact-head CI/review, reviewed main release, version mapping and deployed changed/preserved smoke/persistence are recorded with all failures/skips. |

## 10. Software Test Specification

These are test designs, not implemented tests. All automated additions wait for B C3.

| Test ID | AC | Level | Preconditions/input and action | Expected result | Planned file |
|---|---|---|---|---|---|
| TEST-100 | 100 | API/DB primary RED | Existing fixtures create CLOSED survey with first publishedAt; POST reopen with 10-char reason and expectedVersion0 | Old code 404 vs asserted 200; after implementation PUBLISHED/version1/first timestamp unchanged | server/tests/api/surveyReopen.test.ts |
| TEST-101 | 100,102 | API/DB | Separate CLOSED fixtures, reasons trimmed lengths 9/10/300/301, blank, multibyte/surrogate pairs; arrays/null/extra keys and invalid version types/ranges | Valid boundaries 200; invalid 400 with expected field; DB snapshots unchanged on rejects | server/tests/api/surveyReopen.test.ts |
| TEST-102 | 102 | unit | Pure reopen validator with body and UTF-16 boundaries from §6 | Complete accepted values/error fields; no coercion | server/tests/unit/surveyReopenValidation.test.ts |
| TEST-103 | 101 | unit | All nine status/action combinations; retain original TEST-15 cases | Three successes, six invalid combinations; old publish/close expectations retained | server/tests/unit/surveyLifecycle.test.ts |
| TEST-104 | 101 | API/DB | Matching-version DRAFT/PUBLISHED and CLOSED missing publishedAt; invoke reopen and original invalid publish/close routes | 409; all rows unchanged; no repair | server/tests/api/surveyReopen.test.ts |
| TEST-105 | 103 | API/DB | Two independently authenticated owner agents send same CLOSED version concurrently; then retry old version after close/reopen/close cycle | Exactly one success/event, other 409; stale ABA rejected | server/tests/api/surveyReopen.test.ts |
| TEST-106 | 104 | API/DB | On isolated DB only, force event insert failure with a temporary failing trigger in try/finally; call reopen/publish/close separately | HTTP sanitized500; complete before/after DB snapshot equal; trigger removed even on assertion failure | server/tests/api/surveyReopen.test.ts |
| TEST-107 | 105 | API/DB | Anonymous, student1, owner2, bad/missing id; both new endpoints; invalid body/query on foreign survey | Correct 401/403/404, no event/reason/private data, no writes | server/tests/api/surveyReopen.test.ts |
| TEST-108 | 106 | API/DB | Own/foreign events; empty and >20 history; limit1/100/0/101, before/unknown/repeated query | DESC id, correct nextCursor, complete traversal without duplicate/foreign events, invalid400 | server/tests/api/surveyReopen.test.ts |
| TEST-109 | 107,104 | API/DB | Publish -> close -> reopen(reason A) -> close -> reopen(reason B) | Five immutable contiguous versions, server actor/time, two reasons retained, timestamps consistent | server/tests/api/surveyReopen.test.ts |
| TEST-110 | 108 | API/DB | Survey with stored student1 response/summary; close/reopen; retrieve unchanged data, student1 repeat, student2 first, student3 unenrolled; close again | Old IDs/answers/summary equal before new response; duplicate409/new201/unenrolled403/closed409; own-only reads preserved | server/tests/api/surveyReopen.test.ts |
| TEST-111 | 109 | migration + API/DB | Seed synthetic old-schema snapshot in isolated instance, apply new migration, compare data; reopen legacy CLOSED with null closedAt | Original rows unchanged, version0/no events before action; previousClosedAt null retained | evidence/lab-07/maintenance/migration-results.txt + server/tests/api/surveyReopen.test.ts |
| TEST-112 | 110 | client | Render owner detail; confirm/cancel; invalid reason; 400/409/network; loaded stale version; history loading/empty/older | Accessible controls, correct request, no auto retry, reason preserved on failure, correct states | client/tests/surveyReopen.test.tsx |
| TEST-113 | 100,108,110,111 | E2E + deployed manual counterpart | Owner publishes/closes/reopens, reloads audit; original student repeat denied, another eligible student answers; wrong owner denied via API | Persisted changed journey and preserved permission/uniqueness; annotate actual SHA/revision/operator | e2e/survey-reopen.spec.ts + evidence/lab-07/maintenance/deployed-checks.md |
| TEST-114 | 101,103,104,111 | existing regression + API/DB | Keep original tests; publish/close concurrent and audit failure; run complete named suites | Original outcomes retained, transactional event count correct; record every pass/fail/skip | server/tests/api/surveyReopen.test.ts + existing server/client/e2e suites |

RED staging strategy: first add executable API assertions TEST-100 and valid upper boundary300 using only existing createApp/login/fixture imports and old schema. Assert HTTP 200 first; only after that assertion inspect additive DTO fields. Do not import future validators/models in the primary RED commit. Old code compiles and returns 404 for the absent route; this is missing approved behavior. Save the tested full commit, command, old-code tree and raw output. Additional planned unit/schema tests follow in test-first increments after the primary RED is retained; never count a missing import/generated client error as RED.

## 11. Completion / DoD

- [ ] B C3 checks new requirement fit, impact, every AC/STS mapping, access/error order, atomicity/migration and scheduled-close handoff; actual comment linked.
- [ ] RED assertion failure on old code saved with test commit before implementation. GREEN reruns the same assertions unchanged; added regression is retained.
- [ ] In isolated verified test environment: `npm --prefix server test`, `npm --prefix client test`, both build scripts, `npx playwright test`; record full commands/configuration, SHA and pass/fail/skip counts. Existing hardcoded ports/DB safety guards must be respected, not bypassed; coordinate isolation before any DB/browser run.
- [ ] Migration data preservation and forced transaction rollback checked locally; no live reset/seed/credentials in artifacts.
- [ ] B checks proposed head, tests and diff, then mandatory CI and merge commit; any head change re-reviewed. A never approves/merges own PR.
- [ ] Reviewed main release + human-run cloud changes; actual serving version mapped and changed/preserved deployed checks retained. Coordinate with Lab 6 first.
- [ ] Both PDFs embed relevant full chain, not links alone; Lab 7 metrics/readiness from #89; D2 retains all other feature obligations.

No runtime checks have run for this contract. All execution/approval/release checkboxes remain open. Contract review does not declare feature completion.

## 12. Version history

| Version | Date | Author | Change and reason |
|---|---|---|---|
| 1.0 | 2026-11-25 | A / Codex GPT-6 | Initial nontrivial maintenance proposal, old/new spec and test design before tests/code; apply supplied no-TA-approval announcement, request B team review. |
