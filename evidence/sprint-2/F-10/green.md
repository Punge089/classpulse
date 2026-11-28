# F-10 server and client verification checkpoint

F-08 was merged by B at 7ff7d52. F-10 continues from the retained TEST-200 and TEST-208 RED. TEST-204 guard assertions remained enabled.

- First isolated server run: 296 passed, 7 failed, zero skipped. TEST-58 failed on the new reviewed course shape, and six legacy Lab 6 fixture tests failed because their immutable schema predates the generated client's sectionId. TEST-58 now retains its exact original row fields and adds the sections array.
- A transitional local run with the client still generated from the pre-compatibility schema recorded 294 passed, 10 failed, zero skipped. The Lab 6 fixture projection was incompatible, and the worktree changed before that run completed. Its results are diagnostic only.
- Corrected migration keeps the approved nullable Enrollment.sectionId and its composite foreign key. Prisma leaves that column outside the generic enrollment projection, and F-10 uses parameterized SQL under its own transactions. No Lab 6 source, fixtures or guards changed. The migration SQL remained byte-equivalent across the generated-client compatibility change.
- Corrected isolated PostgreSQL: migrations, TypeScript build and server npm test passed. All 304 tests passed with zero failed/skipped, including same-test RED/GREEN and real targeted eligibility, role/ownership, response storage and section-history checks. Local client npm test passed 27, plus client build.
- Exact-head CI and dedicated browser journey are separate. Release and deployed checks remain open.

## Supplemental TEST-202 and TEST-203 API coverage

Ran server `npm test` on head 2e195e0 with the test addition in this commit, using a disposable PostgreSQL cluster with all recorded migrations applied. The server build passed and the API and unit suites passed 305/305 across 24 files, with zero failed or skipped. The test verifies that a pair of writes using the same token produces one success and one stale response, invalid and foreign section selections preserve the stored state, a forced fixture-only insert failure rolls back the selection and token, and publication freezes the selection.
