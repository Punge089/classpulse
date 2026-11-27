# F-06 coverage checkpoint

This is a review checkpoint, not final acceptance. The test-only API RED preceded the implementation. Most boundary, browser and interaction cases below were added after implementation and are not claimed as RED.

| Contract | Observed coverage | Remaining work |
|---|---|---|
| AC-120, TEST-120/121 | API replacement, order, 1/20 questions and 2/6 choices; browser edits and reorders before publish and response. | Direct add/remove and type-switch-back persistence should be checked explicitly. |
| AC-121, TEST-122 | Empty/21 questions, blank/long prompt, 1/7/duplicate/blank/long choices, invalid token, unexpected fields and rollback assertions. | Explicit valid length endpoints, malformed top-level shapes and every field-detail mapping remain to be checked. |
| AC-122, TEST-123 | API rejection for published, closed and reopened surveys with preserved questions. | Confirm answer-row preservation on an already-responded published survey explicitly. |
| AC-123, TEST-124 | 401, 403, foreign 404, missing and malformed IDs. | Compare the full public 404 envelope where appropriate. |
| AC-124, TEST-125 | Stale token and concurrent same-token winner tests. | Review the result on final candidate. |
| AC-125, TEST-126 | Three concurrent publish/edit attempts with complete serial outcome. | This sampling does not prove every possible scheduler interleaving. |
| AC-126, TEST-127/128 | Forced second-insert database error and preservation of inconsistent draft responses. | Review test trigger cleanup and final CI. |
| AC-127, TEST-129/130 | UI link, save/token, validation, stale-value preservation, cancel and non-draft checks; browser create/edit/reorder/reload/publish/respond/summary. | Explicit loading and network-failure interaction tests remain. |
| AC-128, TEST-131 | Current branch CI runs server/client/browser regressions and builds. | Exact final head, peer review, staging merge and coordinated release remain. |

CI run 45830420400 on feature head 9065e0e against staging a3a0424 reported 267 server, 21 client, and 12 browser tests passed; zero failed or skipped, and server/client builds and Docker passed. The earlier browser failure in run 45805628115 is retained in Issue #90. `git diff --check` against staging currently reports a final blank line in the preserved raw local UI test output; no application file warning was observed.

## Later checks, 26 November

- Subsequent tests exercise add/remove and switching both types across two saves, valid prompt/option length endpoints, malformed body shapes, and preservation of a published response and its answer. They were written after implementation.
- Client tests subsequently cover announced loading and preservation/retry after a network failure. Field-detail assertions are still not exhaustive; the ordering race is sampled rather than exhaustively scheduled.
- CI 45850372922 on feature head e3344c8 against staging a3a0424 reported 271 server, 23 client and 12 browser tests passed, zero failed or skipped; both builds and Docker passed.
- CI 45834540385 attempt 1 on a0c1444 had 11 browser passes and one existing TEST-32 failure waiting for the Email field; the Docker step was skipped. Attempt 2 on the same head passed 267 server, 21 client and 12 browser; the timeout's root cause remains unknown.
- Independent B review, current-head CI after any further change, final staging integration and the coordinated release remain pending. The local raw-output whitespace warning above remains visible.
