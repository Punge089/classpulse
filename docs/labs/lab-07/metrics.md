# Lab 7 metrics

Issue #89. Owner: Student B/book6349. Reviewer: Student A/Punge089. Snapshot: 25 November 2026, 18:06:58 Asia/Bangkok. Product scope: ClassPulse only; the partner Workflow application is excluded. Counts and source rows are in [the dated snapshot](../../../evidence/lab-07/metrics/2026-11-25-snapshot.md).

The historical window is 5-8 November 2026 Asia/Bangkok for Sprint 1 completion and staging integration. Current-state metrics were captured on 25 November 2026. Numerators and denominators use the explicitly listed parent Issues or staging PRs; child Issues and releases to `main` are outside those counts.

| ID | Metric, scope and calculation | Value at snapshot | Source |
|---|---|---|---|
| M1 | Sprint 1 parent Issue closure: closed Issues #1-#11 ÷ 11 original parent Issues | 11/11 (100%); all closed by 8 Nov 2026 | METRIC-SNAPSHOT-2026-11-25, Issue rows #1-#11 |
| M2 | Sprint 1 staging integration: merged PRs #12-#26 with base `sprint-1-staging` ÷ 15 selected integration PRs | 15/15 (100%) | METRIC-SNAPSHOT-2026-11-25, PR rows #12-#26 |
| M3 | Named test suite on a pinned test commit: server `npm test` on test-source commit `3f8918c`, run 45597034491 | 139 passed, 2 failed, 0 test skips; 141 total. The two failures are the new reopen checks receiving 404 instead of expected 200. This is intentional preimplementation RED. | METRIC-SNAPSHOT-2026-11-25; [run 45597034491](https://github.com/Punge089/classpulse/actions/runs/45597034491) |
| M4 | ClassPulse independent UAT defect disposition: count only after the assessed UAT team records an actual disposition | PENDING. The current Lab 6 checkpoint does not support a final no-defect conclusion; do not report zero. | `docs/labs/lab-06/checkpoint-20261124.md`; `part-d-readiness.md` |
| M5 | Lab 7 implementation-candidate CI: results for the candidate commit only | PENDING. No implementation candidate exists; PR #92 head `a9cdbce` is test-only and had no combined status entries at capture time. | METRIC-SNAPSHOT-2026-11-25; PR #92 |

M1 and M2 reconcile offline from the compact Issue and PR ID/date lists in the evidence file. M3 is a test-first failure against the old implementation, not evidence that a delivered candidate is ready. Refresh current-state rows and candidate CI before the final PDF; retain this dated snapshot rather than replacing it.

Interpretation (57 words): The Sprint 1 parent scope and its selected staging PRs are complete, but this does not establish Lab 7 readiness. The new behavior has an honest RED result, while a candidate green run, independent UAT disposition and release evidence are still pending. A should finish the scoped change and deployment chain; B will refresh these metrics against the exact candidate before submission.
