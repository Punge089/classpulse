# Lab 7 metrics

Issue #89. Owner: Student B/book6349. Reviewer: Student A/Punge089. Product scope: ClassPulse only; the partner Workflow application is excluded. The initial 25 November 2026, 18:06:58 Asia/Bangkok values are retained as a dated historical snapshot; the current-state refresh below is 25 November 2026, 18:41:29 Asia/Bangkok. Counts and source rows are in [the dated snapshot](../../../evidence/lab-07/metrics/2026-11-25-snapshot.md).

The historical window is 5-8 November 2026 Asia/Bangkok for Sprint 1 completion and staging integration. Current-state metrics were captured on 25 November 2026. Numerators and denominators use the explicitly listed parent Issues or staging PRs; child Issues and releases to `main` are outside those counts.

| ID | Metric, scope and calculation | Value at snapshot | Source |
|---|---|---|---|
| M1 | Sprint 1 parent Issue closure: closed Issues #1-#11 ÷ 11 original parent Issues | 11/11 (100%); all closed by 8 Nov 2026 | METRIC-SNAPSHOT-2026-11-25, Issue rows #1-#11 |
| M2 | Sprint 1 staging integration: merged PRs #12-#26 with base `sprint-1-staging` ÷ 15 selected integration PRs | 15/15 (100%) | METRIC-SNAPSHOT-2026-11-25, PR rows #12-#26 |
| M3 | Named test suite on a pinned test commit: server `npm test` on test-source commit `3f8918c`, run 45597034491 | 139 passed, 2 failed, 0 test skips; 141 total. The two failures are the new reopen checks receiving 404 instead of expected 200. This is intentional preimplementation RED. | METRIC-SNAPSHOT-2026-11-25; [run 45597034491](https://github.com/Punge089/classpulse/actions/runs/45597034491) |
| M4 | ClassPulse independent UAT defect disposition: count only after the assessed UAT team records an actual disposition | PENDING. The current Lab 6 checkpoint does not support a final no-defect conclusion; do not report zero. | `docs/labs/lab-06/checkpoint-20261124.md`; `part-d-readiness.md` |
| M5 | Lab 7 implementation-candidate CI: results for the candidate commit only | PENDING. No implementation candidate exists; PR #92 head `a9cdbce` is test-only and had no combined status entries at capture time. | METRIC-SNAPSHOT-2026-11-25; PR #92 |

M1 and M2 reconcile offline from the compact Issue and PR ID/date lists in the evidence file. M3 is a test-first failure against the old implementation, not evidence that a delivered candidate is ready. Refresh current-state rows and candidate CI before the final PDF; retain this dated snapshot rather than replacing it.

Interpretation at the initial 18:06 snapshot (62 words): The Sprint 1 parent scope and its selected staging PRs are complete, but this does not establish Lab 7 readiness. The new behavior has an honest RED result, while a candidate green run, independent UAT disposition and release evidence are still pending. A should finish the scoped change and deployment chain; B will refresh these metrics against the exact candidate before submission.


## Current-state refresh - 25 November 2026, 18:41:29 Asia/Bangkok

| ID | Measurement at readback | Value and evidence |
|---|---|---|
| M1 | Sprint 1 parent Issue closure, Issues #1-#11 ÷ 11 | 11/11 (100%); source rows remain in METRIC-SNAPSHOT-2026-11-25. |
| M2 | Sprint 1 staging integration, merged PRs #12-#26 ÷ 15 | 15/15 (100%); all selected PRs target `sprint-1-staging`; source rows remain in METRIC-SNAPSHOT-2026-11-25. |
| M3 | Named implementation suite on the Lab 7 code candidate: server `npm test` on code commit `7c4818cd6b6b7a11d0ce6fd668bc11a54872a302`, CI run 45604842565 | 214/214 passed, 0 failed, 0 skipped. Client `npm test`: 8/8 passed, 0 failed, 0 skipped; both builds and Docker passed. The latest code change is this implementation commit; later PR-head commit `1045594` only retains test/evidence records. [Run 45604842565](https://github.com/Punge089/classpulse/actions/runs/45604842565). |
| M4 | ClassPulse independent UAT defect disposition | PENDING. The 24 Nov Lab 6 checkpoint still does not support a final no-defect conclusion; no zero-defect value is claimed. |
| M5 | Current PR #92 candidate-head required check | 1/1 `test-and-docker` check succeeded on exact head `10455948c40d65e476280936cde9abb278aa4bcc`, run 45605366295 (completed 18:34:10 Bangkok). The combined commit-status API returned no status entries; the separate Check Runs API reports this success. PR #92 remains draft/unmerged, so release and deployment status are pending. |

### Preserved RED and time-bound correction

The 18:06:58 snapshot's PR query returned test-only head `a9cdbce`, but it omitted already-committed implementation `3203c3a` (18:05:22 Bangkok). At that snapshot, CI run 45601152925 was still in progress; its `test-and-docker` Check Run later completed successfully at 18:07:14 Bangkok. This follow-up corrects the missing implementation/check-run context without rewriting the earlier snapshot as green. The original old-code RED remains separately recorded: 139 existing checks passed, 2 new reopen assertions failed, 0 tests skipped.

Interpretation at the current refresh (69 words): The maintained branch now has a successful current-head check and 214 passing server tests plus 8 passing client tests, while the first snapshot remains a valid record of the earlier RED and pending state. Submission is still NOT READY: independent UAT disposition, B's exact-head review, migration preservation, main release and deployed user checks remain open. A owns those release steps; B will refresh the evidence against each accepted head.
## Current-state refresh - 25 November 2026, 20:30:15 Asia/Bangkok

| ID | Current measurement | Value and evidence |
|---|---|---|
| M1 | Sprint 1 parent Issue closure, Issues #1-#11 ÷ 11 | 11/11 (100%); the source rows remain in METRIC-SNAPSHOT-2026-11-25. |
| M2 | Sprint 1 staging integration, merged PRs #12-#26 ÷ 15 | 15/15 (100%); all selected PRs target sprint-1-staging; the source rows remain in METRIC-SNAPSHOT-2026-11-25. |
| M3 | Named test suites on the current Lab 7 PR candidate | GitHub Actions run 45613368930 passed on PR #92 head 45f48cdcd0999e2dbbb5cb4e70638999ff25e3e8. Its test-and-docker job log reports server 219 passed/0 failed/0 skipped, client 10/0/0, and browser 10/0/0; server/client builds and Docker completed successfully. The runner used merge commit cb6b9f1368e793fed288d2ebac484fc1b5e2b3ca with base a49cbe7. The check-run ID is 139202364446. |
| M4 | ClassPulse independent UAT defect disposition | PENDING. The Lab 6 checkpoint still does not support a final no-defect conclusion; no zero-defect value is claimed. |
| M5 | Candidate-head required CI and integration freshness | The PR #92 head check succeeded, but PR #92 remains open/unmerged and its recorded base a49cbe7 is two commits behind current sprint-2-staging head 5e7a164. The successful run used the earlier base, so a refreshed integration check against current staging remains PENDING. B's exact-head C7 review is also PENDING. |

The previous readbacks remain dated history. At this readback PR #92 is A-authored and open at head 45f48cd; B is the required reviewer. The run above is remote GitHub Actions evidence, not a test run by B. It supports the current PR-head test result but does not establish a fresh run on the two newer staging commits, reviewed release, UAT disposition, migration preservation, main release, or deployment.

Interpretation at the current refresh (67 words): At this readback, PR #92's exact-head workflow check passed: 219 server, 10 client and 10 browser tests, plus both builds and Docker. The successful run used merge commit cb6b9f1 with then-current base a49cbe7; sprint-2-staging has since advanced to 5e7a164, two commits beyond that base, so a fresh integrated check remains pending. B's exact-head review, accepted baseline/UAT, migration evidence, release and deployment remain open. Readiness stays NOT READY.

## Current-state refresh - 25 November 2026, 21:10:44 Asia/Bangkok

| ID | Current measurement | Value and evidence |
|---|---|---|
| M1 | Sprint 1 parent Issue closure, Issues #1-#11 ÷ 11 | 11/11 (100%); source rows remain in METRIC-SNAPSHOT-2026-11-25. |
| M2 | Sprint 1 staging integration, merged PRs #12-#26 ÷ 15 | 15/15 (100%); all selected PRs target `sprint-1-staging`; source rows remain in METRIC-SNAPSHOT-2026-11-25. |
| M3 | Named suites on current Lab 7 PR #92 candidate | GitHub Actions run 45627723318 passed on exact PR head `d1b41c3d4fc86361110d5f65357cdef1d89f8aeb`. It checked synthetic merge `43bcdd04900bf995c511d62f3b1b40e81ab4643e` against current staging base `eeae87524a340b3463866f199cec7e1bb59b1ef9`: server 219/0/0, client 10/0/0, browser 10/0/0; both builds and Docker passed. |
| M4 | ClassPulse independent UAT defect disposition | PENDING. No final accepted-baseline/no-defect disposition is claimed. |
| M5 | Exact candidate-head CI and B review | Current-base CI passed on PR #92 head `d1b41c3`; PR #92 remains open/unmerged and B's exact-head C7 review is PENDING. |

Historical TEST-111 evidence is separate from this candidate CI: CI run 45609911425 passed a disposable PostgreSQL 16 migration-preservation test against synthetic pre-change data in nine tables and four survey variants; old values were preserved, all four additive status versions were zero, and no audit rows were fabricated. This demonstrates the scoped SQL/data-preservation check in disposable CI. Accepted Lab 6 baseline mapping, production/deployed migration verification, release and UAT remain PENDING.

Interpretation at the current refresh (68 words): The latest PR #92 candidate passed current-base CI: 219 server, 10 client and 10 browser tests, plus both builds and Docker. The separate TEST-111 disposable PostgreSQL check preserves synthetic old-table values and starts the additive audit table empty; it is not a production migration or accepted-Lab-6 verification. B's exact-head C7 review, accepted baseline and UAT, reviewed release, deployed migration and user checks remain pending. Readiness stays NOT READY.

## Candidate and staging readback - 25 November 2026, 22:25:33 Asia/Bangkok

| ID | Current measurement | Value and evidence |
|---|---|---|
| M1 | Sprint 1 parent Issue closure, Issues #1-#11 ÷ 11 | 11/11 (100%); compact source rows remain in METRIC-SNAPSHOT-2026-11-25. |
| M2 | Sprint 1 staging integration, merged PRs #12-#26 ÷ 15 | 15/15 (100%); selected PRs target `sprint-1-staging`; compact source rows remain in METRIC-SNAPSHOT-2026-11-25. |
| M3 | Named suites on PR #92's candidate head at readback | Exact head `87971f59da5bc63634bd8ce963667f6a5a8efcb9`, Actions run 45638095728: server 219/0/0, client 10/0/0, browser 10/0/0; both builds and Docker passed. The workflow tested synthetic merge `9b74772155143c0526edf213083dfe011d5629ac` against staging base `841ad5ca6d62e4f04d8a943d89a4a91e919feeb5`. |
| M4 | ClassPulse independent UAT defect disposition | PENDING. No accepted-baseline or zero-defect conclusion is claimed. |
| M5 | Integration and peer review status at readback | PR #92 was open at head `87971f5`; B's exact-head C7 review remained pending. Staging later advanced to `9bf820ac98a23b9ffd4924ef48ba77fac1c7fc35` when documentation PR #112 merged, so a fresh integration check against that base was pending. |

The 45638095728 result is remote GitHub Actions evidence. PR #112 changed only the Issue #89 metrics interpretation label and B's AI-use disclosure; its merge did not supply a new PR #92 integration run. The latest staging candidate still lacks B's exact-head C7 review, accepted Lab 6 baseline/UAT disposition, deployed migration verification, release and changed/preserved user checks. Readiness remains NOT READY.

Interpretation at the 22:25 readback (75 words): PR #92 head 87971f5 passed exact-head CI: 219 server, 10 client and 10 browser tests, both builds and Docker, with zero failures or skips. The run tested synthetic merge 9b74772 against staging base 841ad5. Staging later advanced to 9bf820 when PR #112 merged, so a fresh integration check was pending. B's C7 review, the accepted baseline, UAT, deployed migration and user checks remained open. A should refresh PR #92 against staging; readiness was NOT READY.

## Final deployed refresh - 28 November 2026, 02:11 Asia/Bangkok

This refresh uses the exact main release commit and A's sanitized production observations available at capture time. The original 25 November snapshot and intermediate refreshes above remain dated history.

| ID | Current measurement and calculation | Value at 28 November readback | Evidence |
|---|---|---|---|
| M1 | Sprint 1 parent Issue closure: closed Issues #1-#11 / 11 original parent Issues | 11/11 (100%); all closed by 8 November | Historical compact issue rows in [METRIC-SNAPSHOT-2026-11-25](../../../evidence/lab-07/metrics/2026-11-25-snapshot.md); denominator is parent Issues only. |
| M2 | Sprint 1 staging integration: merged PRs #12-#26 with base sprint-1-staging / 15 selected integration PRs | 15/15 (100%) | Historical compact PR rows in [METRIC-SNAPSHOT-2026-11-25](../../../evidence/lab-07/metrics/2026-11-25-snapshot.md); denominator is the selected PRs only. |
| M3 | Named release test suites on main SHA 8316f270cb11d47c75f848de3f3d40acefbe8def, deploy run 46050688714 | Server 272, client 23, browser 12: 307/307 passed, 0 failed, 0 skipped. Both builds and Docker passed. | [Main deploy run 46050688714](https://github.com/Punge089/classpulse/actions/runs/46050688714), test-and-docker job; exact head 8316f27. |
| M4 | Independent ClassPulse UAT defect disposition | PENDING. No independent UAT disposition or zero-defect count is claimed. Separately, A's developer-operated live API check passed 14/14 with 0 failures and 0 skips; this is not classified as independent UAT. | METRIC-REFRESH-2026-11-28 rows L7-B11a..L7-B12-final; [A's Issue #89 evidence handoff](https://github.com/Punge089/classpulse/issues/89#issuecomment-7226082351). |
| M5 | Main release/deploy workflow outcome on SHA 8316f270cb11d47c75f848de3f3d40acefbe8def | 2/2 jobs succeeded: test-and-docker and deploy. Production migration/update and automated read-only smoke passed. | [Deploy run 46050688714](https://github.com/Punge089/classpulse/actions/runs/46050688714); smoke paths are listed in METRIC-REFRESH-2026-11-28. |

M1/M2 remain the unchanged historical counts; their compact source rows let the values be reconciled offline. The 14/14 live API checks were performed by A on synthetic survey 30 and are recorded separately from the independent UAT status. The current report-branch CI is a separate documentation check, not the release test result.

Interpretation at this refresh (75 words): The exact main release passed 307 automated tests, and the deploy workflow completed both jobs, migration/update and read-only smoke. A's 14/14 live API observations on the serving revision covered the changed reopen path and preserved answers, duplicate protection and ownership denial. These are developer-operated checks, not independent course UAT. The independent UAT defect disposition remains pending, so the overall report remains NOT READY until B reviews the exact final PDF and the human submits it.
