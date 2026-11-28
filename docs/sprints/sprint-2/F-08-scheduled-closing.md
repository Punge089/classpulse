# F-08 Scheduled closing - engineering contract

Issue #96, version 1.1 execution inventory, 25 November 2026. Owner/driver: Bannasorn Thongkorn (Punge089, A), assisted by Codex GPT-6.1 Sol. Reviewer: Papangkorn Jitvoottikrai (book6349, B). Actual initial-contract C3: [7159683176](https://github.com/Punge089/classpulse/issues/96#issuecomment-7159683176), 25 November 2026 10:25:48 UTC. Branch `feature/96-scheduled-closing`, initial base `c99748c`. Design only; no F-08 feature tests/schema/code yet. The separately reviewed Lab7 integration addendum remains pending.

## 1. Feature and requirements

FR-12: owner sets an optional closing time and responses stop after it. BR-11: closing time, when set, must be future at publishing; reject responses after it. Exact boundary here is **at or after** closing time. Preserve BR-03 manual lifecycle, BR-04 open-only, BR-05 eligibility, BR-06 uniqueness, BR-07 validation, BR-08 ownership, BR-09 immutable responses and BR-10 identified labeling. NFR-02/03 access, NFR-05 persistence, NFR-07 UX and NFR-09 safe configuration apply. D2/Sprint2 feature, separate from Lab7 maintenance assessment.

B accepted this design in the C3 linked above: a stored optional deadline controls availability without a background job. Keep `status` as the manually controlled lifecycle and expose `acceptingResponses` and `closureReason` separately. At deadline a PUBLISHED survey is effectively closed to responses even if stored status remains PUBLISHED; label it "Closed - deadline reached" in UI. Do not claim an automatic persisted CLOSED transition or a scheduled cloud job. If a persisted automatic transition is later required, version/review the design instead of silently changing behavior.

## 2. Workflow

Owner creates survey as before, opens detail and optionally sets a deadline using local datetime input with visible timezone. Save converts to a canonical UTC timestamp. Draft can store a past deadline for later editing, but cannot publish until it is cleared or made strictly future. No changes to the original create payload or question editor. Owner may change/remove the deadline of DRAFT or manually CLOSED surveys. While PUBLISHED, deadline changes are forbidden: close first, adjust and explicitly reopen to avoid silently extending collection.

Publishing/reopening with null deadline accepts indefinitely until manual close. Publishing/reopening with deadline requires `deadline > serverNow` after acquiring the write lock. Existing past-deadline PUBLISHED surveys remain unavailable until explicit manual close -> reschedule/clear -> reopen; clearing/editing alone never changes manual CLOSED status. Previous answers and summaries remain readable.

## 3. Business rules, clock and transaction consistency

`closesAt` null means no schedule. Availability is `status === PUBLISHED && (closesAt === null || now < closesAt)`. Equality is closed. Server controls now; body parameters cannot override clock. Store timestamptz-compatible Prisma DateTime in UTC with millisecond precision; accept years 2000..9999. UI is advisory; server is authoritative.

Owner schedule PUT, publish/close/reopen and response POST serialize on the same Survey row using a transaction and row-level write lock. Read status/deadline/version and take the server time **after** acquiring that lock. Use the post-lock transaction check as the response admission linearization point; if it is before the deadline, response may commit just after it. If lock wait crosses the deadline, reject. Do not promise a commit-time cutoff. Every later response rechecks from current locked state. Never validate only before the transaction. Eligibility, answer validation and nested response creation also occur under this consistent survey view; preserve error order. No automatic retry of failed user mutations.

No need to increment lifecycle statusVersion for schedule edits, because status is unchanged; set a strictly newer updatedAt timestamp for successful schedule edits. Same `expectedUpdatedAt` token convention as F-06, exact canonical ISO string and `max(serverNow, old+1ms)` update. Conditional update and lock make two same-token edits one winner and one409. Lifecycle operations must update updatedAt too; a schedule form loaded before publish/close becomes stale. No fake lifecycle event for a schedule edit. Once a survey is published, its schedule is frozen until manual close; removing a schedule does not itself reopen.

## 4. Permissions and errors

Owner-only schedule endpoint:401 without auth,403 wrong role,404 missing/foreign/malformed id, then400 invalid body,409 stale token,409 `INVALID_TRANSITION` for PUBLISHED, then persistence. Foreign IDs return404 even with invalid schedule body; global JSON-parser precedence remains unchanged. Publish/reopen retain their own auth/ownership/body/version/status precedence, then add409 `CLOSING_TIME_PASSED` for `closesAt <= now` before writes. Close still works for stored PUBLISHED after effective deadline and records normal manual close/audit.

Response POST preserves401/403 role ->404 missing survey ->403 NOT_ELIGIBLE ->409 SURVEY_NOT_OPEN ->400 answer validation -> persistence. Deadline reached uses existing409 SURVEY_NOT_OPEN, never stores partial answers or exposes survey content to an ineligible user. Duplicate handling remains409 ALREADY_RESPONDED after availability/validation, so an existing response on an expired survey still gets SURVEY_NOT_OPEN according to that preserved precedence.

## 5. UI specification

Owner detail gains a labeled optional closing-time input, timezone explanation, clear deadline control, read-only formatted stored value, Save/Cancel, inline errors and pending disable. Scheduling form uses updatedAt; stale409 preserves input and requests reload, no silent retry. PUBLISHED form explains "Close this survey before changing its deadline"; original Close stays available. Past draft deadline blocks publishing via server error; show recovery guidance. CLOSED with past deadline blocks reopen and asks owner to reschedule/clear first.

Owner detail and respondent list/answer screen show formatted deadline with timezone. Respondent open list omits unavailable surveys; an already-open answer page can submit only if server still permits it. On deadline rejection show the established closed message and preserve typed input without repeated submission. Existing identified notice is retained. Existing response confirmation/history remains visible after expiry; schedule must not hide saved responses. Browser clock may update labels but cannot authorize a POST. Accessibility/keyboard/loading/empty/network states follow existing theme/components.

## 6. API specification

`PUT /api/owner/surveys/:id/schedule` body exactly `{ "closesAt": null | "2026-11-28T12:00:00.000Z", "expectedUpdatedAt": "...canonical UTC ISO..." }`. Both keys required; reject unknown keys/array/null body, numeric/date strings without canonical UTC Z or millisecond component, timezone-offset variants, invalid rollover dates, missing timezone, booleans and invalid year/range. Null clears. In DRAFT/CLOSED past/present/future values are accepted as configuration; only publish/reopen must be future. Token must round-trip through Date.toISOString exactly. 200 `{survey}` existing owner detail plus `closesAt`, `acceptingResponses`, `closureReason`, and updatedAt. No create-payload change. Standard400 details use `closesAt`, `expectedUpdatedAt` or `body`;401/403/404;409 STALE_SURVEY/INVALID_TRANSITION.

Owner detail/create/lifecycle DTOs and owner list add `closesAt: string|null`, `acceptingResponses: boolean`, `closureReason: "NOT_PUBLISHED"|"MANUAL"|"DEADLINE"|null`. DRAFT -> NOT_PUBLISHED; CLOSED -> MANUAL (includes legacy closes); PUBLISHED past/equal deadline -> DEADLINE; PUBLISHED open -> null. Timestamp sampling is per request from server. Owner list `status` still identifies stored lifecycle; UI uses derived fields for availability.

Respondent GET `/api/surveys` filters stored PUBLISHED with deadline null or > requestNow and preserves enrollment/hasResponded behavior. Its DTO adds closesAt. GET `/api/surveys/:id` returns404 for unavailable/foreign cases just as currently closed/missing records; valid detail includes closesAt. POST responses uses locked current availability and retains existing response shape/error code. GET existing responses and summary are unchanged: past answers/aggregates are not filtered by current deadline. No new background endpoint or public timing metadata.

## 7. Data and migration

Add Survey.closesAt nullable DateTime with default null in additive `*_scheduled_closing` migration. All old rows retain IDs, timestamps/status/questions/answers and have null deadline; original behavior persists. No seed/backfill/deletion or live reset. No changed uniqueness constraints or audit model. No schedule-event table: audit of lifecycle remains as Lab7 defines; schedule change history is outside this feature's current scope and disclosed. Migration dry run compares existing synthetic data before/after in isolated test instance. Production migration steps remain human-run after reviewed release scope exists.

## 8. Failure/boundary and dependency impact

Test one millisecond before/exactly at/one millisecond after deadline, null deadline, timezone conversion across Bangkok/UTC day boundary, malformed/rollover date, min/max supported year and stale token. Validate race outcomes by actual row lock barriers rather than only concurrent Promise launch. Server errors return sanitized500 and transaction rollback preserves schedule/status/answers. When expired schedule blocks publish/reopen, status/version/audit must stay unchanged.

Dependencies: Lab7 #87 owns lifecycle/reopen/audit and F-06 #90 owns draft edits; B F-07 extends question/response types and B F-09 #88 adds history in responses.ts. Implementation slot follows agreed integrations. Response-route edits are restricted to submit section; preserve B history. Before tests/code that interact with Lab7, a separately scoped contract revision must add CLOSING_TIME_PASSED semantics and shared row-lock protocol to #87 and obtain B review. This draft does not unilaterally alter #87. F-10 must preserve deadline check while adding eligibility. Global SRS/SDS/traceability updates occur through their own scoped integration Issue. If the actual integrated implementation differs from these assumptions, revise this contract and request new C3.

Preserved regressions: original publish/close matrix, auth/session, role/ownership, course eligibility, question validation, duplicate response, own-only retrieval, aggregates/rounding, Lab7 reopening audit and F-06 draft locks. No password, anonymity, rate denominator or summary arithmetic changes. No automatic expiry event or artificial closing timestamp is invented.

## 9. Acceptance criteria

| ID | Observable outcome |
|---|---|
| AC-180 | Owning owner sets/changes/clears UTC deadline on DRAFT/CLOSED with current token; persisted readback and derived fields agree; status/questions/answers unchanged. |
| AC-181 | Strict body/date/token boundaries reject400 with relevant details and zero writes; same-token edits yield one success/one stale409. |
| AC-182 | Schedule mutation enforces401/403/404 and foreign invalid-body404; PUBLISHED mutation409; no private record/secret leaks. |
| AC-183 | Publish/reopen requires null or strictly future deadline; exact/past cutoff409 CLOSING_TIME_PASSED with no status/version/event write. |
| AC-184 | At t-1ms eligible response201, at t and t+1ms409 SURVEY_NOT_OPEN with no partial response/answer rows; null deadline preserves old behavior. |
| AC-185 | Deadline reached removes survey from respondent list; detail404, stale form submission409; own saved response/history and summary remain available/unchanged. |
| AC-186 | Lock wait crossing deadline rejects at post-lock time; close/schedule/submission races produce only the defined serialized outcomes and preserve uniqueness. |
| AC-187 | Expired stored PUBLISHED can be manually closed; owner explicitly reschedules/clears while CLOSED, then reopens through Lab7; old respondents cannot submit twice. |
| AC-188 | UI round-trips local input to UTC, displays timezone/deadline, handles pending/error/stale/closed recovery and persists after reload; migration preserves old rows with null deadline. |
| AC-189 | Integrated regressions/build/CI/peer review and later main/deployed deadline/preserved checks are recorded on exact tested versions with all failures/skips and D2 traceability. |

## 10. Software Test Specification

The original designs below received B C3 at the linked comment. That review permits independent scoped test work; it does not waive serialized implementation, verified runtime or the separately scoped/reviewed Lab7 integration revision. No F-08 test source has been written at this checkpoint.

| Test | AC | Level | Preconditions/input and action | Expected result | Planned file |
|---|---|---|---|---|---|
| TEST-180 | 180 | API/DB primary RED | Existing own DRAFT fixture; read updatedAt directly through existing Prisma, PUT canonical deadline+token to absent endpoint | Old implementation404 against asserted200; after change persisted UTC deadline | server/tests/api/scheduledClosing.test.ts |
| TEST-181 | 180,181 | API/DB | DRAFT/CLOSED set/change/null; two same-token updates; snapshot original fields | Correct200/persistence, one concurrent409; all unrelated rows retained | server/tests/api/scheduledClosing.test.ts |
| TEST-182 | 181 | unit | Null/canonical dates, offset/no-zone/rollover/bad years, wrong body/token/unknown keys | Exact accepted values or named field errors, no implicit date rollover/coercion | server/tests/unit/surveySchedule.test.ts |
| TEST-183 | 182 | API/DB | Anonymous/student/other-owner/missing/bad id; invalid foreign body; PUBLISHED schedule change |401/403/404/409 in stated order, no changes | server/tests/api/scheduledClosing.test.ts |
| TEST-184 | 183 | API/DB | Deadline t; publish/reopen at t-1,t,t+1 and null; original matrix invalid pairs | Only null/future permitted; rejects leave statusVersion/audit/rows identical | server/tests/api/scheduledClosing.test.ts |
| TEST-185 | 184 | unit | Pure availability function at exact millisecond boundaries for all states and null | Only PUBLISHED and null/future accepting; deterministic reason | server/tests/unit/surveySchedule.test.ts |
| TEST-186 | 184,186 | API/DB | Eligible independent fixtures; controlled server Date at t-1/t/t+1 while retaining real DB timers | Before201/at-after409; no response/answer partial rows; actual post-lock time respected | server/tests/api/scheduledClosing.test.ts |
| TEST-187 | 185 | API/DB | Own enrolled and foreign/unpublished surveys around deadline; stored response/summary | Open list/detail exclude expired; own saved response and aggregates unchanged | server/tests/api/scheduledClosing.test.ts |
| TEST-188 | 186 | API/DB | Hold Survey lock in separate transaction, launch submit before t, advance clock to t, release lock |409 after wait; no stored response; demonstrates recheck after lock | server/tests/api/scheduledClosing.test.ts |
| TEST-189 | 186,187 | API/DB | Synchronize close vs submit and CLOSED schedule change vs reopen through lock barriers; simultaneous duplicate submits | Defined serial outcomes, no acceptance of unavailable state or duplicate answers | server/tests/api/scheduledClosing.test.ts |
| TEST-190 | 187 | API/DB | Expired PUBLISHED -> close -> reschedule/clear -> reopen; original answered respondent and new eligible respondent | Original answer retained/duplicate409; new201; past deadline reopen409; history events preserved | server/tests/api/scheduledClosing.test.ts |
| TEST-191 | 188 | migration manual | Apply additive migration over isolated old-schema synthetic rows; compare selected complete records | Null deadline on old rows, existing IDs/status/answers unchanged; raw commands/results retained | evidence/sprint-2/F-08/migration.txt |
| TEST-192 | 188 | client | UTC/Bangkok day-boundary input, clear/save/cancel,400/409/network/pending; expired/stale answer UI | Correct timestamp/display, errors and retained input, no auto resubmit | client/tests/scheduledClosing.test.tsx |
| TEST-193 | 184,185,187,188 | E2E/deployed manual | Owner schedules/publishes, student form before deadline, wait/reject/reload, owner closes/reschedules/reopens, saved-data readback | Visible changed journey plus actual persisted/forbidden API checks on recorded SHA/revision | e2e/scheduled-closing.spec.ts; evidence/sprint-2/F-08/deployed-checks.md |
| TEST-194 | 189 | regression/build | Actual integrated head includes Lab7/F-06/F-07/F-09; full named server/client/E2E and builds | Existing assertions preserved, counts/pass-fail-skip/CI/run/version retained | evidence/sprint-2/F-08/regression.txt |

Primary RED uses only existing app/fixtures and existing Survey.updatedAt: do not import nonexistent schedule function/column/types before first failure. Assert PUT200 first so old404 is the failure, with setup/compilation healthy. Commit tests/raw RED before implementation; same assertion and data later GREEN. Additional cutoff/schema tests follow in test-first increments with their actual red/green evidence, never label missing generated models/import errors as RED.

## 11. Definition of Done and evidence

- [x] B reviewed the original contract AC-180..189/TEST-180..194 and accepted derived availability, clock/lock and preservation semantics in C3 7159683176. This is contract approval, not tested implementation or Lab7 integration approval.
- [ ] Any required Lab7 integration addendum is separately versioned/reviewed before interacting tests/code; actual old-code SHA pinned.
- [ ] Meaningful RED committed before implementation; same test GREEN; all AC have actual linked test/manual results and accepted version. No disabled/focused/weakened tests.
- [ ] Verified separate local instance with database name classpulse_test, existing safety guard; distinct/serialized ports. No credential/log copying or reset of Lab6 data.
- [ ] Run `npm --prefix server test`, `npm --prefix client test`, both build scripts and `npx playwright test` at exact integrated head/config; record commands/pass-fail-skip and every failure. Manual migration/deployed checks labeled manual.
- [ ] B substantive review of current proposed commit and passing mandatory CI; merge commit to staging, reviewed main release and actual deployed cutoff/preserved checks. Human runs cloud/migration commands and submits separate D2 PDF.

No F-08 application tests have run for this contract. Code, tests, integration-contract review, implementation PR review, release and feature results remain PENDING. Local document checks and baseline documentation-branch CI are not F-08 application verification.

### Execution impact checkpoint - 25 November 2026

Read-only source reference: Lab7 PR92 head `d1b41c3d4fc86361110d5f65357cdef1d89f8aeb`, still awaiting B implementation review. This is an observed proposed implementation, not an accepted Lab6 baseline or permission to implement F-08 out of order. The following source inventory narrows the already-contracted design; it does not revise #87's contract or write its code.

| Existing source observation | Required F-08 integration and retained oracle |
|---|---|
| `ownerSurveys.ts` locks the owned `Survey` row with `FOR UPDATE`, checks reopen body/version and lifecycle validity, samples server time, then atomically writes state/version/event. | Preserve that ownership/error order and one transaction. For publish/reopen only, insert the already-contracted deadline check after the existing transition/integrity/version checks and before any update/event. A rejected deadline leaves all survey/event/answer data unchanged (AC-183, TEST-184); close still works after effective expiry. The actual #87 contract addendum must be separately scoped and reviewed before this change. |
| `surveyLifecycle.ts` implements the pure stored-state/action matrix and has no clock/data access. | Retain its existing matrix cases. Availability/deadline logic belongs to `surveySchedule.ts` and transactional callers; do not replace stored status or silently create an expiry event (TEST-185/194). |
| `responses.ts` currently reads availability/eligibility/questions before a transaction that creates the response. | An outer read cannot prove F-08 admission. Move the authoritative current survey/enrollment/question reads and validation into the transaction after locking that same survey row; then sample time and create the complete response under the existing error order. Preserve the B-owned history GET section. Prove the crossing-deadline wait with a lock barrier, not a timing guess (TEST-186/188/189). |
| The closed `ErrorCode` union currently lacks `CLOSING_TIME_PASSED`. | Issue96's Files list now includes `server/src/lib/errors.ts` for that already-specified discriminant only. Do not change middleware or disclose internal DB errors (AC-182/183, TEST-183/184). |
| `statusVersion` guards lifecycle intent, while F-06 and scheduling use `expectedUpdatedAt`. | Schedule edits increment neither lifecycle version nor event count. Ensure strictly newer `updatedAt` for scheduling and lifecycle writes so an old schedule form cannot become valid across a same-millisecond close/reopen cycle. Preserve explicit no-auto-retry recovery (TEST-181/189/192). The shared lifecycle timestamp impact belongs in the pending integration addendum. |
| PR92 has no `closesAt` field and preserves historical response/summary access. | Add only the nullable deadline migration after the agreed integration slot. Existing rows receive null and retain IDs/values/timestamps; expiration does not hide saved responses/summary (TEST-187/191). The final integrated schema and F-07/F-10 interactions must be read again before implementation. |

Execution boundaries: independent contract preparation is allowed now. F-08 product/shared-file implementation remains after the recorded #87 -> #90 -> agreed extended-type slot, and interacting tests/code require the reviewed #87 addendum. Do not infer that importing newer staging documentation satisfies that prerequisite. Disposable CI PostgreSQL16 is a verified isolated test lane for earlier work; any future F-08 CI/browser execution needs a scoped workflow configuration if the current workflow does not execute the required tests. Local instances/ports and human-only production migration steps remain separate gates. No credentials or live connection strings are included here.

## 12. Version history

v1.0,25 November2026,A/Codex GPT-6.1 Sol: initial scheduled-closing contract before tests/code, FR12/BR11 boundary and locked admission design, explicit separate Lab7 integration-review prerequisite; B C3 pending.

v1.1 execution inventory,25 November2026,A/Codex GPT-6.1 Sol: record actual B C3 and read-only impact against proposed87 head d1b41c3; name the already-required error-union file before editing it, identify the current response admission/row-lock gap and shared timestamp impact, and preserve all AC/STS plus the separately scoped/reviewed87 integration prerequisite. No application tests, schema or implementation changed; no later feature assignment or integration approval inferred.

v1.2 proposed F-08/Lab 7 integration, 27 November 2026, A/Codex GPT-6. Records the specific error and locking rules requested in B's proposal review. The approved standalone cutoff and original test design remain in their earlier versions. Integration C3 is pending.

## 13. Proposed lifecycle integration v1.2

Read with [#130 / PR #131](https://github.com/Punge089/classpulse/pull/131), which proposes Lab 7 maintenance contract v1.7. For reopen, the locked owner record is required before payload validation. Invalid reason returns HTTP 400 VALIDATION_ERROR with a reason detail, including on an expired survey. A valid body with a stale statusVersion returns HTTP 409 STALE_SURVEY. The existing transition legality, original publication timestamp and version-capacity checks precede the deadline. Publish and reopen accept null or strictly future deadline at the sampled post-lock server time. At or after the deadline, a valid transition attempt receives 409 CLOSING_TIME_PASSED. Failed transitions leave status, statusVersion, timestamps, schedule, answers and audit unchanged. Manual close continues to work after effective expiry.

Every successful publish, close or reopen sets updatedAt to the greater of the post-lock server time and the previous updatedAt plus 1 ms, in the same transaction as the existing statusVersion increment and audit. The event records the physical server time. Successful schedule changes advance updatedAt by the same rule and keep statusVersion and audit unchanged. If the schedule edit gets the CLOSED survey lock first, reopen with the existing lifecycle version uses the newly committed deadline. If reopen succeeds first, the earlier schedule token gets STALE_SURVEY. A fresh schedule token on stored PUBLISHED gets INVALID_TRANSITION. Recheck response eligibility and the cutoff under that same row lock, preserving existing response error order and saved history/summary readback.

| Test | Existing F-08 AC | Level and expected result |
|---|---|---|
| TEST-195 | AC-182, AC-183 | API/DB. Owned expired CLOSED survey: invalid reopen reason produces 400 with reason detail, stale version produces STALE_SURVEY, and otherwise valid reopen produces CLOSING_TIME_PASSED. Check role and foreign-record precedence and unchanged rows. |
| TEST-196 | AC-181, AC-186 | API/DB. Freeze the sampled time within one millisecond, prove strictly increasing updatedAt across publish/close/reopen, physical event times and expected version increments. Prior schedule tokens become stale. |
| TEST-197 | AC-181, AC-183, AC-186 | API/DB. Hold the row lock to exercise each schedule/reopen winner. Schedule-first uses the committed deadline. Reopen-first invalidates the old token and rejects a fresh token on PUBLISHED. Check final state and audit. |
| TEST-198 | AC-183, AC-187 | API/DB. Start with previous responses. Test a deadline denial and an isolated audit insert failure, with a full pre/post comparison of schedule, timestamps, version, answers and audit. |

These additions target the existing scoped file `server/tests/api/scheduledClosing.test.ts`, paired with TEST-184/186–194 and the existing Lab 7 regression. TEST-180 remains the executed independent RED. Affected tests await B C3, and implementation awaits the shared-file slot after F-06/F-07.

### F-08 owner-list verification clarification, 28 November 2026

The reviewed API contract adds three availability fields to the owner list. TEST-20 keeps its exact object comparison, previous fields and ownership/count checks. Its expected legacy published row now also asserts null closesAt, acceptingResponses true and null closureReason. No contract rule changed.
