# Lab 6 coordination register

## Current status — 25 November 2026, after received C/D R2

**C/D reports two scoped PASS results** in run `UAT6-20261125-CodexD-R2`, **17:49:22–17:52:43 Bangkok**: CD-01 inactive login (401 INVALID_CREDENTIALS; identity401 before/after), and CD-07 exact aggregate on retained **survey26/responses13,14,15**. Respondents3/5/16 supplied ratings4/4/5; count3/average4.33, rating buckets0/0/0/2/1, Online3/In person0, with no identities/individual responses in the summary as reported. Four active-session logout204/identity401 checks are supporting observations, not controlled expiry/replay proof. [Original independent report](../../../evidence/lab-06/checkpoint-20261124/received-cd-r2-20261125/FIXTURE-CASE-REPORT.md).

The referenced raw `fixture-case-results.json` and `CD07-summary.png` have **not yet been received/inspected by A**. Preserve reported PASS separately from supporting-evidence completeness. **Controlled session expiry and final acceptance remain PENDING.** No comprehensive no-genuine-defect conclusion or ClassPulse PartD exercise entry is inferred. [Receipt assessment](../../../evidence/lab-06/checkpoint-20261124/received-cd-r2-20261125/a-receipt-assessment.json).

The exact reported release is CP-V01 source `1fe3e3b82dfb0537be30223c9b598b3479b4affe`, revision `classpulse-00006-6w6`, digest `sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795`,100% traffic. This uses A's **00:36:54 Bangkok** mapping; C/D recorded origin and `/assets/index-Bi1ZvEdG.js`, without a fresh cloud readback during17:49–17:52. Source/revision freshness is qualified, not fabricated. The operator is Codex under Thira, model unspecified; browser/contexts are C/D-reported. Start-notice delivery was unverified and Thira directed continuation without reply; no retrospective A notice/approval or Ashira participation is inferred. [Provenance](../../../evidence/lab-06/checkpoint-20261124/received-cd-r2-20261125/source-provenance.json).

The human fixture setup and A READ ONLY postchecks remain separately preserved: extra16 active/CPE334 through enrollment4; inactive17 without enrollment; selected old users/courses/enrollments unchanged, student3id4 CPE231-only. C/D now reports receipt of the private handoff. No reset, new account operation, deployment or live test was performed by this report review. [Setup](../../../evidence/lab-06/checkpoint-20261124/fixture-ready-20261125/START-HERE.md).

B's provisioner correction/139-test review and PR82/84 merges are complete. The tool correction is not a Sprint1 ClassPulse UAT defect. Workflow WF-BUG-001 is fixed/independently verified and closed, not our ClassPulse PartD. B's additional Workflow branches and A's remaining ADD01/06/setup coverage still need actual execution/coordination. PR85's new head requires B's exact-head review/current CI. Both final product decisions, **ClassPulse PartD**, final PDF review and human submission remain incomplete. Automations remain paused.

This status supersedes older pending CD01-inactive/CD07-result/receipt statements below. Original captures remain unchanged; no missing evidence, broad case completion or acceptance is invented.

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
