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

Interpretation at the initial 18:06 snapshot (57 words): The Sprint 1 parent scope and its selected staging PRs are complete, but this does not establish Lab 7 readiness. The new behavior has an honest RED result, while a candidate green run, independent UAT disposition and release evidence are still pending. A should finish the scoped change and deployment chain; B will refresh these metrics against the exact candidate before submission.


## Current-state refresh - 25 November 2026, 18:41:29 Asia/Bangkok

| ID | Current measurement | Value and evidence |
|---|---|---|
| M1 | Sprint 1 parent Issue closure, Issues #1-#11 ÷ 11 | 11/11 (100%); source rows remain in METRIC-SNAPSHOT-2026-11-25. |
| M2 | Sprint 1 staging integration, merged PRs #12-#26 ÷ 15 | 15/15 (100%); all selected PRs target `sprint-1-staging`; source rows remain in METRIC-SNAPSHOT-2026-11-25. |
| M3 | Named implementation suite on the Lab 7 code candidate: server `npm test` on code commit `7c4818cd6b6b7a11d0ce6fd668bc11a54872a302`, CI run 45604842565 | 214/214 passed, 0 failed, 0 skipped. Client `npm test`: 8/8 passed, 0 failed, 0 skipped; both builds and Docker passed. The latest code change is this implementation commit; later PR-head commit `1045594` only retains test/evidence records. [Run 45604842565](https://github.com/Punge089/classpulse/actions/runs/45604842565). |
| M4 | ClassPulse independent UAT defect disposition | PENDING. The 24 Nov Lab 6 checkpoint still does not support a final no-defect conclusion; no zero-defect value is claimed. |
| M5 | Current PR #92 candidate-head required check | 1/1 `test-and-docker` check succeeded on exact head `10455948c40d65e476280936cde9abb278aa4bcc`, run 45605366295 (completed 18:34:10 Bangkok). The combined commit-status API returned no status entries; the separate Check Runs API reports this success. PR #92 remains draft/unmerged, so release and deployment status are pending. |

### Preserved RED and time-bound correction

The 18:06:58 snapshot's PR query returned test-only head `a9cdbce`, but it omitted already-committed implementation `3203c3a` (18:05:22 Bangkok). At that snapshot, CI run 45601152925 was still in progress; its `test-and-docker` Check Run later completed successfully at 18:07:14 Bangkok. This follow-up corrects the missing implementation/check-run context without rewriting the earlier snapshot as green. The original old-code RED remains separately recorded: 139 existing checks passed, 2 new reopen assertions failed, 0 tests skipped.

Interpretation at the current refresh (59 words): The maintained branch now has a successful current-head check and 214 passing server tests plus 8 passing client tests, while the first snapshot remains a valid record of the earlier RED and pending state. Submission is still NOT READY: independent UAT disposition, A's exact-head review, migration preservation, main release and deployed user checks remain open. A owns those release steps; B will refresh the evidence against each accepted head.
