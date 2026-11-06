# ClassPulse

Course feedback surveys: lecturers (Survey Owners) publish identified surveys for their courses,
enrolled students (Respondents) answer once, and owners see aggregate results.

CPE 334 group project, theme #10 (Review, Feedback, and Survey System). Team: `Punge089`, `book6349`.

- Plan and Issues: [`docs/plan.md`](docs/plan.md) · board: https://github.com/users/Punge089/projects/5
- Design: [`docs/design.md`](docs/design.md)
- Partner guide (Thai): [`docs/partner-guide.md`](docs/partner-guide.md)

## Local setup

Use Node.js 22 or newer and PostgreSQL 16 or newer. Create the local login `classpulse` with `CREATEDB` and two databases owned by it, `classpulse` for development and `classpulse_test` for automated tests. See [the partner guide](docs/partner-guide.md) for the initial database setup.

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

Server tests use `.env.test` and reset only `classpulse_test`. Playwright starts both servers itself; install its browser once with `npx playwright install chromium`, then run `npm run test:e2e` from the repository root. The E2E specs log in to the **development** database, so run `npm run prisma:seed` (above) first, with the same `SEED_PASSWORD` that is in `server/.env`.

If `npm ci` was run but the server tests say the Prisma client "did not initialize", run `npx prisma generate` once from `server` (the migrate step in the setup above does this too).

## Database login (local development only)

The setup above assumes this local role and these two databases. Run it once as the PostgreSQL superuser (you are asked for that password; the `classpulse` password below is a local development value, never a real one):

```powershell
psql -h localhost -U postgres -c "CREATE ROLE classpulse LOGIN PASSWORD 'classpulse' CREATEDB;" -c "CREATE DATABASE classpulse OWNER classpulse;" -c "CREATE DATABASE classpulse_test OWNER classpulse;"
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

`python tools/test_results.py` runs the three test suites with JSON reporters and writes `docs/sprints/sprint-1/test-results.md`: every acceptance criterion from the contracts, its planned tests, the tests that actually ran, and the result, plus the commit that was tested. Nothing in that table is typed by hand. Run it on a clean checkout of the release commit.

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
