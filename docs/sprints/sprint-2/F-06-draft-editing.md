# F-06 Draft question editing - engineering contract

Issue #90, version 1.0, 25 November 2026. Owner/driver: Bannasorn Thongkorn (Punge089, A), assisted by Codex GPT-6. Reviewer: Papangkorn Jitvoottikrai (book6349, B), C3 pending. Contract-only branch `feature/90-draft-editing`, base `c99748c`. No new tests or implementation yet. Shared owner-file implementation follows Lab 7 #87; actual code base must be rechecked before RED.

## 1. Feature and linked requirements

Execution checkpoint,25November2026: the initial header describes the historical contract-only state. B posted genuine C3 [7159681538](https://github.com/Punge089/classpulse/issues/90#issuecomment-7159681538) at10:25:44UTC, approving AC120..128/TEST120..131 and the explicit publish/edit concurrency/rollback design. No F06 test or product source has been written. PR92/Issue87 integration is still pending, so the Issue's serialized shared-file/test gate remains in force. A inspected current87 implementation45f48cd: owner lifecycle takes an owner-scoped row lock and then conditionally updates status/version plus audit in one transaction, compatible with the already-designed F06 serial outcomes. Re-check the actual accepted staging head again before RED; this readback is not F06 runtime verification.

File-inventory clarification: the closed ErrorCode union in `server/src/lib/errors.ts` also needs the already-contracted `DRAFT_HAS_RESPONSES` discriminant once implementation gates open. Issue90 Files now includes that exact addition before edits; STALE_SURVEY is inherited from87. This changes neither errors/status precedence nor AC/STS, and no error middleware is altered. B's C3 remains the behavior review; no new requirement is introduced.

F-06 completes FR-10 (owner edits/deletes draft questions), BR-01 (question edits only in DRAFT), BR-02 validation, BR-08 ownership, NFR-02/03 access, NFR-05 persistence and NFR-07 field/async states. F-03 create/publish/close and F-04 answers remain intact. This is planned Sprint 2 work, not the separate Lab 7 behavior change.

## 2. Workflow

Owner opens own draft, chooses Edit questions, changes prompts/types/required flags/options and adds/removes/reorders questions. Save validates and atomically replaces the draft's question list. Cancel writes nothing. Survey id, course, title, description, mode and status remain unchanged. On success return to detail and show the stored list. Another owner never sees/changes the record. Published/closed/reopened surveys have no edit action and the API rejects direct writes.

## 3. Business rules and concurrency

Full replacement of questions is deliberate: only drafts with no responses may be edited. Question/option IDs may change on successful save; no response/answer may be orphaned or deleted. Reject an inconsistent DRAFT that has any responses with 409 `DRAFT_HAS_RESPONSES`, no automatic repair. At least one and at most20 questions; prompt trimmed1..300; `required` defaults true; RATING no options; SINGLE_CHOICE2..6 distinct case-insensitive trimmed labels1..100. Zero/21 questions, bad prompts/types/options/bodies rejected with per-field details. F-07 later revises type support through reviewed contract history; do not implement extended types under this Issue.

Use a client-supplied `expectedUpdatedAt` equal to the exact current ISO timestamp from owner detail. Preserve timestamp precision by comparing through Prisma against the parsed Date. In one transaction, conditional-update the owned DRAFT row with matching `updatedAt` to acquire its write lock, set a strictly newer millisecond updatedAt (`max(serverNow, previous+1ms)`), verify no responses, remove old options/questions and create the new ordered list. Reject stale token409 `STALE_SURVEY`. Require database foreign keys as defense; transaction errors roll back every row. No client-supplied id/status/course/owner allowed in question body.

The row lock and conditional predicate must serialize with publish/close mutations, not only with other editors. If publish wins, edit rejects409 and preserves the published structure. If edit wins, publish may succeed afterwards and publishes the entirely saved new list; it never sees a partial list. Two edits with the same token produce one save and one stale409. Lab 7 statusVersion changes only on lifecycle transitions; draft editing changes updatedAt, not statusVersion or lifecycle event history. Before implementation, re-check #87's transaction shape; any mismatch requires contract revision and B review.

## 4. Permissions and errors

`requireAuth` then OWNER role; invalid/missing/foreign survey id404. Ownership before body validation. Body errors400; valid body on non-DRAFT409 `INVALID_TRANSITION`; matching DRAFT with stale token409 `STALE_SURVEY`; then invalid persisted response invariant409 `DRAFT_HAS_RESPONSES`. Global malformed-JSON parser behavior unchanged. Preserve standard error envelope, no stack/secret. Backend is authoritative even if UI is bypassed.

## 5. UI

New route `/owner/surveys/:id/edit` behind OWNER UX guard. Load existing detail, show loading/error; a loaded non-draft explains it cannot be edited and links back. Existing Draft detail gains Edit questions link. Reuse existing theme/form conventions, not a new visual system. Controlled question blocks support add/remove/reorder, type changes clear incompatible options, required checkbox, option editing. Limit messages match server. Save disabled while pending; field errors next to inputs, network/server alert preserves edits. On409 show reload guidance and keep unsaved values; never overwrite newer changes automatically. Successful save returns detail, reload proves persistence. Browser back/cancel does not mutate DB.

## 6. API

`GET /api/owner/surveys/:id`: additive `updatedAt` ISO UTC on owner detail/create/mutation DTO. No new read endpoint or role permission. Include after #87 statusVersion addition; do not remove it.

`PUT /api/owner/surveys/:id/questions`: body exactly `{ expectedUpdatedAt: ISO timestamp string, questions: [{ prompt, type, required?, options? }] }`. Timestamp must be a valid canonical `Date.toISOString()` representation; reject missing/bad/non-string token400. Reject unknown top-level/question fields, arrays/null body, supplied question IDs, duplicated/empty options and all BR-02 violations. RATING options may be absent/empty, otherwise400. At success200 `{ survey: <owner detail with questions/options and new updatedAt> }`. Errors401/403/404/400 and409 as above, sanitized500 for unexpected persistence failure. Ordered positions are1..n with new IDs. No PATCH partial-update ambiguity, no title/course/status mutation through this route.

## 7. Data and migration

No new model/column/migration. Reuse existing Survey.updatedAt, Question, QuestionOption relations, nested/interactive transaction and constraints. Guard inconsistent response-bearing draft before destructive replacement; never relax foreign keys. Legacy drafts can be read/saved with a freshly fetched timestamp. Published history is immutable; F-09 must continue reading old responses. Only isolated test fixtures may reset test data; no live seed/reset. SQL/local test instance remains separately verified from Lab 6.

## 8. Boundaries and failures

1/20 questions valid,0/21 invalid; prompt1/300 valid,0/301 invalid; options2/6 valid,1/7 invalid; label1/100 valid,0/101 invalid; whitespace trimming and case-insensitive duplicates identical to create. Validate before replacing. RATING -> SINGLE_CHOICE requires valid options; reverse removes them. Add/remove/reorder preserves sequential positions, never duplicate `(surveyId,position)` while the transaction commits. MaxLength uses existing JavaScript length semantics. Mid-write failure leaves old IDs/values/token intact. Client receives a new token only on success. Same-token two saves and save/publish race have deterministic allowed outcomes described above.

## 9. Acceptance criteria

| ID | Observable result |
|---|---|
| AC-120 | Owner edits prompts/types/required/options and adds/removes/reorders questions of own draft;200 with stored ordered list, same survey identity/course/mode/title/status. |
| AC-121 | Every BR-02 boundary and malformed/unknown-field/token case returns400 with details and no changed DB rows/token. |
| AC-122 | PUBLISHED/CLOSED/reopened surveys reject direct edit409 and preserve all questions/options/answers. |
| AC-123 | Anonymous/wrong-role/foreign/missing/malformed id rejected401/403/404; invalid body on foreign survey still404. |
| AC-124 | Two same-token edits yield one200/one409; stale token never overwrites a newer saved list. |
| AC-125 | Concurrent publish/edit yields either published old-list + edit409 or fully saved new-list followed by publish; never partial state. |
| AC-126 | Mid-replacement failure fully rolls back all question/option/token changes; DRAFT with existing responses rejects409 without deletion. |
| AC-127 | UI shows draft edit, validation/loading/error/stale handling, cancel no-op and stored results after reload; respondent/non-draft access cannot mutate. |
| AC-128 | Original create/publish/close/answer/summary/access regressions pass; updatedAt is additive, #87 statusVersion/audit preserved; exact-head peer/CI/release evidence recorded. |

## 10. Software Test Specification

| Test | AC | Level | Input / action | Expected | Planned file |
|---|---|---|---|---|---|
| TEST-120 | 120 | API/DB primary RED | Existing own draft; fetch detail/token, PUT reordered/edited two-question list | Old implementation404 vs expected200; after change stored new ordered questions and unchanged survey fields | server/tests/api/draftEditing.test.ts |
| TEST-121 | 120,121 | API/DB | Add/remove/reorder and type switch both directions; valid1/20 questions/2/6 options/length limits |200 and exact stored structure | server/tests/api/draftEditing.test.ts |
| TEST-122 | 121 | unit/API-DB | All invalid BR-02 boundaries, duplicates, bad body, unknown fields, invalid date; snapshot before/after |400 with expected fields and unchanged original rows/token | server/tests/api/draftEditing.test.ts; server/tests/unit/surveyValidation.test.ts |
| TEST-123 | 122 | API/DB | Direct PUT against PUBLISHED/CLOSED and later #87 reopened survey with matching timestamp |409, full old data unchanged | server/tests/api/draftEditing.test.ts |
| TEST-124 | 123 | API/DB | Anonymous/student/foreign owner/bad or absent id; invalid foreign body |401/403/404, no response data or mutations | server/tests/api/draftEditing.test.ts |
| TEST-125 | 124 | API/DB | Two owner agents same token, distinct lists, concurrent PUT |one200/one409; final DB equals winner in full | server/tests/api/draftEditing.test.ts |
| TEST-126 | 125 | API/DB | Separate agents PUT and POST publish concurrently, repeat on fresh fixtures |Only specified serial outcomes; committed list complete/consistent | server/tests/api/draftEditing.test.ts |
| TEST-127 | 126 | API/DB | Valid old draft; temporary test-only failing insert trigger installed/removed in try/finally during replacement |sanitized500 and original complete DB snapshot/token restored | server/tests/api/draftEditing.test.ts |
| TEST-128 | 126 | API/DB | Construct inconsistent draft with saved response and matching token; PUT valid replacement |409 DRAFT_HAS_RESPONSES, old rows intact | server/tests/api/draftEditing.test.ts |
| TEST-129 | 127 | client | Render/edit/save/cancel;400 details/409 stale/network; loading/non-draft |Correct controls/request/token and preserved unsaved edits on failure | client/tests/draftEditing.test.tsx |
| TEST-130 | 120,127,128 | E2E | Owner creates draft, edits/reorders, reloads, publishes; student answers; owner summary |Saved edited structure used end-to-end, prior original journeys preserved | e2e/draft-editing.spec.ts |
| TEST-131 | 128 | existing regression | Run server/client/E2E suites and builds at integrated head with Lab 7 |Original checks enabled; counts/failures/skips and tested commit retained | evidence/sprint-2/F-06/regression.txt |

Primary RED must compile against existing code: use only existing app/fixture imports; if GET detail lacks updatedAt before code changes, obtain the real old timestamp directly from existing Prisma Survey in test setup. POST body uses that timestamp; assert expected PUT200 first. Old route404 is the meaningful missing-behavior failure. Do not count a missing DTO field/import compilation error as RED.

## 11. DoD and evidence

- [ ] B reviews contract/C3, especially transaction lock and publish race, before tests.
- [ ] Test-only commit and saved actual RED with full pre-change/test SHA precede code; same tests later GREEN, no weak/disabled/skipped cases.
- [ ] Capture primary/API/unit/client/E2E and migration-not-applicable rationale. Commands: `npm --prefix server test`, `npm --prefix client test`, both build scripts, `npx playwright test` in verified isolated environment; record actual command/config/head/counts.
- [ ] Check exact final Issue Files/diff, no secrets and model trailer; B exact-head review/current CI; staging merge commit; coordinated main release and persistence demonstration.
- [ ] Trace AC to actual test files/results/release; D2 embeds full contract and selected evidence. Do not claim old green runs for this feature.

Implementation, tests, C3, GREEN and release are all pending. No runtime test count is claimed.

## 12. Version history

v1.0,25 November2026,A/Codex GPT-6: initial draft-edit contract and test design before new tests/code; serialize shared file implementation with Lab 7 and B work.

v1.1 execution inventory,25November2026,A/Codex GPT-6.1 Sol: record actual B C3 and inspected87 row-lock compatibility, preserve the integration-before-tests gate, and name the already-required error-union discriminant file before implementation. No behavior/AC/STS change and no F06 tests/code written.

### v1.2 proposed F-07 compatibility addendum, 28 November 2026

A/Punge089, with Codex GPT-6.2 Sol. B/book6349 is the independent reviewer. This revision follows the accepted standalone F-06 staging merge 4f1f03a (#93, B reviewed 6aa7b21) and F-07 contract proposal 575f873 (#134/#137). It defines the F-07 authoring extension before shared editor implementation. F-06's original AC-120–128 and TEST-120–131 evidence remains tied to its original implementation and staged version.

- In the F-07 increment, the same owner PUT endpoint accepts a complete ordered question list containing RATING, SINGLE_CHOICE, TEXT and MULTI_CHOICE. RATING and TEXT take no nonempty option list. SINGLE_CHOICE and MULTI_CHOICE take 2–6 trimmed distinct labels, with the existing length and position rules. The editor clears inapplicable options on a switch to a no-option type. The F-07 submitted-answer TEXT length and multiple selected option rules remain in the F-07 contract.
- Keep owner-scoped authorization and row lock, current updatedAt token, DRAFT/no-response preconditions, unchanged statusVersion, all-or-nothing replacement, persisted order, stale write and publish/edit serial outcomes. Invalid type or options produce the existing matching field error and preserve the entire saved question list and token.
- F-07 TEST-142 verifies mixed-type replacement, invalid-option rollback and reload, and preserves stale, foreign and non-draft denials. TEST-149 verifies type switches and keyboard editor behavior. Keep the complete F-06 tests enabled and record integrated results on the actual candidate. The fixture, browser and application file inventory remains in #134.
- No F-06 API schema or application behavior changes in this documentation PR. Run current CI and obtain B's review of this exact addendum before B modifies the shared F-06 editor or handler for F-07. B can work on the already reviewed independent F-07 RED after #134 lists its exact test/evidence paths.

Version reason: preserve the reviewed F-06 mutation guarantees as F-07 expands allowed authoring types; the original F-06 acceptance evidence remains readable.
