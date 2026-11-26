# F-09 — My responses

**Owner:** Student B (`book6349`) · **Reviewer:** Student A (`Punge089`) · **Issue:** #88
**Version:** 1.1 · **Date:** 26 November 2026
**Requirements:** FR-13; preserves BR-09 (submitted answers are immutable); NFR-02, NFR-03, NFR-07; depends on F-04.
**Status:** Contract revision for partner review. No tests or implementation are authorized before C3.

## 1. Outcome and boundary

A signed-in respondent can review their own saved responses across surveys that are currently published or closed, move through a bounded response history, and open a saved response using the existing respondent-scoped detail endpoint.

The server remains the access-control authority. The list is scoped by the authenticated respondent ID on every query. The list does not include answer contents; selecting an item loads its details through the existing `GET /api/responses/:id` endpoint. Reading history never changes a response, answer, survey, or enrollment.

This is an independent F-09 slice. It does not modify survey authoring, submission rules, lifecycle transitions, answer types, schema, seed data, or migrations. F-07 may extend answer DTOs in its own reviewed scope; this contract consumes the current detail response shape and leaves that handoff explicit. No F-08 deadline or Lab 7 reopening behavior is introduced.

## 2. Workflow

1. An authenticated respondent opens **My responses** from respondent navigation.
2. The client requests the first page from `GET /api/responses/mine`. The page shows a loading state, then a list, an empty state, or an error with a retry action.
3. Each list item shows the saved survey title, course code/title, current survey status, and submission time. It does not show answers.
4. The respondent can request the next page. The server returns only this respondent's rows and a continuation cursor when another page exists.
5. Selecting an item opens `/my-responses/:responseId`. The client calls the existing `GET /api/responses/:id` and renders the saved answers read-only. The page provides a link back to My responses.
6. A closed survey's response remains available. History visibility is based on response ownership; it does not depend on the survey being open or on eligibility to submit a new response.

**Reviewed policy decision:** A agrees that own saved history remains visible after later course unenrollment. The v1.1 mandatory checks below govern list, detail and denied new submission. A C3 on this revision is still required before tests.

## 3. API contract

### 3.1 List

`GET /api/responses/mine?limit={limit}&cursor={cursor}`

The route is added before the existing `/:id` route so the literal `mine` path is not parsed as an ID.

- Authentication and `RESPONDENT` role checks run before route/query validation, following current `app.ts` middleware order.
- `limit` is optional; default 20; valid integer range 1–50.
- `cursor` is optional and opaque to the client. It is a URL-safe encoding of the last returned row's UTC `submittedAt` and positive response `id`. The server validates its shape and maximum encoded length (256 characters). It is a page position, never an authorization credential.
- Each query filters by `respondentId = req.user.id`, even when a cursor is supplied. It does not filter by current survey status or current course enrollment.
- Sort order is `submittedAt DESC, id DESC`. The ID is a deterministic tie-breaker for equal timestamps.
- The server fetches at most `limit + 1` matching rows. It returns the first `limit`; `nextCursor` is built from the last returned row only when the extra row proves another page exists. Otherwise it is `null`. There is no total count.
- A cursor continues strictly before its timestamp/ID tuple in the same descending order. Newer submissions do not shift already traversed pages.
- Response metadata contains the current survey title/status and course code/title, plus the saved response ID, survey ID, and submission time. The list omits answers and respondent identifiers.

Success shape:

```json
{
  "responses": [
    {
      "id": 42,
      "surveyId": 7,
      "surveyTitle": "Course feedback",
      "surveyStatus": "CLOSED",
      "courseCode": "CPE334",
      "courseTitle": "Software Engineering",
      "submittedAt": "2026-11-25T10:00:00.000Z"
    }
  ],
  "nextCursor": "eyJzdWJtaXR0ZWRBdCI6Ii4uLiIsImlkIjo0Mn0"
}
```

An empty history is `200` with `responses: []` and `nextCursor: null`.

### 3.2 Existing detail

The existing `GET /api/responses/:id` remains unchanged. It returns the current response envelope and answers sorted by question position, and filters the row by the authenticated respondent ID. A missing or another respondent's ID returns the same `404 NOT_FOUND` response. No detail route or alternate permission path is added.

### 3.3 Errors and precedence

All errors retain the established envelope `{ "error": { "code", "message", "details"? } }`.

| Condition | Result |
|---|---|
| Missing, expired, or invalid session | 401 `UNAUTHENTICATED` |
| Authenticated owner requests respondent endpoint | 403 `FORBIDDEN` |
| Invalid `limit` or malformed/oversized `cursor` | 400 `VALIDATION_ERROR`, field details identify the invalid query field |
| Empty owned history | 200 empty page |
| Missing response ID or another respondent's response ID | 404 `NOT_FOUND` with the same public message/body shape |

Authentication and role errors take precedence over query errors because middleware runs before the route. No response or answer data is returned on any error.

## 4. Data and UI details

- Read existing `Response`, `Survey`, and `Course` fields only: response ID, respondent ownership, survey ID/title/status, course code/title, submittedAt, and answer details from the current detail endpoint.
- No table, column, index, migration, seed, answer, or lifecycle change is in scope.
- List and detail views are read-only and use the existing session/JSON API client.
- Navigation adds a **My responses** link for respondents only. Existing owner navigation and respondent survey navigation remain intact.
- List UI states: loading (announced with `role=status`), non-empty list, empty history, pagination control, and error (`role=alert`) with retry. Detail states: loading, saved answer view, missing/forbidden/session error, and a keyboard-accessible return link. No current response history is shown for an owner.
- The response detail view preserves identified-survey disclosure and existing saved answer semantics; it does not imply anonymity or allow edits.

## 5. Acceptance criteria

| AC | Requirement |
|---|---|
| AC-160 | A respondent can request the first page from `GET /api/responses/mine`; the endpoint is registered before `/:id`. |
| AC-161 | Every page contains only rows whose respondentId equals the authenticated respondent; no other respondent's identifiers or rows appear. |
| AC-162 | The list includes the respondent's own responses for PUBLISHED and CLOSED surveys, independent of current survey status and later enrollment changes. |
| AC-163 | Rows use stable descending `submittedAt`, then descending response ID order, including equal timestamps. |
| AC-164 | Omitting pagination inputs returns at most 20 rows and uses the documented default. |
| AC-165 | Valid limit values are integers 1–50; all invalid values and malformed or repeated query parameters return 400 with a field error; exact inputs are pinned in v1.1 below. |
| AC-166 | A valid continuation cursor returns the next older page without repeating or skipping owned rows in a fixed dataset, including when a foreign row is interleaved. |
| AC-167 | Equal-timestamp rows continue by response ID, with no duplicate or missing row across page boundaries. |
| AC-168 | A new response submitted after page one does not move newer rows into an already traversed cursor page. |
| AC-169 | `nextCursor` is non-null only when another matching row exists and is null on the final page. |
| AC-170 | Malformed, invalidly encoded, noncanonical or oversized cursors return 400 with a cursor field error; a valid foreign-position cursor never reveals foreign data. |
| AC-171 | A respondent with no saved responses receives 200, an empty array, and a null cursor. |
| AC-172 | List items include the specified survey/course/response metadata and omit answer contents. |
| AC-173 | A request without a valid session returns 401 before any query validation; no response data is returned. |
| AC-174 | An authenticated OWNER receives 403 from the list route before query validation; no response data is returned. |
| AC-175 | The existing detail endpoint returns the respondent's own full saved response in its current envelope and question-position order. |
| AC-176 | A foreign respondent's response ID and a nonexistent response ID produce identical 404 public error shapes. |
| AC-177 | Closing a survey after submission does not hide the owned list item or existing response detail. |
| AC-178 | Respondent navigation exposes My responses; owner navigation is unchanged, and the list/detail links work by keyboard. |
| AC-179 | A respondent can complete the read-only list → next page → detail → back journey; loading, empty, and error states do not display stale or fabricated rows. |

## 6. System test specification

| TEST | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-160 | AC-160 | API | Authenticated respondent with two saved responses | GET the list without pagination inputs | 200 list; route resolves to history, not ID parsing |
| TEST-161 | AC-161 | API/privacy | Two respondents with interleaved responses across two pages | Fetch all pages as respondent A | Every returned ID belongs to A; B's title/IDs are absent from every page |
| TEST-162 | AC-162 | API | Own responses tied to PUBLISHED and CLOSED surveys; later unenrolled | Fetch list/detail, then attempt a new submission | Both history reads return 200 with unchanged saved data; new submission returns 403 NOT_ELIGIBLE |
| TEST-163 | AC-163 | API | Multiple owned rows with distinct and equal submittedAt values | Fetch a page | Order is timestamp descending, then ID descending |
| TEST-164 | AC-164 | API | At least 21 owned rows | GET with no query | First page has 20 and a continuation cursor |
| TEST-165 | AC-165 | API/boundary | Limits 1, 50 and invalid cases enumerated in v1.1 | Request each exact query | 1/50 accepted; invalid values return 400 field details with no rows |
| TEST-166 | AC-166 | API/pagination | Fixed set larger than one page with interleaved foreign row | Follow nextCursor and try valid foreign-position cursor | Each owned row occurs once, no gap/overlap or foreign data |
| TEST-167 | AC-167 | API/boundary | More than one row has the same submittedAt around a page boundary | Traverse pages | ID tie-break preserves order and each row appears once |
| TEST-168 | AC-168 | API/concurrency | Fetch page one, then create a newer response, then follow its cursor | Request page two | Previously traversed rows are not repeated or shifted into page two |
| TEST-169 | AC-169 | API | Dataset with exactly limit rows and dataset with limit+1 | Fetch each page | Cursor null for exact final page; non-null only for more rows |
| TEST-170 | AC-170 | API/boundary | Invalid encoding, timestamp/ID shapes and bounds enumerated in v1.1 | Request list with each cursor | 400 cursor details; no rows returned |
| TEST-171 | AC-171 | API | Respondent has no responses | GET list | 200 empty list, null cursor |
| TEST-172 | AC-172 | API/projection | Own response has answers and linked survey/course | GET list | Required metadata matches rows; answer text/values are absent |
| TEST-173 | AC-173 | API/access | No session and malformed limit | GET list | 401 UNAUTHENTICATED, not query-validation data |
| TEST-174 | AC-174 | API/access | Owner session and malformed cursor | GET list | 403 FORBIDDEN, not cursor-validation data |
| TEST-175 | AC-175 | API | Respondent A owns a response with multiple ordered questions | GET its detail ID | Existing response envelope; answers ordered by question position |
| TEST-176 | AC-176 | API/privacy | A response ID owned by B plus a nonexistent ID | GET each as A | Same 404 status and public body shape for both |
| TEST-177 | AC-177 | API/integration | Respondent has own response; survey transitions to CLOSED | Fetch list and detail | Item and saved detail remain visible; no mutation occurs |
| TEST-178 | AC-178 | Client | Owner and respondent sessions | Inspect navigation and keyboard flow | Only respondent sees My responses; links/focus work; owner nav unchanged |
| TEST-179 | AC-179 | Client/E2E | Delayed first/next-page fetches, empty list, initial/next-page network failures and retries; saved closed-survey history | Assert each client state then complete list → next page → detail → back | Accessible loading/error/retry; failed next page preserves prior rows; retry appends once; read-only saved detail and back link work |

## 7. Product definition of done

- Contract is reviewed by A (C3) before tests or application code begin. Resolve the enrollment-history question in the contract/review record first.
- Create the listed API, client, and E2E tests; save meaningful RED output before implementation. Preserve IDs and report actual passed/failed/skipped test counts at exact commits.
- Implement only the Issue #88 Files list. Keep `GET /api/responses/:id` behavior and F-04 submission behavior unchanged. No schema/seed/migration changes.
- Run the targeted API/client/E2E checks available for the environment, then full relevant server/client regression and both builds; do not skip or weaken tests. Save outputs in `evidence/sprint-2/F-09/`.
- Run `git diff --check`, inspect branch status and diff, verify every changed path is in Issue #88 Files, and verify current-head CI on a PR to `sprint-2-staging`.
- Request A's review; B does not approve or merge this PR. Release/deployment evidence belongs to the coordinated D2 release.

## 8. Sequencing and handoff

Contract commit → C2 on Issue #88 → wait for A's C3 → test-only RED commit/output → implementation → GREEN evidence → PR/current CI → A's review and merge. Do not start F-07 shared answer-type edits or F-10 sections work in parallel. Record the F-07 answer DTO handoff after it receives its own reviewed contract.

## 9. Version history

| Version | Date | Change |
|---|---|---|
| 1.0 | 25 Nov 2026 | Initial F-09 contract; no tests or implementation started. |

## 10. Version 1.1 review clarifications — 26 November 2026

These exact inputs and outcomes refine the corresponding sections, AC and TEST rows above. Where v1.0 says optional or leaves a cursor/query/client oracle open, this section controls. No tests or implementation have started; A must review this committed version and post C3 before either begins.

- FR-13/BR-09 trace to NFR-02 (unauthenticated 401 with no private data), NFR-03 (negative wrong-role/wrong-owner API coverage) and NFR-07 (loading, empty and error states). History remains identified and read-only. The scoped `MyResponsesPage` handles `/my-responses/:responseId` itself. Existing `ConfirmationPage` expects `:id` and is outside Issue #88 Files, so it is not changed.
- After a respondent is unenrolled, owned history list and detail still return 200 and the same saved data. A new submission returns 403 `NOT_ELIGIBLE`. TEST-162 must assert all three results; this is mandatory, not optional.
- Only the single query keys `limit` and `cursor` are accepted. `limit` is one decimal integer string 1–50, with no sign, leading zero, exponent, fraction or whitespace; default is 20. Exact invalid cases for TEST-165: `0`, `51`, `-1`, `1.5`, `abc`, `01`, `+1`, `1e1`, whitespace, repeated `limit`, `limit[]`, unknown key and malformed percent escape. All return 400 `VALIDATION_ERROR` with offending-field details and no rows. Arrays and nested query objects are rejected, not coerced.
- The cursor is unpadded canonical base64url of UTF-8 JSON containing exactly `submittedAt` and `id`. `submittedAt` is a real UTC timestamp in canonical millisecond ISO form (`YYYY-MM-DDTHH:mm:ss.sssZ`); `id` is a JSON integer from 1 through 2147483647, matching positive PostgreSQL Int IDs. Encoded length is at most 256 characters. Decode once; reject padding, noncanonical encoding, invalid UTF-8/JSON, missing/extra keys, invalid dates, non-UTC/noncanonical timestamps, and ID `0`, negative, `2147483648`, fraction or string. TEST-170 requests each exact invalid value and expects 400 with cursor details and no rows.
- A syntactically valid cursor supplied by a different respondent is only a position; it is never an authorization credential. Continue with `respondentId` filtering on every page. TEST-161 creates interleaved A/B timestamps and checks every continuation page contains only A rows. TEST-166 follows all A pages and also sends a valid foreign-position cursor; it checks no A duplicate/gap and no B row, title or identifier.
- TEST-179 covers client loading before first and next-page responses, empty history, initial network failure then retry, next-page failure then retry, detail and back navigation. Loading has `role=status`; network failure has `role=alert` and a retry action. A failed next-page request retains earlier rows and does not append stale or duplicate rows; successful retry appends the correct page exactly once. Client assertions belong in scoped `client/tests/responseHistory.test.tsx`; E2E covers the selected saved-history journey.

### Version history continuation

| Version | Date | Change |
|---|---|---|
| 1.1 | 26 Nov 2026 | Resolve A's Issue #88 review: make unenrollment mandatory; pin cursor/query boundaries, continuation privacy and client retry oracles. No feature scope expansion or application change. |
