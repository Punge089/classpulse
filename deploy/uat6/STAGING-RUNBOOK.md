# Part D staging runbook — review draft, not an execution authorization

Issue115 / [contract PD-01–12](../../docs/labs/lab-06/part-d-staging-contract.md). A/Punge089 with Codex GPT-6. **STOP before provisioning/build exposure until baseline entry, B C3, designated staging ref and the isolated exposure exception/environment are agreed.** No exercise source SHA, endpoint or revision exists yet. No command in this document was executed against cloud resources.

## Exact proposed cloud targets

| Item | Proposed target and constraint |
|---|---|
| Project/region | cpe-334-en-034 / asia-southeast1; human verifies current account and permission, never changes global gcloud project configuration |
| Healthy service | classpulse; read-only during exercise exposure, keep classpulse-00006-6w6 and its original traffic/data |
| Exercise service | classpulse-uat6-exercise; separate service, never deploy the bad build to classpulse or reuse its traffic command |
| Existing SQL instance | classpulse-pg; no restart/version/network/settings change |
| New exercise database | classpulse_uat6_exercise; never classpulse, never a fixture-reset command on the healthy DB |
| Dedicated database role | classpulse_uat6; only required exercise DB/schema rights; no modification to existing accounts or production privileges |
| New secret references | classpulse-uat6-database-url and classpulse-uat6-seed-password; private values entered by human, never in Git/CLI args/evidence |
| Exercise migration job | classpulse-uat6-migrate; never update/execute classpulse-migrate with an exercise connection |
| Runtime identity | verify classpulse-runner@cpe-334-en-034.iam.gserviceaccount.com; do not create/expand IAM implicitly; human separately authorizes any necessary narrow binding |
| Image | existing regional classpulse repository; immutable exercise SHA tag plus resolved digest, with OCI source-revision label; never overwrite a healthy SHA tag |

These are proposals, not claims that resources exist. Human read-only inventory must confirm target absence or an exact previous exercise receipt before creation. On an unexpected resource/connection/permission/schema, stop and report; do not use reset/upsert/delete or broaden IAM as a repair.

## Human preflight and execution sequence after approval

1. Record actual account/project, the approved source SHA/ref, clean source tree, healthy service/revision/image/traffic and existing survey26/27 readbacks. Reject a healthy-source mismatch or an unrelated release in progress. Record the exact agreed main-only/test-exposure exception or local route first.
2. Human SQL administrator creates the dedicated exercise database and restricted role, with a private hidden password flow. Confirm the new role has no production business-table privileges. Do not use a default broad admin role or paste password SQL into evidence/history. New database/schema must contain no prior business records. Migration/seed are allowed **only** after this isolated target is positively verified.
3. Human creates the two exercise-specific secrets privately and verifies only the needed runtime identity can read them. No production secret/connection is copied into the exercise. If permissions are unavailable, retain the specific error and stop; this runbook grants no IAM override.
4. On a clean checkout of the **approved exact exercise SHA**, build the existing Dockerfile; record source ancestry and clean status before/after. Use `docker build --label org.opencontainers.image.revision=EXACT_SHA --tag IMAGE:EXACT_SHA .` with validated literal substitutions. Push/resolve the image by digest. Preserve intentionally failing existing-test results; do not label this known-bad test image as a green release or merge it to protected main. Docker engine must actually be available; no build claim from a package manifest.
5. Human creates/executes only the exercise migration job against the dedicated secret. Confirm the resolved database is classpulse_uat6_exercise and the job is classpulse-uat6-migrate. Human initializes the existing synthetic fixture accounts **once on that empty database**, privately supplies the exercise seed password, and records sanitized account/course IDs. The existing seed uses upserts: never run it against a nonempty/healthy/shared database.
6. Human exposes the approved image digest on classpulse-uat6-exercise with the dedicated SQL/secret configuration and agreed invocation access. Do not copy arbitrary environment values, broaden network access, create a public tunnel or alter healthy traffic. Keep authorization in the app. Record the actual new revision and traffic; a new service is not assumed to receive100% until the readback shows it.
7. Verify health/readiness, role login and one normal Sprint1 journey on the exercise endpoint; retain sanitized smoke evidence without revealing the chosen fault. Re-read healthy service traffic/digest and preserved records to establish they were not altered by setup. If a smoke/setup check fails, fix the setup under review; do not call it the exercise finding.
8. Only after real verification, send the black-box handoff below and an explicit start go-ahead on that exact release. C/D is ready without an appointment, but posts its actual operator/model/start before execution. Freeze that exercise version during the run. No cleanup/provisioning/deploy mutation during testing.

CLI readback forms, with human-verified substitutions, are read-only:

```sh
gcloud run services describe classpulse --project=cpe-334-en-034 --region=asia-southeast1 --format='json(metadata.name,status.url,status.latestReadyRevisionName,status.traffic)'
gcloud run services describe classpulse-uat6-exercise --project=cpe-334-en-034 --region=asia-southeast1 --format='json(metadata.name,status.url,status.latestReadyRevisionName,status.traffic)'
gcloud run revisions describe EXACT_EXERCISE_REVISION --project=cpe-334-en-034 --region=asia-southeast1 --format='json(metadata.name,status.imageDigest,spec.serviceAccountName)'
```

Do not dump full service YAML, environments, connection values, raw headers, cookies or credentials. Readback of a source label/tag is provenance to record, not proof that an unrelated image was built from the intended checkout.

## Independently hosted local fallback

B/C/D may explicitly agree that D runs the exact exercise source on D's own separate local PostgreSQL cluster and browser context. D already used isolated local tooling for supporting tests; this is still a new agreed runtime. It must be a dedicated **persistent exercise database**, not the resettable classpulse_test used by Vitest. Verify loopback listener, owned fresh data directory, database/schema name, zero prior business records and no competing sessions. Use synthetic private credentials only; migrate/seed once after those guards, then retain exercise records. Never point the unchanged seed/reset helpers at cloud/shared data.

Use source README's standard Express/Vite startup only after confirming ports are free; do not stop another chat's processes. Record exact SHA, dependency/runtime versions, app URLs and process/runtime identifiers. A localhost URL is reachable only on that machine: D must actually run/test it there independently. Cloud Run revision/traffic are **N/A**, and development HTTP cookie/static-serving differences are declared. No authentication/config/source rule is changed just to imitate production. Corrected PartD deployment still requires the reviewed main release and real independent retest on the agreed corrected deployment.

## Tester-safe handoff — fill only from actual evidence

```text
Exercise release label:
Verified URL:
Exact source commit / designated staging ref:
Image digest / independently verified artifact identity:
Serving revision or local runtime identifier:
Traffic allocation (N/A for local, with explanation):
Verifier / observation time / before-after healthy reference:
Agreed environment differences and independent access:
Synthetic access: sent privately, never inline here.
Scope: agreed broad Sprint1 UAT inventory plus independent coverage review.
Keep existing CP-V01 records and the new exercise evidence.
Please test black-box; do not inspect the injection diff until your finding is recorded.
Testing may begin only after this record is verified and the explicit release-specific go-ahead is sent.
```

Do not include the affected field/route/prior fix/regression or developer-only fault notes. If the exact defect is learned early, record that fact rather than claiming blind discovery. After an actual finding, follow reported-case RED → fix GREEN → regression → teammate review/CI → coordinated corrected main deployment → independent retest. Cleanup/deletion is a later human-authorized operation after retained evidence and acceptance, not part of this runbook.
