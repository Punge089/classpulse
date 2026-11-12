# ClassPulse Lab 5 deployment guide

Draft for Issue #33. Punge089 writes the guide; book6349 reviews the evidence and owns SDS updates. Group EN-034_P0. Course section awaits confirmation. Lab 5 is due 15 November 2026 at 23:59 Asia/Bangkok.

## Current verified source

Integration [PR #42](https://github.com/Punge089/classpulse/pull/42) combines the original rule, app, Docker and CI commits with their histories. At 1c3c95f, local server tests passed 105/105, client 1/1, both builds passed, and Docker checks from a fresh remote clone passed 4/4. Integration head 27fa76f also passed [test-and-docker](https://github.com/Punge089/classpulse/actions/runs/43087862460). B reviewed and merged the integration into sprint-2-staging at 8b7d4b1. Its Git tree matches the tested 27fa76f head.

These are integrated-source results. The public deployment, served main SHA, required-check blocking exercise and deployed persistence results remain pending their individual evidence.

## Stack and adaptation

Express 4, TypeScript, Prisma 5 and PostgreSQL provide the API and persistence. React 18, Vite and Bootstrap provide the UI. Sessions are stored in PostgreSQL. The root three-stage Node 24 Alpine Dockerfile builds the UI/API together and runs as the node user with OpenSSL and installed Prisma/seed tooling. Express serves /app/client/dist in production, sharing one origin with the API.

The TokTickIT reference is adapted to ClassPulse routes, synthetic @classpulse.test accounts and one SEED_PASSWORD setting. Compose uses a persistent PostgreSQL volume, a healthy-db prerequisite, a separate migration/seed initializer and the app. The app process does not run migrations or seed on startup. The runtime includes the password helper imported by the TypeScript seed.

## Configuration

Private values are supplied by humans through ignored local environment files or the planned Secret Manager bindings. Root .env.example and server/.env.example contain placeholders. The root connection uses host db for Compose; host development uses localhost. The client calls the same-origin API and currently reads no client environment setting.

| Variable | Purpose/default | Secret | Source |
|---|---|---|---|
| DATABASE_URL | Prisma PostgreSQL connection. Required. | Yes | Human local configuration; planned runtime secret binding |
| SEED_PASSWORD | Synthetic account seed password. Required only for initialization. | Yes | Human configuration or planned migration-job secret binding |
| POSTGRES_USER | Compose database user. Required. | No | Local root environment |
| POSTGRES_DB | Compose database name. Required. | No | Local root environment |
| POSTGRES_PASSWORD | Compose database credential. Required. | Yes | Human local configuration |
| NODE_ENV | Production mode in the image and Compose; development for host setup | No | Runtime mode |
| PORT | Internal server port, default 3000 | No | Runtime environment; Cloud Run supplies PORT |
| APP_PORT | Compose host port, default 3000 on 127.0.0.1 | No | Local root environment |
| SESSION_TTL_HOURS | Session lifetime, default 8 hours | No | Runtime environment |
| CLASSPULSE_IMAGE | Compose image name, default classpulse:local | No | Local root environment |

The planned release workflow uses GCP_PROJECT_ID, GCP_REGION, WIF_PROVIDER and WIF_SERVICE_ACCOUNT as GitHub demo environment variables identifying resources. Their final implementation is tracked in B's Issue #38. WIF avoids a stored service-account JSON key.

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
| Region | asia-southeast1 proposed; actual resource locations await confirmation |
| Artifact Registry repository/image | classpulse/classpulse proposed |
| Cloud SQL instance/database | classpulse-pg/classpulse proposed |
| Cloud Run service/migration job | classpulse/classpulse-migrate proposed |
| Runtime/deployer identities | Proposed names are in the human setup plan; actual resources await confirmation |
| Public service URL and served main SHA | Pending first deployment |

Humans review and run cloud provisioning/IAM commands, enter credentials privately, and configure the GitHub environment/ruleset. The local autopilot/gates.md contains the prepared commands and Done checks. Actual resource names and permissions must be verified before this table is marked deployed.

## Release and commit identification

Feature branches enter sprint-2-staging through teammate-reviewed PRs. A reviewed release PR takes staging into main. The main workflow runs the reusable test-and-docker checks, pushes the full-SHA image, resolves its digest, completes the migration job, updates the existing service to that same digest and runs read-only smoke checks. L5-7 implementation PR #45 was reviewed by A and merged at a82f933; its six offline release-stub cases and three mocked smoke tests passed at ff08cf6, and its PR CI passed. The C-01 evidence update followed in PR #46 at 9dae599. Live deployment evidence remains pending human setup and an accepted main release.

Identify the running release by reading the service's traffic allocation and ready revision, then the revision's actual image digest. Resolve the matching Artifact Registry image tagged with the accepted main SHA and compare it with the workflow summary. Record SHA, digest, serving revision, traffic and run URL together. Keep the protected v1.0.0-sprint1 tag fixed.

For persistence, create a new synthetic survey through the live UI after initialization and retain its ID. Read the same ID after a verified fresh app revision and a reviewed main redeployment using the same database. Record before/after evidence. Compatible rollback and roll-forward use existing accepted image SHAs and leave the database intact. See the L5-6 and L5-8 contracts for the planned gate and persistence observations.

## Evidence index and remaining checks

| Check | Evidence/status |
|---|---|
| C-01 passing PR CI | [Integration run 43087862460](https://github.com/Punge089/classpulse/actions/runs/43087862460), head 27fa76f, successful tests/builds/image build |
| C-02 failed required check blocks merge | Pending human main ruleset and reviewed demonstration |
| C-03 clean-clone container stack | [Integration validation at 27fa76f](https://github.com/Punge089/classpulse/blob/27fa76fbb84fa360e01a68a5bb11d16bee0b3bed/docs/labs/lab-05/L5-integration.md), tested source 1c3c95f, Docker 4/4 |
| C-04 live domain workflow and access restriction | Pending public deployment and observed UI/API/database journey |
| C-05 deployed persistence | Pending same-record before/restart/redeploy observations |
| C-06 reviewed main release pipeline | Pending release workflow, human setup and live revision evidence |

The final PDF requires the confirmed section and complete observed evidence. Its name is lab5_sec<section>_EN-034_P0.pdf. Both members review it before the human submits to LEB2. Keep the service available until the instructor ends grading.
