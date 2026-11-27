# Lab 6 · CP-FIX-001 independent isolated AC-04 verification

**TEST-04 passed.** The unchanged auth test file passed 8 tests, with 0 failed, 0 skipped and exit code 0. This records the isolated API/DB method proposed by ClassPulse A. Thira reported that Ashira agreed to the method before execution. Ashira’s review of the completed evidence and D’s updated acceptance decision are pending.

| Field | Actual |
| --- | --- |
| Exact source | `bee0d122bf23410e3d2db69649ad5e44959b6cd8` (CP-FIX-001), clean before and after |
| Serving revision | N/A |
| Operator | Codex (GPT-6.2 Sol) under Thira (D) |
| Time | 27 November 2026, 01:15:20.386–01:15:23.973 Asia/Bangkok |
| Runtime | Windows x64, Node 24.14.0, npm 11.9.0, Vitest 2.1.9, PostgreSQL 16.16 |
| Command from `server` | `npm test -- tests/api/auth.test.ts --reporter=verbose` |
| Database | Fresh disposable `classpulse_test` on a separate PostgreSQL instance listening only on `127.0.0.1:61247`. Matched the instance’s data directory and verified zero public tables before migration. Stopped the instance and verified that the listener closed. |

The verbose output names TEST-04 as passed. The existing assertions verified logout HTTP 204, a session-cookie clearing directive, HTTP 401 `UNAUTHENTICATED` when the isolated API test checked the original session after logout, and a count of zero session rows for the test user after starting with one. The suite ran with a process-only synthetic fixture secret. The test source remained unchanged.

Earlier database startup attempts ended before Vitest. The first Vitest invocation reached the fixture hook without `SEED_PASSWORD`, which caused all eight tests to stop at setup. The final invocation used a freshly created empty database in the same isolated instance and a synthetic seed setting. The earlier output is retained separately.

This is an isolated verification result. **Live M01 remains BLOCKED in the historical live record.** No live app, Cloud SQL, shared database or preserved exercise database was used. AC-04 and whole-product acceptance are for C and D to review on the agreed basis.

[Verbose output](auth-test-output.txt) · [Run record](run-record.json) · [Database setup](setup-output.txt) · [Earlier fixture setup failure](fixture-setup-failure-output.txt)
