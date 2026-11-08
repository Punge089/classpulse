# F-04 - Response submission

**Owner:** Student B (`book6349`) · **Reviewer:** Student A (`Punge089`) · **Issue:** #8
**Version:** 1.2 · **Date:** 7 Nov 2026
**Requirements:** FR-06, FR-07, BR-04, BR-05, BR-06, BR-07, BR-09, BR-10; depends on SR-01 and F-01.

## 1. Feature

Allow an authenticated respondent to find published surveys for enrolled courses, submit one identified response, and read their own saved response. Sprint 1 supports the RATING and SINGLE_CHOICE question types only. The server is authoritative for eligibility, status, answer validation, and duplicate prevention.

## 2. Behaviour and workflow

1. The respondent opens `/surveys`; the API returns only PUBLISHED surveys for courses in which the respondent is enrolled, with `hasResponded` for each item.
2. The respondent opens a survey and sees its questions and the notice: “Identified survey - your name is stored with your answers”. The detail endpoint returns 404 for a DRAFT or CLOSED survey or a respondent not enrolled in its course.
3. The respondent submits answers once. The server validates eligibility, survey status, and the full answer set, then stores one `Response` and its `Answer` rows in one database transaction.
4. The client shows a confirmation with the submission time and a link to the saved response. The list then shows “Submitted”.
5. A repeat submission receives the server's `ALREADY_RESPONDED` message; the form is not submitted again. The database unique constraint handles simultaneous submissions.

## 3. Business rules and validation

- Only enrolled respondents may submit. `POST /api/surveys/:id/responses` returns 403 `NOT_ELIGIBLE` when the survey exists but the respondent is not enrolled.
- Only PUBLISHED surveys accept responses. DRAFT and CLOSED surveys return 409 `SURVEY_NOT_OPEN` and store nothing.
- Each respondent may submit at most one response per survey (BR-06). Enforce this with the unique `(surveyId, respondentId)` database constraint; do not rely on a pre-check for concurrent requests. Map Prisma `P2002` on `Response` to 409 `ALREADY_RESPONDED`.
- Every required question must be answered exactly once. A RATING answer is an integer from 1 through 5. A SINGLE_CHOICE answer must select an option belonging to that question. Reject missing required answers, duplicate or unknown question IDs, unknown/mismatched options, malformed answer collections, out-of-range ratings, decimals, and string ratings with 400 `VALIDATION_ERROR` and field details.
- An optional question may be omitted; do not create an `Answer` row for it (BR-07). Store no answer for a question not answered.
- A respondent may read only their own response. Another respondent's response ID returns 404. Responses cannot be edited or deleted in Sprint 1 (BR-09).
- Do not return respondent identity fields in the response representation beyond the explicitly specified own-answer response shape. Never return password data or stack traces.

### Response check order

For protected endpoints, apply 401 unauthenticated, then 403 wrong role, then resolve a numeric resource ID and return 404 for a missing resource. For `POST /api/surveys/:id/responses`, after the survey exists, check enrollment first (403 `NOT_ELIGIBLE`), then status (409 `SURVEY_NOT_OPEN`), then answer shape and fields (400 `VALIDATION_ERROR`), then persist. This is the POST-specific order in addition to the shared route order. The survey detail GET intentionally returns 404 for an unpublished survey or a respondent who is not enrolled; it does not use the POST response code. TEST-26 and TEST-27 exercise the precedence: a non-enrolled respondent posting to a DRAFT survey gets 403, while an enrolled respondent posting invalid answers to a CLOSED survey gets 409. An unknown POST survey ID gets 404 before eligibility, status, or answer validation.

## 4. Permissions

| Operation | Anonymous | Respondent | Owner |
|---|---|---|---|
| List published surveys | 401 | Published surveys in enrolled courses only | 403 |
| Read survey detail | 401 | Enrolled + PUBLISHED; otherwise 404 | 403 |
| Submit response | 401 | Existing survey: enrollment 403 → status 409 → answer validation 400; one response only | 403 |
| Read response | 401 | Own response only; otherwise 404 | 403 |
| Edit or delete response | 401 | No operation; 404 | 403 |

## 5. UI spec

- `/surveys`: show only eligible published surveys, loading state with `PulseLine`, empty state when none are available, and “Submitted” for completed surveys.
- `/surveys/:id`: show the identified-survey notice before the form. Render rating questions with the shared `RatingDots`; render a single-choice question as its ordered options. Show field validation details and disable Submit while the request is in flight.
- On success, show the confirmation page with the submitted timestamp and response link. On a 409, show the server message and keep the form from resubmitting. On other errors, show a recoverable alert and remain on the form.
- The frontend role guard and button state are UX only; the API enforces all permissions.

## 6. API spec

All endpoints use JSON and require an authenticated session cookie `cp_session` unless marked public by the shared auth contract.

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `GET /api/surveys` | - | 200 `{surveys:[{id,title,courseCode,mode,status,hasResponded}]}` for PUBLISHED surveys in enrolled courses | 401 `UNAUTHENTICATED`; 403 `FORBIDDEN` for OWNER |
| `GET /api/surveys/:id` | - | 200 `{survey}` with questions and options | 401 `UNAUTHENTICATED`; 403 `FORBIDDEN`; 404 `NOT_FOUND` for non-numeric/missing ID, DRAFT/CLOSED survey, or non-enrolled respondent |
| `POST /api/surveys/:id/responses` | `{answers:[{questionId,ratingValue?} \| {questionId,optionId?}]}` | 201 `{response:{id,surveyId,submittedAt}}` | 400 `VALIDATION_ERROR` with `details[]`; 401 `UNAUTHENTICATED`; 403 `FORBIDDEN` or `NOT_ELIGIBLE`; 404 `NOT_FOUND` for invalid/missing survey ID; 409 `SURVEY_NOT_OPEN` or `ALREADY_RESPONDED` |
| `GET /api/responses/:id` | - | 200 `{response:{id,surveyId,submittedAt,answers:[{questionId,prompt,type,ratingValue?,optionId?,optionLabel?}]}}` for the current respondent's response. A rating answer includes `ratingValue`; a choice answer includes `optionId` and `optionLabel`. | 401 `UNAUTHENTICATED`; 403 `FORBIDDEN` for OWNER; 404 `NOT_FOUND` for invalid/missing/other respondent's response |
| `PUT /api/responses/:id`, `DELETE /api/responses/:id` | - | No route in Sprint 1 | 404 `NOT_FOUND` |

All error bodies follow `{error:{code,message,details?}}`; do not expose stack traces. Use `parseId` for path IDs. Use `loginAs` in API tests and append the protected routes to `PROTECTED_ROUTES` in the same test file change.

## 7. Data spec / migration

No schema change. Use `Survey`, `Question`, `QuestionOption`, `Response`, and `Answer` from SR-01. Insert the response and all submitted answers in one Prisma transaction. The database's unique `(surveyId, respondentId)` constraint guarantees the single-response rule. The question and option relationships must be checked before persistence; do not accept an option belonging to another question.

## 8. Failure and boundary cases

- Invalid/non-numeric/missing survey IDs return 404 without a 500 or stack trace.
- For POST, verify the specified 404 → eligibility 403 → status 409 → answer validation 400 ordering with requests that isolate each condition.
- Check both DRAFT and CLOSED status, an unenrolled seeded respondent, and a wrong-role owner.
- Reject malformed JSON, a non-array `answers`, missing required questions, ratings 0/6/2.5/`"3"`, duplicate/unknown question IDs, and an option ID belonging to another question. Accept ratings 1 and 5.
- Exercise sequential and simultaneous duplicate requests; simultaneous attempts must produce exactly one 201 and one 409 and persist exactly one Response.
- A respondent cannot fetch another respondent's response; the response JSON contains no other respondent identity. `PUT` and `DELETE` are absent.
- The UI handles double-click submission, disables Submit in flight, shows the 409 server message, and does not resubmit after confirmation.

## 9. Acceptance criteria

- **AC-20:** student1's list contains PUBLISHED CPE334 surveys only, excludes DRAFT and CPE231 surveys, and reports `hasResponded`.
- **AC-21:** a valid submission returns 201, stores one Response and one Answer per answered question, and the response GET returns them.
- **AC-22:** sequential duplicate submission returns 409 `ALREADY_RESPONDED` with exactly one stored Response; simultaneous submissions return one 201 and one 409 with exactly one stored Response.
- **AC-23:** submitting to DRAFT or CLOSED returns 409 `SURVEY_NOT_OPEN` and stores nothing.
- **AC-24:** student3, who is not enrolled in CPE334, receives 403 `NOT_ELIGIBLE` and nothing is stored.
- **AC-25:** invalid answers return 400 with details for each invalid field; ratings 1 and 5 are accepted.
- **AC-26:** student2 receives 404 when reading student1's response; response JSON does not disclose rating data for another respondent; `PUT` and `DELETE` are absent (404).
- **AC-27:** owner1 receives 403 when posting a response or reading a respondent response.
- **AC-28:** the respondent sees the identified-survey notice before answering; successful submission shows a timestamped confirmation; the list shows “Submitted”; Submit is disabled while sending; a 409 shows the server message without resubmitting.
- **AC-29:** student1 receives 200 for an enrolled PUBLISHED survey detail; receives 404 for a DRAFT or CLOSED survey, a survey in a non-enrolled course, or a non-numeric ID; owner1 receives 403.

## 10. STS

| Test ID | AC | Level | Precondition & input | Action | Expected result | Planned file |
|---|---|---|---|---|---|---|
| TEST-22 | AC-20, NFR-03 | API-DB | Seeded student1, owner1, student3; PUBLISHED CPE334 survey plus a DRAFT CPE334 survey and PUBLISHED CPE231 survey | GET `/api/surveys` as student1 and owner1 | Student1 sees only PUBLISHED CPE334 surveys with `hasResponded`; other statuses/course are excluded. Owner1 receives 403 `FORBIDDEN`, with no survey list in the response. | `server/tests/api/responses.test.ts` |
| TEST-23 | AC-21 | API-DB | Seeded fixture; published CPE334 survey with one rating and one choice question | Submit valid answers, then GET returned response ID | 201; one Response and the two matching Answer rows persist and are returned. Each answer has `questionId`, `prompt`, and `type`; the rating answer has `ratingValue`, and the choice answer has `optionId` and `optionLabel`. | `server/tests/api/responses.test.ts` |
| TEST-24 | AC-22 | API-DB | One published survey; student1 has already submitted | Submit the same valid answers again | 409 `ALREADY_RESPONDED`; Response count stays exactly 1 | `server/tests/api/responses.test.ts` |
| TEST-25 | AC-22 | API-DB | One published survey; student1 has not submitted | Send two identical POST requests simultaneously | Sorted statuses are `[201,409]`; Response count is exactly 1 | `server/tests/api/responses.test.ts` |
| TEST-26 | AC-23 | API-DB | CPE334 surveys in DRAFT and CLOSED states; student1 is enrolled in CPE334; unknown survey ID | Submit valid answers to each status, invalid answers to the CLOSED survey as student1, and a request with an unknown survey ID | DRAFT and CLOSED with valid answers return 409 `SURVEY_NOT_OPEN`; CLOSED with invalid answers also returns 409 before validation; unknown ID returns 404; no Response or Answer is stored | `server/tests/api/responses.test.ts` |
| TEST-27 | AC-24 | API-DB | DRAFT CPE334 survey; student3 enrolled only in CPE231 | Submit valid answers as student3 | 403 `NOT_ELIGIBLE` before DRAFT status is checked; no Response or Answer is stored | `server/tests/api/responses.test.ts` |
| TEST-28 | AC-25 | Unit | Question fixtures cover required/optional RATING and SINGLE_CHOICE; test table contains every AC-25 invalid shape | Call `validateAnswers` for each invalid input | Each case returns `ok:false` with expected field detail; optional omitted answer is valid and yields no answer row input | `server/tests/unit/responseValidation.test.ts` |
| TEST-29 | AC-25 | API-DB | Published survey with a RATING question | Submit values 1, 5, 0, 6, 2.5 and `"3"` in isolated cases | 1 and 5 return 201; 0, 6, decimal, and string values return 400 | `server/tests/api/responses.test.ts` |
| TEST-30 | AC-26 | API-DB | student1 has submitted to a published survey; student2 is logged in separately | GET student1's response as student2; then PUT and DELETE the response as student1 | GET by student2, PUT, and DELETE each return 404 `NOT_FOUND`; the GET response contains no response/answer values or respondent identity | `server/tests/api/responses.test.ts` |
| TEST-31 | AC-27 | API-DB | Owner1 authenticated; a respondent response exists | POST a response and GET that response ID as owner1 | Both requests return 403 `FORBIDDEN` | `server/tests/api/responses.test.ts` |
| TEST-32 | AC-28 | E2E | For each run, create and publish a fresh CPE334 survey through the owner UI with rating and choice questions and a run-unique title; student1 is eligible and has not answered this new survey | Open the new survey, inspect notice, submit, double-click Submit, then revisit list | Notice precedes form; one confirmation and response; button disables while sending; list says “Submitted”; server 409 message is shown without second submission. The test never reuses a seeded/demo survey or response. | `e2e/respond.spec.ts` |
| TEST-39 | AC-29 | API-DB | Seeded student1 enrolled in CPE334; PUBLISHED, DRAFT, and CLOSED CPE334 surveys; PUBLISHED CPE231 survey; owner1 authenticated | GET detail as student1 for each survey and for a non-numeric ID; GET the PUBLISHED CPE334 detail as owner1 | Student1 gets 200 only for the enrolled PUBLISHED survey and 404 for DRAFT, CLOSED, non-enrolled, and non-numeric IDs; owner1 gets 403 | `server/tests/api/responses.test.ts` |

## 11. Completion evidence checklist

- [ ] Contract commit pushed before tests; C3 reviewed.
- [ ] TEST-22…TEST-32 written from this contract; no test skipped, disabled, or weakened.
- [ ] Red output saved to `docs/sprints/sprint-1/evidence/F-04-red.txt` and red commit recorded.
- [ ] Green output saved to `docs/sprints/sprint-1/evidence/F-04-green.txt`; server, client, and E2E counts recorded.
- [ ] Traceability updated; PR targets `sprint-1-staging` and is reviewed by Student A.

## 12. Version history

| Version | Date | Author | Change |
|---|---|---|---|
| v1.0 | 6 Nov 2026 | Student B (`book6349`) | Initial contract based on plan I-08 and shared API/data contracts. |
| v1.1 | 6 Nov 2026 | Student B (`book6349`) | Incorporated C3: specified the response GET answer shape, added survey-detail AC/test coverage and write-route 404 assertions, clarified POST error precedence, and made TEST-32 create a fresh survey per run to avoid seeded response collisions. |
| v1.2 | 7 Nov 2026 | Student B (`book6349`) | Closed the NFR-03 gap noted in PR #13 by adding the owner-role `GET /api/surveys` 403 assertion to TEST-22; the route is already specified as respondent-only in §4. |
