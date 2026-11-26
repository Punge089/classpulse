# CP-EX-001 version register — preparation snapshot

Issue117, A/Punge089 with Codex GPT-6. This register was authored before runtime validation/exposure. Exact candidate SHA and archive identity belong in the separately generated verified SOURCE.json/handoff; they cannot be self-referenced in the source commit. Later B review/ref/readiness records supersede this preparation status without turning an unbuilt snapshot into a passed release.

| Record | State at source preparation |
|---|---|
| Healthy production | CP-V01 source1fe3e3b82dfb0537be30223c9b598b3479b4affe; last A cloud mapping25Nov21:15:48, revisionclasspulse-00006-6w6; no production mutation |
| Feature ancestry | Branch feature/117-lab6-exercise created from sprint-2-staging9bf820ac98a23b9ffd4924ef48ba77fac1c7fc35; no protected integration or force push |
| Planning approvals | Issue115 C3comment7168743313 and original-S1 ref agreement7169092867; C/D subsequently confirmed local access/environment differences |
| Peer coordination | Lab7/Sprint2 chat notified of Issue117/exact files before app edit; acknowledged scope/ports/release coordination; no peer source changed |
| Healthy local base | Existing tests139server/1client passed and both builds passed at exact9bf820a, fresh owned loopback target, no new product test written |
| Educational change | Instructor-standardized one-rule exercise; detailed selection/history/output is developer-only until independent discovery; not a natural UAT defect claim |
| Candidate exact source/build | To be verified from the actual committed source by producer and B; no hash/URL invented here |
| CI policy | Existing tests/assertions/mandatory CI remain; expected failures are retained honestly; DRAFT PR must not merge the faulty version into sprint-2-staging/main |
| Exposure | NOT performed by this snapshot. Original sprint-1-staging may only fast-forward to the SAME actual B-reviewed SHA after old ref/rules/ancestry rechecks |
| Independent runtime | D-owned persistent local classpulse_uat6_exercise; local source/artifact/runtime IDs recorded; Cloud Run revision/traffic N/A |
| Test start | No go-ahead from this snapshot. Requires actual B exact-source exposure disposition, verified ref/build/hashes and a separate explicit source-specific go-ahead |
| Discovery/correction | Not performed: C/D finding → new reported-case regression RED commit → fix GREEN/regression → teammate review/CI → coordinated corrected main deployment → independent retest |

The C/D package must exclude developer selection notes, targeted failure names and private credentials. Public GitHub source/CI cannot guarantee technical secrecy: testers agreed black-box use and must record any advance exact-defect knowledge. Publish the complete educational provenance only after the actual independent finding. Keep protected tag/healthy data, survey26/27/responses13-16 unchanged. No cloud operation, final acceptance or PartD completion is claimed by preparation.

## Independent discovery and correction contract —26November2026
D reported CP-EX-F01 on4199888409fefafa920a773991d735f14ffb4ac8/sprint-1-staging/runtime9caf, local revision/traffic N/A,14:55:12–14:58:20Bangkok. Empty title+valid required rating creates/persists Draft9; drafts3/6/9 retained. [Raw finding and triage](../../../evidence/lab-06/exercise-correction-20261126/README.md), [existing-AC correction contract](exercise-correction-contract.md). Received12hashes/CRC and5screenshots reviewed by A; no A rerun or C review inferred. B-approved PD10 governs next real reported-case RED/fix/GREEN; this entry does not claim correction/review/deployment/retest/acceptance.

Correction source3d6f0874ccbaa8a14756ada9b12c2e20fa003e2b restores the one title guard; [full chain and deviation](../../../evidence/lab-06/exercise-correction-20261126/correction-summary.json). Actual repeat RED29c1d51 had2fail/2pass; evidence aed4be8 committed before final fix. GREEN4/4focused,143/143server,1/1client,2/2existingownerbrowser,buildspass;0skip. Local revision/traffic N/A. This is developer validation, not independent retest or deployed corrected acceptance. Original source419 stays onS1; no main/S2/cloud mutation.
