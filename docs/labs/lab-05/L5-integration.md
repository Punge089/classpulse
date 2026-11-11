# Lab 5 integration validation

Issue #41, owner Punge089, reviewer book6349. This branch combines the existing feature commits so the application, image and required CI job can be tested together.

## Source and review history

| Source | Head | Existing review/evidence |
|---|---|---|
| Rules, PR #34 | 452680a | B approved the documentation change. |
| Cloud-ready app, PR #39 | 4eaba0e | A approved after server 105/105, client 1/1, both builds and six production routing checks. |
| Docker, PR #35 | 0dd6157 | Contract received B's C3 before red tests. Combined-snapshot rehearsal passed Docker 4/4 after the integer-ID harness fix. B's final PR review remains pending. |
| CI, PR #40 | 127a4f6 | A reviewed the workflow, pins and permissions. The original CI run passed tests/builds and failed the image step because this source branch lacked the Dockerfile. |

All source heads are retained as merge parents. Each feature's contract, red and implementation commits remain in history. The integration changes arrive through those parents. Corrections to B-owned source remain B's responsibility.

## Validation

Run the full server/client suites, both builds and the real test-and-docker job against this integrated source. Clone the pushed integration branch into a clean directory and run tools/lab5/test-docker.mjs with Docker available, recording the exact SHA. The harness supplies only public disposable fixture settings and creates isolated database volumes.

| Check | Result |
|---|---|
| Complete server suite | At 1c3c95f, npm --prefix server run test passed 105/105 in 14 files, 0 failed/skipped. |
| Complete client suite | At 1c3c95f, npm --prefix client run test passed 1/1, 0 failed/skipped. |
| Server/client builds | Both npm --prefix server run build and npm --prefix client run build passed at 1c3c95f. |
| Fresh-clone Docker checks / C-03 | Fresh remote clone of 1c3c95f passed all four Docker checks, 0 failed/skipped. |
| Required test-and-docker Actions run / C-01 | [Run 43087403001](https://github.com/Punge089/classpulse/actions/runs/43087403001) succeeded at 1c3c95f, including the complete tests, both builds and application Docker build. |

### C-03 reproduction and observations

On 12 November 2026, cloned the pushed integration branch into a new directory with git clone --single-branch --branch feature/41-lab5-integration https://github.com/Punge089/classpulse.git and verified HEAD was 1c3c95f64d8c0b4495d2d8a1e6bd3957a0108307. Ran node --test tools/lab5/test-docker.mjs from the fresh source with Docker Desktop available. No host node_modules or private environment file was copied into that clone.

The harness supplies public disposable fixture values through the documented configuration interface. It builds the application image, checks its non-root UID and required runtime files, tests synthetic context exclusions, rejects missing required inputs, serves on runtime port 3100, verifies five seeded accounts, confirms a failed initializer prevents the app from running, and reads the same survey after app replacement. It cleans up only its disposable projects and volumes.

The actual result was 4 tests passed, 0 failed, 0 skipped, with a 46.2-second total runtime. The named tests were L5-3-T1 through L5-3-T4. This establishes the local clean-clone C-03 check; deployed-service C-04/C-05 remain pending their separate live evidence.

## Merge and handoff

The integration PR targets sprint-2-staging and requires B's review, passing checks and a merge commit. It retains the earlier PRs as traceability records. Each owner records the integration outcome on their own Issues. A's #36/#37 review work is complete, while integration validation and the final required CI result remain the immediate dependency.

Live deployment, WIF, environment/ruleset changes and deployed persistence evidence retain their human setup gates. This integration does not provision cloud resources.
