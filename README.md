# ClassPulse

Course feedback surveys: lecturers (Survey Owners) publish identified surveys for their courses,
enrolled students (Respondents) answer once, and owners see aggregate results.

CPE 334 group project, theme #10 (Review, Feedback, and Survey System). Team: `Punge089`, `book6349`.

- Plan and Issues: [`docs/plan.md`](docs/plan.md) · board: https://github.com/users/Punge089/projects/5
- Design: [`docs/design.md`](docs/design.md)
- Partner guide (Thai): [`docs/partner-guide.md`](docs/partner-guide.md)

## Local setup

Use Node.js 22 or newer and PostgreSQL 16 or newer. Create the local login `classpulse` with `CREATEDB` and two databases owned by it, `classpulse` for development and `classpulse_test` for automated tests. The one-time commands for that login and those databases are under [Database login](#database-login-local-development-only) below; the [partner guide](docs/partner-guide.md) explains them in Thai.

Install the locked dependencies and copy the environment examples from the repository root in PowerShell.

```powershell
npm ci
npm ci --prefix server
npm ci --prefix client
Copy-Item server/.env.example server/.env
Copy-Item server/.env.test.example server/.env.test
```

Edit both copied files. Replace `LOCAL_DB_PASSWORD` with the local database password (URL-encode special characters) and set `SEED_PASSWORD` to a synthetic password for the fixture accounts. Keep the two database names as shown in the examples.

Apply the initial migration and seed the development database.

```powershell
Set-Location server
npm run prisma:migrate
npm run prisma:seed
```

Apply the same migration to the test database. From `server`, use the connection string from `.env.test`.

```powershell
$env:DATABASE_URL = (Get-Content .env.test | Where-Object { $_ -like 'DATABASE_URL=*' }) -replace '^DATABASE_URL=', ''
npx prisma migrate deploy
Remove-Item Env:DATABASE_URL
Set-Location ..
```

Run the API and client in separate terminals from the repository root.

```powershell
npm --prefix server run dev
npm --prefix client run dev -- --port 5173 --strictPort
```

Open `http://localhost:5173`. The Vite proxy serves `GET http://localhost:5173/api/health`, which returns `{"status":"ok"}`.

```powershell
npm --prefix server run test
npm --prefix client run test
npm --prefix server run build
npm --prefix client run build
```

Server tests use `.env.test` and reset only `classpulse_test`. Playwright starts both servers itself; install its browser once with `npx playwright install chromium`, then run `npm run test:e2e` from the repository root. The E2E specs log in to the **development** database, so run `npm --prefix server run prisma:seed` (from the repository root) first, with the same `SEED_PASSWORD` that is in `server/.env`. Stop any `npm run dev` servers before `npm run test:e2e`: when ports 3000 or 5173 are already in use, Playwright reuses whatever is listening there instead of starting this checkout's code.

If `npm ci` was run but the server tests say the Prisma client "did not initialize", run `npx prisma generate` once from `server` (the migrate step in the setup above does this too). `npm ci` may print `npm warn allow-scripts ... esbuild` warnings; the tests and builds still run, so ignore them.

## Database login (local development only)

The setup above assumes this local role and these two databases. Run it once as the PostgreSQL superuser (you are asked for that password; the `classpulse` password below is a local development value, never a real one):

```powershell
psql -h localhost -U postgres -c "CREATE ROLE classpulse LOGIN PASSWORD 'classpulse' CREATEDB;" -c "CREATE DATABASE classpulse OWNER classpulse;" -c "CREATE DATABASE classpulse_test OWNER classpulse;"
```

To start the test database again from empty (it holds nothing but test data, so this is safe), recreate it and apply the migration again with the test-database block in Local setup:

```powershell
psql -h localhost -U classpulse -d classpulse -c "DROP DATABASE IF EXISTS classpulse_test WITH (FORCE);" -c "CREATE DATABASE classpulse_test OWNER classpulse;"
```

## Seeded accounts

Every account uses the password you set as `SEED_PASSWORD` in `server/.env` (it is never stored in Git). All addresses are synthetic.

| Email | Role | Notes |
|---|---|---|
| `ann.lee@classpulse.test` | Survey Owner | owns CPE334 |
| `ben.kim@classpulse.test` | Survey Owner | owns CPE231 |
| `student1@classpulse.test` | Respondent | enrolled in CPE334 |
| `student2@classpulse.test` | Respondent | enrolled in CPE334 |
| `student3@classpulse.test` | Respondent | enrolled in CPE231 only |

The development seed also creates one closed CPE334 survey, "Week 1 pulse".

## Running all the checks

From the repository root, in PowerShell:

```powershell
npm --prefix server run test
npm --prefix client run test
npm --prefix server run build
npm --prefix client run build
npm run test:e2e
```

`python tools/test_results.py` (Python 3.10 or newer, standard library only) runs the three test suites with JSON reporters and writes `docs/sprints/sprint-1/test-results.md`: every acceptance criterion from the contracts, its planned tests, the tests that actually ran, and the result, plus the commit that was tested. Nothing in that table is typed by hand. Run it from PowerShell on a clean checkout of the release commit, with the development database seeded and ports 3000 and 5173 free (it runs the E2E suite); it takes one to two minutes.

Its exit status is the answer: **0 means everything passed, 1 means it did not.** It exits 1 when any runner exits nonzero, a suite fails to load, a report is missing, empty or invalid, a test fails or is skipped, a planned `TEST-nn` never ran, or an acceptance criterion has no executed test. In that case the first lines of the table say `Overall result: FAILED` with the reasons, and the table is never reused from an earlier run. Commit `test-results.md` only from a run that printed `PASSED` and exited 0. `--skip-run` rebuilds the table from the reports and exit codes of the last run. The generator's own checks run with `python -m unittest tools.test_test_results -v` from the repository root.

On the release tag `v1.0.0-sprint1` (commit `d4bad74`) a clean run gives server 101, client 1 and e2e 8 passed with 0 failed and 0 skipped, `Overall result: PASSED`, and exit status 0; all 39 acceptance criteria in `docs/sprints/sprint-1/test-results.md` pass. Use these numbers to check a fresh clone.

## The Deliverable 1 report (PDF)

`pip install -r tools/requirements.txt`, then `python tools/build_report.py` builds a draft PDF from the documents in `docs/` (it needs Microsoft Edge or Chrome and, for the diagrams, internet access to cdnjs.cloudflare.com). Run it from PowerShell, not from a sandboxed shell. `python tools/build_report.py --final` refuses to build while a `TODO` or a missing document remains.

## Where things are

| Path | What |
|---|---|
| `server/` | Express API, Prisma schema and migration, seed, server tests |
| `client/` | React app (Vite, Bootstrap, the "Pulse" theme), component tests |
| `e2e/` | Playwright journeys |
| `docs/srs.md`, `docs/features.md`, `docs/traceability.md`, `docs/system-sds.md`, `docs/sprints/` | the requirements, design, plan and per-feature contracts |
| `docs/sprints/sprint-1/evidence/` | saved red and green test output for each feature |
| `tools/` | report builder, results table generator, autopilot helpers |

## Branches

`main` (released) ← `sprint-1-staging` (integration) ← `feature/<issue>-<slug>`.
