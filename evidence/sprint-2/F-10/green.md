# F-10 server and client verification checkpoint

F-08 was merged by B at 7ff7d52. F-10 continues from the retained TEST-200 and TEST-208 RED. TEST-204 guard assertions remained enabled.

- First isolated server run: 296 passed, 7 failed, zero skipped. TEST-58 failed on the new reviewed course shape, and six legacy Lab 6 fixture tests failed because their immutable schema predates the generated client's sectionId. TEST-58 now retains its exact original row fields and adds the sections array.
- A transitional local run with the client still generated from the pre-compatibility schema recorded 294 passed, 10 failed, zero skipped. The Lab 6 fixture projection was incompatible, and the worktree changed before that run completed. Its results are diagnostic only.
- Corrected migration keeps the approved nullable Enrollment.sectionId and its composite foreign key. Prisma leaves that column outside the generic enrollment projection, and F-10 uses parameterized SQL under its own transactions. No Lab 6 source, fixtures or guards changed. The migration SQL remained byte-equivalent across the generated-client compatibility change.
- Corrected isolated PostgreSQL: migrations, TypeScript build and server npm test passed. All 304 tests passed with zero failed/skipped, including same-test RED/GREEN and real targeted eligibility, role/ownership, response storage and section-history checks. Local client npm test passed 27, plus client build.
- Exact-head CI and dedicated browser journey are separate. Release and deployed checks remain open.

## Supplemental TEST-202 and TEST-203 API coverage

Ran server `npm test` on head 2e195e0 with the test addition in this commit, using a disposable PostgreSQL cluster with all recorded migrations applied. The server build passed and the API and unit suites passed 305/305 across 24 files, with zero failed or skipped. The test verifies that a pair of writes using the same token produces one success and one stale response, invalid and foreign section selections preserve the stored state, a forced fixture-only insert failure rolls back the selection and token, and publication freezes the selection.

## C7 follow-up: executable TEST-210 and TEST-211

B requested the two in-scope test files after reviewing source 5c316de. TEST-210 now runs the real earlier migration chain in a uniquely named schema in classpulse_test, seeds legacy rows, applies the actual F-10 migration and verifies preserved rows and snapshots, accepted same-course links and rejected cross-course links. TEST-211 uses the actual owner pages and exercises loading, no sections, pending writes, validation, stale reload, network retry, cancel and the two zero-rate states against saved response totals.

Local PostgreSQL: server `npm test -- tests/db/sectionEligibilityMigration.test.ts` passed 1/1. Client `npm test -- --run tests/sectionEligibility.test.tsx` passed 5/5. Zero failed or skipped. The server and client builds passed. No application behavior changes were needed in the C7 follow-up. The original TEST-200 and TEST-208 RED checkpoints remain in the branch history.

## TEST-213 summary scale RED

On source 13bc573 plus this test, the disposable PostgreSQL run applied all migrations and built the server. The full server `npm test` reproduced the owner summary HTTP 500 with 500 saved responses and 20 questions. The initial focused diagnostic selected only this test (one failed and five unselected). The full run failed once with zero test skips.

```text
FAIL tests/api/sectionEligibility.test.ts > TEST-213 preserves the owner aggregate at 500 responses and 20 questions
AssertionError: expected 500 to be 200
Test Files  1 failed | 26 passed (27)
Tests       1 failed | 320 passed (321)
```

The separate F-14-sized benchmark on GitHub test checkout b8f7974 also returned HTTP 500 on the first warmup and reported PostgreSQL SQLSTATE 54001. No samples were accepted.
