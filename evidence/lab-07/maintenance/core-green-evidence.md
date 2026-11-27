# Lab7 backend core GREEN - candidate3203c3a

Actual [CI45601152925](https://github.com/Punge089/classpulse/actions/runs/45601152925), source3203c3af8b33adea086b62d654c93dd4a1e77d90, completed SUCCESS. Existing workflow uses a fresh isolated PostgreSQL16 service and Node24.

| Actual command / step | Outcome | Retained source |
|---|---|---|
| server: npm test |176passed/0failed/0skipped | [Complete server output](core-green-test-server.txt) |
| client: npm test |1passed/0failed/0skipped | [Complete client output](core-green-test-client.txt) |
| server: npm run build |exit0 | [Build excerpt](core-green-build-server.txt) |
| client: npm run build |exit0 | [Build excerpt](core-green-build-client.txt) |
| docker build --tag classpulse-ci:ci . |exit0 | [Docker outcome excerpt](core-green-build-docker-image-locally.txt) |

[Run metadata, step dispositions and hashes](core-green-run.json) records each actual step; environment values omitted and terminal controls stripped from retained logs.

## Same-test comparison and limits

Primary3f8918c was139passed/2failed/0skipped; expanded test-onlya9cdbce was144passed/32failed/0skipped(total176). Core3203c3a keeps the expanded API test source byte-identical: now all37new API cases and139existing server checks pass. No assertion was weakened, focused, removed or skipped. Meaningful primary/expanded RED and their output commits precede implementation. Distinct run totals are not added together.

The core introduces statusVersion, durable audit events, owner-scoped lock/transaction, strict reason/version/query validation and private paginated history. Existing schema/behavior regression is exercised in isolated CI. The ErrorCode union inventory clarification covers only already-reviewed STALE_SURVEY. Local preflight build results remain separate.

**Partial backend checkpoint only.** Fault-injected rollback, full old-data migration comparison, complete unit cases, owner reopen/history UI/client/E2E and deployed changed/preserved checks are still pending. CI migration from a fresh service is not proof of historical-data preservation. No E2E command ran in this workflow; no UI completion, final B approval, staging/main release, GCP deployment, independent UAT acceptance or submission is inferred. PR92 stays draft; F08 interactions remain separately gated.
