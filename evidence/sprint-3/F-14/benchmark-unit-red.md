# F-14 TEST-282/283 preimplementation RED

CI: https://github.com/Punge089/classpulse/actions/runs/45995737483
Feature head: d50ccce9a937bbe37319110d56b4aa7441b44063
Base: 5fe00fd3e065cc6fb0cb1edd0aaf80ae5bfbd347
Actions checkout: b82d1672169e0fb65be6d5068edfbbbf51c9d0c8
Command: npm test in server
239 passed, 7 failed, 0 skipped tests. The test-only commit exports executable stubs; their missing analysis/validation behavior caused every intended failure. No compilation, missing module or setup failure was observed.
Skipped workflow steps: Test client, Build server, Build client, Install Chromium for preserved and maintenance browser tests, Reseed synthetic CI accounts for browser tests, Test complete browser suite, Build Docker image locally, Post Set up Node.js 24.

Selected original output with terminal formatting removed:

```text
test-and-docker	Test server	2026-11-27T12:06:28.3453094Z  FAIL  tests/tools/summaryBenchmark.test.ts > TEST-282 records every sample, uses nearest rank 19 and accepts 500ms
test-and-docker	Test server	2026-11-27T12:06:28.3465191Z Error: Summary sample analysis has not been implemented
test-and-docker	Test server	2026-11-27T12:06:28.3554372Z  FAIL  tests/tools/summaryBenchmark.test.ts > TEST-282 rejects a p95 of 500.001ms without rounding down
test-and-docker	Test server	2026-11-27T12:06:28.3555123Z Error: Summary sample analysis has not been implemented
test-and-docker	Test server	2026-11-27T12:06:28.3560403Z  FAIL  tests/tools/summaryBenchmark.test.ts > TEST-282 rejects wrong sample counts and invalid durations
test-and-docker	Test server	2026-11-27T12:06:28.3562889Z Received: "Summary sample analysis has not been implemented"
test-and-docker	Test server	2026-11-27T12:06:28.3595472Z  FAIL  tests/tools/summaryBenchmark.test.ts > TEST-282 reports a failed response or wrong summary instead of dropping it
test-and-docker	Test server	2026-11-27T12:06:28.3597994Z Received: "Summary sample analysis has not been implemented"
test-and-docker	Test server	2026-11-27T12:06:28.3605154Z  FAIL  tests/tools/summaryBenchmark.test.ts > TEST-283 accepts explicitly approved loopback targets and test database name
test-and-docker	Test server	2026-11-27T12:06:28.3607882Z "Error: Benchmark target validation has not been implemented"
test-and-docker	Test server	2026-11-27T12:06:28.3613597Z  FAIL  tests/tools/summaryBenchmark.test.ts > TEST-283 rejects unsafe app targets, wrong database names or ports, and overrides
test-and-docker	Test server	2026-11-27T12:06:28.3616280Z Received: "Benchmark target validation has not been implemented"
test-and-docker	Test server	2026-11-27T12:06:28.3621235Z  FAIL  tests/tools/summaryBenchmark.test.ts > TEST-283 rejects invalid configuration without exposing the private URL
test-and-docker	Test server	2026-11-27T12:06:28.3639954Z       Tests  7 failed | 239 passed (246)
test-and-docker	Test server	2026-11-27T12:06:28.3665944Z ##[error]Error: Summary sample analysis has not been implemented
test-and-docker	Test server	2026-11-27T12:06:28.3675299Z ##[error]Error: Summary sample analysis has not been implemented
test-and-docker	Test server	Received: "Summary sample analysis has not been implemented"
test-and-docker	Test server	Received: "Summary sample analysis has not been implemented"
test-and-docker	Test server	"Error: Benchmark target validation has not been implemented"
test-and-docker	Test server	Received: "Benchmark target validation has not been implemented"
```
