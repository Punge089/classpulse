# Lab 6 version and release register

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

## Verified repository references, 19 November 2026

| Reference | SHA / observation | Meaning |
|---|---|---|
| Protected Sprint 1 tag v1.0.0-sprint1 | d4bad74211729032697164f378638efb834a67b6 | Baseline; never move/recreate |
| Remote main at preparation | 1fe3e3b82dfb0537be30223c9b598b3479b4affe | Main source observed with Git; not proof of live serving image |
| Remote sprint-2-staging at branch creation | 8c239225c75dc8f0f4db191797282ed9698850d4 | Documentation branch baseline |
| Candidate service URL | https://classpulse-zdwglar6eq-as.a.run.app/ | Needs agreed version readback before UAT |
| Last recorded Lab 5 revision | classpulse-00006-6w6, 100% traffic | Historical observation only |
| Last recorded image digest | sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795 | Historical image tied to main 1fe3e3b in Lab 5; not a fresh serving readback |

Historical metadata provenance: [Lab 5 deployment evidence](../lab-05/deployment.md). Do not reuse its manual test results as Lab 6 independent execution.

## Initial and corrected session register — updated24November2026

| Version ID | Purpose | Source SHA | Digest | Serving revision(s)/traffic | URL | Actual time/operator | Release/CI/smoke evidence |
|---|---|---|---|---|---|---|---|
| CP-V01 | Initial ClassPulse independent UAT | 1fe3e3b82dfb0537be30223c9b598b3479b4affe | sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795 | classpulse-00006-6w6,100% | Candidate URL above | A latest saved Console24Nov02:16:41Bangkok; C/D actual run17:31–18:03 | [Time-specific readback](../../../evidence/lab-06/checkpoint-20261124/cp-v01/reconfirmation.txt); developer preflight8/8, not acceptance |
| PARTNER-V01 | Original Workflow independent UAT | 82a4806b5291b57ad7e76a28fb7d40e1e947b9a6 | sha256:6554d7f8cccdf1b4ded95f3f7d1a2560a786b0ecf7613cab62d59d942613a4fb | scd928edd-00007-477,100% | https://scd928edd-4d7hbszvwq-as.a.run.app | C/D cloud mapping24Nov20:51:51–58Bangkok; A run21:03:40–21:09:45 | [Supplied mapping](../../../evidence/lab-06/checkpoint-20261124/received-cd-a2/Workflow/current-serving-version.json); A footer matched, setup variation later accepted in C/D A3 |
| PARTNER-FIX-01 | Workflow correction branch only, NOT a deployed release | 84a62c781c730ecf5779c80be0607df7ce0fe74f | PENDING corrected deployment | PENDING corrected deployment | Original URL still serves PARTNER-V01 | A inspected remote PR63/CI; no deployed retest | DraftPR63;CI45407729755SUCCESS; actual teammate review/integration/deployment/retest pending |

Append corrected releases and retest versions when they exist. Each correction needs traceable original defective code -> RED test commit -> fix/GREEN commit -> feature merge -> reviewed main release -> deployed image/revision -> independent retest/decision. Explain merge SHA differences. Use CP-EX-* IDs for the professor-standardized educational exercise, never label it as a natural defect of the healthy release.

## Readback procedure

Before handoff and after each correction deployment, read Cloud Run service traffic and serving revision image digest, match Artifact Registry immutable digest to the full source SHA tag and actual release run. Record timestamp/operator and all serving traffic; a latest-ready revision alone does not prove it receives requests. Public health/ready/SPA/auth smoke cannot identify the source image. No environment-secret values should be inspected or captured. Notify the UAT Team before deployment affects their session.

Acceptance is release-specific. Keep initial failures/evidence and corrected observations as separate runs; do not overwrite earlier results. See [record templates R02/R06/R07](records-template.md) and [coordination](coordination.md).

## Standardized exercise lineage

Track healthy source/initial thorough independent run -> new Sprint staging exercise commit -> independently accessible staging test instance -> blind UAT finding -> reproducer RED -> correction GREEN/regression -> reviewed fixed integration/main release -> corrected deployed revision -> independent retest. CP-EX labels identify educational origin. Record failing existing checks honestly; they do not authorize a defective main deployment or disabling CI. See [exercise protocol](exercise-protocol.md) and [coverage audit](coverage-review.md).

## Current integration boundary

PR75 merged3425a5e,PR76 mergedb98369c and PR78 mergedcdcf460 are documentation changes on staging. They do not change main1fe3e3b or provision accounts/deploy an app. Protected annotated Sprint1 tag object7f2a63d8 peels tod4bad742; it has not moved. See [checkpoint](checkpoint-20261124.md). No corrected ClassPulse/exercise release exists yet; final acceptance remains PENDING.

C/D A3 reattaches the original Workflow mapping only. It is neither a new cloud verification nor a corrected serving release. PR63 now Ready at the same84a62c7, but no corrected source/digest/revision/traffic mapping exists. See [later response](../../../evidence/lab-06/checkpoint-20261124/received-cd-a3/Workflow/CORRECTION-STATUS.md).

B v2 UI observes original82a4806 marker21:27:28–21:34:37 Bangkok; later human06 at21:57:46 lacks a fresh marker/mapping in its screenshot and remains qualified. Workflow release64 targets main at eee7c7e with actual osizk approval/current CI; that source is not yet a corrected serving release. Obtain actual post-merge source/marker/revision/digest/traffic/time and keep further execution/retest in a new versioned run.

## CP-V01 fixture data addendum — 25 November

The human setup added user16/user17 and enrollment4; it is not a corrected application release. The same source/revision/digest/100%traffic was freshly confirmed at00:36:54Bangkok. [Immutable source-tag readback](../../../evidence/lab-06/checkpoint-20261124/fixture-ready-20261125/serving-reconfirmation.json). New fixture results must name this actual version and time; no future deployment freeze is assumed.
