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
| Complete server suite | Pending integrated-source execution |
| Complete client suite | Pending integrated-source execution |
| Server/client builds | Pending integrated-source execution |
| Fresh-clone Docker checks / C-03 | Pending integrated-source execution |
| Required test-and-docker Actions run / C-01 | Pending integration PR run |

## Merge and handoff

The integration PR targets sprint-2-staging and requires B's review, passing checks and a merge commit. It retains the earlier PRs as traceability records. Each owner records the integration outcome on their own Issues. A's #36/#37 review work is complete, while integration validation and the final required CI result remain the immediate dependency.

Live deployment, WIF, environment/ruleset changes and deployed persistence evidence retain their human setup gates. This integration does not provision cloud resources.
