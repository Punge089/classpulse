# Lab 6 coordination register

## Current coverage action — 25 November 2026, C/D consolidated report

C/D PR69's consolidated report is received; no genuine ClassPulse defect was established in completed checks. [A's residual-branch disposition](coverage-disposition-a3.md) requests the short anonymous PUT/DELETE, live old-session replay, cookie metadata and respondent reload checks before the no-defect PartD gate. Natural live8-hour expiry remains OPEN with local TEST05 supporting PASS; production storage/log inspection and extra rounding tie retain explicit limits pending C/D/B agreement. C's actual report review remains pending. A requests work now; proposed26/27Nov slots are not booked. A's readonly CloudConsole observation at25Nov21:15:48Bangkok confirms classpulse-00006-6w6/100%/sameCP-V01digest/TTL8; source mapping is carried from the prior identical immutable image. No new UAT result, exercise defect, code/schema/shared-file/cloud mutation or release/deploy is claimed. PartD entry NOT READY and final acceptance PENDING until results/dispositions are reviewed.

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

Current checkpoint:24November2026, Issue79. See [actual evidence/status](checkpoint-20261124.md). This register distinguishes an actual run from a booked appointment, technical scope agreement from final participant acknowledgement, and draft messages from messages actually sent. No password/token/cookie belongs here.

| Field | Actual value / next action |
|---|---|
| A | GitHub/Git identity verified Punge089; prior report Bannasorn Thongkorn67070503420, final cover verification pending. Codex-operated repository/UI work labelled. |
| B | GitHubbook6349; prior record/report Papangkorn Jitvoottikrai67070503421, direct human identity and availability confirmation pending. A does not act as B. |
| C | Ashira Sansoda67070503445, EN-037_P5; identity supplied by partner. Actual contribution/review still needs its own evidence. |
| D | Thira Rungruangkaset67070503419, EN-037_P5; supplied declaration attributes ClassPulse technical tool operations to Codex under Thira. |
| Partner | Workflow and Approval System; https://github.com/osizk/WorkflowAndApprovalSystem ; https://scd928edd-4d7hbszvwq-as.a.run.app/login ; Sprint1 contractv0.6. |
| ClassPulse release | CP-V01 source1fe3e3b; A's latest saved cloud readback24Nov02:16:41Bangkok. C/D reports five synthetic roles accessible. Time-specific, not a new readback now. |
| Workflow release | WF-FIX-001 sourcead2cbef67dec,revision00008-9zd,100%; C/D mapping22:37:46Bangkok. A independent corrected-live retest23:03:13–15 passed2original+5supplemental checks; markers before/after matched. |
| Current technical inventory | ClassPulse original01–12+CD01–08 with residual branches; Workflow original01–06+PARTNER-ADD01–06A2 accepted technically by C/D. Final actual participant/fixture acknowledgement remains pending. |
| Actual ClassPulse run | C/D supplied24Nov17:31–18:03Bangkok observations; API fixtures08/10/11 and post-run setup only disposition retained. CD08additional at20:45:30. Not a retroactively booked appointment. |
| Actual Workflow run | A's Codex21:03:40–21:09:45 observed01/04/05; C/D A3 accepted the setup variation; three recorded paths PASS. B v2 supplies qualified02/03 UI observations and human06 at21:57:46; C/D now accepts the scoped02/03/06 paths with capture limits; additional incomplete branches remain pending. |
| Data retention | Keep original/continuation records plus A01/04 ID e1cc8f10-ccb4-49b1-a391-3d44fd4e3f67 and A05 ID b1f4b385-04b4-4e7a-905f-7f9091e65db2. No live reset or existing enrollment changes. |
| Future slots / channel | A deferred discussion to25November; no exact session or agreed channel is recorded. A/student coordinates external notifications to Thira/Ashira; Codex has sent no external chat. Notify before new live execution/deployment affects tests. |
| B readiness / next scope | PR78 documentation reviewed and mergedcdcf460 after B markedReady. B contract Issue80/PR81 received A C3 at11e0a21 after16 offline checks/currentCI; contract81 now merged6dc55d8. A reviewed executable83/294efc4:138tests passed but separate real concurrent-writer case failed; changes requested before live apply. Human target/credential/run gates remain; no accounts created. |
| Remaining ClassPulse setup | New inactive and extra CPE334 respondent not provisioned; A read-only baseline22:53:02 verified normalized target-email absence and student3id4 CPE231-only; no writes. Human-approved apply baseline remains pending. See fixture-provisioning.md and part-d-readiness.md. |
| Final PDF / submission | A assembles after actual evidence; B reviews exact file/hash; human verifies course deadline/filename, uploads and retains receipt. Not done. |

## Repository coordination and external messages

A/B act through their own verified accounts. A's standing authority covers A-owned Issue/PR comments and non-author exact-head review/merge after current CI. B retains its own authority and work. No approval transfers to a changed head. The [evidence checkpoint](checkpoint-20261124.md) records actual PR75/76/78 review/merge provenance.

Student A forwards the existing A3 ZIP and matching recipient text once. Prepared copy-ready messages are not sent messages. Do not infer channel agreement, notification, B availability or consent from a template. Before further live tests, coordinate the actual start/version/data-retention/deployment freeze. No new live execution occurred during Issue79 consolidation.

## Dated preparation/automation history

Issue68/69 and B70/71 record19–20November preparation. B acknowledged kit receipt in comment7014497599, initially reported scheduler limitations, then reported active20minute heartbeat in PR69comment7016235809 through22November23:59Bangkok. Those are B's historical reports, not A inspection of B's machine or current availability. A's earlier local kit/proposed20–22November sessions did not establish booked appointments. PR69→3d652d8 and PR71→b14cf38 are preparation integration, not runtime UAT. **Automations remain paused** at this checkpoint.

The original22November deadline/internal21:00 target is historical. A reports an extension; official revised deadline remains PENDING. C/D availability24–29November is not the deadline. Do not revive elapsed targets as current dates.

## Remaining boundaries

Human-only cloud/account/credentials/ruleset/submission gates remain in AGENTS.md. No executable fixture writer has been reviewed here. Keep student3 CPE231-only. Full PartD/exercise entry remains gated on actual thorough independent coverage; no exact exercise choice is shared or inserted. Each team signs its own release-specific final decision, and C/D's incomplete contribution/acceptance must not be invented.

C/D A3 accepts the documented logout/replacement-tab setup for the three observed paths without private-window repeat. This does not cover restart, cookie replay or expiry and does not sign whole-product acceptance. Workflow PR63 is now Ready, with actual peer review/deployment still pending. See the latest checkpoint addendum.

Latest external action prepared: student may forward SEND-TO-CD-DEPLOY-AND-B-RESULTS.txt with the original B v2 ZIP, not a new starter pack. A has no active Workflow run; B's reported runs ended. Codex has not sent clearance externally. Hold new Workflow runs around C/D's reviewed release64 deployment until verified corrected mapping. B's posted start notice/relay gap remains honestly recorded. Actual user availability and final decisions remain pending.
