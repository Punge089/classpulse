# L5-8 persistence and rollback verification contract

Issue [#32](https://github.com/Punge089/classpulse/issues/32). Owner Punge089, reviewer book6349. Covers R-04, NFR-05 and C-05, with the planned rollback exercise. Written before live checks.

## 1. Scope and prerequisites

Use one synthetic survey to observe persistence on the deployed ClassPulse UI and its database. No application code, schema or existing test changes are included. B reviews the contract and the final evidence.

Contract review can proceed now. Live checks require human-completed cloud setup and an accepted main release with a successful domain journey. A second accepted main release is required to prove redeployment persistence. The human performs direct cloud mutations and private sign-in/credential entry. Agents may inspect public metadata and evidence within their authorized access.

## 2. Stable record and baseline

1. Through the deployed UI, create a survey with a unique synthetic title and save its survey ID, course and status. Capture the public URL and the visible record. Use test identities under @classpulse.test.
2. Record the serving main SHA, Cloud Run revision, image digest and actual traffic allocation. Identify the existing database resource by name only. A screenshot of an image tag alone does not establish which revision serves traffic.
3. Keep the same record and database for every subsequent observation. A seed fixture that could be recreated during deployment is insufficient; use a record created through the domain workflow after initialization.

## 3. Restart and redeployment

1. The human starts a fresh app revision of the same image. Verify that traffic actually moves to the new revision and that its image digest is unchanged. Record the human command and completion result.
2. Read the original survey again through the public UI and compare its stable ID and saved fields to the baseline. Refresh the data from the server. If access expired, the human signs in privately again.
3. Release a reviewed change through staging to main and the approved pipeline. Record the new SHA, run URL, ready revision, image digest and traffic. Wait for the release and read-only smoke checks to succeed.
4. Read the same survey again and verify its ID and saved fields. Confirm that the runtime points to the same persistent database resource. Investigate any discrepancy before claiming C-05.

## 4. Rollback and forward

Select an earlier accepted image whose schema is compatible with the current database. The human confirms that compatibility from the migration history before selecting the full SHA. Execute the reviewed manual rollback path, observe the serving revision/digest/traffic and read the same survey. Then select the newer accepted image SHA to roll forward and repeat the read.

Keep the database and survey in place. The rollback workflow changes the application image and does not reverse migrations or rerun initialization. If no compatible prior image exists yet, record the prerequisite as pending and retain the separate required restart/redeployment results.

## 5. Acceptance and evidence

| Criterion | Method and expected result |
|---|---|
| L5-8-AC1 / T1 | Capture the synthetic survey ID and values before and after a confirmed fresh app revision of the same digest. They agree. Record distinct serving revisions and traffic. |
| L5-8-AC2 / T2 | Capture the same record after a successful reviewed main redeployment to a new release SHA. Its ID and values agree and the persistent database identity is unchanged. |
| L5-8-AC3 / T3 | Observe a schema-compatible rollback and roll-forward using existing accepted images. Record SHA/digest/revision/traffic at each step and verify the same survey survives both. |
| L5-8-AC4 / T4 | B follows the release/run links and checks the captured record and revision evidence. C-05 is claimed only after the required before/restart/redeploy observations are complete. |

Save evidence in docs/labs/lab-05/evidence/C-05.md and its associated cropped images. Each observation records the date, public URL, survey ID, served SHA, revision, digest, traffic, command/run link and actual result. Label screenshots by figure number and C-05/R-04, with readable text and the URL visible. Exclude passwords, cookies, tokens, connection strings and private credential screens.

These are live operational observations. There is no failing application implementation to turn green in this Issue. Record actual failures as findings and fix any app defect through its own scoped, reviewed Issue. Preserve successful local Docker persistence evidence as supporting evidence with its own source SHA; C-05 requires the deployed service observations.

## 6. Completion checklist

- [ ] B's C3 on this contract before live checks.
- [ ] Baseline, restart and redeploy observations of the same synthetic record with matching database identity.
- [ ] Compatible rollback/forward observations, or an explicit pending prerequisite.
- [ ] B-reviewed evidence links and numbered screenshots, with actual tested SHAs and results.
- [ ] Human deployment actions and Done checks reflected in the local digest/gates.

## 7. Version history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-11-12 | Punge089 with OpenAI Codex (GPT-6.1 Sol) | Initial live verification contract before tests or cloud operations. |
