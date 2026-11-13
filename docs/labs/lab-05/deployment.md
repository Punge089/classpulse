# ClassPulse Lab 5 deployment guide

Guide and evidence index for Issue #33. Punge089 writes the guide and collects the live observations; book6349 reviews the evidence and owns SDS updates. Group EN-034_P0, section 31 confirmed by Student A. Lab 5 is due 15 November 2026 at 23:59 Asia/Bangkok.

## Current verified source

Integration [PR #42](https://github.com/Punge089/classpulse/pull/42) combines the original rule, app, Docker and CI commits with their histories. At 1c3c95f, local server tests passed 105/105, client 1/1, both builds passed, and Docker checks from a fresh remote clone passed 4/4. Integration head 27fa76f also passed [test-and-docker](https://github.com/Punge089/classpulse/actions/runs/43087862460). B reviewed and merged the integration into sprint-2-staging at 8b7d4b1. Its Git tree matches the tested 27fa76f head.

The accepted first main release is [a63719dd823dd77c86fbf187b4bc6663b4e07d8b](https://github.com/Punge089/classpulse/commit/a63719dd823dd77c86fbf187b4bc6663b4e07d8b), merged by B through [PR #44](https://github.com/Punge089/classpulse/pull/44). Its [main push workflow 43475436003](https://github.com/Punge089/classpulse/actions/runs/43475436003) passed source CI, WIF authentication, image build/push, migration, service update and read-only smoke checks. The running image/revision was matched to that main SHA on 14 November. Deployed restart/redeployment persistence remains pending C-05; successful deployment alone does not establish it.

## Stack and adaptation

Express 4, TypeScript, Prisma 5 and PostgreSQL provide the API and persistence. React 18, Vite and Bootstrap provide the UI. Sessions are stored in PostgreSQL. The root three-stage Node 24 Alpine Dockerfile builds the UI/API together and runs as the node user with OpenSSL and installed Prisma/seed tooling. Express serves /app/client/dist in production, sharing one origin with the API.

The TokTickIT reference is adapted to ClassPulse routes, synthetic @classpulse.test accounts and one SEED_PASSWORD setting. Compose uses a persistent PostgreSQL volume, a healthy-db prerequisite, a separate migration/seed initializer and the app. The app process does not run migrations or seed on startup. The runtime includes the password helper imported by the TypeScript seed.

## Configuration

Private values are supplied by humans through ignored local environment files or Secret Manager. Root .env.example and server/.env.example contain placeholders. The root connection uses host db for Compose; host development uses localhost. Cloud Run uses the attached Cloud SQL socket. The client calls the same-origin API and currently reads no client environment setting.

| Variable | Purpose/default | Secret | Source |
|---|---|---|---|
| DATABASE_URL | Prisma PostgreSQL connection. Required. | Yes | Local human configuration; Cloud Run service/job reference classpulse-database-url version 2 |
| SEED_PASSWORD | Synthetic account seed password. Required only for initialization. | Yes | Local human configuration; migration job references classpulse-seed-password version 1; not supplied to the app service |
| POSTGRES_USER | Compose database user. Required. | No | Local root environment |
| POSTGRES_DB | Compose database name. Required. | No | Local root environment |
| POSTGRES_PASSWORD | Compose database credential. Required. | Yes | Human local configuration |
| NODE_ENV | Production mode in the image and Compose; development for host setup | No | Runtime mode |
| PORT | Internal server port, default 3000 | No | Runtime environment; Cloud Run supplies PORT |
| APP_PORT | Compose host port, default 3000 on 127.0.0.1 | No | Local root environment |
| SESSION_TTL_HOURS | Session lifetime, default 8 hours | No | Runtime environment |
| CLASSPULSE_IMAGE | Compose image name, default classpulse:local | No | Local root environment |

The reviewed release workflow uses GCP_PROJECT_ID, GCP_REGION, WIF_PROVIDER and WIF_SERVICE_ACCOUNT as nonsecret GitHub demo environment variables. API readback confirmed exactly four values: cpe-334-en-034, asia-southeast1, projects/91139895529/locations/global/workloadIdentityPools/github-actions/providers/github-main, and classpulse-deployer@cpe-334-en-034.iam.gserviceaccount.com respectively. The environment has one branch rule main and no tag rule. The WIF provider also restricts numeric repository/owner IDs, main, demo and the main deploy.yml workflow. The deployer account lists no keys; the accepted main workflow authenticated with WIF.

## Local build, test and run

Use the reviewed integrated source before following the Docker commands. For source verification, install the locked dependencies with npm ci at the root, server and client, generate Prisma in server, and prepare the isolated classpulse_test database using the host setup instructions in README.md. Existing tests load server/.env.test and enforce that database name.

```powershell
npm ci
npm ci --prefix server
npm ci --prefix client
Push-Location server
npx prisma generate
Pop-Location
npm --prefix server run test
npm --prefix client run test
npm --prefix server run build
npm --prefix client run build
node --test tools/lab5/test-docker.mjs
```

For the local UI/API/database stack, a human copies the root example to the ignored .env file and privately fills the required values. Then run:

```powershell
docker compose --env-file .env up --build --wait
docker compose --env-file .env ps
```

The initializer runs the installed Prisma migrate deploy followed by npm run prisma:seed and must complete successfully before the app starts. Open http://localhost:3000 for the default host port. GET /api/health checks liveness; GET /api/ready returns status ready and db connected after its real database query succeeds, or sanitized 503 on failure.

To restart only the app, use docker compose --env-file .env restart app. The named postgres_data volume remains attached to the database. For a local app replacement use docker compose --env-file .env up --no-deps --force-recreate --wait app. Preserve the database volume during persistence checks. Inspect status and return codes while keeping credential values out of output and screenshots.

## Cloud inventory and human setup

| Setting/resource | Current status |
|---|---|
| GCP project | cpe-334-en-034, supplied by Student A |
| Billing | True in the supplied Cloud Shell capture |
| Budget and teammate access | Student A reports complete |
| Region | asia-southeast1 verified for registry, SQL, service and job |
| Artifact Registry repository/image | classpulse/classpulse; accepted main SHA tag verified against the serving digest below |
| Cloud SQL instance/database | classpulse-pg/classpulse; PostgreSQL16, db-f1-micro, 10GB SSD, auto-storage increase off |
| Cloud Run service/migration job | classpulse/classpulse-migrate; migration command runs Prisma migrate deploy then prisma:seed |
| Runtime identity | classpulse-runner@cpe-334-en-034.iam.gserviceaccount.com on both service and job |
| Deployer identity | classpulse-deployer@cpe-334-en-034.iam.gserviceaccount.com; Cloud Run Developer verified directly on each resource |
| Public service URL | https://classpulse-zdwglar6eq-as.a.run.app/ |
| Served main SHA | a63719dd823dd77c86fbf187b4bc6663b4e07d8b at the 14 November baseline |

Cloud mutations and credential handling remain human-controlled by default. A gave specific exceptions for the agent-assisted browser setup recorded in the [AI-use follow-up PR #52](https://github.com/Punge089/classpulse/pull/52); do not describe every setting as manually clicked by a student. A privately entered/submitted credentials. B reported performing the owner-only runtime grants and later database credential correction; A inspected metadata and live behavior without reading values. The local autopilot/gates.md retains the exact human commands and Done checks. The initial manual bootstrap preceded the accepted main release and is recorded separately rather than used as C-06 evidence. Service scaling was verified as minimum 0 / maximum 3 with 512 MiB memory.

## Release and commit identification

Feature branches enter sprint-2-staging through teammate-reviewed PRs. A reviewed release PR takes staging into main. The main workflow runs the reusable test-and-docker checks, pushes the full-SHA image, resolves its digest, completes the migration job, updates the existing service to that same digest and runs read-only smoke checks. L5-7 implementation PR #45 was reviewed by A and merged at a82f933; its six offline release-stub cases and three mocked smoke tests passed at ff08cf6, and its PR CI passed. The C-01 evidence update followed in PR #46 at 9dae599. The first accepted main deployment is run 43475436003; B owns the reviewed C-06 evidence record in Issue #38.

Identify the running release by reading the service's traffic allocation and ready revision, then the revision's actual image digest. Resolve the matching Artifact Registry image tagged with the accepted main SHA and compare it with the workflow summary. Record SHA, digest, serving revision, traffic and run URL together. Keep the protected v1.0.0-sprint1 tag fixed.

The directly inspected 14 November baseline maps main a63719dd823dd77c86fbf187b4bc6663b4e07d8b to Artifact Registry digest sha256:8b5d63ae5e29b373601908b0f0be9817461de8db466d8bf27f0a3b15288a6c09 and serving revision classpulse-00002-54d at 100% traffic. The SQL attachment is cpe-334-en-034:asia-southeast1:classpulse-pg. Treat this as a dated observation, not a promise that the revision never changes.

## Observed domain workflow and persistence baseline

On the accepted main release, A privately signed in to the synthetic owner/respondent accounts and Codex operated the browser. It observed missing-title rejection, created and published survey 2 through the live UI, submitted synthetic response 1, observed duplicate rejection, verified the original answers were unchanged, and observed a FORBIDDEN response with no owner data when the respondent opened the owner API. The owner summary then showed exactly 1 response, rating averages 4.00 / 5.00, and Cloud deployment: 1 with other choices: 0. The displayed Identified notice preceded answering. These are live observations with local screenshots, not an additional automated unit-test count; B's final evidence review is still required.

Stable record: [survey 2](https://classpulse-zdwglar6eq-as.a.run.app/owner/surveys/2), title CPE334 Lab 5 deployment feedback - EN-034_P0 - 2026-11-14, course CPE334, Published, three required questions. [Response 1](https://classpulse-zdwglar6eq-as.a.run.app/responses/1) contains ratings 4 and 5 and the choice Cloud deployment. These pages require the appropriate private sign-in. Keep the same IDs and database through C-05. Additional realistic classroom surveys 3 (Published requirements/user stories) and 4 (Draft mid-semester learning) are explicitly synthetic and do not replace this baseline.

Survey 2 was created after initialization, so rerunning seed cannot recreate that baseline and create misleading evidence. Its normal page reload and owner summary were verified, but an app restart and reviewed redeployment have not yet been observed. The guarded [human same-image restart handoff](https://github.com/Punge089/classpulse/issues/32#issuecomment-6862573365) records the exact baseline and stops if it has drifted. After a human runs it, verify a new serving revision with the unchanged digest/DB and reread the same record. Then release a separately reviewed change through staging to main, verify its new SHA/run/revision and compare the same saved values. Compatible rollback and roll-forward use existing accepted main image SHAs and preserve the database; the initial pre-main staging candidate is not an accepted rollback target. See Issue #32's approved 8c82dee contract. No C-05 pass is claimed yet.

## Evidence index and remaining checks

| Check | Evidence/status |
|---|---|
| C-01 passing PR CI | [Integration run 43087862460](https://github.com/Punge089/classpulse/actions/runs/43087862460), head 27fa76f, successful tests/builds/image build |
| C-02 failed required check blocks merge | [Accepted evidence](evidence/C-02.md), PR #49 merged at c8a12a5. PR #48 had 105 passing tests and one deliberate failure at bad1b85; after B approval the failed Required check still disabled merge. Closed unmerged with history retained. |
| C-03 clean-clone container stack | [Integration validation at 27fa76f](https://github.com/Punge089/classpulse/blob/27fa76fbb84fa360e01a68a5bb11d16bee0b3bed/docs/labs/lab-05/L5-integration.md), tested source 1c3c95f, Docker 4/4 |
| C-04 live domain workflow and access restriction | Owner create/publish, respondent answer, duplicate rejection, backend role denial and owner aggregate observed on a63719d. Local figures collected; B evidence review and final PDF indexing pending. |
| C-05 deployed persistence | Survey 2/response 1 baseline captured; human same-image restart, reviewed next-main redeploy and compatible rollback/forward observations pending. |
| C-06 reviewed main release pipeline | [PR #44](https://github.com/Punge089/classpulse/pull/44) merged to a63719d; [main run 43475436003](https://github.com/Punge089/classpulse/actions/runs/43475436003) passed including WIF/migration/deploy/smoke. Main tag/digest/serving revision matched as above; B-owned evidence review/indexing remains pending. |

The final PDF is lab5_sec31_EN-034_P0.pdf. Use Answer Parts 0-4 with direct links and numbered, readable figures. Complete C-05 and the remaining evidence reviews before claiming the lab complete. Both members review the report before the human submits to LEB2 by 15 November 2026 23:59 Bangkok and verifies the receipt. Keep the service available until the instructor ends grading. Never include passwords, tokens or connection strings in the report.
