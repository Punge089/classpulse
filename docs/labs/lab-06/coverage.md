# Sprint 1 UAT case-to-contract coverage — B review v1.2

**Status:** Static review completed against the pinned Sprint 1 contracts and the source at sprint-2-staging commit 8c239225c75dc8f0f4db191797282ed9698850d4. All proposed cases remain NOT RUN. No runtime test, partner execution, PASS, defect, or acceptance is claimed. This is the developer team's proposed coverage map, not the independent UAT Team's required audit.

## Review basis

- Contract baseline: protected tag v1.0.0-sprint1 at d4bad74211729032697164f378638efb834a67b6.
- Contract text: four Sprint 1 files at 1fe3e3b82dfb0537be30223c9b598b3479b4affe; comparison confirmed those files are unchanged from the protected tag.
- Source inspected at 8c239225c75dc8f0f4db191797282ed9698850d4, including authentication, owner/respondent routes, validation, lifecycle, summary calculation, seed fixture, and relevant UI pages.
- This is a source/document review only. The application was not run; no browser UAT or database mutation was performed.

## Independent coverage audit required before freezing cases

The 20 November instructor clarification requires each independent UAT Team to make its own coverage assessment for the product it tests. This B-authored matrix helps the Product Team see proposed coverage and residual gaps; it does not substitute for C/D's independent audit of ClassPulse, and it does not assess the partner app on C/D's behalf.

Before freezing an inventory, the independent team should map important implemented requirements and AC branches to supplied case IDs and exact expected outcomes; mark coverage covered, partial, missing or unclear with reasons; propose concrete additional cases for important gaps; and record the Product Team's actual response and the agreed inventory version. Preserve residual gaps rather than waiving them to fit time. Follow the supplied [clarification and audit procedure](https://github.com/Punge089/classpulse/pull/75) once that PR is reviewed and integrated.

A coverage suggestion remains proposed until agreed. A no-genuine-defect conclusion requires the audit plus thorough actual execution of the agreed cases. Nothing in this static matrix establishes execution, a defect count, or acceptance.

## Case map

| Case | Purpose | Contracts / ACs | Source behavior checked |
|---|---|---|---|
| UAT-01 | Owner creates and publishes; respondent submits; confirmation and populated aggregate privacy | FR-02-09; BR-10; AC-10, 13, 18-21, 28, 30 (one response), 33-34 | Owner-scoped survey, respondent notice/confirmation/list badge, aggregate-only summary |
| UAT-02 | Empty-title UI validation, backend missing-required-answer rejection, rating boundaries | BR-02/07; AC-11 (partial), 19, 25 (partial) | Authoring validation, required answers, integer ratings 1-5 |
| UAT-03 | Wrong role and other-owner reads/write | BR-08; AC-16/17/32 | Role gate gives 403; owner-filtered resource lookup gives 404 |
| UAT-04 | Sequential duplicate attempt | BR-06; AC-22 (sequential branch), 28 (Submitted badge) | Unique-conflict handler maps duplicate to 409 ALREADY_RESPONDED; one stored response |
| UAT-05 | Close, reject new response, preserve old history/summary | BR-03/04; AC-15, 21, 23, 29 | Published-to-Closed transition; closed survey detail is hidden; eligible submission gets 409 |
| UAT-06 | Non-enrolled listing/detail/response | BR-05; AC-20, 24, 29 | Listing/detail omit non-enrolled survey; submission checks enrollment first and returns 403 NOT_ELIGIBLE |
| UAT-07 | Failed/successful login, reload and logout | FR-01; AC-02 (wrong-password portion), 03, 08; AC-01/04 UI portion | Invalid credentials share 401; /me requires a valid session; logout deletes session and clears cookie |
| UAT-08 | Zero-response summary | AC-31, 33-34 | Null average and zero buckets; UI says “No responses yet” and renders an em dash for null average |
| UAT-09 | Cross-respondent privacy and response immutability | BR-09; AC-21, 26-27, 33 | Other respondent gets 404; owner gets 403; PUT/DELETE routes are absent; summary is aggregate-only |
| UAT-10 | Invalid lifecycle transitions and Draft response denial | BR-03/04; AC-14, 23, 29 | Only DRAFT -> PUBLISHED -> CLOSED is legal; other transitions return 409 |
| UAT-11 | Optional question and two-response arithmetic | BR-07; AC-25 (optional answer), 30 (two-response subset), 33-34 | Omitted optional answer is not stored as zero; aggregates retain zero buckets/options |
| UAT-12 | Course ownership, representative role/auth boundaries | BR-08; AC-07 (representative), 12, 16-18, 27, 29 (partial) | Owner course lookup precedes field validation; wrong role 403; other owner 404; signed-out requests 401 |

## Residual AC coverage

| AC / group | Proposed manual coverage | Remaining limit |
|---|---|---|
| AC-01 | UAT-07 checks visible successful owner login | Cookie attributes and production Secure behavior are not inspected |
| AC-02 | UAT-07 wrong-password path | Unknown email, inactive user, identical messages, and response headers are not compared manually |
| AC-03/04 | UAT-07 checks /me after failed login and after logout | Does not replay the same old cookie, inspect session-row deletion, or verify clear-cookie attributes |
| AC-05/06 | None beyond normal login | Expiry, hash storage/verification, malformed-login logs and secret-log scans remain automated/review coverage |
| AC-07 | UAT-12 checks four signed-out endpoints | Does not cover every protected route and method or prove the full route matrix |
| AC-08 | UAT-01/UAT-07 cover respondent/owner visible flows in part | Does not independently verify every role-specific landing, logout and reload branch |
| AC-09 | None | Missing/non-string credentials and non-JSON login bodies are not manually sent |
| AC-11 | UAT-02 empty-title UI validation | The 121-character title, question-count, prompt-length, choice-option and wrong-type matrices remain supporting automated coverage |
| AC-12 | UAT-12 tests another owner's course with valid and empty titles | Non-positive/malformed courseId behavior is not manually covered |
| AC-16/17/18 | UAT-03/UAT-12 exercise listed owner routes and scope readbacks | Record each request separately; compare the exact route list against the pinned test matrix during execution |
| AC-22 | UAT-04 sequential duplicate | Simultaneous requests (one 201/one 409) are not manually covered |
| AC-25 | UAT-02 required-answer omission, invalid ratings 0/6/fraction/string, and valid endpoints 1/5 | Wrong body types, duplicate/foreign question IDs, wrong option IDs, extra fields and all malformed answer shapes are not covered |
| AC-28 | UAT-01/UAT-04 visible notice, confirmation and Submitted badge | Submit disabled while sending and stale-form 409 UI handling are not covered |
| AC-29 | UAT-05/06/10/12 status, enrollment and role boundaries | Non-numeric survey ID behavior is not manually tested |
| AC-30 | UAT-01 and UAT-11 exercise one- and two-response aggregates | Literal [4,4,5] -> 4.33 and half-cent rounding are not manual: only two CPE334 respondents are seeded |
| AC-31/33/34 | UAT-01/08/11 populated and empty aggregates | Manual observation still needs real sanitized evidence at execution |

The source contracts and developer tests remain authoritative. Partial coverage is disclosed, not waived. No case is PASS until every required step/subcase has an actual observation and evidence for the exact deployed release.

## Run-result rule

Create one record per materially different request/subcase. A case is PASS only when all required steps and state readbacks pass; any failed subcase makes it FAIL. If no step failed but a required step cannot run, mark it BLOCKED. Until a human tester executes it, it is NOT RUN. Independent UAT Team C/D alone records the acceptance decision.

## Version history

| Version | Editor | Change | State |
|---|---|---|---|
| Proposed 1.2, 24 Nov 2026 | Student B / book6349, AI-assisted follow-up (Codex GPT-6) | Distinguish the developer-authored case map from the mandatory independent UAT coverage audit; preserve static-only and NOT RUN status | A review pending; no UAT result claimed |
