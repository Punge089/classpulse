# Product Definition of Done - ClassPulse

**Version 1.0 · 2026-11-06 · Author: Punge089 · Reviewer: book6349**
Applies to every feature, document Issue and release. An Issue is done only when **all** rows hold, with evidence.

| # | Condition | Evidence that proves it (never an AI statement) |
|---|---|---|
| 1 | The required behaviour is implemented as the contract describes | Contract commit ID, implementation commit IDs, PR diff |
| 2 | The planned verification was executed: every AC has a test (or a documented manual check) | STS table in the contract; AC → test → result table in `docs/sprints/sprint-1/test-results.md` |
| 3 | Tests are meaningful and pass: no skipped, disabled or weakened test; assertions checked by a human | Saved output with passed / failed / skipped counts, the command and the tested commit ID |
| 4 | For rule work, the test failed for the intended reason before the code and passed after | `evidence/<feature>-red.txt` then `evidence/<feature>-green.txt`, with their commit IDs and dates |
| 5 | Review is complete: the other student read the diff and tests, ran something, and left a specific check, question, finding or reason for approval; the author did not approve their own PR | PR review thread |
| 6 | Integration is complete: merged into `sprint-1-staging` with a merge commit; the full suite passes on the staging head; the release PR into `main` is reviewed | Merge commit IDs; `evidence/integration-*.txt`; release PR |
| 7 | Setup and documents are current: README steps work from a clean clone; traceability rows hold real test names and results; the contract's version history is up to date | README run by the reviewer; `docs/traceability.md` |
| 8 | No secrets, real passwords or real personal data in Git or in the PDF | Secret `git grep` result in the release PR |
| 9 | Incomplete work, failed or skipped tests and known limitations are disclosed | Known-limitations section of the report; coverage gaps in `docs/traceability.md` |

A claim such as "all tests pass" without the command, counts and commit ID does not satisfy rows 2–3.
