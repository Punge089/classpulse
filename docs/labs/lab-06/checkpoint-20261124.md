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
