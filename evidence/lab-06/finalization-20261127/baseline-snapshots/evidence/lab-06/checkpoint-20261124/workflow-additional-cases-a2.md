# A/B proposed additional Workflow UAT cases revision A2

Independent coverage-review proposals from Student A/Punge089 assisted by Codex, 24 November2026. Revision A2 addresses B's actual static review of A1. EN-037_P5 Product Team agreement on these revisions and final inventory is still PENDING; B's static review is not C/D acceptance. Every case/subcase is NOT RUN. Keep supplied UAT-01–06 unchanged and add stable PARTNER-ADD-01–06 IDs only after agreement.

Basis: [Sprint 1 contract v0.6](https://github.com/osizk/WorkflowAndApprovalSystem/blob/82a4806b5291b57ad7e76a28fb7d40e1e947b9a6/docs/sprints/sprint-1/contracts.md), [SRS](https://github.com/osizk/WorkflowAndApprovalSystem/blob/82a4806b5291b57ad7e76a28fb7d40e1e947b9a6/docs/srs.md), and supplied revised DOCX. Proposed test release fullSHA82a4806b5291b57ad7e76a28fb7d40e1e947b9a6/marker82a4806b5291. The Product Team explicitly says serving revision/source/traffic verification is still pending; no formal runtime result is claimed.

## Common execution rules

Use https://scd928edd-4d7hbszvwq-as.a.run.app/login and synthetic requester1/requester2/reviewer1/reviewer2 accounts. Verify role/assigned reviewer and sign out between role changes, or use agreed isolated sessions. Record exact request IDs from the app (do not assume numeric IDs), run ID, full version/revision confirmation, actual tester/operator/AI assistance, Bangkok timestamp, browser, inputs, expected/actual, per-subcase outcome and sanitized evidence. Same-origin API requests use the normal browser session and documented endpoints with JSON; no credentials/cookie/header dumps. Notify each other before deployment. No database/assignment/clock mutation, seed, reset, record deletion or cloud operation is authorized for A/B by these proposals.

Normal titles use `UAT-<case>-<initials>-<HHmmss>` plus a description. Exact title-boundary subcases need the explicit exception below. Valid POSTs create durable synthetic data; retain it. Stop an affected chain after unexpected success, preserve the actual result and start a fresh agreed fixture for remaining negative tests. A successful subcase does not make its sibling subcases PASS. Authorized readbacks show external saved state, not every DB row or transactional interleaving.

Default valid create body: `{title: runTitle, purpose: 'Purchase stationery for the team', amount: '125.50'}`. POST /api/requests returns201 with `{request:...}`; record its ID, assigned reviewer, SUBMITTED status and exactly one SUBMITTED event. Decisions use POST /api/requests/<actual-id>/decision. Lists use GET /api/requests and details GET /api/requests/<actual-id>. Session API is /api/session (different from ClassPulse /api/auth).

## PARTNER-ADD-01 Authentication and server session

Refs AC-01/02/03, FR-01. Proposed A lead. Preconditions: fresh signed-out private session; synthetic role accounts and privately supplied access; agree an unknown synthetic login.

1. Submit one wrong-password login for an existing account and one unknown-login request to POST /api/session. Use a throwaway synthetic password. Expect401 INVALID_CREDENTIALS and the same generic message; GET /api/session afterward expects401 AUTH_REQUIRED. Record each attempt separately; no session should be created.
2. Sign in correctly as requester1 and GET /api/session. Expect200 with only id and role, role REQUESTER, no password hash/session token. Verify reload keeps the identity. Repeat identity/role check as reviewer1 in a separate ordinary sign-in.
3. DELETE /api/session to log out: expect204. GET /api/session and protected list/detail then expect401 AUTH_REQUIRED with no request data. DELETE /api/session again expects204, including already signed out. State-changing requests must include the normal origin context.
4. Inspect cookie attributes only with values masked: HttpOnly/SameSite=Lax/Path and Secure under HTTPS, lifetime matching eight hours. If tooling cannot observe attributes, record the subcase limitation.

Capture sanitized status/code/message and role/UI identity for each action. Current-browser401 after logout is not proof of server rejection of a saved old cookie. Exact eight-hour expiry/old-cookie replay requires an agreed secret-safe controlled method; do not alter clocks/session tables or record raw tokens. Keep those branches pending/supporting evidence until arranged, not silently covered by step3.

## PARTNER-ADD-02 Title purpose and payload boundaries

Refs AC-05, BR-09/01. Proposed B lead. Preconditions requester1 with valid preset reviewer; valid default body; owned list baseline; fresh tracking for each successful creation.

Change only the named field in each request; other fields valid. POST /api/requests uses amount as STRING `'125.50'` throughout. Successful boundary cases expect201 and persisted normalized text/amount/SUBMITTED/one initial event. Every invalid case expects422 VALIDATION_ERROR with relevant field error and no saved record for that attempt.

| Subcase | Exact input | Expected |
|---|---|---|
| 02a title lengths | ASCII `'T'.repeat(n)` for n=2,3,120,121 separately | 2/121 invalid;3/120 accepted |
| 02b purpose lengths | ASCII `'P'.repeat(n)` for n=9,10,2000,2001 separately | 9/2001 invalid;10/2000 accepted |
| 02c trimming | title `'  ABC  '` and valid purpose; separately a title or purpose of three spaces | Trimmed title ABC accepted; each blank-only field invalid |
| 02d Unicode | title `'T'.repeat(119)+'😀'`; then `'T'.repeat(120)+'😀'` | 120 Unicode code points accepted;121 invalid. Count using Array.from(value).length, not UTF-16 .length |
| 02e client identity claim | Otherwise valid body plus requesterId set to a different authorized fixture's actual ID | Unexpected key422; no new request |
| 02f client status claim | Otherwise valid body plus status `'APPROVED'` | Unexpected key422; no new request/history |
| 02g purpose Unicode bounds | `'P'.repeat(8)+'😀'`, `'P'.repeat(9)+'😀'`, `'P'.repeat(1999)+'😀'`, `'P'.repeat(2000)+'😀'` separately | Code-point lengths9/10/2000/2001 respectively:9/2001 rejected422;10/2000 accepted201. Keep run marker in a different valid title |

For exact title bounds omit the normal title prefix and place the run marker in a valid purpose and evidence record; confirm this exception first. For purpose bounds keep the marker in a valid title. Do not change the measured field to add identification. Use API probes when browser min/max constraints prevent sending the exact input. After each attempt re-read the authorized list, and accepted detail when created; identify actual saved IDs rather than inferring from UI validation. Original UAT-02 already covers monetary0.00/0.001/0.01/1000000.00/1000000.01 and stays required.

## PARTNER-ADD-03 Rejection and approval reason limits

Refs AC-11/BR-05. Proposed B lead. Preconditions requester1 creates fresh SUBMITTED record assigned to reviewer1; capture ID,125.50THB, status and single initial history event. Reviewer1 performs each API call on that record until it is successfully terminal.

1. POST decision `{decision:'REJECT',reason:'   '}` ->422, no decision write.
2. POST `{decision:'REJECT',reason:'R'.repeat(501)}` ->422, no decision write.
3. POST `{decision:'APPROVE',reason:'R'.repeat(501)}` ->422, no decision write.
4. After EACH rejection retrieve detail under the authorized role; expect unchanged SUBMITTED/amount and one SUBMITTED event. Record separate status/field error and readback for steps1–3.
5. Create a SEPARATE fresh record and reject with exactly500 code points: `{decision:'REJECT',reason:'R'.repeat(500)}`. Expect200 REJECTED, exact saved reason and one terminal event after SUBMITTED. Requester1 independently retrieves the saved result. A padded-reason storage probe is exploratory unless the Product Team explicitly agrees its storage expectation: the contract specifies the length/nonblank check after trimming, but does not clearly mandate whether the saved reason itself is trimmed. Record actual storage without imposing a new requirement. This does not waive the contracted validation-after-trimming rule.

Additional proposed Unicode reason subcases, subject to C/D agreement: on a fresh SUBMITTED request,03u-501 uses `{decision:'REJECT',reason:'R'.repeat(500)+'😀'}` (501codepoints)->422 with unchanged state/history;03u-500 then uses `'R'.repeat(499)+'😀'` (500codepoints)->200 REJECTED with one terminal event and saved supplied reason. Keep all markers outside the reason, count with Array.from(value).length, and use a separate request from the ASCII500 boundary.

UAT-05 already checks a completely empty reason and normal valid rejection. UAT-01 approval omits the optional reason; confirm null saved reason in that case when available. Do not attempt a valid boundary on an already terminal record and misclassify409 as validation422.

## PARTNER-ADD-04 Repeated and competing decisions

Refs AC-12/BR-06/07. Proposed B lead with actual operators recorded. Preconditions: first branch only AFTER A completes UAT-04 on the same UAT-01 APPROVED record; second branch uses a fresh SUBMITTED record assigned to reviewer1.

1. As reviewer1 repeat APPROVE on the UAT-01 ID; then try REJECT with a valid reason. Each expects409 DECISION_CONFLICT. After each, authorized detail must remain APPROVED with the original two events/reason/amount unchanged. Test the REJECTED terminal branch on a separate completed rejection record if agreed; do not disturb original comparison evidence.
2. On a fresh SUBMITTED request prepare two eligible decision calls, one `{decision:'APPROVE'}` and one `{decision:'REJECT',reason:'Synthetic concurrent decision check'}`. Dispatch exactly once each with Promise.all in an authorized reviewer1 session (or agreed equivalent). Label both responses separately.
3. Expect exactly one200 and one409 DECISION_CONFLICT. Retry the losing decision once ->409. Retrieve saved detail as requester1 and reviewer1: terminal status matches the winner, exactly one matching terminal event follows SUBMITTED, amount unchanged. Retain winning reason/null as applicable.

Promise.all is an external competing-call probe; do not assert exact transaction overlap or forced rollback from it. A network/dispatch block is not PASS. Reruns use a new request; no request loop or load test. Agree session isolation with A/B and the Product Team before concurrent testing.

## PARTNER-ADD-05 Backend role assignment and immutability

Refs AC-07/08/09, BR-01/02/04. Proposed B lead. Fresh requester1-owned request assigned to reviewer1 with125.50THB/SUBMITTED/one event; record actual ID.

1. As reviewer2 POST decision APPROVE for that ID ->404 NOT_FOUND, generic response without request/history disclosure. Reopen as requester1 and confirm unchanged ID/amount/status/history.
2. As requester2 GET /api/requests/<requester1-id> ->404 NOT_FOUND and list excludes it. Original UAT-03 checks the corresponding UI; this subcase records backend result. Authorized readback unchanged.
3. As reviewer1 POST /api/requests with otherwise valid create body ->403 FORBIDDEN. Confirm no owned request or decision event was created; authorized owner/assigned reviewer readbacks must remain unchanged. Original UAT-06 separately retains requester-decision403.
4. Proposed unsupported edit probe: PUT /api/requests/<owned-submitted-id> with `{title:'Synthetic attempted edit'}` as requester1. Product Team must confirm this method/path and expected status before this subcase is frozen. Contract promises no supported edit operation and unchanged saved state, but does NOT specify the exact unsupported-route status. Expect no successful edit, then read back original title/purpose/amount/status/history. Do not invent404/405 as a contracted expectation.

Unexpected-key ownership/status validation is ADD-02, so do not count it as a performed ADD-05 check unless actually run and cross-referenced.

## PARTNER-ADD-06 Keyboard mobile and durable retrieval

Refs AC-14/NFR-01/NFR-04. Proposed A lead. Use agreed fresh submission/decision data and the exact verified release. Record actual browser and viewport; proposed desktop1366x768 and mobile390x844.

1. Complete the sign-in/create/submit/review/decision/retrieve journey using keyboard controls, with visible focus and labels; trigger an invalid required field and verify associated readable error. Record the actual focus path and each material failure, not a generic accessibility certification.
2. At the agreed mobile viewport inspect login, create form, detail and decision screens: content/actions reachable without page-level horizontal overflow; labels, status and errors available as text. Preserve evidence for each relevant screen.
3. Choose the actual operation BEFORE execution. Preferred06c-R is a Product-Team/human-operated actual restart of the tested application process/instance on the SAME source/image and database, after the record is created/decided. Record what was restarted, operator, resource/instance/revision and actual stop/start times; independently retrieve the SAME ID as both authorized roles and compare amount/status/history/reason. Alternative06c-N is creation of a NEW instance on the same source/image and database, only if the Product Team agrees this separate scope. Record it as new-instance retrieval, not a restart of the previous process. Show that the new instance actually handled the retrieval (for example correlated sanitized instance/request evidence); existence of another instance or a load-balanced request alone is insufficient. If that evidence is unavailable, record the new-instance assertion as unproven/BLOCKED rather than substituting it for restart coverage. Reconfirm serving version afterward.

Step3 remains setup-dependent; do not restart their service yourself. Original UAT-04 fresh-session persistence is separate and does not prove an app restart. Source setup/build/test evidence and forced event-insertion rollback require separately attributed controlled developer evidence, not a claim made from successful UI retrieval.

## Additional fixture-dependent coverage questions

AC-06 absent/wrong-role reviewer mapping and self-assignment DB refusal, AC-13 forced event-insertion rollback, and exact session expiry need an agreed isolated fixture/supporting method from the Product Team. We do not propose destructive live probes. Please supply the scope/method or an explicit residual-limit disposition; a developer test is not relabeled as A/B independent UAT. Important agreed requirements must not be silently dropped for time.

## Workflow Product Team disposition requested

| Proposed case | Response / reason / revisions | Setup and precise expected status clarifications | Responder/time | Final required subcases |
|---|---|---|---|---|
| PARTNER-ADD-01 | PENDING EN-037_P5 | PENDING | PENDING | PENDING |
| PARTNER-ADD-02 | PENDING EN-037_P5 | Prefix exception/Unicode/payload agreement | PENDING | PENDING |
| PARTNER-ADD-03 | PENDING EN-037_P5 | PENDING | PENDING | PENDING |
| PARTNER-ADD-04 | PENDING EN-037_P5 | Concurrent-call/session/data agreement | PENDING | PENDING |
| PARTNER-ADD-05 | PENDING EN-037_P5 | Confirm unsupported PUT route/status in05.4 | PENDING | PENDING |
| PARTNER-ADD-06 | PENDING EN-037_P5 | Viewports/keyboard scope and restart method | PENDING | PENDING |

Inventory freeze, actual A/B division acceptance, serving-version record, private access, test/retest times/channel and every executed result remain pending. Student A has deferred appointment/channel planning to25November; no date/time or deadline is invented by this proposal.

## Revision A2 disposition of B feedback

B reviewed A1 statically on24November, not by app execution. A2 adds purpose and reason Unicode code-point boundaries, keeps padded-reason storage exploratory until agreed, and splits actual restart06c-R from separately agreed new-instance retrieval06c-N. All original/additional IDs and original outcomes remain stable; the new subcases require C/D disposition. Their serving-version record, actual appointments/channel, final inventory and B personal availability remain pending. Earlier A1 ZIP is preserved unchanged; this file is the new proposed revision.
