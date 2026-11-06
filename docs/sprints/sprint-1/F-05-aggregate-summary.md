# F-05 — Aggregate survey summary

**Owner:** Student B (book6349) · **Reviewer:** Student A (Punge089) · **Issue:** #9
**Version:** 1.1 · **Date:** 6 Nov 2026
**Requirement:** FR-08. Depends on SR-01 and F-01.

## 1. Feature

Give a survey owner aggregate results for one of their surveys. The API returns response count, rating averages and distributions, and ordered choice counts. It returns no response-level rows or respondent identity. The owner screen presents these aggregates and a clear empty state.

## 2. Behaviour and workflow

1. An authenticated OWNER opens /owner/surveys/:id/summary for a survey they own.
2. The API resolves the survey and verifies ownership before querying response and answer aggregates. A missing or another owner's survey returns 404; a wrong role returns 403.
3. The API returns one aggregate object with each question in its original order, including zero-count rating buckets and options selected by nobody.
4. The UI shows the survey response count and per-question results using read-only RatingDots and choice-count bars. When there are no responses, it shows “No responses yet”.

## 3. Business rules and validation

- Rating average is the arithmetic mean rounded to two decimal places using round-half-up. Preserve decimal semantics at the half-cent boundary; for example, 4.335 becomes 4.34 and 4.345 becomes 4.35.
- Compute each rating average and distribution from RATING answer rows for that question only. A respondent who omitted an optional rating question contributes no rating answer and is excluded from that question's average denominator.
- Rating distribution always contains buckets 1 through 5, including zero-count buckets. If there are no ratings, average is null.
- Choice counts include every option in its stored position order, including zero-count options.
- responseCount is the count of submitted responses for this survey. Empty surveys return zero and zero for all count buckets.
- A respondent's ID, email, full name, or individual response/answer rows never appear in the summary JSON.
- Do not change response status or data while reading a summary.

## 4. Permissions

| Operation | Anonymous | Respondent | Owner |
|---|---|---|---|
| Read survey summary | 401 | 403 | Own survey only; otherwise 404 |

The check order is 401 unauthenticated → 403 wrong role → 404 missing, non-numeric, or not-owned survey → aggregate query. The backend enforces access; the client guard is only UX.

## 5. UI spec

- Add owner route /owner/surveys/:id/summary with accessible labels for the response count, rating distribution, average, and option counts.
- Show PulseLine while loading, “No responses yet” when the response count is zero, and a recoverable error alert if the API request fails.
- Use read-only RatingDots for rating summaries and bars for choice counts; keep options in their defined order and make counts available as text as well as visually.
- The page is aggregate-only and exposes no respondent identities or response-level editing controls.

## 6. API spec

Mount the owner-summary router at /api/owner/surveys behind requireAuth and requireRole("OWNER"). Register `GET /api/owner/surveys/:id/summary` in `PROTECTED_ROUTES` in the API test file.

| Method and path | Request | Success | Errors |
|---|---|---|---|
| GET /api/owner/surveys/:id/summary | No body | 200 {summary:{surveyId,status,responseCount,questions:[...]}} | 401 UNAUTHENTICATED; 403 FORBIDDEN; 404 NOT_FOUND for invalid/missing/not-owned survey |

For each RATING question return {questionId,prompt,type:"RATING",rating:{average,distribution:{"1":n,"2":n,"3":n,"4":n,"5":n}}}. For each SINGLE_CHOICE question return {questionId,prompt,type:"SINGLE_CHOICE",choice:{options:[{optionId,label,count}]}}. Keep question and option order stable. Error bodies follow {error:{code,message,details?}}; never return stack traces.

## 7. Data spec / migration

No schema change. Read Survey, Question, QuestionOption, Response, and Answer from SR-01. Implement summarize(questions, answers, responseCount): SurveySummary as a pure function in server/src/lib/summary.ts; the route in server/src/routes/ownerSummary.ts retrieves only the requested survey's data after the ownership check. Return aggregates only, never raw Response or Answer records.

## 8. Failure and boundary cases

- Missing, non-numeric, or another owner's survey IDs return 404; do not reveal whether another owner's survey exists.
- A RESPONDENT receives 403 and an anonymous request receives 401.
- Verify an empty response set gives responseCount 0, average null, and all-zero rating/choice counts.
- Verify round-half-up at exact half-cent boundaries as well as the AC-30 example; do not use binary floating-point Math.round(x * 100) / 100 as the only rounding step.
- Verify options with no selections remain present in option order.
- Search the serialized summary for respondentId, email, fullName, and seeded respondent identifiers; none may appear.
- Summary GET is read-only and returns no per-response rows.

## 9. Acceptance criteria

- AC-30: rating values [4,4,5] return average 4.33 and distribution {"1":0,"2":0,"3":0,"4":2,"5":1}; choice counts include zero-count options in option order.
- AC-31: zero responses return responseCount 0, average null, and all counts zero.
- AC-32: owner2 receives 404 for owner1's survey; student1 receives 403.
- AC-33: summary JSON contains no respondentId, email, fullName, or per-response rows.
- AC-34: owner summary UI shows response count and per-question results, with “No responses yet” when empty.

## 10. STS

| Test ID | AC | Level | Precondition & input | Action | Expected result | Planned file |
|---|---|---|---|---|---|---|
| TEST-33 | AC-30 | Unit | One RATING question with answers [4,4,5]; two boundary fixtures each contain 200 ratings: 133 ratings of 4 plus 67 of 5 (867/200 = 4.335), and 131 ratings of 4 plus 69 of 5 (869/200 = 4.345) | Call summarize separately with each literal 200-answer fixture | [4,4,5] averages 4.33 with its exact distribution; 4.335 rounds half-up to 4.34 and 4.345 rounds half-up to 4.35 | server/tests/unit/summary.test.ts |
| TEST-34 | AC-30 | API-DB | Published survey with one rating and one choice question; three responses contain ratings [4,4,5] and three Yes choices | GET summary as owner1 | 200 with expected average/distribution, response count 3, Yes count 3, No count 0, and stable option order | server/tests/api/summary.test.ts |
| TEST-35 | AC-31 | Unit | One rating and one choice question with no answers and response count 0 | Call summarize | responseCount 0, rating average null, all rating/choice buckets zero | server/tests/unit/summary.test.ts |
| TEST-36 | AC-31, AC-32 | API-DB | An empty survey with a RATING and SINGLE_CHOICE question belongs to owner1; owner2 and student1 are authenticated separately | GET summary as owner1, owner2, and student1; GET a missing numeric survey ID and a non-numeric survey ID as owner1 | Owner1 receives 200 with responseCount 0, rating average null, all rating buckets zero, and all option counts zero; owner2 receives 404 `NOT_FOUND`; student1 receives 403 `FORBIDDEN`; missing and non-numeric IDs both return 404 | server/tests/api/summary.test.ts |
| TEST-37 | AC-33 | API-DB | Summary fixture includes seeded respondent identities | Serialize the owner1 summary response and search identity keys and seeded emails/names | No respondentId, email, fullName, seeded respondent identifier, or per-response row appears | server/tests/api/summary.test.ts |
| TEST-38 | AC-34 | E2E | The TEST-40 I-10 journey has a survey with one rating and one choice question and a submitted response | Open its owner summary page; also exercise the empty state before submission | Response count and aggregate results are visible; empty state says “No responses yet” before any response | e2e/journey.spec.ts (owned by I-10) |

## 11. Completion evidence checklist

- [ ] Contract commit pushed before tests; C3 reviewed.
- [ ] TEST-33…TEST-37 written from this contract; TEST-38 included in I-10; no test skipped, disabled, or weakened.
- [ ] Red output saved to docs/sprints/sprint-1/evidence/F-05-red.txt and red commit recorded.
- [ ] Green output saved to docs/sprints/sprint-1/evidence/F-05-green.txt; server and client counts recorded.
- [ ] Traceability updated; PR targets sprint-1-staging and is reviewed by Student A.

## 12. Version history

| Version | Date | Author | Change |
|---|---|---|---|
| v1.0 | 6 Nov 2026 | Student B (book6349) | Initial contract based on plan I-09 and shared API/data contracts. |
| v1.1 | 6 Nov 2026 | Student B (book6349) | Incorporated C3: added literal 200-rating half-up fixtures, API coverage for empty summaries and invalid IDs, protected-route registration, and clarified that each average uses only submitted rating answers for its question. |
