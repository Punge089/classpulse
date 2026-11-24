# Sprint 1 contract extracts and source crosswalk — B review v1.2

**Status:** Static review material. These notes explain the Sprint 1 expectations used to review the cases; they do not change the contracts or record execution results.

## Pinned source

- Protected baseline tag: v1.0.0-sprint1 at d4bad74211729032697164f378638efb834a67b6.
- Contract text read at commit 1fe3e3b82dfb0537be30223c9b598b3479b4affe. The four contract files below were compared with the protected tag and were unchanged.
- Reviewed application source: sprint-2-staging at 8c239225c75dc8f0f4db191797282ed9698850d4.
- The tag/source references identify the contracts and code used in this static comparison. They do not identify the currently serving Cloud Run revision or image.

## Contract expectations used by the cases

### Authentication — F-01

| AC | Contract expectation |
|---|---|
| AC-01 | Valid login returns public user data and a cp_session cookie with HttpOnly/SameSite=Lax; Secure follows production mode. |
| AC-02 | Wrong password, unknown email and inactive account use the same 401 INVALID_CREDENTIALS response and set no session cookie. |
| AC-03 | A valid session can read /api/auth/me; no valid session gets 401 UNAUTHENTICATED. |
| AC-04 | Logout clears the cookie and deletes the session; replaying that same old cookie then gets 401. |
| AC-05 | An expired session is rejected with 401. |
| AC-06 | Password hashes are not plaintext; password and raw session token are not logged. |
| AC-07 | Every protected route without authentication returns 401 with only error data. |
| AC-08 | UI reports failed login; successful login shows name and role, lands by role, survives reload; logout returns to login. |
| AC-09 | Missing/non-string login fields and non-JSON login body return 400 VALIDATION_ERROR without session creation. |

Source: [F-01 authentication contract](https://github.com/Punge089/classpulse/blob/1fe3e3b82dfb0537be30223c9b598b3479b4affe/docs/sprints/sprint-1/F-01-authentication.md).

### Survey authoring and lifecycle — F-03

| AC | Contract expectation |
|---|---|
| AC-10 | Owner creates a CPE334 two-question Rating/Single Choice survey as Draft. |
| AC-11 | Invalid title, question count, prompt, option list, question type or question structure returns 400 VALIDATION_ERROR with field details. |
| AC-12 | Another owner's course returns 404 and stores nothing, even if other fields are invalid; malformed/non-positive courseId returns 400. |
| AC-13 | Draft publish returns 200 and Published. |
| AC-14 | Re-publish or close from an illegal state returns 409 INVALID_TRANSITION with status unchanged. |
| AC-15 | Published close returns 200 and Closed. |
| AC-16 | Respondent access to every protected owner route returns 403 FORBIDDEN and does not create a survey. |
| AC-17 | Another owner gets 404 for survey read/publish/close and changes nothing. |
| AC-18 | Owner survey/course lists contain only the caller's records; survey list includes accurate response counts. |
| AC-19 | UI shows Draft then Published; empty title displays an inline message. |

Source: [F-03 authoring contract](https://github.com/Punge089/classpulse/blob/1fe3e3b82dfb0537be30223c9b598b3479b4affe/docs/sprints/sprint-1/F-03-survey-authoring.md).

### Respondent flow and access — F-04

| AC | Contract expectation |
|---|---|
| AC-20 | Respondent list includes only published surveys in enrolled courses and indicates prior submission. |
| AC-21 | Valid submission stores one response and an answer for each answered question; respondent can read their own saved response. |
| AC-22 | Sequential duplicate returns 409 ALREADY_RESPONDED; simultaneous duplicate gives one 201 and one 409 with one stored response. |
| AC-23 | Draft/Closed submission returns 409 SURVEY_NOT_OPEN and stores nothing. |
| AC-24 | Non-enrolled student gets 403 NOT_ELIGIBLE and no response is stored. |
| AC-25 | Invalid answer payload returns 400 with field details; valid rating endpoints are integers 1 and 5. |
| AC-26 | A respondent cannot read another respondent's response (404); PUT/DELETE are absent (404). |
| AC-27 | Owner cannot post a response or read a respondent response (403). |
| AC-28 | UI displays identified notice, timestamped confirmation and Submitted state; disables submit while sending; stale 409 is shown without resubmission. |
| AC-29 | Enrolled published detail returns 200; Draft/Closed, non-enrolled or non-numeric IDs return 404; owner role gets 403. |

Source: [F-04 response contract](https://github.com/Punge089/classpulse/blob/1fe3e3b82dfb0537be30223c9b598b3479b4affe/docs/sprints/sprint-1/F-04-response-submission.md).

### Aggregate summary — F-05

| AC | Contract expectation |
|---|---|
| AC-30 | Ratings [4,4,5] produce average 4.33 and buckets 1=0, 2=0, 3=0, 4=2, 5=1; zero-count choices remain in option order. |
| AC-31 | Empty survey summary has responseCount 0, null average and zero counts. |
| AC-32 | Another owner receives 404; a respondent receives 403 for owner summary. |
| AC-33 | Summary JSON contains no respondentId, email, fullName or per-response rows. |
| AC-34 | Owner UI shows count/results and the exact empty text “No responses yet”. |

Source: [F-05 summary contract](https://github.com/Punge089/classpulse/blob/1fe3e3b82dfb0537be30223c9b598b3479b4affe/docs/sprints/sprint-1/F-05-aggregate-summary.md).

## Static application behavior checked

| Behavior | Source path at reviewed commit | Case implication |
|---|---|---|
| Failed/unknown/inactive login shares the generic 401; /me is protected; logout deletes session and clears cookie | server/src/routes/auth.ts, server/src/middleware/auth.ts | UAT-07 should claim only observable session behavior; cookie flags/replay/expiry remain untested |
| Owner course ID is validated, then ownership is checked before remaining survey fields | server/src/routes/ownerSurveys.ts | UAT-12 should expect 404 for another owner's course even when title is empty |
| Owner-only route middleware and caller-filtered survey lookups | server/src/app.ts, server/src/routes/ownerSurveys.ts, server/src/routes/ownerSummary.ts | Wrong role is 403; another owner's survey/summary is 404 |
| Respondent list/detail is limited to Published surveys in enrolled courses | server/src/routes/surveys.ts | UAT-06/10 expect hidden list and 404 detail for non-enrolled or non-open survey |
| Response creation checks enrollment before status, then validates answers and persists; unique conflict is 409 | server/src/routes/responses.ts, server/src/lib/responseValidation.ts | Non-enrolled request is 403 NOT_ELIGIBLE; enrolled Draft/Closed request is 409 SURVEY_NOT_OPEN; invalid answers are 400 |
| Only Draft->Published and Published->Closed are allowed | server/src/lib/surveyLifecycle.ts | All other lifecycle requests are 409 INVALID_TRANSITION without a state change |
| Summary returns aggregate values only; null average becomes UI em dash; empty view says No responses yet | server/src/lib/summary.ts, client/src/pages/owner/SurveySummaryPage.tsx | Corrects UAT-08 display and supports UAT-01/08/11 aggregate checks |
| Respondent UI displays identified notice, confirmation time/answers, Submitted badge | client/src/pages/respondent/AnswerSurveyPage.tsx, ConfirmationPage.tsx, SurveyListPage.tsx | Supports the specific visible UAT-01/04 checks; no runtime claim |

## Synthetic fixture and fresh-run method

The seed source at reviewed commit 8c239225c75dc8f0f4db191797282ed9698850d4 defines these test labels and roles:

| Label | Synthetic login | Role / owned or enrolled data |
|---|---|---|
| Owner A | ann.lee@classpulse.test | OWNER; owns CPE334 |
| Owner B | ben.kim@classpulse.test | OWNER; owns CPE231 |
| Respondent 1 | student1@classpulse.test | RESPONDENT; enrolled in CPE334 |
| Respondent 2 | student2@classpulse.test | RESPONDENT; enrolled in CPE334 |
| Respondent 3 | student3@classpulse.test | RESPONDENT; enrolled only in CPE231 |

The repository seed requires the environment variable SEED_PASSWORD, but this document never records its value. The code confirms fixture definitions only; it does not prove the accounts are provisioned in the current deployment or that the team has authorized credentials.

For a new execution round, choose a new run ID and fresh timestamped survey titles. Recreate the needed surveys through the app, retain previous synthetic records, and use new respondent/survey pairs for any retest that needs a successful submission. Do not run seed/reset/delete operations on live data. UAT-04 is the only planned same-run duplicate POST and exists solely to verify rejection after one successful submission. If a fixture/account is absent, block the affected cases and ask the authorized human operator; do not create live enrollments or accounts.

## Lab 6 process clarification; Sprint 1 contract unchanged

The instructor clarification supplied on 20 November 2026 changes the Lab 6 UAT process, not the pinned Sprint 1 contract text or its expected outcomes. It requires an independent coverage audit and, only after thorough actual UAT finds no genuine defect, the standardized educational exercise described in [Issue #74](https://github.com/Punge089/classpulse/issues/74) and [PR #75](https://github.com/Punge089/classpulse/pull/75). The announcement's original publication author/date were not independently verified.

This crosswalk remains a static reference to the existing contract and reviewed source. It does not authorize editing contract ACs, changing expected results, weakening automated tests or bypassing CI/branch controls. No no-defect conclusion or exercise is recorded here. Any permitted exercise must use a new Sprint staging commit, preserve blinded independent discovery, and be followed by the normal RED/GREEN, regression, teammate review, required CI, corrected deployment and independent retest. The healthy baseline and human cloud gates remain intact.

## Version history

| Version | Editor | Change | State |
|---|---|---|---|
| Proposed 1.1, 19 Nov 2026 | Student B / book6349, AI-assisted draft | Pin contract/source bases, crosswalk AC expectations and code behavior, verify seed roles, describe safe fresh-run method and residual coverage | A review pending; static only |
| Proposed 1.2, 24 Nov 2026 | Student B / book6349, AI-assisted follow-up (Codex GPT-6) | Record that instructor clarification supplements Lab 6 process but does not change the pinned Sprint 1 contracts; preserve static-only status | A review pending; no execution result claimed |