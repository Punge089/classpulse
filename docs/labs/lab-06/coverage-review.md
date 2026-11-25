# Independent UAT coverage review

## Current status — 25 November 2026, exact-command supporting result received

**TEST-05: supporting PASS; independent live expiry: OPEN; final acceptance and ClassPulse Part D: PENDING.** C/D operator Codex GPT-6.2 Sol under Thira/D ran `npm test -- tests/api/auth.test.ts` at CP-V01 `1fe3e3b82dfb0537be30223c9b598b3479b4affe`, 20:30:14-20:30:18 Bangkok: **8 passed, 0 failed, 0 skipped, exit 0**. This was a fresh localhost `classpulse_test` database; serving revision **N/A**. A reviewed the supplied artifacts and pinned source, without rerunning the app. [Evidence and limits](../../../evidence/lab-06/checkpoint-20261124/received-test05-exact-20261125/a-review.json); [report/output/proof](../../../evidence/lab-06/checkpoint-20261124/received-test05-exact-20261125/README.md).

TEST-05 asserts /me200 before backdating fixture expiresAt and /me401 UNAUTHENTICATED afterward. The default reporter confirms the full eight-test file, not a separate HTTP transcript. This supports stored-session expiry rejection; it does not establish the deployed eight-hour TTL. CD01 inactive login/CD07 aggregate remain scoped PASS; preserve survey26/responses13-15. Remaining coverage, both product decisions, ClassPulse PartD and the reviewed final PDF/submission remain open. No code/schema/shared-file/release/cloud/live-data change was made. B must review this Issue106 evidence update; prior PR103 is already merged. Current A assistance: Codex GPT-6, artifact/report work only.

Earlier dated receipt/method statuses below are history; the later received result above supersedes their NOT RECEIVED state.

## Historical status — 25 November 2026, companion review before TEST-05 receipt

**CD-01 inactive login and CD-07 exact aggregate are PASS within the recorded scope**, now supported by C/D's received [JSON](../../../evidence/lab-06/checkpoint-20261124/received-cd-r2-20261125/fixture-case-results.json) and [summary image](../../../evidence/lab-06/checkpoint-20261124/received-cd-r2-20261125/CD07-summary.png), which A reviewed against the preserved report. Inactive user17: before/login/after401 with INVALID_CREDENTIALS at login. Survey26: baseline0; respondents3/5/16 -> responses13/14/15, ratings4/4/5; count3/average4.33, distribution0/0/0/2/1, Online3/In person0; aggregate values agree across API/UI/image without respondent identities. Four active logout204/identity401 observations do not prove controlled expiry/replay. Preserve survey26/responses13–15. [Artifact assessment](../../../evidence/lab-06/checkpoint-20261124/r2-companion-review-20261125/companion-review.json).

**A confirms existing TEST-05 as supporting automated verification only.** C/D may run exact CP-V01 source `1fe3e3b82dfb0537be30223c9b598b3479b4affe` against an isolated local `classpulse_test` target and return actual output. The test backdates fixture expiresAt, then asserts /me401; it does not wait out the live8-hour TTL. Supporting execution/result remains **NOT RUN / NOT RECEIVED** here. **Independent live expiry remains OPEN; final acceptance remains PENDING.** See [method, isolation and return evidence](session-expiry-support.md). No production TTL, code, schema, shared file, deployment or live data change is part of this approval.

C/D run `UAT6-20261125-CodexD-R2` was25Nov17:49:22–17:52:43Bangkok; operator Codex under Thira, model unspecified. Exact reported CP-V01 source is `1fe3e3b82dfb0537be30223c9b598b3479b4affe`, revision `classpulse-00006-6w6`; the earlier narrative supplies digest `sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795`/100% from A's00:36:54mapping. The JSON retains source/revision but states digest/internal wording was removed. No fresh cloud mapping in that run is claimed. Its live origin/asset and unverified-notice/operator limitations remain; no Ashira participation or retrospective start approval is inferred.

Human setup/A READ ONLY postchecks, B's corrected provisioner review/139tests and PR82/84/85 merges are separate completed records; closed Issues79/80 cover their scoped documentation/tool work, not Lab6 completion. WF-BUG-001 is fixed/independently verified/closed for Workflow, not ClassPulsePartD. Remaining coverage, **ClassPulse PartD**, both product decisions and final PDF/submission remain incomplete. No exercise defect is selected. This block stays within new Issue102's Lab6-owned files; Lab7/Sprint2/shared changes require prior coordination. Automations remain paused.

This status supersedes historical missing-companion/report-only statements below. Original received bytes and prior receipt states remain unchanged. No proposed supporting test is presented as executed or as independent live UAT.

## Latest verified state —24November2026, after WF-FIX-001 retest

- Workflow WF-BUG-001 independent corrected-live retest **PASS**:2original boundary tests plus5supplemental checks,0failures/skips,23:03:13–15Bangkok. Full sourcead2cbef67decf9953219694898327dea0bb66034; markers before/afterad2cbef67dec; revision00008-9zd,100%. [Independent result](../../../evidence/lab-06/checkpoint-20261124/a-wf-bug-retest/INDEPENDENT-RETEST.md). C/D cloud mapping is attributed; A checked served source/browser and remote deployment. All A/B business records were left untouched.
- [C/D's latest B-v2 dispositions](../../../evidence/lab-06/checkpoint-20261124/received-cd-corrected/EN037-B-V2-DISPOSITION.md) accept the recorded same-tab/logout02/03 paths, numeric1000000.00 display and scoped06denial; no repeat solely for those capture limits. Earlier original82a4806 snapshots remain historical. B06 still lacks a fresh marker/expanded identity in its screenshot; predeployment C/D readback corroborates release continuity without inventing that capture. The six original Workflow paths have scoped PASS evidence; required unexecuted additional branches and whole-product acceptance remain pending.
- ClassPulse [actual read-only baseline](../../../evidence/lab-06/checkpoint-20261124/fixture-baseline/README.md) completed22:53:02Bangkok:target emails absent, student2id5/student3id4, student3CPE231-only. No accounts created. This is an agent-observed point-in-time snapshot, not human-approved live apply.
- B contract81 merged6dc55d8 after exact-head approval/CI. B implemented PR83; A ran138server tests/build/typecheck at294efc4 but independently reproduced a normalized-email concurrency race and [requested changes](../../../evidence/lab-06/checkpoint-20261124/repository/PR83-REVIEW.md). No live fixture apply until B's regression/fix and new A review, then human target/baseline approval and execution.
- C/D still needs the new inactive/third-respondent fixtures for CD01/CD07, controlled-session coverage disposition and actual peer contribution evidence. ClassPulse PartD is incomplete. The Workflow fix and provisioner review do not substitute. A sends the scoped retest return; B fixes83 and reviews82 at its current head. Final acceptance/PDF/human submission remain pending. Automations remain paused.

Earlier dated paragraphs below retain the sequence of evidence received. Where they say corrected deployment/retest, B setup disposition, live email absence, or provisioner implementation is pending, this latest section supersedes them. Raw incoming/execution files are unchanged.

Use this before freezing the initial case list for **each product**. The independent UAT Team owns the assessment, using the actual Sprint 1 requirements/ACs and Developer Team handoff. ClassPulse's existing [coverage table](coverage.md) is an input; C/D must form their own judgment rather than copying its conclusions. A/B do the equivalent audit on the partner app. Follow the [instructor clarification](instructor-clarification.md).

## Procedure

1. Obtain the actual delivered scope/ACs and baseline/tested version. Distinguish Sprint 1 requirements from later-sprint features. Record the independent reviewer names/time.
2. Map important requirements/AC branches to the supplied case IDs and specific expected outcomes. Mark covered, partial, missing or unclear, with reasons and user impact. Developer tests may support confidence but do not become independent UAT results.
3. Examine boundaries, invalid/malformed input, role/ownership/enrollment, state/history and unusual actions. Propose additional concrete cases where important gaps remain. Every addition needs a stable ID, AC reference, role/preconditions/synthetic inputs, numbered actions, expected result, protected-state readback and sequence/data implications.
4. Send suggestions/questions to the Product Team; record actual disposition and reasons. An important unmet requirement cannot be waived simply to fit time. Seek TA clarification if scope/access is genuinely disputed. Freeze a versioned inventory containing original and agreed additional cases.
5. Execute the full agreed inventory, with both student participants and actual operator/AI assistance recorded. If exploration finds a new issue, preserve the observation and turn it into a reproducible case/finding; do not retroactively invent an executed case. Keep original/retest results separate.
6. Only conclude “no genuine defects found” after this audit and thorough actual execution support it. Document residual coverage limitations explicitly. An important agreed case that is BLOCKED or NOT RUN is not evidence of a sound no-defect result.

## ClassPulse suggestions for C/D to evaluate independently

Historical proposal examples from20November: these were candidate additions, not executed/agreed cases at that date or hints for an introduced defect. Current24November technical agreement/results are recorded below. C/D choose and refine cases from their own assessment. Existing IDs UAT-01–12 stay stable; proposed additions use UAT-CD-01 etc. A/B use PARTNER-ADD-01 etc. for the other app.

| Area / AC | Gap or unusual action to consider | Concrete expectation from contract |
|---|---|---|
| BR-02 / AC-11 | Title 120 versus 121 characters, prompt length, 0/21 questions, invalid/duplicate options | Valid boundary accepted; invalid field rejected with 400 VALIDATION_ERROR via API and no saved survey; UI validation distinguished from backend result |
| BR-07 / AC-25 | Required SINGLE_CHOICE omitted while rating valid; foreign question/option, duplicate question, malformed answer shapes | 400 with field details, no response stored; optional omission accepted rather than treated as zero |
| BR-06 / AC-22 | Two simultaneous valid submissions on one fresh eligible pair | Exactly one 201 and one 409 ALREADY_RESPONDED, one stored response; preserve both results and owner count |
| AC-28 / state change | Owner closes while respondent form is already open; double-click Submit | Closed submission gets clear server error/no stored response; in-flight Submit disabled and successful first request not duplicated |
| AC-07/12/17/27/29 | Protected verbs/routes not yet checked; owner create on other course; malformed ID; cross-role write | Contract-specific 401/403/404/400, no disclosure and unchanged protected state; use the exact contract matrix |
| AC-04 / authentication | Browser logout alone does not prove the old server session invalidated | Controlled secret-safe support for old-session rejection; do not expose/copy cookie values into evidence. Record coverage limitation if unavailable |
| AC-30 | Only two CPE334 responders cannot prove literal [4,4,5] -> 4.33 or decimal half-cent boundaries | Agree a controlled synthetic fixture or distinguish supporting automated evidence; do not live-reseed or add unauthorized enrollment |

These examples are ordinary contract coverage, publicly shared before any exercise choice. Do not tell the independent testers which one, if any, is later used as the educational exercise.

## R11 coverage audit and additional-case record

```text
Product / Product Team:
Independent UAT Team / actual reviewers / time:
Requirements/AC document and version:
Tested product baseline/release:
Supplied handoff/case inventory version:
Important AC or branch:
Existing case IDs and exact expected outcome:
Independent assessment: covered / partial / missing / unclear
Reason and user impact:
Proposed additional case ID / purpose:
Role, preconditions and fresh synthetic inputs:
Numbered actions:
Expected status/UI/data outcome and unchanged-state readback:
Dependencies/order/retention/evidence to collect:
Product Team response / actual agreement / time:
Final inventory version and required case/subcase list:
Execution/retest record references (only when actually performed):
Residual limitations / escalation if needed:
```

The final PDF embeds this independent assessment, case additions/dispositions and actual results. A suggestion alone is not an executed PASS or a defect. Neither team should sign the other team's assessment or decision on their behalf.

## Actual 24 November technical dispositions and residual coverage

See [current checkpoint](checkpoint-20261124.md) and [received C/D A2](../../../evidence/lab-06/checkpoint-20261124/received-cd-a2/EN037-TECHNICAL-RESPONSE-A2.md). ClassPulse original12+CD01–08 technical scope is recorded. Original12 have reported passing behaviors, with08/10/11 API setup disclosed/accepted after the run for setup only. CD06 anonymous401/authenticatedPUT/DELETE404 is agreed. CD08 authenticated guarded/original2147483647 probes both404, plus prior403/409precedence observations, complete that agreed external branch; no directDB inspection is claimed.

CD01 inactive/controlled-session and CD07 third respondent remain pending; no important unexecuted requirement becomesPASS. Thorough no-genuine-defect conclusion and educational-exercise entry remain NOT READY. Preserve actual peer participation and fixture limits.

Workflow original01–06 and PARTNER-ADD01–06A2 are technically accepted by C/D. The [full additional cases](../../../evidence/lab-06/checkpoint-20261124/workflow-additional-cases-a2.md) preserve Unicode bounds, exploratorytrimstorage, concurrency-proof limits and restart/newinstance distinctions. A observed01/04/05expected behavior with the setup variation later accepted in C/D A3; B02/03 have qualified UI observations and a later human06 probe; B incomplete additional cases and Aadditional01/06 remain NOT RUN. Actual technical agreement does not establish execution, participant acknowledgements or a final frozen acceptance inventory.

Later A3 disposition makes the three recorded A paths PASS within their tested scope. It does not execute additional cases, optional restart or controlled session assertions and does not establish whole-product acceptance.

The current checkpoint retains B v2's supplemental UI boundary/reason evidence, exact incomplete API/capture branches, and missing fresh marker/expanded identity qualification for later human06. B's same-tab/logout setup and amount-format example require C/D disposition. Do not silently promote these to a full additional-case PASS or use C/D release64 to skip remaining coverage.
