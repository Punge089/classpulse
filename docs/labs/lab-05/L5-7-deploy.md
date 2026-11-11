# L5-7 production deployment and rollback contract

Issue #38. Student B owns the deployment workflow; Student A reviews. Scope: R-03, R-05, R-07, R-08, R-09 and R-10; evidence C-06. Contract v1.0, before implementation.

## 1. Goal, boundaries and dependencies

Deploy only accepted ClassPulse releases on main. A normal release runs the same CI checks as the reusable workflow from L5-4, builds and pushes one image tagged with the full commit SHA, resolves that image to a digest, completes the migration job, updates Cloud Run to that same digest, and performs read-only smoke checks. A manual rollback selects an existing image by its prior full commit SHA.

This contract does not create GCP resources, configure billing or IAM, create GitHub environments or rulesets, or run mutating cloud commands. Those are human-only L5-1, L5-5 and L5-6 steps recorded in autopilot/gates.md. C-06 live evidence remains blocked until the human confirms the provisioned resources, Workload Identity Federation, and demo environment.

Prerequisites before implementation:

- L5-2 and L5-3 are merged so the production server has database readiness, serves the client, and the root Dockerfile builds the app.
- L5-4 contract v1.2 is approved and ci-docker.yml exposes workflow_call. A normal deployment must reuse its test-and-docker job and wait for success.
- The human has completed the L5-5 first deployment and L5-6 WIF/demo setup. The workflow may only update those existing resources.

## 2. Workflow triggers and release gate

- Push to main starts an automatic normal release. Pull requests never authenticate to GCP or deploy.
- workflow_dispatch is enabled on main with an optional image_tag string. Empty means a normal release of the selected main commit. A non-empty value must be a lowercase 40-character commit SHA and selects rollback.
- Runs selected from another ref must not authenticate or deploy.
- For normal releases, the test job calls .github/workflows/ci-docker.yml as a reusable workflow. The deploy job starts only after test-and-docker succeeds.
- For rollback, the reusable CI job, image build/push and migration job are skipped. Deployment still verifies that the selected image exists, resolves it to a digest, updates the service by that digest, and runs the smoke test.
- A failed test, invalid SHA, missing image or failed migration must prevent a normal service update. A failed smoke test is reported as failed; the workflow does not attempt an automatic rollback because schema compatibility cannot be inferred.
- Use a shared deploy-demo concurrency group with cancellation disabled so a running migration or release is not interrupted.

## 3. Permissions, environment and resource names

Use workflow-level contents: read. Only the deploy job receives id-token: write for keyless Google authentication. Pin every third-party Action to a full commit SHA. Use Workload Identity Federation; no JSON service-account key, cloud secret, or service-account credential file is stored or printed.

The deploy job uses the demo GitHub environment and its human-configured variables: GCP_PROJECT_ID, GCP_REGION, WIF_PROVIDER, and WIF_SERVICE_ACCOUNT. Validate required variables and the full SHA before authenticating. The environment must be restricted to main by the human; the workflow itself does not edit GitHub settings. No optional login smoke credentials are used.

Resource-name assumptions to match the human-reviewed L5-5 setup:

| Resource | Contract name |
|---|---|
| Artifact Registry repository | classpulse |
| Image name | classpulse |
| Cloud Run service | classpulse |
| Cloud Run migration job | classpulse-migrate |

If the reviewed L5-5 setup uses different names, revise this contract and its version history before changing deployment code. Do not put a project ID, service URL, or credential value in source.

Initial Action pins from the supplied starter kit:

| Action | Release | Full commit SHA |
|---|---|---|
| actions/checkout | v7.0.1 | 3d3c42e5aac5ba805825da76410c181273ba90b1 |
| google-github-actions/auth | v3 | 7c6bc770dae815cd3e89ee6cdf493a5fab2cc093 |
| google-github-actions/setup-gcloud | v3.0.1 | aa5489c8933f4cc7a4f7d45035b3b1440c9c10db |
| actions/setup-python | v7.1.0 | 6d4fd22b20465ccc0f7354476588e8df7c9ca0e0 |

## 4. Normal release path

For a push to main or a manual run with empty image_tag:

1. Run the reusable L5-4 workflow. Do not start deployment unless its test-and-docker job passes.
2. Set IMAGE_TAG to the triggering commit's full GitHub SHA. Configure Docker auth for the selected Artifact Registry host, build the root Dockerfile, tag it as REGION-docker.pkg.dev/PROJECT/classpulse/classpulse:IMAGE_TAG, and push it.
3. In deploy/release.sh, resolve that tag to its fully qualified sha256 digest. Validate that the digest belongs to the expected project, repository and image before using it.
4. Update classpulse-migrate with the digest and wait for the migration job to finish. If it fails, exit before touching the service or traffic.
5. Update the classpulse Cloud Run service to the same digest and direct 100% of traffic to the new revision.
6. Read the service URL and run deploy/smoke_test.py against it. The smoke test is read-only and uses no credentials.
7. Add a workflow summary with the deployed commit SHA, image digest, service URL, normal/rollback mode, and smoke-test result. Do not print environment dumps or secrets.

The release script updates pre-provisioned resources only. It never creates resources, changes IAM, reads Secret Manager values, runs the initial setup script, or pushes an image.

## 5. Rollback path

A non-empty workflow_dispatch image_tag is accepted only on main and only if it matches lowercase [0-9a-f]{40}. Validate it before cloud authentication. Do not build or push a replacement image, run CI, or run migrations in rollback mode.

The release script must first resolve the existing tag to the exact Artifact Registry digest. If the tag or digest is missing or invalid, stop before the service update. Otherwise update the service and traffic using that digest, then run the same read-only smoke test and record the selected SHA and digest. Rollback changes the application image only; it does not reverse database migrations. The operator chooses a prior image known to be schema-compatible.

## 6. Release script and offline tests

deploy/release.sh accepts PROJECT_ID, REGION, IMAGE_TAG, SERVICE_NAME, MIGRATE_JOB_NAME, ROLLBACK and optional GITHUB_ENV. Validate required inputs and the SHA before any gcloud call. Never create resources or change IAM. Use one immutable digest for both migration and service. Export SERVICE_URL and DEPLOYED_IMAGE for later workflow steps without printing credentials.

deploy/tests/test_release_stub.sh replaces gcloud with a local fake and covers:

- Normal release resolves a digest, updates and waits for the migration job, then updates the service and 100% traffic with that same digest.
- Rollback resolves the selected image and updates the service without migration.
- Missing image, malformed digest, or failed migration never updates the service.
- Invalid SHA is rejected before any gcloud call.
- No secret or database value is printed.

deploy/smoke_test.py uses only Python's standard library and performs GET requests for these checks:

| Request | Expected result |
|---|---|
| GET /api/health | HTTP 200 and status ok |
| GET /api/ready | HTTP 200 and db connected |
| GET / | HTTP 200 and the ClassPulse page title |
| GET /api/auth/me without a session | HTTP 401 and error code UNAUTHENTICATED |

The authenticated endpoint check verifies the ClassPulse access boundary without an account, token, session mutation, or private data. Do not add login/logout requests. deploy/tests/test_smoke.py mocks HTTP responses and proves the smoke checks pass, fail on an unhealthy database or broken access boundary, and never contact a live host.

Offline commands:

- bash -n deploy/release.sh
- bash deploy/tests/test_release_stub.sh
- python3 -m unittest discover -s deploy/tests -p test_smoke.py

The shell test uses only local fake commands. The Python test replaces the HTTP function with mocks. Neither test can contact Google Cloud or the public service.

## 7. Acceptance criteria

| ID | Observable result |
|---|---|
| L5-7-AC1 | Automatic deployment starts only for a push to main; manual dispatch is limited to main and supports an empty normal-release input or a validated prior 40-character SHA. |
| L5-7-AC2 | A normal release waits for the reusable L5-4 test-and-docker job, then builds and pushes the full-SHA image. |
| L5-7-AC3 | The image tag is resolved to one sha256 digest; migration completes before the service is updated with that same digest. |
| L5-7-AC4 | Invalid SHA, missing image/digest, or migration failure cannot change the service. Rollback skips tests, build and migration but updates by the selected digest. |
| L5-7-AC5 | The read-only smoke test verifies health, database readiness, ClassPulse home page, and the unauthenticated access boundary without credentials or writes. |
| L5-7-AC6 | WIF uses the demo environment, least-privilege permissions and no JSON key; workflow logs and summary do not contain credentials. |
| L5-7-AC7 | Offline release and smoke tests use local stubs/mocks and never contact GCP or the live service. |
| L5-7-AC8 | C-06 records the successful run URL, deployed SHA, image digest, service URL and smoke result only after human setup and a successful release. |

## 8. Verification plan

After Punge089 posts C3 on this contract, write the offline tests first and capture their expected red results before implementing the workflow or scripts. Red evidence must come from missing in-scope release/smoke behavior; an absent human GCP project, GitHub environment or Dockerfile is a separate dependency, never a test failure. Then implement the contract, run the offline commands, inspect workflow permissions and full-SHA pins, and open the implementation PR to sprint-2-staging. Do not run a live release before human L5-5/L5-6 completion.

| Test ID | Acceptance | Action and expected result | Evidence |
|---|---|---|---|
| L5-7-T1 | AC1-AC2 | Inspect triggers and conditions; verify normal release calls reusable CI and rollback dispatch skips it only for a valid SHA on main. | Offline workflow contract assertions |
| L5-7-T2 | AC3-AC4 | Run the fake-gcloud cases; verify the same digest reaches migration and service, and failure paths stop before service update. | test_release_stub.sh output |
| L5-7-T3 | AC5, AC7 | Run the mocked HTTP suite; verify health/readiness/home/auth responses and zero live network calls. | test_smoke.py output |
| L5-7-T4 | AC6 | Inspect workflow permissions, environment variable names, action pins, and generated summary paths. | Diff review |
| L5-7-T5 | AC8 | After the human confirms L5-5 resources and L5-6 environment, run the main release and verify its revision uses the reported digest. | C-06 workflow URL and safe summary |

## 9. Completion evidence

- [ ] Punge089 posts C3 for this contract commit before implementation.
- [ ] Red evidence captures the test-first offline failure and includes no credentials.
- [ ] Offline release and mocked smoke tests pass; commands and counts are recorded.
- [ ] The implementation PR to sprint-2-staging is reviewed by A.
- [ ] C-06 records the real successful release run, deployed SHA, digest, service URL and smoke result after human setup.
- [ ] A later reviewed release PR from sprint-2-staging to main demonstrates the workflow on a main release; no human-only GCP or GitHub setting was changed by the agent.

## 10. Version history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-11-11 | book6349 with OpenAI Codex (GPT-6 Luna) | Initial contract for main-only keyless releases, digest-pinned migration/deployment, safe rollback and read-only smoke checks. |
