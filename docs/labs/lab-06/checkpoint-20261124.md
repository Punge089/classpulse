# Actual UAT checkpoint — 24 November 2026

Consolidated for Issue79 by Student A/Punge089 with Codex GPT-6. Earlier dated preparation states remain history. This checkpoint supersedes stale current placeholders; it is not a final independent acceptance. Source material is in the [evidence directory](../../../evidence/lab-06/checkpoint-20261124/README.md).

## ClassPulse: incoming independent results

C/D supplied EN-037_P5 identities C=Ashira Sansoda67070503445 and D=Thira Rungruangkaset67070503419. Their original progress reports passing behavior across original UAT-01–12, with disclosed API-created setup for08/10/11. A accepted only that setup deviation after execution; this is not acceptance of the whole product. Reports attribute tool operations to Codex under Thira, not presumed manual clicks by both students. Actual Ashira contribution/review remains to be evidenced.

The [received A2 response](../../../evidence/lab-06/checkpoint-20261124/received-cd-a2/EN037-TECHNICAL-RESPONSE-A2.md) records technical scope original12+CD-01–08, CD06 anonymous401 versus authenticated respondentPUT/DELETE404, and CD08 completion. At20:45:30 Bangkok, authenticated RESPONDENT identity returned200; candidate2147483647 with malformed `{answers:{}}` returned404NOT_FOUND; the original `{answers:[]}` probe immediately afterward also returned404. This is agreed external lookup-before-validation evidence, not direct database inspection. Earlier non-enrolled Draft403 and enrolled Closed409 observations remain separately retained.

CD01 inactive-account/controlled-session branches and CD07 third CPE334 respondent remain pending. Existing student3 must remain CPE231-only. No comprehensive no-genuine-defect conclusion, educational exercise entry or final acceptance is supported yet.

## Workflow: original serving release and agreed technical scope

C/D's fresh read-only gcloud mapping at20:51:51–58 Bangkok establishes original source `82a4806b5291b57ad7e76a28fb7d40e1e947b9a6`, revision `scd928edd-00007-477`,100%traffic and digest `sha256:6554d7f8cccdf1b4ded95f3f7d1a2560a786b0ecf7613cab62d59d942613a4fb`. Its immutable full source tag matches the serving digest. A observed the matching browser marker `82a4806b5291`; A did not independently inspect the partner's GCP console.

C/D technically accepted original01–06 and [PARTNER-ADD-01–06 A2](../../../evidence/lab-06/checkpoint-20261124/workflow-additional-cases-a2.md), including Unicode purpose/reason boundaries, storage trimming as exploratory, actual restart versus verified new-instance retrieval, and actual absent-edit-route status without inventing404/405. Fixture-dependent durability/expiry/assignment/event-failure experiments still require agreed setup. Technical agreement is not execution or final participant acknowledgement.

## A's actual independent Workflow run

Run `UAT6-20261124-A-210340`,21:03:40–21:09:45 Bangkok, Codex operated under Student A. Exact per-step UTC times, inputs, expected/actual observations and snapshots are in [A's result narrative](../../../evidence/lab-06/checkpoint-20261124/a-workflow/RESULTS.md) and [raw observations](../../../evidence/lab-06/checkpoint-20261124/a-workflow/observations.json).

| Case | Actual observed result | Evidence / qualification |
|---|---|---|
| UAT-01 | Request `e1cc8f10-ccb4-49b1-a391-3d44fd4e3f67`,125.50; blank-reason approval succeeded; requester readback APPROVED with exactly SUBMITTED→APPROVED. | Evidence02–07; expected behavior observed; run level browser qualification applies. |
| UAT-04 | Same01ID after logout/replacement tab/new login and reviewer reload;125.50,status and original two events unchanged;Approve/Reject controls both0. | Evidence08–10; literal new private-window creation was not verified. Optional app restart NOT RUN. |
| UAT-05 | Separate request `b1f4b385-04b4-4e7a-905f-7f9091e65db2`,300.00; blank rejection reason denied and reload retained SUBMITTED/one event; valid reason saved REJECTED and requester retrieved exact reason/two events. | Evidence11–17; UI validation observation, no inferred HTTP status. |

Browser setup: temporary ChatGPT in-app browser; exact engine/version and private-window flag not exposed. Explicit logout and a closed/replacement tab were used, with signed-out redirect/new authenticated sessions. C/D disposition or a literal private-window repeat is pending. These three paths have expected observed behavior; whole case final disposition/acceptance is pending. Both new records remain for readback. Final explicit logout observed. No existing record/admin/cloud changes or restart. A stale closed-tab evidence helper was rebound before04 credentials; tooling issue, not app defect.

B's02/03/06 remain NOT RUN by the latest supplied B handover; A's agent is not B's participation. Additional A01/A06 and unexecuted subcases remain NOT RUN. Required start notification/real availability/channel agreement remain human coordination tasks; user deferred discussion to25November, not a booked slot. No new live test is run by this consolidation.

## Workflow WF-BUG-001 correction status

Original discovery and regression design belong to Workflow. A's independent19:09:37 Bangkok confirmation found102400bytes→422 and102401bytes→500 versus expected413:2tests,1pass/1fail/0skip. Minor accepted by C/D;413 is the parser/client-error classification, not an explicit status in the original Sprint1 contract.

C/D supplied RED `0e4897310d8382ec915b6a122ba9121cad22c919` (build passed,1pass/1intendedfail/0skip), GREEN `84a62c781c730ecf5779c80be0607df7ce0fe74f` (2safety/7focused tests passed) and full CI[45407729755](https://github.com/osizk/WorkflowAndApprovalSystem/actions/runs/45407729755) with17pass/0fail/0skip and Dockerbuild. A inspected PR63's diff and verified that successful full-CI/head record through GitHub; A did not rerun the suite or give their teammate approval. [PR63](https://github.com/osizk/WorkflowAndApprovalSystem/pull/63) remained Draft/unmerged at inspection. Corrected live deployment and independent retest are PENDING. The live original82a4806 mapping is not corrected84a62c7. This partner defect does not satisfy ClassPulse PartD.

## Actual repository integration and remaining gates

- B approved A75/05134a3 and merged3425a5e after CI45404297275; A closed planningIssue74 after its14document checks/57links and10date assertions. Scope completion is not Lab6 completion.
- A approved/merged B76/fa3f181 atb98369c after32offline checks and CI45396597109. Initial local checker29pass/2fail were CRLF/apostrophe assumptions, retained and corrected; not product failures.
- A reviewed B78/49289a5 with16static documentation/SQL checks, gitdiffcheck and CI45408546110. After B marked Ready on unchanged head, A merged `cdcf460a1f928b15a197889b4bda21425902e1d3`. No fixtures were provisioned. [Fixture procedure](fixture-provisioning.md) still requires actual human target preflight and a separately scoped/reviewed executable mutator. B owns that next scope.
- Main remainsCP-V01 source1fe3e3b; staging documentation merges do not deploy it. Protected annotated Sprint1 tag remains peeled commitd4bad742; no history rewrite. Automations remain paused.
- Next A work: B-current-head review/merge as appropriate, future provisioner contract review, remaining agreed A coverage after real start notification, and corrected-live Workflow retest after deployment mapping. See [ClassPulse PartD readiness](part-d-readiness.md).
- Await actual B identity/availability/own UAT, C/D browser disposition/participant evidence/corrected Workflow release, human fixture setup, final decisions/PDF review and submission. Deadline extension is user-reported; official exact revised date is PENDING. Partner availability24–29November is not a deadline.

## Later C/D A3 disposition — received during Issue79 consolidation

The [received A3 disposition](../../../evidence/lab-06/checkpoint-20261124/received-cd-a3/EN037-A3-SETUP-DISPOSITION.md) supersedes the earlier pending browser-setup statements above. Under Thira's delegated technical review, C/D verified the A3 checksums and inspected snapshots, control counts and screenshots. They accept explicit logout, closed/replacement tab, observed signed-out redirect and fresh login for the recorded UAT-01/04/05 paths. A literal private-window repeat is unnecessary for these specific checks. Preserve the actual method; do not claim a private context was created.

The three recorded paths are now **PASS with accepted setup variation**:01 submission/approval/readback,04 signed-out/new-login persistence/terminal controls,05 blank-reason denial and valid rejection/readback. The [later disposition record](../../../evidence/lab-06/checkpoint-20261124/a-workflow/a3-later-disposition.json) is separate from unchanged original observations that correctly recorded disposition as pending at execution time. This is no new live run and no whole-product acceptance. Optional restart, cookie attributes/replay, expiry and controlled durability remain separate untested/setup-dependent assertions. Both request IDs are retained.

C/D also marked Workflow PR63 Ready on unchanged84a62c7 and requested osizk review. A verified that current remote status:open,not Draft,not merged. Its earlier Draft snapshots remain historical. Actual teammate approval, integration, corrected deployment mapping and independent retest still remain pending; the reattached original mapping is not a fresh cloud readback or corrected release.

Separately, B opened Issue80/contract-only PR81 at11e0a2193365ba0de917d9b781428495f2d798da. A completed16 offline contract/source checks, verified successful CI45416589669 and posted C3/PR approval, allowing B's C4 and RED-before-implementation work. The exact executable and any live apply are not approved; human target/private-input gates and real isolated-DB tests remain. This supersedes earlier wording that the future contract had not yet been proposed. A's evidence PR82 still requires B's current-head review/CI.

## B v2 actual results and Workflow release request

Received `ClassPulse_B_UAT_and_Provisioner_20261124_v2.zip` (SHA256`b6b04d0a2d81dfb000d2bb684ba7db5c2e0d47a355db84d961d8864500bb5309`):9 original payloads,8 listed checksums verified. A inspected both supplied screenshots. [B's report](../../../evidence/lab-06/checkpoint-20261124/b-workflow/RESULTS.txt), [raw observations](../../../evidence/lab-06/checkpoint-20261124/b-workflow/observations.json) and [later assessment](../../../evidence/lab-06/checkpoint-20261124/b-workflow/assessment.json) distinguish48 UI observations from case counts. Original run21:27:28–21:34:37 Bangkok was Codex GPT-6.1 Sol operated under book6349, with visible original marker82a4806b5291; full cloud mapping remains C/D's supplied evidence, not B's readback.

| Case | Actual evidence | Current disposition |
|---|---|---|
| UAT-02 |0.00/0.001/1000000.01 denied with no matching saved title;0.01 saved5ba5da73-7d7e-4bd1-9984-8b9e13ddc553 and1000000.00 saved0063548a-0d21-4685-ba19-6dea12c3e88c. Screenshot confirms both amounts. | Expected numeric UI behavior observed. Display1000000.00 differs from handoff example1,000,000.00; C/D disposition requested. Contract requires two decimal places/round-trip, not an explicit grouping separator, so no functional defect is established by that difference alone. |
| UAT-03 | Dedicated89.00 requestd27f11e6-a057-4a1f-b190-980688127c63 excluded from requester2/reviewer2 lists; direct details say Request not found without history/decision controls; requester1 readback retains SUBMITTED/one event. | Expected UI isolation/unchanged state observed; do not infer HTTP statuses. B's setup variation remains for C/D disposition. |
| UAT-06 | Later B-reported human DevTools execution at21:57:46.326 Bangkok returned403/FORBIDDEN; before/afterGET200 retain125.50/SUBMITTED/the same initial event and unchanged:true on9b734a22-085a-4f7f-a33f-3fe475c96012. | Scoped expected API denial observed. Screenshot does not show fresh marker or expanded identity; release/setup provenance remains qualified.21:34:21 is creation time, not execution time. |

The [human addendum](../../../evidence/lab-06/checkpoint-20261124/b-workflow/UAT06-human-result.txt) supersedes the original BLOCKED checkpoint for that one probe; it is a screenshot transcription, not an exported original API log. The original48 records remain unchanged. CSV clocks omit an explicit timezone; use raw JSON UTC and the stated Bangkok conversion, not a new guessed timezone.

B used one temporary IAB tab with explicit role logouts, not a verified fresh private/replacement tab per case. A's earlier accepted variation does not automatically sign off that different B setup. B posted a start notice to A in Issue77/comment7134381903, but actual private-channel relay is unverified. Preserve both qualifications and seek actual C/D disposition, not retrospective invented consent.

B accepts ADD02–05 ownership; A retains ADD01/06. ADD02 includes17 supplemental UI bounds/trim/Unicode attempts, with no measured HTTP422; API-only02e/f remain NOT RUN. ADD03 rejection boundaries and separate ASCII/Unicode500 saved reasons have evidence, but APPROVE501 was captured while Saving decision and needs a complete response repeat. ADD04/05 API cases and other incomplete branches remain NOT RUN. Do not sign full additional cases or whole-product acceptance from these observations.

The package's C3-pending provisioner text predates A's actual contract81 approval/C3 on11e0a21. No executable or provisioner tests are included. B may C4 then commit meaningful RED before implementation under Issue80; human target/private-input and exact executable review gates remain. No new ClassPulse fixtures were created.

C/D requested clearance to deploy [release PR64](https://github.com/osizk/WorkflowAndApprovalSystem/pull/64). A inspected exact release headeee7c7e93ee8d6e458d95bdd358762df9c2c6164, actual osizk approval and successful test-and-docker45418756758/deployment-checks45418757100. The release workflow's test/deploy jobs were skipped on the PR event; do not describe them as deployed. PR64 remains open/unmerged at that inspection. C/D's actual request is retained in [chat transcription](../../../evidence/lab-06/checkpoint-20261124/received-cd-a3/release64-request-from-chat.txt); prepared A clearance is not a sent message or deployment event. A has no active Workflow run and B's reported runs have ended. Hold new runs during deployment and await the corrected full source/marker/revision/digest/traffic/time before independent WF-BUG-001 retest. Keep original/new-release results separate and preserve A/B records. Neither final acceptance nor ClassPulse PartD is complete.
