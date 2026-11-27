# F-07 — Extended question types

**Issue:** #134 · **Version:** 1.0 proposal, 27 November 2026  
**Driver:** Papangkorn Jitvoottikrai (Student B, `book6349`) · **C3 reviewer:** Bannasorn Thongkorn (Student A, `Punge089`)  
**Requirements:** FR-11, BR-12; preserves BR-02, BR-04–10 and NFR-02/03/05/07/09. Depends on F-03/F-04/F-05, accepted F-09, and the F-06 draft editor before editing shared authoring files. No F-07 test or implementation is authorized before A's C3.

## 1. Baseline, outcome and boundary

The `5fe00fd` staging baseline supports `RATING` and `SINGLE_CHOICE` only. `QuestionType` has those two values; `Answer` stores one `ratingValue` or `optionId`; the owner summary aggregates both. The accepted F-09 detail endpoint projects those same answer shapes. F-06's ready PR #93 adds draft editing while retaining the two baseline types. This feature adds `TEXT` and `MULTI_CHOICE` end to end: owner creation and draft replacement, respondent admission/submission and confirmation, own saved-history detail, and owner summary. It preserves existing rows and both original types.

The Sprint 2 owner summary shows a `TEXT` question's answered count, with no raw text or respondent identity. Reading text answers in owner analysis is FR-18/F-13 in Sprint 3 and needs its own reviewed access/privacy contract. An identified respondent may still read their own saved text through F-09. Do not call the survey anonymous. F-08 controls cutoff and F-10 controls section admission; F-07 changes answer validation and persistence within their eventual shared transaction, not either admission rule.

## 2. Authoring and question definitions

Owner create and F-06 draft edit accept all four enum values. A `TEXT` question has no options; a `MULTI_CHOICE` question has 2–6 different option labels, each 1–100 characters after trim, case-insensitively distinct just as `SINGLE_CHOICE`. `RATING` has no options. Prompt, title, description, question-count, ownership, draft-only mutation and optimistic-token rules remain those of F-03/F-06. Unknown types or mismatched options produce 400 `VALIDATION_ERROR` with `questions[i].type` or `.options`; no part of a failed replacement persists. The UI changes the option editor when a type changes and shows validation, pending, stale, network and reload states. The owner can reload and publish a valid draft, then see the persisted types and option order.

Changing a draft question's type through F-06 replaces its questions and options atomically. Published/closed/reopened surveys cannot have questions changed; saved responses and historical answer interpretations remain intact. F-06's canonical contract must receive a versioned F-07 compatibility addendum before its shared editor is changed. This Issue does not silently revise F-06's accepted two-type implementation.

## 3. Answer API and validation

`GET /api/surveys/:id` adds the new question types to the existing question DTO; `TEXT` has `options: []`, and `MULTI_CHOICE` has ordered `{id,position,label}` options. Admission, response status and identified notice remain unchanged. `POST /api/surveys/:id/responses` retains `{answers: [...]}` and existing status/error envelope. Each answer has exactly one type-specific value:

| Question | Submitted answer | Valid value |
|---|---|---|
| `RATING` | `{questionId,ratingValue}` | Integer 1–5. |
| `SINGLE_CHOICE` | `{questionId,optionId}` | One option of this question. |
| `TEXT` | `{questionId,textValue}` | Trimmed nonblank Unicode text, at most 500 code points; reject unpaired surrogates. Internal whitespace is preserved. |
| `MULTI_CHOICE` | `{questionId,optionIds}` | Array of 1 through all available options, distinct positive IDs belonging to this question. Canonical persisted/read order follows option position then ID, regardless of request order. |

Optional questions may be omitted. An optional `TEXT` containing only whitespace is treated as omitted and creates no Answer row; the client omits it from the request. A provided empty `optionIds` array is invalid even for an optional question, since BR-12 says a submitted multi-choice answer selects at least one option. Required missing or blank text and missing multi-choice answers return 400. Reject duplicate question IDs, another survey's question/option IDs, duplicate selected IDs, cross-question options, wrong value key, unknown value key, null, number/string coercions, text over 500 code points and invalid UTF-16. Error details identify `answers[i]` and the specific value field. Validate against the server-loaded survey questions and current option IDs, never client labels. Preserve existing 401/403 role, 404 missing, 403 `NOT_ELIGIBLE`, 409 `SURVEY_NOT_OPEN`, 400 answer, then 409 duplicate order. An invalid submission writes zero Response, Answer or selection rows.

## 4. Persistence, readback and summary

Extend Prisma `QuestionType` additively. Add nullable `Answer.textValue` (database `varchar(500)`) and a join table `AnswerSelectedOption(answerId, optionId)` unique on the pair. Keep `Answer` unique on `(responseId, questionId)`, and retain `ratingValue` and `optionId` for old types. The selection table references Answer and QuestionOption with restrictive or cascading behavior that cannot delete historical answers through a published survey edit. Application validation checks each selected option's question; the migration should enforce that relationship in the database with a composite key or a documented equivalent constraint so a cross-question selected option cannot be stored by bypassing the API. Add a database check or equivalent guarded persistence invariant for type-specific columns where feasible; report any invariant that remains application-only. Do not rewrite old answers; old rows keep null text and no selection rows. Rehearse migration on an isolated database containing existing responses and compare counts/values before and after.

The existing response transaction must insert the Response, Answer rows and all selected-option rows atomically under the admission lock once F-08/F-10 integrate. Unique response-per-respondent stays authoritative. `GET /api/responses/:id` retains its own-respondent filter and existing envelope. Add `textValue` only for TEXT and `selectedOptions: [{optionId,label}]` only for MULTI_CHOICE, ordered by option position then ID. Keep rating and single-choice readback unchanged. The confirmation and F-09 detail pages render text as plain text and selected labels read-only, with no HTML interpretation. F-09's list remains metadata-only and has no new answer content.

`GET /api/owner/surveys/:id/summary` retains owner-only 404 for a foreign survey, `responseCount`, existing rating/choice shapes, and question order. Add `TEXT` `{questionId,prompt,type:"TEXT",text:{answeredCount}}`; no text strings, response IDs or respondent identifiers in Sprint 2 summary. Add `MULTI_CHOICE` `{questionId,prompt,type:"MULTI_CHOICE",multiChoice:{answeredCount,options:[{optionId,label,count}]}}`. Count each saved selected option once, including zero-count options; `answeredCount` is the number of Answer rows for that question. Option counts may sum above `answeredCount`. UI labels that distinction and uses `answeredCount`, not total response count, as a per-option percentage denominator when shown; zero answers show zero counts and no misleading percentage. F-13 may later add a separately authorized raw-text view; F-11 must review its privacy effect.

## 5. UI and failure behavior

Owner create/F-06 editor exposes a labeled four-type selector. TEXT shows a 500-character answer hint instead of option inputs. MULTI_CHOICE uses the same ordered option editor as SINGLE_CHOICE with a clear multi-select label. Respondent TEXT uses a labeled textarea with live remaining character count; MULTI_CHOICE uses checkboxes and preserves typed/selected values after 400/network/cutoff errors. Required and optional states are announced. Existing rating and radio paths remain usable. Confirmation and My responses show saved values in question order; the owner summary shows type-specific counts with loading/empty/error states and no raw text. All controls support keyboard and visible focus. Server validation, not client state, decides acceptance.

## 6. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-140 | Owner creates and reloads TEXT/MULTI_CHOICE questions with valid ordered options, while old types still round-trip. |
| AC-141 | F-06 draft edit adds/changes/removes/reorders new types atomically and respects owner, state and stale-token restrictions. |
| AC-142 | Type/option/prompt limits and mismatches reject with field details and no partial draft mutation. |
| AC-143 | TEXT accepts trimmed 1–500 code-point text; optional blank omits an answer; required blank, over-limit and invalid Unicode reject atomically. |
| AC-144 | MULTI_CHOICE stores 1–n distinct options of the right question; empty, duplicate, wrong-question and malformed values reject atomically. |
| AC-145 | Mixed four-type response persists and retrieves all type-specific values, with one response per respondent and no partial writes on error. |
| AC-146 | F-09 own-history and confirmation render saved TEXT/MULTI_CHOICE read-only in stable order; foreign respondent access remains 404. |
| AC-147 | Owner summary reports TEXT answered count only and MULTI_CHOICE answered/option counts, including zero; no raw text or respondent identity leaks. |
| AC-148 | Existing rating/single-choice totals, averages, submission, history and published survey data remain unchanged after additive migration. |
| AC-149 | New authoring, response, history and summary screens handle loading, validation, network, keyboard and persisted readback. |
| AC-150 | Backend auth, role, owner, eligibility, publication/cutoff and duplicate rules retain their precedence with the new types. |
| AC-151 | Test-only RED, unchanged GREEN, migration/regression and current-head reviewed CI are recorded with true pass/fail/skip counts and version. |

## 7. System test specification

| TEST | AC | Level | Setup and action → expected result |
|---|---|---|---|
| TEST-140 | 140,151 | API/DB primary RED | With baseline owner/course, POST a valid TEXT and MULTI_CHOICE draft; expect 201 and persisted types. Old code returns 400 at `questions[0].type`; retain assertion/output before implementation. |
| TEST-141 | 140,142 | Unit/API | Valid four-type create, option 2/6 boundaries and case-folded duplicates; readback matches order; invalid type/options produce field 400 and zero survey rows. |
| TEST-142 | 141,142 | API/DB | After F-06 integration, edit mixed draft with current token; reload order/types; stale, foreign and non-draft edits reject with unchanged rows/token. |
| TEST-143 | 143,145 | Unit/API | TEXT 1/500/501 code points, whitespace, optional omission, required blank and unpaired surrogate; check normalized stored value or 400 and no rows. |
| TEST-144 | 144,145 | Unit/API/DB | MULTI_CHOICE 1/all options and invalid empty/duplicate/foreign/cross-question/noninteger IDs; check canonical selection order and atomic rejection. |
| TEST-145 | 145,148 | API/DB | Submit all four types, reload Response/Answer/selection rows; repeat POST 409; original rating/choice answer rows are unchanged. |
| TEST-146 | 146,150 | API/access | Own detail returns TEXT and ordered selected labels; another respondent gets identical 404 to missing ID; wrong role/anonymous endpoints reject with no values. |
| TEST-147 | 147 | Unit/API/access | Summary has text answeredCount, no raw string/ID/email, multi counts including zero; foreign owner 404; option counts may exceed answeredCount. |
| TEST-148 | 148,151 | Migration/DB | Migrate an isolated old-data snapshot; compare survey/response/answer counts and old values, and reject a cross-question selected-option insert. |
| TEST-149 | 149,150 | Client | Owner type editor, respondent textarea/checkboxes and typed-error retention, confirmation/history read-only and summary counts; keyboard/empty/network states. |
| TEST-150 | 145–150 | E2E | Owner creates/publishes mixed survey; eligible respondent submits and reloads own history; owner reads summary counts; forbidden actor is denied by API. |
| TEST-151 | 150,151 | Integration/regression | Run server/client/browser suites, builds and Docker on exact integrated head; test cutoff, eligibility, duplicate, draft-edit and historical-answer interactions without weakening tests. |

## 8. Definition of done, sequencing and version history

Before tests: record all implementation, migration, test and evidence paths in #134 Files; reconcile F-06 compatibility with A's reviewed version and request a versioned addendum where needed; obtain A C3 on this contract. Commit test-only RED and its actual output, then implementation and same-test GREEN. Check the real migration on isolated PostgreSQL, all contract AC, current-head CI and independent A review before staging. Save evidence under `evidence/sprint-2/F-07/`; record every failure/skip. Main candidate, GCP deployment and D2 PDF are separate reviewed release gates. Do not edit F-08/F-10 shared paths before their owner/slot agreement.

| Version | Change |
|---|---|
| 1.0 proposal, 27 Nov 2026 | B draft from current staging and #134; no tests, code, migration or review acceptance yet. |
