# F-14 TEST-282/283 first GREEN

- [CI 45996267991](https://github.com/Punge089/classpulse/actions/runs/45996267991) evaluated feature head `7a6633e5c0a4ea3876b9bd69a8627dbe38a34988` against staging `5fe00fd3e065cc6fb0cb1edd0aaf80ae5bfbd347`, with exact workflow checkout `9e2c21d7c9e05bc5d440f502ba2d5abe221c3076`.
- Server `npm test`: 246 passed, including all seven unchanged cases from [the retained RED](benchmark-unit-red.md). Client `npm test`: 16 passed. Root `npm run test:e2e -- --reporter=line`: 13 passed. Zero failures/test skips. Build and Docker steps passed.
- This proves the pure sample analysis (exact 20, p95 rank 19, unrounded threshold and failed-sample rejection) and target-validation portion of the agreed benchmark. The full workload, runtime access checks and measured HTTP p95 remain pending. The existing artifact action emitted a Node 20 deprecation warning without failing or skipping a step.

Selected original workflow lines with formatting removed:

```text
test-and-docker	Check out source	2026-11-27T12:09:46.5318620Z 9e2c21d7c9e05bc5d440f502ba2d5abe221c3076
test-and-docker	Test server	2026-11-27T12:10:28.8362137Z  ✓ tests/tools/summaryBenchmark.test.ts (7 tests) 6ms
test-and-docker	Test server	2026-11-27T12:10:31.8757754Z       Tests  246 passed (246)
test-and-docker	Test client	2026-11-27T12:10:33.8382232Z       Tests  16 passed (16)
test-and-docker	Test complete browser suite	2026-11-27T12:11:16.5427803Z   13 passed (23.2s)
```
