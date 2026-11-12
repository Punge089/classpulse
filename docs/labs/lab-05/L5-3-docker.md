# L5-3 Docker contract

Issue [#30](https://github.com/Punge089/classpulse/issues/30). Student A owns packaging. Student B reviews. Covers R-01, R-02, C-03 and the container side of NFR-05 and NFR-09.

## Workflow and configuration

1. From a fresh checkout, a human fills in the local environment using the root example owned by L5-2. Compose must document its variable names consistently with that example. The database service is named `db`; container-to-container traffic uses its PostgreSQL port. Neither host dependencies nor a local PostgreSQL installation are required.
2. Build one image from the root Dockerfile. Separate Node 24 stages build the React client and Express server. The runtime contains the built SPA at `/app/client/dist`, the compiled API, OpenSSL, generated Prisma client, schema, migrations and everything the existing seed imports. Installing dependencies or downloading a CLI at startup would make the result depend on the network.
3. Compose starts PostgreSQL with a named data volume. After PostgreSQL reports healthy, a one-shot service runs the installed Prisma migration CLI and the seed in order. The app starts only after that service exits successfully. The web process itself does not migrate or seed the database on restart.
4. Run the image as a non-root user. The default internal port is 3000 and the process honors `PORT`. Production UI and API share one origin. Static serving and database-backed readiness are supplied by L5-2. This Issue introduces no route, account, authorization, schema or UI changes.

## Boundaries and failures

- Supply the database connection at runtime. Supply `SEED_PASSWORD` only to the one-shot service. Missing required inputs should stop Compose before startup, with only variable names in diagnostics. Cloud credentials and production secrets are outside the clean-clone exercise.
- Keep local environment files, dependencies, repository history, course materials, reports and agent logs out of the build context. Test the context with a harmless synthetic marker. Never inspect or print an expanded Compose configuration containing real inputs.
- A failed migration must prevent seeding and serving. Recreating an app container must reuse the same named PostgreSQL volume. C-05 on the public service is tracked separately under L5-8.

## Local Compose settings

| Variable | Purpose and source | Secret |
|---|---|---|
| POSTGRES_USER, POSTGRES_DB | Local database user and name, supplied by the operator from the root example. Required. | No |
| POSTGRES_PASSWORD | Local database credential, supplied privately by the operator. Required. | Yes |
| DATABASE_URL | Runtime connection using Compose host db and the same database settings. Required for initialization and app. | Yes |
| SEED_PASSWORD | Supplied privately for the one-shot initialization service. Required. | Yes |
| PORT | Internal HTTP port, default 3000. Cloud Run supplies its own runtime value. | No |
| APP_PORT | Local host port, default 3000, bound to 127.0.0.1. Tests use 0 to allocate a free port. | No |
| SESSION_TTL_HOURS | Session lifetime, default 8. | No |
| CLASSPULSE_IMAGE | Local image name, default classpulse:local. Tests select an isolated name. | No |

The Docker checks use public fixture credentials for temporary databases. They never load the developer's private environment. Run `node --test tools/lab5/test-docker.mjs` from the repository with Docker and Compose on PATH. On Windows, start Docker Desktop first. The image check can run before L5-2 lands. The remaining checks report the missing root environment example until that dependency is available.

## Acceptance and verification

| Criterion | Test and observable result |
|---|---|
| L5-3-AC1. A clean checkout builds one image. | L5-3-T1 builds with Docker using only tracked app inputs, then checks the runtime UID, built entry point, SPA, migration files, generated client and installed seed tooling. It checks that synthetic excluded files are absent. |
| L5-3-AC2. Configuration is supplied at runtime. | L5-3-T2 verifies a missing required input is rejected and that the default web process starts on 3000. Run the same image with a different internal `PORT` and check the HTTP response there. |
| L5-3-AC3. PostgreSQL initialization gates the web service. | L5-3-T3 checks migration and seed exit 0, confirms a seeded synthetic account exists without printing credentials, and checks the app and database are ready. Use an isolated project with a deliberately failing initializer and verify the web service never runs. |
| L5-3-AC4. A fresh clone runs the full stack and retains data across app replacement. | L5-3-T4 checks HTML at the root and the database-backed readiness route, records a synthetic database record ID, recreates the app, and reads the same ID. Record the clone SHA, commands, counts and safe results for C-03. |

Run the planned checks from `tools/lab5/test-docker.mjs` against a disposable Compose project. Missing Docker or missing upstream endpoints is a blocked check. Save genuine assertion failures as red evidence separately from setup failures. Review focus: verify startup ordering by observing a failed initializer, and run the positive C-03 path on a Docker-capable host after L5-2 lands.

## Completion evidence

- [ ] C3 from B on the contract commit.
- [ ] Failing tests committed before implementation with sanitized red output.
- [ ] Passing tests and clean-clone C-03 evidence at the tested SHA.
- [ ] B's reviewed PR into staging.

## Version history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-11-11 | Punge089 with OpenAI Codex (GPT-6) | Initial container contract, before tests and implementation. |
| 1.1 | 2026-11-11 | Punge089 with OpenAI Codex (GPT-6.1 Sol) | Document exact Compose variable names, public test fixtures and Windows entry point. Verify image construction independently while the L5-2 environment and endpoints are pending. Acceptance criteria are preserved. |
