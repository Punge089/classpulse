# F-11 Anonymous survey mode

Issue #140 · v1.0 · 28 November 2026. Driver Bannasorn Thongkorn (A/Punge089). Reviewer Papangkorn Jitvoottikrai (B/book6349). Proposed; design requires peer review before tests or implementation.

## 1. Feature and requirements

FR-16 allows an owner to create an anonymous survey and requires disclosure before answering. BR-13 separates participation from answers and freezes mode after publish. BR-14 holds results until five completed responses. NFR-08 prohibits linking a respondent to anonymous answers in API/export. Preserve BR-04–08, BR-10–12 and NFR-02/03/09. Integrate F-07 answer validation, F-08 cutoff/reopen, F-09 own history and F-10 eligibility without leaking access or identity. F-12/F-13 must honor this policy.

## 2. Behavior and workflow

1. Owner picks IDENTIFIED or ANONYMOUS when creating the survey; default IDENTIFIED for unchanged clients. Existing draft editor preserves mode and API rejects in-place mode mutation. To correct a choice before publish, create a new draft. Mode stays immutable after publish, close and reopen.
2. Eligible respondent sees the saved survey mode before answering. A valid anonymous submission creates one participation marker and one separately recorded answer batch atomically. A duplicate gets the existing already-submitted behavior and leaves no second batch.
3. Own list/history uses participation to show that the respondent submitted. An anonymous confirmation has no persistent answer detail link or per-answer receipt. It states that the submission was saved.
4. Owned summary with fewer than five accepted batches returns a suppressed state without answer counts, sample values or raw data. At five, allow supported whole-survey aggregate only. Never expose anonymous free text, per-response details or a filtered cohort that could be differenced.

## 3. Business rules and validation

Use existing eligibility, lifecycle, deadline and answer validation ordering, with the post-lock clock and an atomic duplicate guard preserved. Both stores must commit together and any validation/write failure rolls back both. Count committed answer batches, including legitimate blank optional answers where normal rules permit them. Surveys in DRAFT never accept submissions. Close/reopen does not remove data, reset participation or alter mode. Result gates apply to authorized operators and all authorized output paths. No direct or stable synthetic bridge, shared timestamp, position, insert order or correlation identifier between participation and the answer store is available to application readers.

## 4. Permissions

Only OWNER may choose mode on create, manage an owned survey or read permitted aggregates. Require RESPONDENT and existing enrollment/section checks to submit; history remains own-only. Return standard 401, 403 and ownership 404 without alternate status/identity disclosure. No owner-visible anonymous completion roster, per-person answer response link, small-group filter, raw TEXT or audit export of submissions.

## 5. UI

Show radio choices and explain both modes on create. Before anonymous answers, show “Anonymous survey — your participation is recorded separately from your answers.” Keep existing identified wording for identified surveys and historic data. On success show a simple confirmation and link to available surveys. Own history shows an anonymous participation badge without timestamp, saved answers or anonymous detail navigation. Summary shows a clear rule message before threshold and distinguishes it from loading, empty and error. Keyboard/focus and field-error patterns follow the shared UI rules.

## 6. API and errors

- POST /api/owner/surveys accepts optional mode enum; invalid values get 400 VALIDATION_ERROR. Existing authoring responses retain the survey mode. Attempts to change mode on another operation are rejected; validate against published, closed and reopened state.
- Respondent list and detail return saved mode. Submission uses the existing endpoint and validates same inputs. Identified output shape stays unchanged. Anonymous success returns 201 with a discriminated body containing mode, surveyId and submitted:true only. Preserve 401/403/404 and existing 409 duplicate/lifecycle/deadline cases. All unexpected errors are sanitized.
- Own history includes only limited anonymous survey display metadata and a submitted marker. No response ID, timestamp, answers or join keys. Anonymous entries have their own nonchronological sort and stable UI rules. Identified lookups keep ownership scoping; requests for anonymous detail return 404.
- Owner summary returns a discriminated 200 threshold status with no numeric count below five. At/above five return whole-survey safe aggregates; TEXT contributes answered counts only. F-12/F-13 remain disabled for anonymous unless individually reviewed and proven under this policy.

## 7. Data and migration

Retain all identified responses and field semantics. Add separate anonymous participation store keyed uniquely by surveyId and respondentId, storing no submission timestamp, answer batch ID or section snapshot. Add anonymous answer batch store keyed by an independent random internal identifier, surveyId only; individual answer/selection records relate to batch and validated question/option, without user, section, timestamps, UUID ordering or shared trace keys. Additional database constraints must enforce question/option membership and prevent linked question types from bypassing guards. Do not expose or log either internal key alongside the other or expose database storage metadata. Restrict database roles, transaction log access, infrastructure logs and backups by operating procedure. Timing/observer or self-disclosure risk outside the API boundary remains a limitation; engineering must review that boundary before launch. Never store raw anonymous content in telemetry. Migration is additive with original records retained as identified. No backfill/relabel or response copying.

## 8. Failure and boundary cases

Test concurrent duplicate with commit/rollback, final-answer failure after marker, unopened/expired/reopened, sections and wrong clients, 0–4 versus exactly 5 complete submissions, unfiltered output across state transitions, history isolation, mode spoofing, unsupported anonymous exports/filters, no secret or identity in errors/logs and safe identified migration. Use synthetic accounts. Consider combined list, summary, export and history reads when reviewing linkability. Establish acceptable aggregate disclosure under product scope before launch.

## 9. Acceptance criteria

| AC | Observable result |
|---|---|
| AC-220 | Default identified and explicit anonymous create work; saved mode cannot change later. |
| AC-221 | Respondent sees accurate identified/anonymous notice before answering and mode-appropriate confirmation. |
| AC-222 | Anonymous participation and batch commit atomically using separate stores with no persisted link. |
| AC-223 | Duplicate/concurrent submissions produce one marker and one batch; failures leave neither new record. |
| AC-224 | Enrollment, section, close/reopen, schedule, question type and wrong-role rules stay enforced. |
| AC-225 | Owner reads suppressed state at 0–4 and safe whole-survey aggregates at 5; foreign access denied. |
| AC-226 | Anonymous history shows own participation only, with no answer ID/time/details or cross-person rows. |
| AC-227 | Export/filter paths cannot reveal anonymous linkage or suppressed data. |
| AC-228 | Migration preserves existing identified records and responses; audit/error paths expose no matching data. |

## 10. Software test specification

Exact planned paths must be approved in #140 before changes. All are unexecuted.

| Test | AC | Level | Precondition and action | Expected result | Planned file |
|---|---|---|---|---|---|
| TEST-220 | 220 | API/DB | Create both modes and invalid mode; try edit after publish/reopen | Correct persisted mode; invalid or mutation rejected | server/tests/api/anonymousMode.test.ts |
| TEST-221 | 221 | E2E | View anonymous and identified surveys and submit each | Accurate mode disclosure and mode-specific confirmation | e2e/anonymous-mode.spec.ts |
| TEST-222 | 222 | API/DB | Submit valid anonymous answer; inspect schema, persisted rows and JSON | Separate stores and no shared key or submission-time data in application records | server/tests/api/anonymousMode.test.ts |
| TEST-223 | 223 | API/DB | Two simultaneous same-user submits; inject second-write failure in separate case | One success and exactly one complete pair of records; failed transaction inserts zero rows | server/tests/api/anonymousMode.test.ts |
| TEST-224 | 224 | API/DB | Wrong role, section, deadline, lifecycle and invalid type cases | Existing denial order and no writes | server/tests/api/anonymousMode.test.ts |
| TEST-225 | 225 | API/DB | 0, 4 and 5 submissions; anonymous owner and foreign owner query | Suppression, correct whole-survey aggregate, foreign 404 with no fields | server/tests/api/anonymousMode.test.ts |
| TEST-226 | 226 | API/DB | Two respondents with mixed survey modes; list history and request foreign IDs | Own identified results and anonymous markers only | server/tests/api/anonymousMode.test.ts |
| TEST-227 | 227 | API/DB | Attempt anonymous export/filters on 4 and 5, try raw-text retrieval | Reject while disabled or prove explicitly reviewed safe result | server/tests/api/anonymousMode.test.ts |
| TEST-228 | 228 | Migration/API | Upgrade an identified fixture, compare answers and audit sanitized output | Identified data unchanged; no anonymous response linkage in API/logs | server/tests/api/anonymousMode.test.ts |

## 11. Completion evidence

B C3 on mode, schema, threshold, and linkability design; approved implementation file list. Record unchanged executable RED and GREEN checks, migrations against a disposable source fixture and current exact-head CI, raw pass/fail/skip totals, peer review and merge version. Demonstrate live identity protection, threshold and persistence under the approved release. Identify any measured versus untested risk. F-12/F-13 anonymous expansions keep separate peer review.

## 12. Version history

v1.0 · 28 November 2026 · A assisted by Codex GPT-6.2 Sol. Initial FR-16/BR-13/BR-14/NFR-08 contract for review.
