# Part F — Working Sprint 1 and verification (evidence)

*Every `TODO` below must be replaced with real evidence before `python tools/build_report.py --final` will build the PDF. Evidence comes from the release tag `v1.0.0-sprint1`, never from an AI statement.*

## F.1 Release and setup summary

- Release tag and commit: TODO (full SHA, date). Tested commit for every result below: TODO (same SHA, or state the exception).
- Dependencies: Node TODO, PostgreSQL TODO. Environment variables: `DATABASE_URL`, `PORT`, `SESSION_TTL_HOURS`, `SEED_PASSWORD`, `CLIENT_ORIGIN`, `NODE_ENV` (examples in `server/.env.example`; no real secrets).
- Commands: TODO (copy the real install, migrate, seed, run and test commands from the README).
- Test accounts: seeded `@classpulse.test` addresses; the password is shared through the private course handoff, not written here.

## F.2 Program demonstrations

*Each scenario: feature and AC IDs, role, starting conditions, steps, expected result, actual result, with screenshots. Release commit: TODO.*

### DEMO-1 Normal journey and persistence (F-03, F-04, F-05; AC-10, AC-13, AC-19, AC-21, AC-28, AC-30; NFR-05)
TODO screenshots and caption: owner creates and publishes; student submits and sees confirmation; the server is restarted and the saved response is retrieved again; owner sees the summary.

### DEMO-2 Business-rule rejections (F-04; AC-22, AC-23)
TODO screenshots and caption: the same student submits again and gets `ALREADY_RESPONDED`; a submission to the closed survey gets `SURVEY_NOT_OPEN`.

### DEMO-3 Login, logout and forbidden operations (F-01, F-03, F-05; AC-01, AC-04, AC-16, AC-32)
TODO screenshots and captions, plus the API evidence: a student calling an owner endpoint gets 403; another owner opening the summary gets 404.

## F.3 Build and test results

TODO commands, commit, and the readable output with passed / failed / skipped counts for the server tests, client tests and Playwright journey (from `docs/sprints/sprint-1/evidence/release-*.txt`).

## F.4 Acceptance criteria to tests

See the AC → test → result table in `docs/sprints/sprint-1/test-results.md` (automated tests and manual checks are labelled separately).

## F.5 Two test excerpts with TDD evidence

### Domain rule — TEST-25, simultaneous submissions store exactly one response (F-04)
TODO the setup and assertion lines from the real test file, the execution result, and the red-then-green versions (red commit and output file, green commit and output file).

### Ownership restriction — TEST-19, another owner cannot publish my survey (F-03)
TODO the setup and assertion lines from the real test file, the execution result, and the red and green versions.

## F.6 Two Issue and PR chains

TODO for two completed Issues (one per student): Issue number, feature and contract IDs, branch name, author, reviewer, the substantive review comment, merge into `sprint-1-staging`, release PR into `main`. Include the final board screenshot and the release reference.

## F.7 History sequence

TODO `git log` excerpt with commit IDs and dates showing, for F-03 and F-04: contract commit, then red commit, then green commit.

## F.8 Contributions

See `docs/contributions.md`.

## F.9 AI use

See `docs/ai-use.md`.

## F.10 Known limitations, failed and skipped tests

TODO list what is incomplete or manual (for example: NFR-05 and NFR-09 are manual checks in Sprint 1; no test for simultaneous publish requests; Docker, CI and GCP are Lab 5), and any failed or skipped test with the reason. Write "none" only if the test output shows none.
