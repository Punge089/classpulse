# Lab 6 coordination register

## Current status — 25 November 2026

The human completed the reviewed fixture apply. A independently checked the selected original baseline and the two new identities in READ ONLY transactions: extra **user16**, active RESPONDENT, CPE334/course1 through enrollment4; inactive **user17**, inactive RESPONDENT, no enrollments. Original student3 remains user4 in CPE231 only; student2 is user5. Selected original users/courses/enrollments are unchanged. See [actual setup and postchecks](../../../evidence/lab-06/checkpoint-20261124/fixture-ready-20261125/START-HERE.md). No seed/reset, application deployment or existing-row update was performed.

A freshly reconfirmed CP-V01 at **25 November 00:36:54 Bangkok**: source `1fe3e3b82dfb0537be30223c9b598b3479b4affe`, revision `classpulse-00006-6w6`, 100% traffic; the immutable source tag resolves to the serving digest. This is a time-specific readback, not a future deployment freeze. [Release evidence](../../../evidence/lab-06/checkpoint-20261124/fixture-ready-20261125/serving-reconfirmation.json).

A reports sending the fixture ZIP and private access to C/D. Their receipt and independent **CD-01/CD-07 results remain PENDING**; creation and private credential verification are not UAT PASS. Controlled expiry/old-session and other unfinished agreed branches remain separate. No comprehensive no-genuine-defect conclusion or ClassPulse PartD entry is supported yet.

The provisioner race is corrected and independently reviewed: B RED `dc651049` (A rerun:10 database passes/1 intended failure), GREEN `d51ef87` (A:139 server passes/build/typecheck and a separate real-writer collision rejection), CI45438536383, A merge PR83 `f4533ea`. This tool correction is not a Sprint1 ClassPulse UAT defect. B merged A PR82 at `b73a269`; A checked 16 offline document assertions and merged B PR84 at `c99748c` after exact-head CI45564970810 succeeded. Historical model labels remain preserved; B's current declaration is GPT-6.1 Sol without inferring earlier runtime identity. [Review records](../../../evidence/lab-06/checkpoint-20261124/repository-followup-20261125/review84-checks.json).

C/D verified the actual Workflow retest and closed WF-BUG-001 fixed/independently verified. A separately checked [Workflow Issue62 is closed/completed](../../../evidence/lab-06/checkpoint-20261124/repository-followup-20261125/workflow-issue62-after-retest.json). Both whole-product decisions, remaining coverage, **ClassPulse PartD**, final PDF review and human submission remain incomplete. B's Workflow ADD02 API, incomplete ADD03 APPROVE501 and ADD04/05, plus A's remaining ADD01/06, still need actual execution/setup/version/start coordination. Automations remain paused.

This status supersedes older pending fixture/provisioner/PR82/PR84/Workflow-closure statements below. Original dated captures and their limitations are retained unchanged.

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
