# Final metrics evidence - 28 November 2026

Issue #89, Student B/book6349. Product scope is ClassPulse only; partner Workflow is excluded. Readback compiled 28 November 2026, 02:11 Asia/Bangkok from the merged main release, GitHub Actions, A's Issue #89 handoff and the sanitized receipts attached to A's report PR. B did not execute the application tests, production API checks, GCP operations, or UAT in this refresh.

## M1 and M2 - unchanged historical counts

| Metric | Value | Offline reconciliation |
|---|---:|---|
| M1: closed Sprint 1 parent Issues #1-#11 / 11 | 11/11 (100%) | See [2026-11-25 historical snapshot](2026-11-25-snapshot.md), rows for Issues #1-#11. |
| M2: merged selected staging PRs #12-#26 / 15 | 15/15 (100%) | See the same snapshot, rows for PRs #12-#26 and their target branches. |

These are historical Sprint 1 counts; the denominator does not include child Issues, report PRs, or main releases.

## M3 - automated candidate test suites

| Exact commit / run | Suite | Passed | Failed | Skipped |
|---|---|---:|---:|---:|
| main 8316f270cb11d47c75f848de3f3d40acefbe8def / deploy run 46050688714 | server | 272 | 0 | 0 |
| same | client | 23 | 0 | 0 |
| same | browser | 12 | 0 | 0 |
| same | total | 307 | 0 | 0 |

Both builds, Docker and the deploy workflow's migration/update and read-only smoke steps succeeded. See [deploy run 46050688714](https://github.com/Punge089/classpulse/actions/runs/46050688714). This result is on the exact main commit; earlier intentional RED and prior failures remain historical rows, not overwritten.

## M4 - UAT status and related production observations

Independent UAT defect disposition remains **PENDING**. No no-defect/zero-defect conclusion is supported by this developer-run receipt.

A/Punge089 reported a separate live API check on commit 8316f27 and serving revision classpulse-00008-qlw. The sanitized receipt at report PR #104 head b75f410, file `evidence/lab-07/report/inputs/nov28-live-reopen.json` (SHA-256 bf3a2d469eb619e078baa2b889b2d6adf14f85fe637a4a046b3668f5655f607b), records these 14 checks, all PASS:

| Observation IDs | Result |
|---|---|
| auth-owner, auth-respondent, auth-other | 3/3 PASS; expected synthetic roles returned |
| fixture-create, fixture-publish | 2/2 PASS; synthetic survey created and first publication retained |
| fixture-original-response, fixture-original-summary | 2/2 PASS; response 17 saved; count 1 / average 4 |
| fixture-close | 1/1 PASS; CLOSED, version 2 |
| L7-B11a, L7-B11b | 2/2 PASS; reopen to PUBLISHED, version 3, first publishedAt retained, one reasoned REOPEN event plus prior CLOSE/PUBLISH observed |
| L7-B12a, L7-B12b, L7-B12c, L7-B12 final | 4/4 PASS; response 17/rating 4 and summary unchanged; duplicate 409 ALREADY_RESPONDED; different lecturer read/reopen 404; summary/history unchanged |

Total: 14/14 PASS, 0 failures, 0 skipped. Owner, respondent and other-lecturer sessions each logged out with HTTP 204. The receipt states these were authenticated API checks; it does not claim a separate production browser run or independent UAT. Source handoff: [Issue #89 comment 7226082351](https://github.com/Punge089/classpulse/issues/89#issuecomment-7226082351).

## M5 - release CI and production workflow

| Run | SHA / scope | Jobs / outcome |
|---|---|---|
| 46049699597 | PR #143 head 2f99a06 -> main bee0d122 | Exact release CI passed 272 server, 23 client, 12 browser; no failures/skips, builds and Docker passed. |
| 46050688714 | Main merge 8316f270cb11d47c75f848de3f3d40acefbe8def | test-and-docker and deploy jobs both success (2/2); deploy/migration/update and automated read-only smoke passed. |

A's sanitized production readback `evidence/lab-07/report/inputs/nov28-live-readback.json` at PR #104 head b75f410 (SHA-256 45f4a84f94062cbda7b5b9f38c043825765bbd6f033f1cd38676a239d664a6c2) records: Cloud Run revision classpulse-00008-qlw at 100% traffic before/after; migration job classpulse-migrate-62khg, migration 20261125110000_survey_lifecycle_audit, 1/1 task succeeded, exit code 0; legacy sample survey 26 / response 15 remained HTTP 200 with both answers intact; image index digest sha256:7acc661c6f49606a63ad1c536b5657fe46ca72fa2e99c4a139876cdd867ed389 and corresponding platform manifest sha256:60c23699db69a6badb92f50d638fed23885498d12b9e2e7f9a0d6e3a34ab2b0a. The automated smoke checked /api/health, /api/ready, /, and /api/auth/me. The legacy readback is one sample, not a complete historical-data audit.

Report documentation CI is separate: run 46053752670 passed on PR #104 head b75f410. A reports 84 local source checks passed, 0 failed/skipped, plus structural checks on all 30 draft pages. These checks do not constitute B's final PDF approval or a submission receipt.

## Scope and limit

These are recorded workflow and A-operated observations, not tests or UAT performed by B. Independent UAT defect disposition and B's exact final PDF review remain pending; overall report readiness remains NOT READY. No LEB2 upload or submission receipt is claimed.