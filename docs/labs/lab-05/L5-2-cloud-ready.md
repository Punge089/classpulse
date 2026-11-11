# L5-2 Cloud-ready app contract

Issue [#36](https://github.com/Punge089/classpulse/issues/36). Student B owns the implementation; Student A reviews. Scope: R-02, R-03, R-04, NFR-05 and NFR-09; supports C-03 and C-04. Contract v1.0, before tests and implementation.

## 1. Goal and boundaries

Make the existing ClassPulse web process ready for the container and release workflow: serve the production React build from Express, report database readiness separately from process liveness, and keep demo seed credentials explicit. This work adds no schema, account, authorization, or visual UI change. The Compose interface must agree with [L5-3 Docker contract v1.0](https://github.com/Punge089/classpulse/blob/feature/30-docker/docs/labs/lab-05/L5-3-docker.md): service name `db`, container port 5432, runtime assets at `/app/client/dist`, and a separate one-shot initializer.

## 2. Runtime behavior

1. In production, Express serves the Vite build at `client/dist`, which is `/app/client/dist` in A's runtime image. Resolve the default build path relative to the server code so it works from the repository and the image layout.
2. Serve the built assets and return `index.html` for direct browser navigation to valid client-side paths such as `/owner/surveys/1`. Keep this routing after API routes and static-file handling.
3. The web process never migrates or seeds on startup or restart. Docker's one-shot initializer owns migration and seed ordering under L5-3.
4. Existing API routes and authorization are unchanged. The new readiness route is public and exposes only a status, not database details.

## 3. Configuration contract

- Root `.env.example` documents `DATABASE_URL`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `SEED_PASSWORD`, `PORT`, `SESSION_TTL_HOURS`, and `NODE_ENV` with clearly fake placeholders. Its PostgreSQL URL uses the Compose hostname `db` and port 5432. The Compose initializer receives `SEED_PASSWORD`; the app service does not.
- `server/.env.example` documents every server application setting with fake placeholders and a host-development URL using `localhost`, not `db`. It includes `DATABASE_URL`, `SEED_PASSWORD`, `PORT`, `SESSION_TTL_HOURS`, and `NODE_ENV`.
- Use `NODE_ENV=production` in the root Compose example and `NODE_ENV=development` in the server host-development example. The examples are documentation only; no example value is a usable credential.
- Local `.env` files stay ignored. No secret is added to source, client build output, image layers, logs, or evidence.

## 4. API contract

| Route | Success | Dependency and boundary |
|---|---|---|
| `GET /api/health` | `200 {"status":"ok"}` | Process liveness only; must not query PostgreSQL. |
| `GET /api/ready` | `200 {"status":"ready"}` | Return only after a real Prisma database query succeeds. |
| `GET /api/ready` when PostgreSQL is unavailable | `503 {"status":"unavailable"}` | Sanitize the body; do not return connection data, query details, or exception text. |

The existing `/api` not-found handler continues to return the current JSON `NOT_FOUND` response for unknown API paths. `/api/ready` is registered before that handler.

## 5. UI and static-file routing

There is no UI redesign. In production, `/`, an existing built asset, and direct client-side routes are served from `client/dist`. Static files are served before the SPA fallback. Only a non-API browser navigation to a client route may fall back to `index.html`; requests under `/api`, missing static assets (including `/assets/` paths and file-like paths), and non-navigation requests must continue to a 404. The fallback must not turn an unknown API route or a missing JavaScript/CSS/image file into a successful HTML response.

## 6. Seed and data behavior

The existing seed continues to create only synthetic `@classpulse.test` fixtures and requires `SEED_PASSWORD`; an absent or empty value stops before any database write. No default/demo password is introduced. Supply the value only to the one-shot initializer (or a developer's explicit local seed command), never to the long-running web process. The seed remains idempotent. No Prisma schema or migration change is part of L5-2.

## 7. Permissions and failure handling

- `/api/health` remains 200 while PostgreSQL is down; `/api/ready` returns sanitized 503 until the database query succeeds.
- Errors from the database probe do not leak to clients. Existing API authorization and role checks do not change.
- Unknown `/api/*` paths stay JSON 404. Missing build assets stay 404. A production client deep link returns the SPA document.
- Missing `SEED_PASSWORD` fails the seed before writes. The app process does not attempt to repair this by seeding at startup.

## 8. Acceptance criteria

| ID | Observable result |
|---|---|
| L5-2-AC1 | `/api/ready` returns 200 only when a database probe succeeds, otherwise a sanitized 503; `/api/health` is database-independent and remains 200. |
| L5-2-AC2 | With `NODE_ENV=production`, `/`, an existing asset, and a direct client route such as `/owner/surveys/1` are served from `client/dist`. |
| L5-2-AC3 | Unknown `/api/*` requests retain the JSON 404 contract; missing static assets return 404 and never the SPA HTML. |
| L5-2-AC4 | The seed requires `SEED_PASSWORD`, has no default credential, and is not run by web startup or restart. |
| L5-2-AC5 | Root and server environment examples document all current settings with placeholders; root uses Compose host `db`, while the server example uses `localhost`. |

## 9. Verification plan

Do not write tests until Student A posts C3 on this contract commit. Then commit meaningful red tests and sanitized red evidence before implementation, followed by green output and a reviewed PR into `sprint-2-staging`.

| Test ID | Acceptance | Action and expected result | Planned file |
|---|---|---|---|
| L5-2-T1 | AC1 | Probe a working test database and a failing database stub; readiness is 200/ready then 503/unavailable with no internal error text, while health remains 200 in both cases. | `server/tests/api/cloudReady.test.ts` |
| L5-2-T2 | AC2, AC3 | Run the production app with a small client build fixture; check `/`, a real asset, a deep link, unknown `/api/*`, and a missing asset. Browser routes get the build, API paths retain JSON 404, and missing assets return 404. | `server/tests/api/cloudReady.test.ts` |
| L5-2-T3 | AC4 | Exercise seed configuration without a password and inspect the web entry point; the seed fails before writes and the web startup does not invoke it. | `server/tests/unit/seedConfig.test.ts` |
| L5-2-T4 | AC5 | Review both examples and Compose references; every listed variable has a placeholder, root uses `db`, server uses `localhost`, and no usable secret is present. | Contract/configuration review |

## 10. Completion evidence

- [ ] A's C3 review references this contract commit and identifies any requested contract change.
- [ ] Red tests and red output are committed before implementation; output contains no connection strings or passwords.
- [ ] Green tests, builds, and sanitized evidence are recorded with command, counts, and tested SHA.
- [ ] B's PR is reviewed and merged into `sprint-2-staging`; C-03/C-04 are claimed only when their separate stack/deployment evidence exists.

## 11. Version history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-11-11 | book6349 with OpenAI Codex (GPT-6 Luna) | Initial contract before tests and implementation. |
