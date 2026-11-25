# ClassPulse Part D readiness and evidence gates

## Latest verified state —24November2026, after WF-FIX-001 retest

- Workflow WF-BUG-001 independent corrected-live retest **PASS**:2original boundary tests plus5supplemental checks,0failures/skips,23:03:13–15Bangkok. Full sourcead2cbef67decf9953219694898327dea0bb66034; markers before/afterad2cbef67dec; revision00008-9zd,100%. [Independent result](../../../evidence/lab-06/checkpoint-20261124/a-wf-bug-retest/INDEPENDENT-RETEST.md). C/D cloud mapping is attributed; A checked served source/browser and remote deployment. All A/B business records were left untouched.
- [C/D's latest B-v2 dispositions](../../../evidence/lab-06/checkpoint-20261124/received-cd-corrected/EN037-B-V2-DISPOSITION.md) accept the recorded same-tab/logout02/03 paths, numeric1000000.00 display and scoped06denial; no repeat solely for those capture limits. Earlier original82a4806 snapshots remain historical. B06 still lacks a fresh marker/expanded identity in its screenshot; predeployment C/D readback corroborates release continuity without inventing that capture. The six original Workflow paths have scoped PASS evidence; required unexecuted additional branches and whole-product acceptance remain pending.
- ClassPulse [actual read-only baseline](../../../evidence/lab-06/checkpoint-20261124/fixture-baseline/README.md) completed22:53:02Bangkok:target emails absent, student2id5/student3id4, student3CPE231-only. No accounts created. This is an agent-observed point-in-time snapshot, not human-approved live apply.
- B contract81 merged6dc55d8 after exact-head approval/CI. B implemented PR83; A ran138server tests/build/typecheck at294efc4 but independently reproduced a normalized-email concurrency race and [requested changes](../../../evidence/lab-06/checkpoint-20261124/repository/PR83-REVIEW.md). No live fixture apply until B's regression/fix and new A review, then human target/baseline approval and execution.
- C/D still needs the new inactive/third-respondent fixtures for CD01/CD07, controlled-session coverage disposition and actual peer contribution evidence. ClassPulse PartD is incomplete. The Workflow fix and provisioner review do not substitute. A sends the scoped retest return; B fixes83 and reviews82 at its current head. Final acceptance/PDF/human submission remain pending. Automations remain paused.

Earlier dated paragraphs below retain the sequence of evidence received. Where they say corrected deployment/retest, B setup disposition, live email absence, or provisioner implementation is pending, this latest section supersedes them. Raw incoming/execution files are unchanged.

Prepared for Issue79; this is a concrete readiness checklist, not a completed correction or permission to mutate live systems. See the [current checkpoint](checkpoint-20261124.md), [instructor source](instructor-clarification.md) and [exercise protocol](exercise-protocol.md). No defect has been selected or reintroduced by this work. Workflow's own bugfix is separate from ClassPulse PartD.

## Entry gate and responsible next actions

| Gate | Actual state | Next owner/action and done evidence |
|---|---|---|
| Important ClassPulse Sprint1 coverage audited and proposed additions disposed | Original12+CD01–08 technical scope recorded; residual branches remain. | C/D independently finish agreed important coverage; A/B resolve actual setup questions. Retain executed/subcase inventory and genuine gaps. |
| CD01 inactive synthetic identity | Not provisioned; normalized email absence verified by A read-only baseline22:53:02Bangkok. Human-approved apply snapshot still pending. | B83 exists but A requested changes for reproduced normalized-email race; B fixes/regression, A re-reviews, authorized human confirms target/baseline and runs approved additive setup; C/D tests actual inactive login and denial. |
| CD07 third enrolled respondent for [4,4,5]→4.33 | Not provisioned; no extra CPE334 enrollment created. | New active RESPONDENT in existing CPE334 only; keep student3 CPE231-only. C/D records three submissions, count3/buckets/4.33/zero-bucket/privacy readbacks. |
| CD01 controlled expiry/old-session evidence | Separate setup/coverage disposition pending. | Agree secret-safe controlled method or record honest scope limits/supporting developer evidence; never invent independent PASS or expose a cookie. |
| No-genuine-defect assessment | Not supported while important agreed checks remain incomplete. | C/D produces actual coverage/results and remaining-limits assessment. Any genuine defect is triaged/reproduced honestly first. |
| Natural correction or educational exercise selected | Neither started. | Accepted genuine defect uses normal correction chain. Only after thorough no-genuine-defect gate use professor's new-staging-commit procedure; keep exact choice from C/D before independent discovery. |

An unexecuted important requirement cannot be made PASS by a documentation disposition. Do not insert a bug merely to fill a score box or call the partner Workflow defect ours.

## Human fixture preflight — available now, creates nothing

1. Authorized human opens Cloud Console, selects ClassPulse project `cpe-334-en-034`, SQL and the intended serving instance/database. Privately verify project, instance and database against the intended app target. Database name alone does not prove the project/instance; do not capture connection strings or passwords.
2. Run the read-only transaction in the reviewed [fixture procedure](fixture-provisioning.md) using that verified target. It has a10second timeout and ends ROLLBACK. Record only database/course IDs and owner emails, synthetic user IDs/roles/activity/enrollments and target-email absence.
3. Stop unchanged if a target email exists, a course is absent/ambiguous, student1/2 do not retain CPE334, student3 differs from CPE231-only, or project/instance/database is uncertain. No seed/reset/upsert or repair of existing rows to force the expected result.
4. Return sanitized actual baseline to B/A for the separately scoped tool's exact guards/review. The reviewed documentation contains no executable mutation command. This was the preparation rule. Subsequently the user explicitly authorized reading/using the existing credential for SQL Studio authentication; A completed only the read-only transaction and saved no credential values. No write was performed.
5. After separate contract/review/tests and target authorization, human privately supplies passwords/connection and personally runs the exact reviewed additive operation. It may create only2Users and1Enrollment, in one transaction with collision/baseline fail-closed guards and post-checks. Existing IDs/roles/activity/enrollments stay unchanged. Setup is not a UAT PASS; C/D still independently executes both branches.

## Required correction chain when the entry gate is met

| Stage | Owner and concrete evidence to retain | Stop condition |
|---|---|---|
| Finding/triage | Actual independent report ID, source/run/operator, exact inputs/actions/expected/actual/evidence, severity and classification reason; accepted owning Issue with explicit Files and reviewer. | No reproducible finding or contract basis: clarify, do not fabricate. |
| Contract before tests | Module owner branches from current sprint-2-staging, commits contract/AC/test design; teammate C3 checks important requirement and unchanged-state assertion. | No real teammate contract review: no feature test/implementation yet. |
| RED | Commit meaningful regression and captured command/output before correction. Build/setup must succeed; assertion fails for the reported behavior. | Syntax/setup failure, missingfixture or always-green assertion is not RED. Never skip/focus/weaken existing tests. |
| GREEN and regression | Same regression passes after minimal fix; preserve commit/diff and complete relevant regression counts/output, including failures/skips. | Unexplained failures or weakened assertions prevent readiness. |
| Review/integration | Non-author checks exact head/diff/tests/Issue checks, reasoned approval, mandatory current-head CI; merge commit with actual model trailer. | Changed head requires re-review. No self-approval/merge, squash, force-push or tag movement. |
| Reviewed release and deployment | Reviewed staging→main release, notify C/D first; human runs actual cloud mutations. Retain source/image digest/revision/traffic/time and post-deploy smoke. | Old metadata, unreviewed release or mismatched source/digest is not a corrected deployed release. |
| Independent retest | C/D executes original reproduction and affected regression cases on the corrected deployed version; actual independent operator/time/input/output/evidence and disposition. | Developer tests, localGREEN or CI icons do not replace independent deployed retest. |
| Decision/report | Both teams issue their own exact-release R07 decision; embed readable case/finding/RED/GREEN/regression/review/CI/deploy/retest chain, contributions/AI-use/limits in one PDF; B reviews exact PDF hash; human uploads and opens received file/receipt. | Required not-run/blocked cases or unresolvedmajor/critical findings prevent Accepted. No final submission without actual upload evidence. |

For the educational path, first preserve healthy baseline and new Sprint-staging exercise commit, blind independent discovery and educational provenance; publish full selection/correction trace only after discovery. Expected failing existing tests remain visible. Never bypass mandatory CI or deploy defective main to expose the exercise. If staging exposure conflicts with actual branch/environment rules, escalate that concrete conflict to human/TA while completing independent preparation. Do not invent a cloud command before an exact reviewed implementation/environment exists.

Current decisions: exercise entry NOT READY; selected defect NONE; fixture writes NONE; corrected ClassPulse release NONE; independent corrected retest NOT RUN; final acceptance PENDING. Exact future slots/channel and official revised deadline are not invented. Automations remain paused.
