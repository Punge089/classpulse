# F-14 first full local summary benchmark

Measured product source and request tool: `f96c94e13cbef4b569df0400bfa4207464a6e680`. At 2026-11-27T12:25:00.492Z, on win32 10.0.26200, AMD Ryzen 9 8940HX with Radeon Graphics        , 24883544064 bytes RAM, v24.19.0 and postgres (PostgreSQL) 18.4. Compiled server in production mode bound to 127.0.0.1, PostgreSQL dedicated local cluster on port 5547.

- 500 distinct synthetic eligible respondents, 20 questions (10 rating and 10 six-choice), 10,000 answers, five validated warmups, one request at a time. Raw ordered and sorted durations and per-run metadata are in [benchmark-disposable-result.json](benchmark-disposable-result.json).
- All bodies matched independent expected buckets; anonymous request 401, respondent 403, foreign owner 404 and owner 200. Nearest-rank p95 was 49.090400000000045 ms (rank 19 of 20), inside the 500 ms baseline limit. The measured interval runs from request invocation through body receipt, before parsing and validation.
- Five table counts (users, courses, surveys, responses, answers) were zero before setup and after scoped cleanup. The dedicated cluster was stopped; its temporary directory was removed.
- An initial environment run held an inherited output pipe open during PostgreSQL startup. The agent stopped only that instance after verifying its PID and port. The pending create-database and duplicate stop calls subsequently failed. The successful rerun captures process output via files and uses the same benchmark assertions.
- [RED CI 45997667523](https://github.com/Punge089/classpulse/actions/runs/45997667523) at 5889f9c: server npm test 246 passed, 3 expected failures, 0 skipped tests. The eight skipped workflow steps were Test client, Build server, Build client, Install Chromium for preserved and maintenance browser tests, Reseed synthetic CI accounts for browser tests, Test complete browser suite, Build Docker image locally, Post Set up Node.js 24.
- [GREEN CI 45997993222](https://github.com/Punge089/classpulse/actions/runs/45997993222) tested checkout 752b73fe9472c98e00a45c49a5dfd1e96d070f45 for f96c94e: server/client npm test 249/16 passed; npm run test:e2e -- --reporter=line 13 passed. Zero failed or skipped; builds and Docker passed. Ten benchmark unit tests ran.

## Reproduction

From a clean checkout of the measured source, run `npm --prefix server ci`. Copy the preserved Python launcher and JavaScript driver from this directory to that checkout's ignored `autopilot/` folder. Run `py -X utf8 autopilot/run-benchmark-disposable.py` from the checkout root. This snapshot targets the specified Windows PostgreSQL 18 and Node install paths with free loopback port 5547. It creates an isolated cluster, applies the existing migrations and builds the server before running the driver. The run uses private synthetic credentials and outputs sanitized JSON.

This evidence verifies the local baseline workload. The final integrated candidate, its full screen/state inventory and its deployed checks still need their own evidence.
