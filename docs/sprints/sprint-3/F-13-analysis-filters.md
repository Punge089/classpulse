# F-13: analysis filters and text answers — proposed contract

Issue #124 · version 0.1 · 27 November 2026 · owner A/Punge089 · reviewer B/book6349

This is a proposal for peer review, not an implemented feature. No F-13 tests or application code may be written before B's C3 and agreed implementation file inventory. It addresses FR-18 and depends on the accepted F-07 text-answer and F-10 section designs. BR-08 ownership, BR-13 identity separation, BR-14 anonymous threshold, NFR-02/03 and NFR-07 remain binding.

## Baseline and scope

At staging baseline a3a0424, owner summary uses the existing owner-scoped aggregate endpoint; the schema has identified responses and rating/single-choice answers, without a TEXT answer field or section entity. F-07 and F-10 are planned, not present in this baseline. F-13 therefore cannot treat section or text data as already available. Existing summary and owner authorization must continue working when no filter is selected. This contract does not add or change submission, eligibility, survey lifecycle, response ownership, schema or anonymity by itself.

The proposed first working slice is **identified surveys only**: an owner may select one valid section of the survey's course, see the existing aggregates restricted to that section, and see submitted text answers for the selected population. Clearing the filter restores the unfiltered summary. Anonymous surveys remain explicitly unsupported by this slice until a separately reviewed F-11 privacy design defines safe filtered disclosure and a threshold for each displayed population. Do not infer anonymous safety from the global count alone.

## Decisions requiring B review

1. For identified surveys, which reviewed F-10 source defines a respondent's section for historical responses: a submission-time snapshot or current enrollment? The choice affects transfers, missing sections and historical reproducibility. No implementation should infer one before F-10 specifies it.
2. Should text answer display reveal respondent identities? This proposal shows text only, without identity, and preserves existing owner access boundaries. B should confirm against FR-18 and the F-12 identified export policy.
3. F-07 must define text answer storage, maximum length, blank/optional answers and immutable historical rendering. F-13 consumes that accepted contract without creating a competing answer schema.

## Proposed interaction and API boundary

An authenticated owner opens an owned survey's summary. A section selector offers All sections and sections valid for the survey's course. Changing selection requests a fresh owner-scoped summary; loading is announced, an empty population is explicit, and errors provide a retry without displaying stale results as current. A text-answer list is read-only and renders ordinary escaped text. The UI must not call an endpoint to expose answers for another owner or another course.

The exact API endpoint, query representation, response DTO, stable ordering and pagination for text answers, field errors, section-history source and file list will be specified in a reviewed revision after F-07/F-10 contracts are available. Server-side ownership and input validation are mandatory. An unknown, malformed or foreign-course section must not silently broaden the filter; no answer data may accompany an error. Existing anonymous protections and threshold semantics cannot be weakened by filter selection, empty states or pagination.

## Proposed acceptance and system checks

IDs are provisional pending registry collision check and B review; do not cite them as accepted baseline IDs.

| Scenario | Acceptance / test expectation |
|---|---|
| Owner, no filter | Existing summary behavior remains unchanged; no cross-owner rows. |
| Owner, valid section | Aggregates and text answers use the same defined eligible response population; compare to known seeded responses in two sections. |
| Clear filter | The unfiltered result is freshly requested and correct. |
| Empty section | A truthful empty result, with no fabricated responses or counts. |
| Invalid or other-course section | A documented client error; no unfiltered fallback or response data. |
| Authentication and ownership | Missing session returns 401, wrong role 403; foreign or missing survey gives the agreed indistinguishable 404. |
| Privacy | Identified slice does not leak respondent identity in text output. Anonymous mode remains unavailable until reviewed F-11 integration specifies safe behavior and per-population threshold. |
| Text safety | Long, empty/optional and markup-like text follow accepted F-07 rules and render as text, not executable markup. |
| Async UI | Loading, empty, error/retry, changing filters rapidly and stale responses are tested. |
| Persistence/regression | Reads do not change any survey, response, answer or enrollment; existing summary, submission, role and lifecycle regression tests remain enabled. |

## Dependencies and completion

Before tests: record B C3 on a versioned contract with stable AC/STS IDs; agree F-07/F-10 data semantics and scope concrete application/test/evidence files in the issue; coordinate any F-11 privacy interaction. Then preserve a meaningful failing assertion on the actual old code before implementation, capture the same checks green, run relevant server/client/browser regression and builds, and obtain independent exact-head review and current CI before a staging merge. D2 evidence must embed the actual contract, review and results rather than claim a planned slice is working.

Version 0.1: A and Codex GPT-6 drafted the proposal from baseline a3a0424. The three decisions above, exact API contract and implementation scope remain open; no tests, code, deployment or acceptance are claimed.

## Version 1.0 implementable contract proposal - 28 November 2026

A/Punge089 drives. B/book6349 reviews. This revision expands v0.1 with stable AC/STS, API, snapshot and UI contracts. It reads proposed F-07 at 575f873 and F-10 at 99d64cc. Their final accepted versions must be checked before tests or code. Any mismatches require a new version and review. FR-18 remains the requirement; BR-08/13/14 and NFR-02/03/07 govern access, privacy and user-visible state.

### 1. Workflow and scope

1. The owner opens the summary of their own identified survey and chooses All sections or one section of its course. All sections includes responses with no historical section snapshot. A separate Unassigned at submission selection covers that unknown population without guessing its historical section.
2. The aggregate and selected TEXT results use the same filter on the saved F-10 source. A roster move never rewrites old summaries. Changing or clearing the filter resets text pagination and replaces both views.
3. Text is read-only and contains no respondent ID/name/email, timestamp, row/response ID or shared per-response grouping. It may contain self-identification voluntarily entered in an identified response; the UI makes the source and policy clear. Read-only identified analysis grants no new respondent or foreign owner access.
4. Anonymous surveys retain the F-11 approved unfiltered aggregates and suppression. Section and raw text analysis are unavailable while their independent privacy requirements remain unresolved. F-13 never bypasses suppression.

### 2. Data and calculations

No migration by F-13. Join the owned survey to its saved responses, use nullable sectionIdAtSubmission and same-course sections from F-10, and consume validated Answer.textValue from F-07. Ignore omitted text rows. Use one read snapshot for totals, filtered aggregates and text page. Existing rating averages/distributions, single/multiple choice counts and zero buckets retain their definitions. F-10's current-attendance rate remains explicitly labeled survey-wide and uses its existing live cohort; never infer it from the historical filter. Export is a separate F-12 feature.

### 3. API and permissions

Retain GET /api/owner/surveys/:id/summary and no-query response compatibility. Introduce GET /api/owner/surveys/:id/analysis for the richer identified read. Query accepts section (all default, unassigned, or a positive numeric same-course ID), optional textQuestionId constrained to this survey and TEXT type, limit (1–50, default 25), and optional cursor. Reject duplicate, unknown, invalid or incoherent query parameters. Text questions are listed by immutable position/ID; the first TEXT question is the default when none is specified. No text questions returns a marked empty page.

200 body: analysis containing selection, sections (stable id and label), the filtered summary aggregates and responseCount, textQuestions (id, position and prompt), selectedTextQuestionId (nullable) and textPage (values: string[], nextCursor: string or null). Sort text internally by immutable answer ID ascending. Use an authenticated, expiring opaque continuation token scoped to caller, survey, filter, text question and the highest answer ID observed on the first page. Tokens do not expose raw IDs. Reject invalid/mismatched cursors and reset pagination. Cap queries to limit+1 rows and exclude records beyond the cursor watermark. Filter changes and clear use a fresh viewport; later inserts do not shift preceding pages.

Enforce OWNER and same ownership check before mode/filter results. Missing session 401; wrong role 403; missing or foreign owned survey 404 with indistinguishable envelope; invalid query, wrong-course section, invalid selected question or cursor 400 with field details and no data; anonymous endpoint 409 ANALYSIS_NOT_AVAILABLE; sanitized 500. No sensitive raw answers, identity, cursor signing values or DB errors in logs.

### 4. UI, validation and boundaries

Add labeled section and TEXT question controls to the owner summary, with named loading, genuine empty result, retryable error and keyboard Load more. Use text rendering, preserve stored internal whitespace, support 500 Unicode code points, never render HTML, and keep values readable at 375 px. On change cancel or ignore stale requests by identity. Avoid showing old content under the new selection or duplicating rows on retry. A valid section with no responses produces zero counts or existing null averages. Historical null section responses appear only in All and Unassigned. Keep an actionable error instead of falling back to All on invalid input.

### 5. Acceptance criteria

| AC | Observable result |
| --- | --- |
| AC-260 | Identified owner selects All, one same-course section or Unassigned and sees exact persisted aggregates. |
| AC-261 | A moved roster leaves prior section membership intact, with historical null rows visible under Unassigned and All. |
| AC-262 | Owner reads saved TEXT for the same selected population without identity or raw internal keys. |
| AC-263 | Token pagination is bounded, consistent across writes and cannot be reused under a different owner/survey/selection. |
| AC-264 | Role/ownership checks, invalid section/question and unknown query errors expose no data. |
| AC-265 | Anonymous analysis is unavailable and never weakens the legacy summary threshold. |
| AC-266 | Loading, change/clear, no responses, retry, keyboard and stale-response ordering work at mobile width. |
| AC-267 | Existing summary shape, calculations, live survey-wide rate and stored records remain unchanged. |

### 6. Software test specification

| Test | AC | Level | Precondition and action | Expected result | Planned file |
| --- | --- | --- | --- | --- | --- |
| TEST-260 | 260 | API/DB | Two sections, one legacy response, known rating and choice answers; read each selection | Correct response counts, averages and zero buckets | server/tests/api/surveyAnalysis.test.ts |
| TEST-261 | 261 | API/DB | Save in one section, transfer roster, request old and new filters | Past response remains assigned to original section | server/tests/api/surveyAnalysis.test.ts |
| TEST-262 | 262 | API/DB | Known text in two sections plus optional blank; fetch by TEXT question | Exact scoped values, preserved whitespace, no identity fields or grouping | server/tests/api/surveyAnalysis.test.ts |
| TEST-263 | 263 | API/DB | More than one page, insert new answer between pages, reuse token on other selections | Rows remain in bounded stable order, invalid reuse rejected | server/tests/api/surveyAnalysis.test.ts |
| TEST-264 | 264 | API/DB | Missing auth, wrong role, wrong owner, foreign section, invalid question and duplicate params | 401/403/404/400, no data and no fallback | server/tests/api/surveyAnalysis.test.ts |
| TEST-265 | 265 | API/DB | Anonymous survey below and above threshold; call analysis and old summary | Analysis denied; old threshold/aggregate remains binding | server/tests/api/surveyAnalysis.test.ts |
| TEST-266 | 266 | Browser | Real seeded owner opens 375 px summary, switches sections, forces out-of-order/failure, clears and retries | Named states, current-only results, safe text, keyboard interaction | e2e/survey-analysis.spec.ts |
| TEST-267 | 267 | API/DB | Before/after counts and existing summary request, including live-roster change | Original summary and stored rows preserved, live rate remains survey-wide | server/tests/api/surveyAnalysis.test.ts |

### 7. Definition of done and release evidence

B C3 on exact revision, including snapshot semantics, no identity output, cursor and anonymous policy. Pin actual F-07/F-10/F-11 behavior and scope exact application, test and evidence paths before writing tests. Retain executable test-only RED on the old code, then same assertions GREEN. Record exact commit, commands, counts and failure/skip details. Obtain independent current-head CI and reviewed merge, then verify saved readback and denied access on the candidate. Schedule remaining work by dated AC for the 13 December release. All new tests here are planned, with no feature implementation or runtime result claimed.

Version 1.0, 28 Nov 2026, A with Codex GPT-6.2 Sol. Preserve v0.1 history above; specify FR-18 API, historical snapshot and UI, stable tests and completion criteria. Contract review and prerequisite integration pending.
