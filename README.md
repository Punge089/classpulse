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

Server tests use `.env.test` and reset only `classpulse_test`. The Playwright configuration starts both servers for future E2E specs. When those specs are present, run `npx playwright install chromium` once and `npm run test:e2e` from the repository root.

## Branches

`main` (released) ← `sprint-1-staging` (integration) ← `feature/<issue>-<slug>`.
