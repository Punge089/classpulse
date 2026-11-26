# UAT6 additive provisioner contract v1.0

Issue #80. Owner Student B (`book6349`); reviewer Student A (`Punge089`).
Prepared 24 November 2026 with Codex GPT-6.1 Sol. **Contract only: A's C3 is pending. No executable, tests or live writes are included.**

Builds on [reviewed fixture procedure](fixture-provisioning.md), PR #78, merge `cdcf460a1f928b15a197889b4bda21425902e1d3`. The intended application schema/password helper is CP-V01 source `1fe3e3b82dfb0537be30223c9b598b3479b4affe`. Any schema/helper change requires renewed comparison.

## Approach and interface

Use the existing TypeScript/Prisma stack and import `hashPassword` from `server/src/lib/password.ts`. The proposed executable is a human-run CLI, never a server route, startup hook, seed extension or CI deployment step. An inspect mode is the default; apply is separate and requires explicit live human confirmation after code review. A reviews this contract before tests or implementation.

Intended modes:
- Inspect: inside a read-only transaction, return allowlisted synthetic identity/course/enrollment metadata and database name; do not accept passwords or write.
- Apply: accept a human-approved baseline and explicit confirmation, privately supplied connection and two passwords. Acquire secrets through hidden interactive input or inherited private process input; no secret-bearing CLI arguments, repository files or output. The CLI refuses absent/non-interactive confirmation for live apply.
- The pure guard/mapping function and injectable transaction runner are testable independently of CLI prompts. A test-only failure injector belongs only to the isolated test harness, with no production CLI flag.

No runnable production command is prescribed until A reviews implementation and the human confirms the actual target/access method.

## Human target and baseline gate

The expected cloud target is project `cpe-334-en-034`, SQL instance `classpulse-pg`, database `classpulse`. Human confirmation from the Console/authorized connection is required; `current_database()` alone cannot prove project or instance. Never read cloud secrets or provision connectivity for the human.

The human's sanitized, approved baseline pins IDs and the following values. No live baseline has yet been captured:
- `ann.lee@classpulse.test` and `ben.kim@classpulse.test`: distinct existing active OWNER accounts.
- CPE334 belongs to Ann's existing ID; CPE231 belongs to Ben's existing ID.
- Existing student1/2/3 identities are active RESPONDENTs. Student1/2 have exactly CPE334 enrollment; student3 has exactly CPE231 enrollment and no CPE334 enrollment.
- No account whose normalized email (trimmed/lowercase) equals either target exists.
- Exact existing account/course/enrollment IDs match the human-approved record. Unexpected extra enrollment, wrong role/activity, missing/duplicate identity, changed ownership or schema mismatch aborts.

Do not repair an unexpected baseline or guess IDs from seed order. Compare all five existing users and enrollment rows before/after; protect other existing data through an insert-only write surface and preservation tests.

## Acceptance criteria

| ID | Required behavior |
|---|---|
| FX-01 | Inspect uses READ ONLY and selects no password/hash/token/connection data. Missing/incorrect human target confirmation prevents apply before any write. |
| FX-02 | Validate the approved baseline above and reject either target email collision, including normalized/case variants, before inserting. |
| FX-03 | Generate independent salted hashes with the unchanged application helper. Extra is active RESPONDENT; inactive is inactive RESPONDENT. Never expose plaintext or hashes. |
| FX-04 | One transaction creates exactly two User rows and one Enrollment linking only extra to existing CPE334. Inactive has no enrollment. All other tables and existing rows remain untouched. |
| FX-05 | Recheck guards inside a SERIALIZABLE transaction. Apply explicit bounded lock/statement/transaction timeouts. Concurrent applies cannot both succeed; uniqueness/serialization failure rolls back and requires fresh human preflight, with no automatic retry or upsert. Normalized-email checks must be protected against check/insert races (document the transaction locking strategy at implementation review). |
| FX-06 | Any failure after the first User, second User or Enrollment insert rolls back all additions. Existing IDs/activity/credentials/enrollments/data remain unchanged. PostgreSQL sequences may consume IDs after rollback; sequence gaps are not deleted business records and are not repaired. |
| FX-07 | Rerunning after success fails on collision without modifying or resetting either new account. No seed/reset/update/upsert/delete, course/session/survey/response creation, or existing enrollment changes. |
| FX-08 | Return sanitized new IDs/roles/activity/enrollment and confirmation of unchanged baseline only after commit. On error emit a fixed safe code; never raw Prisma/DB errors, secrets or SQL parameters. A failed post-check is reported, never repaired automatically. |

For concurrency, lock the User/Course/Enrollment mutation surface in a consistent order within the transaction before guard reads, or demonstrate an equally strong reviewed strategy. Keep the critical section brief and time bounded; do not lock business tables to simulate blanket protection.

## Planned meaningful tests after C3

All are **NOT RUN**. Save RED before implementation, followed by the same assertions GREEN. Do not weaken assertions, fake rollback, skip tests or relabel mocks as DB evidence.

| Test group | Required assertions |
|---|---|
| Gate and inspect | Default mode is read-only; missing confirmation/target/baseline/secrets rejects before writes; output excludes secret/hash fields and sanitizes deliberate DB errors. |
| Baseline | Independently vary each owner/role/activity/course/ID/enrollment requirement, including student3-in-CPE334 and unexpected extra enrollment; each rejects with zero additions and unchanged existing records. |
| Collisions | Each target already exists (including case/whitespace variants); rerun after success; two competing invocations. At most one success; no partial additions or overwritten hashes. |
| Success | Exactly two new Users/one Enrollment; roles/activity are correct; verify hashes with the existing helper; equal test passwords still receive different salts; existing records including internal credential fields remain byte/value equal (compare internally without output). |
| Actual DB rollback | Force failure after first user, second user and enrollment insertion in an isolated PostgreSQL transaction; verify no target rows/enrollment survive and all preexisting business data remain. Preserve safe counts, not raw credential snapshots. |
| Retention | Existing owner/student1/2/3 accounts, all enrollment rows, sessions, surveys, responses and answers remain. No live seed/reset helper is imported or called by the executable. |

DB tests must use a dedicated disposable allowlisted database `classpulse_fixture_test` with locally generated synthetic data and an explicit guard before any setup. Never connect the tests to the production database or cloud connection. Test setup is isolated from provisioner behavior and performs no live seed/reset. Record any unavailable DB test as blocked rather than skipped or passed; mandatory suite completion is required before claiming executable readiness.

## Workflow and evidence

1. Commit this contract and request A's C3. Stop before tests/implementation.
2. After C3, add focused tests and save meaningful failing assertions in `evidence/lab-06/fixture-provisioner-red.txt` before implementation.
3. Implement only Issue #80's file scope; save GREEN/regression/build counts and exact SHA in `fixture-provisioner-green.txt`.
4. A reviews the actual executable PR head, failure/rollback evidence and successful CI. Do not self-approve/merge.
5. Human confirms target and private inputs again, personally runs the reviewed live operation, then returns sanitized pre/post evidence. C/D independently tests CD01 inactive login and CD07 three-respondent summary; provisioning is not a UAT PASS.

## Version history

| Version | Date | Author/assistance | Status |
|---|---|---|---|
| 1.0 | 24 Nov 2026 | book6349 / Codex GPT-6.1 Sol | Proposed for A C3; no implementation or live operation |

## Implementation checkpoint (24 November, pending executable review)

The contract-only C3 remains anchored at 11e0a219. Implementation is proposed separately and is not approved for live use.
The CLI is server/tools/provision-uat6.ts: default inspect uses a real READ ONLY transaction; apply requires a baseline file, a TTY, an exact human target confirmation and two hidden password prompts. It never implicitly loads .env or accepts passwords as CLI arguments.

Transaction order: hash outside locks; SERIALIZABLE; lock_timeout3s; statement_timeout8s; verify database/server target; LOCK TABLE User,Course,Enrollment IN SHARE ROW EXCLUSIVE MODE in that fixed order; reread/validate baseline and normalized collisions; create2Users and1Enrollment; verify unchanged existing baseline; commit. Prisma maxWait5s/transaction timeout15s. No automatic retry. Local test failure injection is refused in production mode and has no CLI flag.

DB tests create a separate classpulse_fixture_test database only through a verified localhost classpulse_test connection and place each scenario in a unique new schema. Local non-CI server address must be loopback. The known GitHub Actions postgres service has a private Docker address; only CI=true/GITHUB_ACTIONS=true/GITHUB_REPOSITORY=Punge089/classpulse plus a private address is accepted for that service. Remote hosts and host-query overrides are refused. No cloud connection is used in tests. Isolated schemas are retained, not cleaned by destructive reset.

RED provenance:17baseline/local-target assertions fail against a compileable fail-closed contract scaffold atff7a958; the guards then pass at31412f6. Eight database assertions fail against pending snapshot/apply behavior at0e70713 before transaction implementation. An initial address-format setup error yielded8unexecuted tests and is recorded separately; it is not presented as a meaningful RED. The later read-only transaction and CLI safety assertions are supplemental checks added after implementation, not claimed as earlier RED.

The isolated DB preservation checks compare existing users (including credential fields internally), courses/enrollments and an unrelated Sentinel table. They do not claim that a production DB was snapshotted or that every production table was read. Full existing server regression is separate.

Human run steps AFTER A approves the exact executable head and CI:
1. Human confirms cloud project/instance/database and privately configures an authorized DATABASE_URL in the process environment. Do not send its value to Codex or put it in a file/argument/log.
2. In server/, invoke the already-installed tsx tool with tools/provision-uat6.ts inspect; save only the sanitized JSON baseline privately and review against merged procedure78. Stop on any mismatch/collision.
3. Invoke tools/provision-uat6.ts apply with the path to that approved baseline JSON. Review the code first. The human personally types target confirmation and both passwords into hidden prompts. This command is not executed by the agent.
4. Human repeats read-only verification and delivers credentials privately to C/D. C/D independently records CD01/CD07. Neither fixture creation nor an executable merge is UAT acceptance.

Final schema guard checkpoint: physical column names/types/nullability of User,Course,Enrollment must match the reviewed CP-V01 shape before inserts. Additional schema-column assertion is RED at283e58e(1failed/9passed), then GREEN10DB checks. The test Enrollment foreign keys were corrected to required/non-null to match the actual Prisma schema. This is a column-level guard, not proof of all possible schema/trigger drift; human version/schema review remains required.
Final local suite after the schema guard:138passed/0failed/0skipped(105existing+33new); server build and strict CLI typecheck exited0. No live operation ran.


## Superseding checkpoint — 25 November 2026 (Student B)

This append-only checkpoint supersedes the earlier pending and transaction-order statements above; historical evidence and commits are preserved.

PR #83 was reviewed and merged by A at `f4533eac6ba035885a67eb6010cfba570b8f3f3e`. The corrected transaction order is: private input and password hashing outside the transaction; SERIALIZABLE; bounded SET LOCAL timeouts; fixed-order SHARE ROW EXCLUSIVE locks on User/Course/Enrollment **before the first snapshot-taking SELECT**; target/schema/baseline/normalized-collision checks; exactly two users and one enrollment; existing-baseline check; commit. Locking after a target SELECT, as described in the earlier checkpoint, was unsafe and is superseded.

The ordinary-writer race regression was committed RED at `dc651049c795bd1f1315150667f011909c33af6d`: 10 database tests passed and the new collision test failed because apply incorrectly resolved. Fix/GREEN `d51ef87cb5c9015401de2ed0c229d30b2254b87a` passes the same test. Focused database tests: 11/11; full server: 139/139 across 16 files, no failures/skips; server build and strict CLI typecheck passed. Exact-head CI [45438536383](https://github.com/Punge089/classpulse/actions/runs/45438536383) succeeded. A independently repeated 139 tests/build/typecheck and a separate ordinary-writer race, observing EMAIL_COLLISION and only the competitor row (6 users/3 enrollments).

### Model attribution clarification

Earlier contract, implementation checkpoints and handovers identify Codex GPT-6.1 Sol. The two race-follow-up commits above and their PR description contain the broader trailer/name Codex GPT-6. Those are the historical recorded labels; the available transcript does not establish a more precise model identifier for that earlier execution, so this clarification does not assert that both names are interchangeable or rewrite either commit. The model explicitly identified for this clarification and the PR #82 merge is **gpt-6.1-sol (Codex GPT-6.1 Sol)**. The merge trailer uses that actual current identifier. Future records should use the runtime-provided model name rather than infer it from the generic Codex identity.

### Current coordination and reported live setup

B merged the previously approved PR #82, unchanged head `9a7bd6de48846aab209b5fbec11818bc36e20a23`, with a merge commit at `b73a2690e620b03b17d1446939fbeda234868d51` after verifying CI45435365559 remained successful.

Correction to B's prior blanket agreement-pending handover: the [C/D A2 technical disposition table](../../../evidence/lab-06/checkpoint-20261124/received-cd-a2/EN037-TECHNICAL-RESPONSE-A2.md) accepts PARTNER-ADD-01–06 A2, including 02g and Unicode reason branches. ADD-06 durability and controlled expiry/replay/assignment/event-failure setups retain their explicit separate dependencies. Technical acceptance does not mean those branches were executed. B's unexecuted API branches and incomplete APPROVE-501 result remain open. An actual start notice and confirmation of the current serving version are still required before further live testing. Original requests remain retained.

[A's latest Issue80 report](https://github.com/Punge089/classpulse/issues/80#issuecomment-7139603541) states the human completed the reviewed apply and A independently postchecked read-only: extra user16 active RESPONDENT with enrollment4 in CPE334/course1; inactive user17 inactive RESPONDENT without enrollment. The original five users/two courses/three enrollments matched preflight, including student3 id4 remaining CPE231-only. These are **A-reported human-run/post-check results**, not a live operation or independent database verification by B. Credentials remain private. C/D's independent CD01/CD07 execution, controlled-session branches, final acceptance and ClassPulse Part D remain pending. A also reports WF-BUG-001 closed/completed. B ran no new live test, cloud command or apply while preparing this checkpoint.
