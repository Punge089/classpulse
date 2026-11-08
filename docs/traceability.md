# Requirements traceability - ClassPulse

**Version 1.4 · 8 Nov 2026 · Author: Punge089 · Reviewer: book6349** · see the version history at the end

One row per baseline requirement (18 FR + 14 BR + 10 NFR = 42). Sprint 1 AC and test IDs come from the
Sprint 1 contracts (`docs/sprints/sprint-1/`). The last two columns of the Sprint 1 rows were filled from the output of `python tools/test_results.py` on the release tag `v1.0.0-sprint1` (commit `d4bad74`, Issue I-10 and I-11);
the full table is `docs/sprints/sprint-1/test-results.md`. Rows planned for Sprint 2 or 3 say "not run yet", never "pass".

| Requirement | Feature or responsibility | Sprint | AC | Planned test | Actual test (file::name) | Result @ commit |
|---|---|---|---|---|---|---|
| FR-01 | F-01 Authentication, session and access control | 1 | AC-01, AC-02, AC-03, AC-04, AC-08, AC-09 | TEST-01…05, 08, 09, 55, 56 | auth.test.ts (TEST-01, 02, 03, 04, 05, 55, 56); auth.spec.ts (TEST-08, 09) | PASS, 10 tests @ d4bad74 |
| FR-02 | F-03 Survey authoring and lifecycle | 1 | AC-10, AC-11 | TEST-10, 11, 12 | ownerSurveys.test.ts (TEST-10, 12); surveyValidation.test.ts (TEST-11) | PASS, 29 tests @ d4bad74 |
| FR-03 | F-03 Survey authoring and lifecycle | 1 | AC-10, AC-11 | TEST-10, 11, 12 | ownerSurveys.test.ts (TEST-10, 12); surveyValidation.test.ts (TEST-11) | PASS, 29 tests @ d4bad74 |
| FR-04 | F-03 Survey authoring and lifecycle | 1 | AC-13 | TEST-14 | ownerSurveys.test.ts (TEST-14) | PASS, 1 test @ d4bad74 |
| FR-05 | F-03 Survey authoring and lifecycle | 1 | AC-15 | TEST-17 | ownerSurveys.test.ts (TEST-17) | PASS, 1 test @ d4bad74 |
| FR-06 | F-04 Response submission | 1 | AC-20, AC-29 | TEST-22, 39 | responses.test.ts (TEST-22, 39) | PASS, 2 tests @ d4bad74 |
| FR-07 | F-04 Response submission | 1 | AC-21, AC-28 | TEST-23, 32, 40 | responses.test.ts (TEST-23); respond.spec.ts (TEST-32); journey.spec.ts (TEST-40) | PASS, 3 tests @ d4bad74 |
| FR-08 | F-05 Aggregate summary | 1 | AC-30, AC-31, AC-33, AC-34 | TEST-33, 34, 35, 37, 38, 40 | summary.test.ts (TEST-33, 34, 35, 37); journey.spec.ts (TEST-38, 40) | PASS, 10 tests @ d4bad74 |
| FR-09 | F-03 Survey authoring and lifecycle | 1 | AC-18 | TEST-20 | ownerSurveys.test.ts (TEST-20) | PASS, 1 test @ d4bad74 |
| FR-10 | F-06 Draft editing | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-11 | F-07 Extended question types | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-12 | F-08 Scheduled closing | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-13 | F-09 My responses | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-14 | F-10 Eligibility by section + response rate | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-15 | F-10 Eligibility by section + response rate | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-16 | F-11 Anonymous mode | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-17 | F-12 CSV export | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-18 | F-13 Analysis filters + text answers | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| BR-01 | F-06 Draft editing | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| BR-02 | F-03 Survey authoring and lifecycle | 1 | AC-11 | TEST-11, 12 | surveyValidation.test.ts (TEST-11); ownerSurveys.test.ts (TEST-12) | PASS, 28 tests @ d4bad74 |
| BR-03 | F-03 Survey authoring and lifecycle | 1 | AC-14 | TEST-15, 16 | surveyLifecycle.test.ts (TEST-15); ownerSurveys.test.ts (TEST-16) | PASS, 7 tests @ d4bad74 |
| BR-04 | F-04 Response submission | 1 | AC-23 | TEST-26 | responses.test.ts (TEST-26) | PASS, 1 test @ d4bad74 |
| BR-05 | F-04 Response submission | 1 | AC-24 | TEST-27 | responses.test.ts (TEST-27) | PASS, 1 test @ d4bad74 |
| BR-06 | F-04 Response submission | 1 | AC-22, AC-50 | TEST-24, 25, 50 | responses.test.ts (TEST-24, 25); constraints.test.ts (TEST-50) | PASS, 3 tests @ d4bad74 |
| BR-07 | F-04 Response submission | 1 | AC-25 | TEST-28, 29 | responseValidation.test.ts (TEST-28); responses.test.ts (TEST-29) | PASS, 14 tests @ d4bad74 |
| BR-08 | F-03 Survey authoring and lifecycle | 1 | AC-12 | TEST-13 | ownerSurveys.test.ts (TEST-13) | PASS, 1 test @ d4bad74 |
| BR-09 | F-04 Response submission | 1 | AC-26 | TEST-30 (also asserts PUT and DELETE → 404, per F-04 v1.1) | responses.test.ts (TEST-30) | PASS, 1 test @ d4bad74 |
| BR-10 | F-04 Response submission | 1 | AC-28 | TEST-32 | respond.spec.ts (TEST-32) | PASS, 1 test @ d4bad74 |
| BR-11 | F-08 Scheduled closing | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| BR-12 | F-07 Extended question types | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| BR-13 | F-11 Anonymous mode | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| BR-14 | F-11 Anonymous mode | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| NFR-01 | F-01 Authentication, session and access control | 1 | AC-06 | TEST-06 (stored hash), TEST-57 (no password or token in the server's console output) | password.test.ts (TEST-06); auth.test.ts (TEST-57) | PASS, 2 tests @ d4bad74 |
| NFR-02 | F-01 Authentication, session and access control | 1 | AC-07 | TEST-07 | unauthenticated.test.ts (TEST-07) | PASS, 13 tests @ d4bad74 |
| NFR-03 | F-01 Authentication, session and access control (the middleware); the wrong-role and ownership negative tests live in F-03 (AC-16, AC-17), F-04 (AC-20 owner on the list, AC-26, AC-27, AC-29) and F-05 (AC-32) | 1 | AC-16, AC-17, AC-20, AC-26, AC-27, AC-29, AC-32 | TEST-18, 19, 22, 30, 31, 39, 36 | ownerSurveys.test.ts (TEST-18, 19); responses.test.ts (TEST-22, 30, 31, 39); summary.test.ts (TEST-36) | PASS, 7 tests @ d4bad74 |
| NFR-04 | F-01 Authentication, session and access control | 1 | AC-04, AC-05 | TEST-04, 05 | auth.test.ts (TEST-04, 05) | PASS, 2 tests @ d4bad74 |
| NFR-05 | SR-01 Persistence foundation: schema, migrations, seed, test DB | 1 / Lab 5 | manual check in DEMO-1 (restart, then reload saved response) | manual, no automated test | manual check (DEMO-1: restart, then reload a saved response) | manual, evidence in Part F |
| NFR-06 | F-14 Hardening: performance, responsive UI, error handling | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| NFR-07 | F-14 Hardening: performance, responsive UI, error handling (Sprint 1: the screens of F-01, F-03, F-04, F-05) | 1 / 3 | AC-08, AC-19, AC-28 (3 forms) + manual list-state checklist | TEST-08, 21, 32, 40 + manual | auth.spec.ts (TEST-08); owner-survey.spec.ts (TEST-21); respond.spec.ts (TEST-32); journey.spec.ts (TEST-40) | PASS, 5 tests @ d4bad74 (plus the manual list-state checklist, Part F) |
| NFR-08 | F-11 Anonymous mode | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| NFR-09 | SR-01 Persistence foundation: schema, migrations, seed, test DB | 1 | review checklist in PR template + `git grep` secret check | manual, release PR | manual check on the release PR (template checklist and secret scan) | manual, evidence in the release PR |
| NFR-10 | F-14 Hardening: performance, responsive UI, error handling | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |

## Coverage gaps

- NFR-05 is split: the restart half is checked manually in Sprint 1 (DEMO-1); the redeployment half is verified in Lab 5.
- NFR-06 (performance) has no acceptance criterion yet; it is specified and measured in Sprint 3 (F-14).
- NFR-07 is verified for 3 forms and 3 lists in Sprint 1; the remaining screens are verified in Sprint 3.
- NFR-10 (375 px layout) is verified in Sprint 3; Sprint 1 only avoids breaking it.
- NFR-05 and NFR-09 have no automated Sprint 1 test; they use a manual check and a release-PR review checklist, which is disclosed here on purpose.
- All Sprint 2 and Sprint 3 FR/BR/NFR rows have a feature and sprint but no AC or test yet; this is allowed at this checkpoint and is filled when each sprint's contracts are written.

## Approved changes

| Change | Date | Reason | Approved by |
|---|---|---|---|
| (none yet) | | | |

## Version history

| Version | Date | Change and reason |
|---|---|---|
| 1.0 | 6 Nov 2026 | Initial matrix of the 42 baseline requirements. |
| 1.1 | 6 Nov 2026 | After the review of PR #13 by book6349: NFR-03 now maps the negative tests of F-03, F-04 (including the new survey-detail test AC-29/TEST-39) and F-05, and names the one operation without a test (`GET /api/surveys` as an owner) as a coverage gap. Also brought up to date with the contracts as they stand: FR-01 gains AC-09/TEST-55 and TEST-56 (F-01 v1.1, v1.2), FR-06 gains AC-29/TEST-39, BR-09 notes that TEST-30 asserts PUT/DELETE (F-04 v1.1), NFR-01 gains TEST-57 (F-01 v1.3). |
| 1.2 | 7 Nov 2026 | The NFR-03 gap named in v1.1 is closed: F-04 v1.2 (book6349, commit 42826b8) adds the owner-role `GET /api/surveys` request to TEST-22, which asserts 403 `FORBIDDEN` with no survey list in the body. I read the test in `server/tests/api/responses.test.ts` at that commit before removing the gap. NFR-03 now maps TEST-22 and AC-20, and the gap bullet is gone. |
| 1.3 | 7 Nov 2026 | I-10: the result columns of the 23 Sprint 1 rows that have automated tests are filled (NFR-05 and NFR-09 say "manual" and point to their evidence) from `python tools/test_results.py` on commit `4eb2dce` (server 101, client 1, e2e 8 passed, 0 failed, 0 skipped, exit 0). TEST-40 (journey, `docs/sprints/sprint-1/I-10-journey.md`) is added to FR-07, FR-08 and NFR-07 next to the tests that already covered them. |
| 1.4 | 8 Nov 2026 | I-11: the Sprint 1 results were produced again in a clean clone at the release tag `v1.0.0-sprint1` (commit `d4bad74`): server 101, client 1, e2e 8 passed, 0 failed, 0 skipped, generator exit 0, 39 of 39 acceptance criteria pass. The table is identical to the run on `4eb2dce` apart from the commit and the time, so the result cells now say `@ d4bad74`. |
