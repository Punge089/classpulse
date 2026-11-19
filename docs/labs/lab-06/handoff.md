# ClassPulse Sprint 1 UAT handoff - proposed v1.1

**Status:** Student B's static review revision, proposed v1.1. It is not yet an agreed or executed UAT plan. No partner execution, result, defect, or acceptance is claimed. Product Team A/B and independent UAT Team C/D must freeze the actual version/accounts/case list before execution.

Read [the coverage review](coverage.md) and [the contract/source crosswalk](contract-extracts.md). Account labels "Owner A/B" below refer to synthetic application users, not the human team members. The shared kit's 03-RECORDS.md has blank templates; A's records-template.md is in PR #69 and becomes available after that PR merges. Human tester C/D assignments remain proposals.

## Student B review changes in v1.1

| Finding in proposed v1.0 | v1.1 correction |
|---|---|
| UAT-12 was mentioned before UAT-05 in prose but omitted from the primary sequence and UAT-05 preconditions. | Put UAT-12 before UAT-05 in both places. |
| The data rule could prohibit the deliberate duplicate response-submission probe required by UAT-04 / AC-22 or conflict with negative lifecycle probes. | Restrict only reuse of successful respondent/survey response-submission pairs; preserve the planned UAT-04 duplicate and other negative POST probes. |
| UAT-02 relied on browser validation for missing required answers and used only a rating question. | Add a backend empty-answers probe and both required question types; keep invalid-rating probes valid for the choice question. |
| UAT-07 did not check whether a bad login left a usable session. | Check /api/auth/me returns 401 after the failed login; this does not claim cookie-header inspection. |
| UAT-08 described the null-average UI as a hyphen. | Match the source UI's em dash (—). |
| cpUat allowed any nested path in several API route families. | Restrict the helper to documented method/path pairs, with positive numeric IDs; PUT/DELETE are allowed only for the deliberately absent response routes in UAT-09. |
| The file contained control characters in place of arrows and left some AC limits implicit. | Replace the control characters and list residual AC coverage in coverage.md. |
| The seed only supplies two CPE334 respondents. | Keep the literal AC-30 [4,4,5] example as supporting automated coverage; do not add a live respondent or mutate live data. |

## Release and handoff fields to verify before sending

| Field | Value or required action |
|---|---|
| Product team | Papangkorn Jitvoottikrai (`book6349`) and Punge089; add Punge089's full name and both student IDs to the final report |
| Other team's students and product | To be agreed and recorded |
| Sprint 1 baseline | `v1.0.0-sprint1`, commit `d4bad74211729032697164f378638efb834a67b6` |
| Deployment under test | Verify current main/source SHA, Cloud Run revision, image digest, URL, and traffic immediately before UAT; record all of them in the execution log |
| Candidate URL | `https://classpulse-zdwglar6eq-as.a.run.app/` - verify that this is serving the agreed release before handing it over |
| Accepted scope | Identified course surveys: login/logout; owner creates, publishes, closes and summarizes an own survey; enrolled respondent views and submits one response; access and validation rules. No Sprint 2/3 features are assessed. |
| Private credentials | Product team supplies synthetic account passwords to the other team through a private course channel. Never add values to Git, this document, screenshots, or the PDF. |
| Initial UAT slot / retest slot | Arrange and record both with the other team. Notify them before any deployment that could affect their test. |

### Account labels and data rules

- Owner A: `ann.lee@classpulse.test`, owns CPE334.
- Owner B: `ben.kim@classpulse.test`, owns CPE231.
- Respondents 1 and 2: `student1@classpulse.test` and `student2@classpulse.test`, enrolled in CPE334.
- Respondent 3: `student3@classpulse.test`, enrolled in CPE231 only.
- `server/prisma/seed.ts` at reviewed staging commit `8c239225c75dc8f0f4db191797282ed9698850d4` confirms these synthetic roles and enrollments. This verifies the repository fixture only; it does not prove deployed accounts exist or have authorized credentials. The seed requires `SEED_PASSWORD`; never record its value or run the development seed against live data.
- Give each execution a fresh run ID and use unique survey titles beginning `UAT6-<YYYYMMDD-HHmm>-<tester>-<case>` with the timestamp in Asia/Bangkok; record actual survey, question, option and response IDs. Within one run, UAT-04 is the only intentional repeat POST of a successful respondent/survey response-submission pair: Respondent 1 retries the already-successful S1 submission once to verify AC-22, and it must not create a second accepted response. Do not reuse successful respondent/survey pairs across runs. Other POSTs required by negative lifecycle or validation probes remain allowed.
- Primary sequence: **UAT-07 -> UAT-01 -> UAT-03 -> UAT-04 -> UAT-06 -> UAT-09 -> UAT-12 -> UAT-05 -> UAT-10**. UAT-12 must finish before UAT-05. Cases 02, 08 and 11 use independent surveys/data and can run separately. Coordinate the two testers on S1. Finish UAT-03, UAT-04, UAT-06, UAT-09 and UAT-12 before closing S1 at UAT-05 step 1; run UAT-10 afterward.
- UAT-01 creates shared survey S1. Save its two question IDs, choice option IDs and successful response ID. UAT-02 creates S2, UAT-08 S8, UAT-10 its own additional Draft S10, and UAT-11 S11. Label every record with the run ID. Never add extra valid answers to S1, whose expected count remains 1.
- For a full retest create a new run ID and fresh surveys, then repeat prerequisites; for a targeted retest document the exact setup recreated and use a fresh respondent/survey pair. Preserve earlier synthetic records for evidence; do not reseed, reset, delete, or edit live data. If prerequisite 01 fails, dependent cases are BLOCKED until an explicitly recorded equivalent fixture is agreed.
- Proposed whole session budget: 2-3 hours including setup/evidence. Agree enough time for all required subcases; do not silently omit them to fit a shorter slot.
- Do not reset or seed the live database during a partner session. Sprint 1 has no survey deletion or response deletion: test records remain as synthetic UAT data. The Product Team must agree on a safe cleanup/archive approach, or explicitly document retained test data; do not delete live records for cleanup without a reviewed procedure.
- Record each case's tester name, team, local date/time and timezone, tested URL/revision/commit, inputs/IDs, actual observation, PASS/FAIL/BLOCKED, and evidence ID. A blocked case is not a pass. Capture the rejection and an unchanged-state readback for negative cases.

### UI routes and common setup

Sign in at `/login`; owner list `/owner`; new survey `/owner/surveys/new`; owner detail `/owner/surveys/<ID>`; summary `/owner/surveys/<ID>/summary`; respondent list `/surveys`; form `/surveys/<ID>`; saved confirmation `/responses/<responseID>`. Record IDs from the address bar and API JSON; do not assume fixture numbers.

To create a case survey: sign in as Owner A, open New survey, select CPE334, enter the unique title, set question text/type and required checkbox, enter each choice option, then Create. Record the new ID and Draft state. Publish only when the case says to. After role changes, use logout/login and verify the displayed user/role; use separate browser profiles if maintaining owner/respondent sessions concurrently.

### API probe helper (manual user-driven checks)

Use only the agreed application's origin and synthetic UAT records. While signed in as the specified account, open browser Developer Tools -> Console. Read the code before executing; do not bypass a browser paste-protection warning blindly. If tooling cannot be used, record BLOCKED and ask the Product Team for written clarification. Do not replace the rejection check with a hidden-button observation.

Install this helper in each tab after a full navigation/reload as needed. It prints method/path/status and JSON, never request headers or cookies. These API probes supplement the manual UI journeys; the Product Team must not execute them on behalf of the independent testers.

```js
window.cpUat = async (path, method = 'GET', body) => {
  const verb = method.toUpperCase();
  const routes = [
    ["GET", /^\/api\/auth\/me$/],
    ["GET", /^\/api\/owner\/courses$/],
    ["GET", /^\/api\/owner\/surveys$/],
    ["POST", /^\/api\/owner\/surveys$/],
    ["GET", /^\/api\/owner\/surveys\/[1-9]\d*$/],
    ["GET", /^\/api\/owner\/surveys\/[1-9]\d*\/summary$/],
    ["POST", /^\/api\/owner\/surveys\/[1-9]\d*\/(?:publish|close)$/],
    ["GET", /^\/api\/surveys$/],
    ["GET", /^\/api\/surveys\/[1-9]\d*$/],
    ["POST", /^\/api\/surveys\/[1-9]\d*\/responses$/],
    ["GET", /^\/api\/responses\/[1-9]\d*$/],
    ["PUT", /^\/api\/responses\/[1-9]\d*$/],
    ["DELETE", /^\/api\/responses\/[1-9]\d*$/]
  ];
  if (!routes.some(([allowedMethod, pattern]) => allowedMethod === verb && pattern.test(path))) {
    throw new Error('Use only a documented endpoint/method with a positive numeric ID');
  }
  const r = await fetch(path, {
    method: verb, credentials: 'same-origin',
    ...(body === undefined ? {} : {
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    })
  });
  const raw = await r.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = { nonJson: true, length: raw.length }; }
  console.log(JSON.stringify({ method: verb, path, status: r.status, data }, null, 2));
  return { status: r.status, data };
};
```

During UAT-01 step 3, before submitting, run `await cpUat('/api/surveys/<S1 ID>')` with the actual numeric ID in the URL. From `data.survey.questions` record the RATING question `id`, SINGLE_CHOICE question `id` and Online option `id`. Create this synthetic-data object with **actual positive numeric IDs** replacing each zero:

```js
window.cpD = {
  surveyId: 0,
  ratingQuestionId: 0,
  choiceQuestionId: 0,
  onlineOptionId: 0,
  responseId: 0 // fill after successful UAT-01; from /responses/<ID>
};
```

For the "valid answer probe" in cases 04, 05 and 06, execute only when instructed, as the named account:

```js
{
  const ids = ['surveyId', 'ratingQuestionId', 'choiceQuestionId', 'onlineOptionId'];
  if (ids.some(k => !Number.isInteger(cpD[k]) || cpD[k] < 1)) {
    throw new Error('Record actual S1 IDs first');
  }
  await cpUat(`/api/surveys/${cpD.surveyId}/responses`, 'POST', { answers: [
    { questionId: cpD.ratingQuestionId, ratingValue: 4 },
    { questionId: cpD.choiceQuestionId, optionId: cpD.onlineOptionId }
  ] });
}
```

Other probes: `await cpUat('/api/owner/surveys/<ID>/close', 'POST')` prints status/body; use `/publish` for publish. GET examples omit method/body. Replace `<ID>` placeholders with the observed numeric IDs before execution. For each negative check capture rejection and authorized readback of unchanged status/count/answers. If a forbidden operation unexpectedly succeeds, record FAIL, preserve evidence and report it immediately; do not conceal or silently undo it.

## Executable cases - proposed, awaiting agreement

### UAT-01 - normal owner-to-respondent journey

**Purpose:** Complete the create-publish-answer-confirm-summary journey using one fresh identified survey.

**References:** FR-02-09; BR-10; AC-10, AC-13, AC-18-21, AC-28, AC-30 (single-response check), AC-33, AC-34. **Roles:** Owner A and Respondent 1. **Precondition:** Their accounts work; no survey exists with this case's unique title. **Input:** CPE334, title `UAT6-<YYYYMMDD-HHmm>-<tester>-01`, one required RATING question `Rate this class` and one required SINGLE_CHOICE question `Best format?` with options `Online` and `In person`; answers 4 and `Online`.

1. Sign in as Owner A. Create the survey for CPE334 with the two questions. Record its ID from the detail URL.
2. Verify the new survey is Draft, then publish it. Verify Published appears.
3. Sign out and sign in as Respondent 1. Open the published CPE334 survey. Check that the Identified notice appears before answering.
4. Submit rating 4 and `Online` once. Record the response ID from `/responses/<ID>` and displayed submission time. Update cpD.responseId. Reopen the respondent survey list.
5. Sign out and sign in as Owner A. Open that survey's summary. Inspect `/api/owner/surveys/<S1 ID>/summary` using cpUat after the stored response exists. No respondentId, email, fullName, actual respondent names/emails, or per-response rows may appear. This checks populated privacy, not only empty JSON.
6. Reopen `/owner` and confirm this survey has the right status and count. Record the actual displayed values.

**Expected:** The populated summary discloses no respondent identity or per-response rows. The submitted survey appears with a Submitted indicator for Respondent 1. A timestamped confirmation exists and the respondent's own answers are 4 and `Online`. The owner sees response count 1, rating average 4.00, rating bucket 4 count 1, `Online` count 1 and `In person` count 0. Save readable evidence for the form/notice, confirmation, and summary.

### UAT-02 - required-field and rating boundaries

**Purpose:** Reject missing/invalid inputs without saved data, and accept the integer rating endpoints 1 and 5.

**References:** BR-02, BR-07; AC-11, AC-19, AC-25. **Roles:** Owner A and Respondents 1/2. **Precondition:** Use a fresh title and separate published survey S2; neither respondent has answered it. **Input:** Title `UAT6-<YYYYMMDD-HHmm>-<tester>-02`, one required RATING question `Rate this class`, and one required SINGLE_CHOICE question `Best format?` with options `Online` and `In person`.

1. As Owner A, select CPE334 and enter valid required questions, but leave the title empty; attempt Create. Observe the field-level message and verify no survey was added. This is a UI check, not a claim that the backend returned AC-11's 400 response.
2. Create and publish S2. As Respondent 2, try to submit with both answers blank in the UI and record the required-field feedback. Before any valid submission, send `await cpUat('/api/surveys/<S2 ID>/responses', 'POST', {answers:[]})`. Expect 400 VALIDATION_ERROR with details for the missing required answers. As Owner A, verify responseCount remains 0.
3. Record S2's positive numeric rating-question ID, choice-question ID and Online option ID from `/api/surveys/<S2 ID>`. As Respondent 2, submit four separate API probes with ratingValue set to 0, 6, 2.5, and the string '3'; include a valid Online choice answer in each request so only the rating value is invalid. Each must return 400 VALIDATION_ERROR. As Owner A, verify responseCount stays 0 after every attempt; record the four subcases separately.
4. As Respondent 2, submit rating 1 and Online once in the UI. Save confirmation; Owner A verifies count 1 and average 1.00.
5. As Respondent 1, submit rating 5 and Online once in the UI. Owner A verifies count 2, average 3.00, rating buckets 1=1 and 5=1 with all others 0, and Online=2/In person=0. Do not submit either pair again.

**Expected:** Empty title is rejected in the UI; an API request missing both required answers is rejected without saving; invalid ratings 0, 6, 2.5 and string '3' are rejected without saving; integer 1 and 5 are accepted by different respondents. AC-11's remaining authoring shapes and AC-25's remaining malformed answer shapes are not covered here; see [coverage](coverage.md).

### UAT-03 - forbidden role and other-owner access

**Purpose:** Enforce owner role and survey ownership on the backend, including a forbidden write.

**References:** BR-08; AC-16, AC-17, AC-32. **Roles:** Respondent 1, Owner B, Owner A. **Precondition:** UAT-01 is published; record its survey ID and owner summary/count before the attempts.

1. As Respondent 1, navigate directly to `/api/owner/surveys/<UAT-01 survey ID>` and `/api/owner/surveys/<ID>/summary` on the tested origin. Record the HTTP status and visible error body. Do not submit a write request.
2. As Owner B, navigate to those same two URLs. Then attempt `POST /api/owner/surveys/<ID>/close` with the safe API probe procedure above. Record status and body.
3. As Owner A, reopen the survey and summary to confirm its status and response count are unchanged.

**Expected:** Respondent receives 403 `FORBIDDEN`, with no survey/summary data. Owner B receives 404 `NOT_FOUND` for both reads and the close attempt, with no survey/summary data. Owner A's survey remains Published and its count is unchanged. Record rejected responses and the owner readback.

### UAT-04 - one response per respondent

**Purpose:** Reject sequential duplicate submission while preserving the original response.

**References:** BR-06; AC-22, AC-28. **Roles:** Respondent 1 and Owner A (readback). **Precondition:** UAT-01 submission already succeeded; record its original response ID and answers.

1. Reopen UAT-01 from the respondent list. Observe its Submitted state; do not create a new survey.
2. Use the safe API probe procedure above while signed in as Respondent 1 to submit the same recorded answers again. Record the status and error code; do not include the session cookie in evidence.
3. Reopen the original response and have Owner A recheck the aggregate count.

**Expected:** A repeated API submission is 409 `ALREADY_RESPONDED`; the original answer remains 4 and `Online`, and count remains 1. If the API request cannot be made, mark this case BLOCKED rather than claiming it passed from the UI badge alone.

### UAT-05 - close and persistent history

**Purpose:** Close a survey, block further responses and preserve the original saved response and aggregates.

**References:** BR-03, BR-04; AC-15, AC-23 (Closed), AC-21 (saved readback), AC-29 (Closed). Response privacy/immutability is UAT-09. **Roles:** Owner A, Respondent 1 and Respondent 2. **Precondition:** Run after UAT-03, UAT-04, UAT-06, UAT-09 and UAT-12; UAT-01 remains Published; Respondent 2 has not answered UAT-01. Record the existing response ID and summary count.

1. As Owner A, close UAT-01. Verify its status is Closed and its existing aggregate remains readable.
2. As Respondent 2, verify S1 is absent from the published list, open `/surveys/<S1 ID>` and record the UI outcome. GET `/api/surveys/<S1 ID>` must return 404 NOT_FOUND. Run the valid answer probe with recorded S1 IDs; record 409 SURVEY_NOT_OPEN without exposing cookies.
3. As Respondent 1, reopen the saved UAT-01 response by its response URL/ID. As Owner A, recheck the summary count.

**Expected:** The closed survey does not accept a new response; direct submission returns 409 `SURVEY_NOT_OPEN` and no new response is stored. Respondent 1's original response remains readable by that respondent, and the aggregate count stays 1. Record before/after evidence.

### UAT-06 - enrollment boundary

**Purpose:** Exclude a non-enrolled respondent from listing, reading and answering the survey.

**References:** BR-05; AC-20, AC-24, AC-29. **Roles:** Respondent 3 and Owner A (readback). **Precondition:** UAT-01 is Published and belongs to CPE334; Respondent 3 is enrolled only in CPE231. Run before UAT-05; Owner A participates in the unchanged-count readback.

1. Sign in as Respondent 3. Check that UAT-01 is absent from the published survey list.
2. Navigate directly to `/api/surveys/<UAT-01 ID>` and record the status/body.
3. Run the safe API probe as Respondent 3 with the recorded IDs. Record status/body. Have Owner A verify response count is still 1.

**Expected:** The list does not disclose the survey; detail returns 404; submission returns 403 `NOT_ELIGIBLE`; count remains 1. Keep credentials/cookies out of evidence.

### UAT-07 - session behavior

**Purpose:** Check failed login feedback, a usable authenticated session after valid login, reload persistence, and user-visible logout.

**References:** FR-01; AC-02 (wrong-password portion), AC-03, AC-08; AC-01/04 user-visible portions only. Cookie flags, cookie replay, server-side row deletion, expiry, password hashing and log secrecy are not manually checked here. **Role:** Owner A. **Precondition:** A fresh signed-out browser session.

1. Sign in with a deliberately wrong password supplied privately. Record the visible error without capturing the password. While still signed out, run `await cpUat('/api/auth/me')`; expect 401 UNAUTHENTICATED with only the error object. This verifies no usable session, not the absence of a Set-Cookie header.
2. Sign in with Owner A's authorized synthetic credentials. Record the displayed name/OWNER role and /owner landing page.
3. Reload and verify the identity remains. Use the UI Logout action; verify it returns to /login. Run `await cpUat('/api/auth/me')` and expect 401 UNAUTHENTICATED after logout.

**Expected:** The bad-login message is shown; no usable authenticated session exists after the failed attempt; valid login shows the expected identity/role and survives reload; logout returns to login and the protected /me request returns 401. Do not capture credentials, cookies, or request headers.

### UAT-08 - empty aggregate and identity protection

**Purpose:** Verify zero-response aggregate values and empty-state presentation.

**References:** AC-31, AC-33, AC-34. **Role:** Owner A. **Precondition:** Create and publish a fresh CPE334 survey `UAT6-<YYYYMMDD-HHmm>-<tester>-08` with one RATING and one SINGLE_CHOICE question (`A`, `B`); no respondent answers it.

1. Open its summary in the UI and its `/api/owner/surveys/<ID>/summary` JSON as Owner A.
2. Record the displayed count, rating average, all rating buckets, and both choice counts. Inspect the JSON keys/values for respondent identity or individual response rows.

**Expected:** Response count 0, API average null (UI displays —), all rating and choice counts 0, and UI text `No responses yet`. The summary has no `respondentId`, `email`, `fullName` or per-response rows.

### UAT-09 - response privacy and immutability

**Purpose:** prove one respondent cannot read another's stored response and a submitted answer cannot be edited/deleted. **References:** BR-09; AC-26, AC-27. **Roles:** Respondents 1/2, Owner A. **Preconditions/input:** S1 response from UAT-01; original values 4/Online; count 1; run before closing S1. Record response ID.

1. As Respondent 2, `await cpUat('/api/responses/<S1 response ID>')`. Expect 404 NOT_FOUND and no response, answers or respondent identity.
2. As Owner A, GET the same response URL. Expect 403 FORBIDDEN with no response data. This differs from the permitted aggregate summary.
3. As Respondent 1, attempt `await cpUat('/api/responses/<response ID>', 'PUT', {answers:[{questionId:<S1 rating ID>,ratingValue:1}]})`, then `await cpUat('/api/responses/<response ID>', 'DELETE')`. Both must return 404 NOT_FOUND; these routes are absent in Sprint 1. Use only this synthetic response.
4. As Respondent 1, reopen `/responses/<response ID>` and API GET: original timestamp/answers remain. As Owner A, verify count 1, average 4.00 and Online count 1.

**Expected/evidence:** each denial plus original-state readback. If an edit/delete succeeds, FAIL and report immediately; the original expected values must not be silently updated.

### UAT-10 - illegal transitions and Draft access

**Purpose:** enforce DRAFT -> PUBLISHED -> CLOSED and no answering Draft. **References:** BR-03/04; AC-14, AC-23, AC-29. **Roles:** Owner A, Respondent 2. **Preconditions/input:** S1 already Closed by UAT-05; create an additional fresh Draft CPE334 survey S10 titled `UAT6-<run>-10` with one required RATING question `Draft test`; save its question ID as Owner A, do not publish it.

1. As Owner A, POST `/api/owner/surveys/<S1 ID>/publish`, then `/close`. Each must return 409 INVALID_TRANSITION; re-read owner detail after each and confirm still Closed. Original summary count stays 1.
2. As Owner A, POST `/api/owner/surveys/<S10 ID>/close`. Expect 409 INVALID_TRANSITION; S10 remains Draft with count 0.
3. As Respondent 2, check S10 absent from list; GET `/api/surveys/<S10 ID>` returns 404 NOT_FOUND. POST `/api/surveys/<S10 ID>/responses` with `{answers:[{questionId:<S10 rating ID>,ratingValue:4}]}` returns 409 SURVEY_NOT_OPEN. Owner A verifies count 0 and Draft status.
4. As Owner A, publish S10 normally (200 PUBLISHED), then attempt publish again. The second attempt must return 409 INVALID_TRANSITION, leaving Published and count 0.

**Expected/evidence:** all four illegal transitions reject, Draft visibility/submission reject, and no rejected operation changes protected state. Capture actual statuses and authorized readbacks, not just disabled UI buttons.

### UAT-11 - aggregate arithmetic and optional answer

**Purpose:** verify multiple answers, zero buckets and omission of an optional question. **References:** FR-03/08; BR-07; AC-25 (optional), AC-30/33/34. **Roles:** Owner A, Respondents 1/2. **Preconditions/input:** independent fresh S11, CPE334, title `UAT6-<run>-11`; required RATING `Overall`, required SINGLE_CHOICE `Format` (Online/In person), optional RATING `Extra` (uncheck required).

1. Owner A creates/publishes S11. Respondent 1 submits Overall=4, Format=Online, leaves Extra blank. Save confirmation ID/time and verify no Extra answer is shown/stored in the saved response JSON.
2. Respondent 2 submits Overall=5, Format=Online, Extra=1 once. Save confirmation ID/time.
3. Owner A opens UI summary and JSON. Expected: responseCount 2; Overall average 4.50, buckets 4=1/5=1 and all others 0; Online=2, In person=0; Extra average 1.00 with bucket 1=1 and others 0 (the omitted answer is not treated as zero).
4. Inspect populated JSON for respondent identities/individual response rows; none may appear. Reload summary and confirm unchanged values.

**Evidence/limit:** both saved submissions plus displayed/JSON results. This proves two-response arithmetic, not the literal AC-30 [4,4,5] -> 4.33 example or half-cent rounding. The existing seed has only two CPE334 respondents. If the teams agree a third synthetic enrollment and an exact-rounding subcase before freezing the handoff, add it with explicit expected counts and fresh data; no live reseed is permitted. Otherwise record the literal example as automated supporting coverage, not independently tested here.

### UAT-12 - course ownership, role boundaries and unauthenticated access

**Purpose:** Prevent authoring another owner's course and cross-role/unauthenticated access. **References:** BR-08; AC-07 representative coverage, AC-12, AC-16-18, AC-27, AC-29. **Roles:** Owner A/B, Respondent 1, signed-out user. **Preconditions/input:** S1 exists; record its ID, response ID, status and count. As Owner B, GET /api/owner/courses and record CPE231's positive numeric course ID; use a unique attempted title `UAT6-<run>-12-denied`.

1. As Owner A, GET /api/owner/courses: CPE334 is present and CPE231 is absent. As Owner B, check S1 is absent from the owned survey list. Save authorized before-state counts/status.
2. As Owner A, POST a survey-create request for Owner B's CPE231 with the valid unique title and required RATING question. Expect 404 NOT_FOUND. Repeat with an empty title; ownership must still be checked first and return 404. As Owner B, verify neither request created a survey.
3. As Respondent 1, request /api/owner/courses, /api/owner/surveys, POST /api/owner/surveys, and POST the S1 publish and close routes. Each must return 403 FORBIDDEN. Respondent detail/summary role denial is checked in UAT-03. After all write attempts, Owner A verifies S1 status/count are unchanged and Owner B verifies no survey was created.
4. As Owner B, POST /api/owner/surveys/<S1 ID>/publish. Expect 404 NOT_FOUND and verify S1 remains Published with the same count. Other-owner detail/summary/close checks are in UAT-03.
5. As Owner A, GET /api/surveys/<S1 ID> and POST /api/surveys/<S1 ID>/responses with the recorded valid answer body. Each must return 403 FORBIDDEN for the wrong role. Owner A confirms S1 count is unchanged.
6. Logout. As the signed-out user, GET /api/auth/me, /api/owner/surveys, /api/surveys, and /api/responses/<S1 response ID> using the helper. Each must return 401 UNAUTHENTICATED with only the error object. This is representative AC-07 coverage, not every protected route/method.

**Expected/evidence:** Record the status/body for each request and authorized before/after readbacks. Every denied attempt discloses no protected data and changes no survey or response. Create one result record per request group; any failed subrequest fails the case.

## Coverage and limitations to agree explicitly

The detailed AC-to-case map is in [coverage.md](coverage.md). These cases are proposals; every case begins NOT RUN. Listing an AC reference does not mean it was executed or fully covered. Keep the contract's residual developer-test obligations in force.

Known limits to agree before freezing the independent case list:

- AC-07 is represented by four signed-out requests in UAT-12, not every protected route and method.
- AC-11 and AC-25 include more invalid shapes than UAT-02 checks; see the explicit list in coverage.md.
- AC-22's simultaneous duplicate branch and AC-28's in-flight disabled-submit/stale-409 UI behavior are not manually covered.
- UAT-07 does not inspect cookie flags, replay an old cookie after logout, inspect session rows/expiry, verify password hashing, compare all failed-login variants, or inspect server logs.
- UAT-12 does not test AC-29's non-numeric survey ID, and UAT-02 does not test every AC-12 malformed courseId case.
- The seed has only two CPE334 respondents. UAT-11's two-response arithmetic does not prove the literal AC-30 [4,4,5] -> 4.33 result or half-cent rounding. Leave that example to supporting automated checks unless a separately scoped, controlled fixture is approved; do not add a live enrollment.
- UAT-01/UAT-08/UAT-11 inspect summary privacy; none of these manual cases replaces the complete automated route/security matrix.

UAT is not an exhaustive duplication of developer tests. Residual items remain in the Sprint 1 contract. Both teams must agree any added subcases before execution; do not silently drop a listed requirement or claim complete AC coverage because an ID appears in a table.

## Results, reporting and acceptance

Use the shared kit's blank R03-R07 forms (03-RECORDS.md); A's equivalent records-template.md is in PR #69 and is available after that PR merges. Default execution status is NOT RUN. Critical/major defects or required BLOCKED tests prevent acceptance. Minor limitations need explicit UAT Team acceptance. Only the independent team records the final decision for the exact tested release.

If no legitimate defect arises, follow the TA-controlled isolated exercise path in the master plan; do not manufacture a live defect or invent a finding.

## Version history

| Version | Editor | Change/reason | Review/agreement |
|---|---|---|---|
| Original supplied draft | Teammate attribution as supplied | Eight preparation cases; no execution claimed | No completed review inferred |
| Proposed 1.0, 19 Nov 2026 | A-assisted preparation | Preserve 01-08 IDs; add 09-12, strengthen boundaries/privacy/state checks and explicit limits | Review pending |
| Proposed 1.1, 19 Nov 2026 | Student B / book6349, AI-assisted draft | Fix case order/data-pair rule, add missing-answer backend probe and failed-login session check, correct empty-average display, restrict API helper, repair control characters, document seed limit and AC gaps | A review and partner agreement pending; not executed |
| Proposed 1.2, 19 Nov 2026 | Student B / book6349, AI-assisted follow-up (GPT-6 Luna) | Clarify that only successful respondent/survey response-pair reuse is restricted; permit planned negative POST probes; make S1 close ordering unambiguous; remove trailing blank line | A re-review pending; not executed |
