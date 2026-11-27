# Lab 7 maintenance readiness

Issue #89. Snapshot: 25 November 2026, 18:06:58 Asia/Bangkok. Scope is the maintained ClassPulse Sprint 1 product and the approved Lab 7 change. This is a status review, not a release acceptance. **Overall: NOT READY.**

| Gate | Current evidence and status |
|---|---|
| Submitted baseline | The immutable original Sprint 1 tag is `v1.0.0-sprint1` at `d4bad74211729032697164f378638efb834a67b6`. It is historical; it does not prove the current accepted Lab 6 baseline. |
| Accepted Lab 6 version | PENDING final accepted-version and UAT disposition. The checkpoint records incomplete important cases and says a no-genuine-defect conclusion is unsupported. |
| Lab 7 contract and change | B posted C3 on Issue #87 for contract `8017c9183302e4e0c5ff04cd997704255420b8fb`. PR #92 now contains the retained preimplementation RED and additional test source; current head `a9cdbce9e76dfd07eb3f2c47051455b748ce326c` is test-only. Implementation/GREEN/reviewed release/deployed verification remain PENDING. |
| Test failures and skips | At run 45597034491, the server suite had 139 passed, 2 expected RED failures, 0 skipped tests, 141 total. Five later workflow steps were skipped because the server step failed. These are not a green candidate result. |
| Defects by severity/status | PENDING independent UAT disposition. Do not turn the uncompleted defect assessment into a zero-defect count. The expected RED for reopening is a missing proposed behavior, not an existing UAT defect. |
| Technical debt | PENDING a reviewed debt register. Do not reclassify UAT defects or expected RED assertions as technical debt. |
| Configuration and secrets | PENDING candidate-specific source/configuration review. No secret scan was run for this snapshot. |
| Setup and documentation | Repository instructions and the Lab 7/D2 separation plan were read. Candidate setup was not rerun or verified in a fresh clone during this snapshot. |
| Deployment | No Lab 7 candidate deployment or serving-version readback has been verified. PENDING. |
| Selected user checks | No new end-user checks were run for this snapshot. PENDING. |
| Current CI | No combined status entries were returned for the current PR #92 test-only head at capture time. Candidate CI is PENDING. |

Readiness can change only after the accepted baseline is resolved, the change completes its same-test RED/GREEN sequence, exact-head review and current CI pass, and the intended release/deployment and changed/preserved user checks are evidenced. The Lab 7 PDF remains separate from Deliverable 2. This record does not authorize deployment or alter Lab 6.


## Current-state refresh - 25 November 2026, 18:41:29 Asia/Bangkok

The initial readiness table above is the dated 18:06:58 snapshot. Its claim that PR #92 had no implementation was incomplete: implementation commit `3203c3a` was already recorded at 18:05:22 Bangkok, while its CI run was still running at the snapshot time. Run 45601152925 completed successfully at 18:07:14 Bangkok. The snapshot's combined-status API had no entries; this was not a Check Runs result.

| Gate | Current evidence and status |
|---|---|
| Lab 7 implementation candidate | PR #92 current head `10455948c40d65e476280936cde9abb278aa4bcc`; latest code implementation commit `7c4818cd6b6b7a11d0ce6fd668bc11a54872a302`. PR remains draft and B's exact-head review is pending. |
| Candidate tests and build | CI 45604842565 on the implementation commit: server `npm test` 214 passed/0 failed/0 skipped; client `npm test` 8/0/0; both builds and Docker succeeded. Current PR-head `test-and-docker` Check Run 45605366295 completed successfully at 18:34:10 Bangkok. The latest head commit retains evidence and does not change the implementation source. |
| Historical RED | Run 45597034491 remains an intentional preimplementation RED: 139 existing checks passed, 2 new reopening assertions failed, 0 test skips. Five later workflow steps were skipped after server failure; these are pipeline steps, not skipped tests. |
| Accepted baseline and UAT | Still PENDING. Lab 6's final acceptance and independent defect disposition remain unresolved; no zero-defect finding is claimed. |
| Migration preservation, main release and deployment | PENDING. CI green does not prove old-data migration preservation, reviewed integration, serving version, traffic, or end-user checks. |

For PR #92, the combined commit-status endpoint currently returns no status entries. The separate Check Runs endpoint returns the successful `test-and-docker` result above. Overall readiness remains **NOT READY** until B's exact-head review, accepted-baseline/UAT disposition, migration evidence, reviewed release/deployment and changed/preserved user checks are complete. Lab 7 remains separate from the D2 PDF; this update does not alter or execute Lab 6.
## Current-state refresh - 25 November 2026, 20:30:15 Asia/Bangkok

PR #92 is A-authored, open and unmerged at head 45f48cdcd0999e2dbbb5cb4e70638999ff25e3e8. B's exact-head C7 review is pending. GitHub Actions run 45613368930 reports a successful test-and-docker check (check-run 139202364446); the job log shows 219 server tests, 10 client tests and 10 browser tests passed, with both builds and Docker successful.

The run checked merge commit cb6b9f1368e793fed288d2ebac484fc1b5e2b3ca, whose base was a49cbe7. Current sprint-2-staging is 5e7a164, two commits ahead of the PR's recorded base. Therefore the PR still needs a current-base integration check and B review; the exact-head check above does not establish that newer integration. The PR is mergeable according to GitHub, but no merge, release, deployment, migration-preservation test or new UAT is claimed here.

The accepted Lab 6 baseline and independent UAT disposition remain PENDING. Migration preservation, main release, deployment, and changed/preserved user checks remain PENDING. Overall readiness remains NOT READY. This Lab 7 refresh is separate from D2 and does not change Lab 6.

## Current-state refresh - 25 November 2026, 21:10:44 Asia/Bangkok

PR #92 is open/unmerged at exact head `d1b41c3d4fc86361110d5f65357cdef1d89f8aeb`, targeting `sprint-2-staging` at `eeae87524a340b3463866f199cec7e1bb59b1ef9`. GitHub Actions run 45627723318 checked merge commit `43bcdd04900bf995c511d62f3b1b40e81ab4643e` and reports the test-and-docker check successful: server 219/0/0, client 10/0/0, browser 10/0/0; both builds and Docker passed. This is current-base integration evidence. B's exact-head C7 review remains pending; no PR approval or merge by B is claimed.

TEST-111's separate historical-data check passed in disposable CI run 45609911425 on synthetic PostgreSQL 16 data: nine pre-change tables had seeded old values; four survey variants were preserved, statusVersion was initialized to zero, and no audit events were fabricated. This automated test does not verify migration of the final accepted Lab 6 database or deployed production data. The accepted Lab 6 baseline and independent UAT disposition remain pending; release/deployment, production migration verification, serving revision, traffic, and changed/preserved-user checks remain pending. Overall readiness remains NOT READY. Lab 7 remains separate from D2, and no Lab 6 files or live data were changed.
