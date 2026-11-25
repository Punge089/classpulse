# ClassPulse CP-EX-001 — isolated local runtime setup

This is the tester-safe operator guide. The compiled runtime ZIP, SOURCE.json and SHA256SUMS.json identify the exact candidate source/artifact. **An artifact is not permission to start testing.** Wait for a separate release-specific go-ahead with the verified Sprint staging ref and archive hash. No exact educational defect is disclosed here. Test the app as a black box; do not inspect developer Issues/diffs/CI failure logs/implementation or tests before recording your finding. Record any advance knowledge honestly.

## Environment agreed with C/D

D independently operates Windows, Node24.14.0/npm11.9.0/PostgreSQL16.16 or the actual versions later reported. The persistent exercise database is **classpulse_uat6_exercise**, on D's newly owned loopback PostgreSQL instance. It is separate from resettable classpulse_test, all shared/CloudSQL databases and the retained CP-V01 records. D accepts local HTTP/development-cookie differences. Cloud Run serving revision and traffic are **N/A**, not0%/100% or the healthy Cloud revision. Record local URLs and process/runtime identities instead. Local setup is not a new live-cookie/expiry test.

The supplied artifact mirrors the built application runtime: compiled server/client, exact dependency manifests, Prisma schema/migration and existing synthetic seed/password helper. It intentionally excludes developer fault notes, test outputs, private data, dependencies and credentials. Dependency installation is local; the artifact's app is already compiled. Do not rebuild it from partial runtime source, run the automated suite against its persistent database or use an unrelated source checkout.

## 1. Verify artifact and local target before any write

1. Compare the ZIP SHA256 with the separate verified handoff. Extract to a **new D-owned directory**, not an existing repo/server folder. Verify every SOURCE.json/SHA256SUMS.json payload hash; reject unknown extra application files or changed bytes. Record the full source SHA, designated ref, archive hash and actual operator/model/time. No short-SHA guessing or substitution of current main/staging.
2. Check3000/5173 are free. Stop on conflict; do not kill another task's process. Create a new persistent PostgreSQL cluster bound only to127.0.0.1 or::1, with a separately owned fresh data directory, local role and database named classpulse_uat6_exercise. Use your authorized local tooling; do not touch system/shared database services or weaken a firewall/IAM setting. Retain the cluster/data after testing.
3. Privately set this runtime's DATABASE_URL and synthetic SEED_PASSWORD only in the process environment or ignored local file. Do not use the CloudSQL connection or production passwords. Never echo values, put them in CLI arguments or include environment dumps in evidence. Both server CLI and its started process must use this same verified persistent target.
4. Before migration, use a read-only connection to verify the actual database, server listener/port, owned data directory, zero public tables and no competing database sessions. A correct database name alone is insufficient. Reject a host query override/tunnel, non-loopback address, old/nonempty target or inconsistent metadata; do not delete/reset/upsert data to force this preflight to pass.

Safe preflight SQL, sent to the verified local connection without publishing its connection value:

```sql
BEGIN READ ONLY;
SELECT current_database() AS database_name,
       host(inet_server_addr()) AS server_address,
       inet_server_port() AS server_port,
       current_setting('data_directory') AS owned_data_directory;
SELECT count(*) AS public_tables FROM pg_tables WHERE schemaname = 'public';
SELECT count(*) AS other_sessions FROM pg_stat_activity
 WHERE datname = current_database() AND pid <> pg_backend_pid();
ROLLBACK;
```

Record sanitized booleans/database identity, not connection/password values or raw local private paths. There is no authorization to run seed/migration against another target if this check fails.

## 2. Install and initialize once, on that empty persistent sandbox only

Set NODE_ENV=development and PORT=3000 for the local server. In the extracted runtime's server folder:

```text
npm ci --no-audit --no-fund
node node_modules/prisma/build/index.js generate
node node_modules/prisma/build/index.js migrate deploy
```

After migration, recheck current_database/listener/owned-directory and verify all business tables are empty (User,Session,Course,Enrollment,Survey,Question,QuestionOption,Response,Answer). The migration ledger is expected; zero business rows is required. If any business record exists, **stop** rather than reseeding it. Then initialize the unchanged existing synthetic seed once:

```text
npm run prisma:seed
```

This seed uses upserts; it is not a harmless inspection command. It is permitted only on the positively verified new/empty local sandbox. The standard synthetic accounts are ann.lee@classpulse.test and ben.kim@classpulse.test (owners), student1/2/3@classpulse.test (respondents); student1/2 belong to CPE334 and student3 to CPE231. They use D's privately supplied synthetic seed password. Preserve the generated IDs and subsequent exercise data. No inactive/third-CPE334 fixture is implied; record any additional fixture need as a setup dependency.

Do not run npm test or fixture reset helpers against this persistent database. A stopped application can be restarted using the retained data; do not rerun initialization to recover a session or hide a finding. If an installation/setup step fails, keep its actual output and mark setup blocked rather than a product finding or successful UAT.

## 3. Start the exact compiled runtime

In the server terminal, using the verified environment:

```text
npm start
```

In a separate terminal at the artifact's client folder:

```text
npm ci --no-audit --no-fund
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5173 --strictPort
```

The shipped Vite configuration proxies /api to localhost:3000 in preview. Open **http://127.0.0.1:5173/login** on D's machine. The compiled client is served by preview and the backend uses development cookie behavior over local HTTP; this is the accepted environment difference. Confirm health/readiness, normal login and role landing; record source/artifact identity and actual startup process IDs/URLs. A healthy setup smoke is not the independent defect report.

Wait for the explicit source/version-specific testing go-ahead. Then post the actual operator/model/Bangkok start and execute the agreed broad Sprint1 UAT inventory plus independent coverage. Preserve synthetic records, record actual results honestly and send any finding with case/AC/input/expected/actual/impact/version/time/evidence. Never copy password/cookie/header values to screenshots/logs. Do not rely on the developer to tell you which case will find the defect.

## 4. Stop processes, retain evidence and data

Log out normally and stop only your owned app/frontend processes; retain the persistent database and finding records for independent retest. Record before/after version/artifact consistency and actual statuses. Do not delete, reset, re-seed, change source or silently upgrade dependencies during the run. Corrected build/deployed retest instructions will be supplied separately after the reported-case correction chain. Final acceptance is not granted by this guide.
