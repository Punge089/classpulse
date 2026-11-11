# L5-4 CI and Docker contract

Issue [#37](https://github.com/Punge089/classpulse/issues/37). Student B owns the workflow; Student A reviews. Scope: R-01, R-02, R-05, R-06 and R-10; evidence C-01. Contract v1.0, before workflow implementation.

## 1. Goal and boundaries

Run the same locked dependency, Prisma, test, build and Docker checks for every pull request targeting `sprint-2-staging` or `main`. Keep CI independent of Google Cloud and use a fresh, disposable PostgreSQL service for each run. This Issue does not change application code, branch protection, GitHub environments, credentials or deployment workflows.

## 2. Workflow trigger and permissions

- Add `.github/workflows/ci-docker.yml` with a `pull_request` trigger filtered to `sprint-2-staging` and `main`.
- Define one required job with the exact job id `test-and-docker`.
- Use GitHub-hosted Ubuntu, Node 24, a bounded job timeout, and `permissions: contents: read`. The workflow has no cloud permissions, write token, upload step or deployment action.

## 3. PostgreSQL and Prisma

- Start an isolated PostgreSQL 16 service named `postgres` with a health check. It is discarded with the runner after the job.
- Set `DATABASE_URL` to the runner's `localhost:5432` service mapping and the `classpulse_test` database. `server/tests/setup.ts` rejects any test URL whose path is not `/classpulse_test`.
- Install the locked root, `server`, and `client` dependencies with `npm ci` in each package directory. Do not use `npm install` or update lockfiles in CI.
- Run Prisma client generation and `prisma migrate deploy` in `server` before database seed and tests.
- Supply only a synthetic `SEED_PASSWORD` in the seed and server-test steps: the existing test fixtures and password tests require it. Do not use a real or shared credential; do not expose it to the client build or Docker build steps.

## 4. Tests, builds, and image

1. Run the complete server suite (`npm test`) after migrations and seed.
2. Run the complete client suite (`npm test`).
3. Build the server and client with their existing `npm run build` scripts.
4. Build the repository Dockerfile locally with `docker build`; do not push or publish an image from CI.

Every step is required on each matching PR. The workflow must fail on a test, build, or Docker error; it must not skip the image build based on changed paths or absent files. No artifacts are uploaded. CI logs must not print environment dumps or any real database password, seed password, connection string, key, or cloud credential.

## 5. Immutable Actions and Dependabot

Pin every third-party Action to its full 40-character commit SHA. Initial pins, verified from the official action release commits on 2026-11-11:

| Action | Release | Full commit SHA |
|---|---|---|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node` | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` |

Set `.github/dependabot.yml` to check `github-actions` in `/` weekly. A Dependabot update must leave the action reference pinned to a full SHA.

## 6. CI-only values and safety

PostgreSQL and seed inputs in the workflow are synthetic, short-lived test values for an isolated CI service; they are not secrets and are never reused outside the workflow. Keep `SEED_PASSWORD` in the Prisma seed and server-test step environments because current test helpers explicitly use it. Do not echo it, put it in an artifact, or use GitHub/cloud secrets for this job. No GCP account, billing, IAM, environment, ruleset, or live database operation belongs here.

## 7. Existing setup and dependency gate

No local package, Prisma, or test-setup adjustment is currently required: the three lockfiles and `npm ci` commands exist, the server has `prisma:seed`, the initial migration is tracked, and `tests/setup.ts` accepts the workflow-provided test URL when no local `.env.test` exists. If implementation shows a required setup change, update this contract's version history before changing another file.

At base commit `8e856581613b08ef1e3e95a4c41f127705d7a993`, the repository has no root `Dockerfile` or `.dockerignore`. A's L5-3 is the prerequisite for a passing image-build step and C-01 evidence. Keep the image build in the workflow; record it as blocked until L5-3 supplies the real application image. The final green C-01 run must include the merged L5-3 files.

## 8. Acceptance criteria

| ID | Observable result |
|---|---|
| L5-4-AC1 | A PR targeting `sprint-2-staging` or `main` runs job `test-and-docker`. |
| L5-4-AC2 | The job uses locked root/server/client installs, the disposable PostgreSQL test DB, Prisma generate/migrate/seed, the server and client test suites, both builds, and a real Docker image build. |
| L5-4-AC3 | Every third-party Action is pinned to a full SHA; Dependabot checks Actions weekly. |
| L5-4-AC4 | The workflow needs no cloud credential, contains no live secret, and emits no credential-bearing log or artifact. |
| L5-4-AC5 | A green C-01 run link, SHA, command list, and test counts are recorded; the workflow remains active for later Lab 5 and release PRs. |

## 9. Verification plan

After Punge089 posts C3 on this contract, first record the intentionally failing result for a test change or the missing L5-3 Docker prerequisite as red evidence. Then implement the workflow and Dependabot configuration, run a real PR check, and save only genuine green run output. Never represent a missing-Dockerfile setup failure as a test assertion or claim C-01 complete before the image build passes.

| Test ID | Acceptance | Action and expected result | Evidence |
|---|---|---|---|
| L5-4-T1 | AC1 | Open a PR to each configured target; Actions shows `test-and-docker` for both. | GitHub run URLs |
| L5-4-T2 | AC2 | Observe dependency install, Prisma, seed, test, build, and Docker-build steps; each completes successfully against `classpulse_test` and the application Dockerfile. | C-01 run summary |
| L5-4-T3 | AC3 | Inspect the workflow and Dependabot config; action references are 40-hex SHAs and weekly updates are enabled. | Diff review |
| L5-4-T4 | AC4 | Inspect workflow permissions, configured values, logs and artifacts; no real credential is present or emitted and no cloud access is requested. | Safe log/config review |

## 10. Completion evidence

- [ ] Punge089's C3 review references this contract commit.
- [ ] Red prerequisite/setup evidence is honest and contains no credentials.
- [ ] Green PR run includes the L5-3 Dockerfile and passes all tests, builds and the image build.
- [ ] `docs/labs/lab-05/evidence/C-01.md` records run URL, tested SHA, commands and test counts.
- [ ] B's PR is reviewed and merged into `sprint-2-staging`; branch protection remains a separate human-owned L5-6 step.

## 11. Version history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-11-11 | book6349 with OpenAI Codex (GPT-6 Luna) | Initial CI contract; records the Dockerfile dependency and test environment. |
