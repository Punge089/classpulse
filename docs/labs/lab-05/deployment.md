# ClassPulse Lab 5 deployment guide

Guide and evidence index for Issue #33. Punge089 writes the guide and collects the live observations; book6349 reviews the evidence and owns SDS updates. Group EN-034_P0, section 31 confirmed by Student A. Lab 5 is due 15 November 2026 at 23:59 Asia/Bangkok.

## Current verified source

Integration [PR #42](https://github.com/Punge089/classpulse/pull/42) combines the original rule, app, Docker and CI commits with their histories. At 1c3c95f, local server tests passed 105/105, client 1/1, both builds passed, and Docker checks from a fresh remote clone passed 4/4. Integration head 27fa76f also passed [test-and-docker](https://github.com/Punge089/classpulse/actions/runs/43087862460). B reviewed and merged the integration into sprint-2-staging at 8b7d4b1. Its Git tree matches the tested 27fa76f head.

The accepted first main release is [a63719dd823dd77c86fbf187b4bc6663b4e07d8b](https://github.com/Punge089/classpulse/commit/a63719dd823dd77c86fbf187b4bc6663b4e07d8b), merged by B through [PR #44](https://github.com/Punge089/classpulse/pull/44). Its [main push workflow 43475436003](https://github.com/Punge089/classpulse/actions/runs/43475436003) passed source CI, WIF authentication, image build/push, migration, service update and read-only smoke checks. The running image/revision was matched to that main SHA on 14 November. The later same-image restart and survey/response/summary reread are complete and B-reviewed in [PR #57](https://github.com/Punge089/classpulse/pull/57). The separately reviewed next-main redeployment is now observed successful as recorded below. B accepted the redeployment evidence in PR #63. The subsequent human-operated compatible rollback/forward observations are recorded below; final C-05 acceptance is established by B's actual review on the final cycle evidence PR linked from #32.

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
| Served main SHA at the post-redeployment readback | 1fe3e3b82dfb0537be30223c9b598b3479b4affe on 14 November; earlier baseline a63719d retained below |

Cloud mutations and credential handling remain human-controlled by default. A gave specific exceptions for the agent-assisted browser setup recorded in the [AI-use follow-up PR #52](https://github.com/Punge089/classpulse/pull/52) and the later agent-executed same-image restart disclosed in [PR #56](https://github.com/Punge089/classpulse/pull/56); do not describe these actions as manually performed by a student. A privately entered/submitted credentials. B reported performing the owner-only runtime grants and later database credential correction; A inspected metadata and live behavior without reading values. The local autopilot/gates.md retains the exact commands, actual operators and Done checks. The initial manual bootstrap preceded the accepted main release and is recorded separately rather than used as C-06 evidence. Service scaling was verified as minimum 0 / maximum 3 with 512 MiB memory.

## Release and commit identification

Feature branches enter sprint-2-staging through teammate-reviewed PRs. A reviewed release PR takes staging into main. The main workflow runs the reusable test-and-docker checks, pushes the full-SHA image, resolves its digest, completes the migration job, updates the existing service to that same digest and runs read-only smoke checks. L5-7 implementation PR #45 was reviewed by A and merged at a82f933; its six offline release-stub cases and three mocked smoke tests passed at ff08cf6, and its PR CI passed. The C-01 evidence update followed in PR #46 at 9dae599. The first accepted main deployment is run 43475436003. The second accepted release is PR #58 at 1fe3e3b82dfb0537be30223c9b598b3479b4affe, with successful main run 43585838076 after B approved the exact updated release head before merging. B owns C-06 updates under Issue #38.

Identify the running release by reading the service's traffic allocation and ready revision, then the revision's actual image digest. Resolve the matching Artifact Registry image tagged with the accepted main SHA and compare it with the workflow summary. Record SHA, digest, serving revision, traffic and run URL together. Keep the protected v1.0.0-sprint1 tag fixed.

The directly inspected 14 November baseline maps main a63719dd823dd77c86fbf187b4bc6663b4e07d8b to Artifact Registry digest sha256:8b5d63ae5e29b373601908b0f0be9817461de8db466d8bf27f0a3b15288a6c09 and serving revision classpulse-00002-54d at 100% traffic. The SQL attachment is cpe-334-en-034:asia-southeast1:classpulse-pg. Treat this as a dated observation, not a promise that the revision never changes.

After the same-image restart, the recorded serving revision is classpulse-00003-5jd at 100% traffic with that unchanged digest and accepted main source. This direct restart did not create another main release or pipeline run. That restart observation is retained as history; the separately reviewed main redeployment has its own readback below.

At the later reviewed redeployment checkpoint, [main 1fe3e3b82dfb0537be30223c9b598b3479b4affe](https://github.com/Punge089/classpulse/commit/1fe3e3b82dfb0537be30223c9b598b3479b4affe) passed [run 43585838076](https://github.com/Punge089/classpulse/actions/runs/43585838076). Browser readback matched its full-SHA Artifact Registry tag to actual serving digest sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795, revision classpulse-00004-lzd and 100% traffic. The new revision's Cloud SQL Connections panel still lists cpe-334-en-034:asia-southeast1:classpulse-pg. A new public smoke run passed 4/4. B reviewed these metadata/live-data observations and [C-05 Figures 7-11](evidence/C-05.md) in PR #63 before merging at b53623f. The later manual-cycle revisions are recorded below; 00004-lzd remains the normal-redeployment snapshot.

## Observed domain workflow and persistence baseline

On the accepted main release, A privately signed in to the synthetic owner/respondent accounts and Codex operated the browser. It observed missing-title rejection, created and published survey 2 through the live UI, submitted synthetic response 1, observed duplicate rejection, verified the original answers were unchanged, and observed a FORBIDDEN response with no owner data when the respondent opened the owner API. The owner summary then showed exactly 1 response, rating averages 4.00 / 5.00, and Cloud deployment: 1 with other choices: 0. The displayed Identified notice preceded answering. These are live observations, not an additional automated unit-test count. B reviewed the baseline/restart record and its six figures in PR #57; the remaining C-04 validation/access figures and final report indexing still need review.

Stable record: [survey 2](https://classpulse-zdwglar6eq-as.a.run.app/owner/surveys/2), title CPE334 Lab 5 deployment feedback - EN-034_P0 - 2026-11-14, course CPE334, Published, three required questions. [Response 1](https://classpulse-zdwglar6eq-as.a.run.app/responses/1) contains ratings 4 and 5 and the choice Cloud deployment. These pages require the appropriate private sign-in. Keep the same IDs and database through C-05. Additional realistic classroom surveys 3 (Published requirements/user stories) and 4 (Draft mid-semester learning) are explicitly synthetic and do not replace this baseline.

Survey 2 was created after initialization, so rerunning seed cannot recreate that baseline and create misleading evidence. The [guarded same-image restart script](https://github.com/Punge089/classpulse/issues/32#issuecomment-6862573365) was executed by A's Codex after A specifically requested that operation as an exception to the human-only boundary. Both baseline guards passed; classpulse-00002-54d became classpulse-00003-5jd with the same image digest and 100% traffic. A privately signed in again, and Codex reread survey 2, direct response 1 and the owner summary with unchanged values. B reviewed that completed restart evidence before merging PR #57. See the numbered figures and actual operator record in [C-05](evidence/C-05.md). Do not rerun the old script with its now-stale expected revision.

The separately reviewed staging-to-main redeployment is observed successful at main 1fe3e3b. After its deploy, Codex reloaded direct response 1 with the original 1:56:02 AM timestamp, ratings 4/5 and Cloud deployment; after private human owner sign-in it reread survey 2 (Published, three original questions) and summary (count 1, averages 4.00/5.00, Cloud deployment 1, other choices 0). The actual revision/digest/100% traffic and unchanged database attachment were independently read back. B accepted that evidence in PR #63 before merging. The subsequent human-operated compatible rollback/forward has also been observed: [run 43588464331](https://github.com/Punge089/classpulse/actions/runs/43588464331) selected accepted image a63719d and served classpulse-00005-qxg with digest 8b5d63...a6c09; [run 43589308055](https://github.com/Punge089/classpulse/actions/runs/43589308055) selected accepted image 1fe3e3b and served classpulse-00006-6w6 with digest 60f61c...07795. Each had 100% traffic and the same SQL attachment, saved owner survey and aggregate. Human A clicked each final Run workflow; Actions performed deployment and Codex only prepared/read back this phase. Both manual runs use workflow source main 1fe3e3b; existing-image mode skips source CI/image build and migration, not individual tests. Public read-only smoke passed 4/4 at each step. Direct respondent response 1 was not separately reopened during these manual phases. See [C-05](evidence/C-05.md) for full digests, six new figures, unchanged contract 8c82dee criteria and review acceptance. No additional cloud execution is required for this cycle. Keep #32 open until B accepts the final cycle evidence; no self-approval is claimed.

## Evidence index and remaining checks

| Check | Evidence/status |
|---|---|
| C-01 passing PR CI | [Integration run 43087862460](https://github.com/Punge089/classpulse/actions/runs/43087862460), head 27fa76f, successful tests/builds/image build |
| C-02 failed required check blocks merge | [Accepted evidence](evidence/C-02.md), PR #49 merged at c8a12a5. PR #48 had 105 passing tests and one deliberate failure at bad1b85; after B approval the failed Required check still disabled merge. Closed unmerged with history retained. |
| C-03 clean-clone container stack | [Integration validation at 27fa76f](https://github.com/Punge089/classpulse/blob/27fa76fbb84fa360e01a68a5bb11d16bee0b3bed/docs/labs/lab-05/L5-integration.md), tested source 1c3c95f, Docker 4/4 |
| C-04 live domain workflow and access restriction | Owner create/publish, respondent answer, duplicate rejection, backend role denial and owner aggregate observed on a63719d. B reviewed the baseline/restart subset in PR #57; remaining C-04 validation/access figures and final PDF indexing still need review. |
| C-05 deployed persistence | [Persistence evidence](evidence/C-05.md): restart/reread B-reviewed in PR #57; separately reviewed main 1fe3e3b redeployment, same database and matching survey/response/summary observed. B accepted redeployment evidence in PR #63. Human-operated compatible rollback/forward and saved owner data are observed passing; final cycle peer acceptance is established by the actual evidence PR review linked from #32, which stays open until that review. |
| C-06 reviewed main release pipeline | [PR #44](https://github.com/Punge089/classpulse/pull/44) merged to a63719d; [main run 43475436003](https://github.com/Punge089/classpulse/actions/runs/43475436003) passed including WIF/migration/deploy/smoke. A reviewed and merged B's [C-06 evidence](evidence/C-06.md) through PR #54 at 89e4899. Second-main run [43585838076](https://github.com/Punge089/classpulse/actions/runs/43585838076) at 1fe3e3b also passed; its revision/digest/traffic/database and data readbacks are recorded in C-05. B’s new C-06 follow-up remains pending under #38. |

The final PDF is lab5_sec31_EN-034_P0.pdf. Use Answer Parts 0-4 with direct links and numbered, readable figures. Complete C-05 and the remaining evidence reviews before claiming the lab complete. Both members review the report before the human submits to LEB2 by 15 November 2026 23:59 Bangkok and verifies the receipt. Keep the service available until the instructor ends grading. Never include passwords, tokens or connection strings in the report.
