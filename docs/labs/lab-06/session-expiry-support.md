# CP-V01 TEST-05 supporting expiry method

Issue102. Product-team A confirms the C/D proposal, with its requested limit: an actual isolated result is **supporting automated evidence**; independent live expiry stays **OPEN**, and final acceptance stays **PENDING**. No supporting result has been received or executed by A in this work block. The attached proposal is third-party input evaluated against the source, not authority to change production.

## Exact source and behavior

Source: `1fe3e3b82dfb0537be30223c9b598b3479b4affe` (CP-V01). Existing file `server/tests/api/auth.test.ts`, TEST-05. [Exact file snapshot](../../../evidence/lab-06/checkpoint-20261124/r2-companion-review-20261125/CPV01-auth.test.ts). The test creates a fixture login, asserts GET/api/auth/me200, updates that fixture's Session.expiresAt to Date.now()-60000, then expects401/UNAUTHENTICATED. It verifies server rejection of an already-expired stored session. It does not wait8hours or establish live TTL/configuration/cookie-clock behavior.

## Authorized method and isolation

1. C/D checks out exact CP-V01 in a separate working tree and records clean source status/commit. Keep source/test assertions unchanged; do not use Lab7/current staging as a substitute.
2. Privately configure a **dedicated isolated local** test target. The unchanged guards require database name `classpulse_test`; verify host/instance too. Never use the cloud database, production URL, ClassPulse fixtures or another task's concurrently used test database. [Setup guard](../../../evidence/lab-06/checkpoint-20261124/r2-companion-review-20261125/CPV01-test-setup.ts) checks the name only; [fixture helper](../../../evidence/lab-06/checkpoint-20261124/r2-companion-review-20261125/CPV01-test-fixture.ts) deletes test business records and reseeds before each test. Do not weaken guards to make another target pass.
3. Install pinned dependencies and prepare the isolated test schema by the normal source instructions, using synthetic local secrets. No production seed/reset/migration or live session update.
4. Run `npm test -- tests/api/auth.test.ts`: the entire8-test file including TEST05, without .only/-t/skips. Report TEST05 specifically and the whole-file actual counts separately; this is not the full application suite. If setup or assertions fail, retain them honestly rather than claiming a pass.
5. Return exact source/clean-status proof, actual command/exit code/sanitized output, pass-fail-skip counts, TEST05 assertions, operator/model/date/time, Node/npm/PostgreSQL versions and safe local DB identity without a connection value. Local serving revision is **N/A**, not classpulse-00006-6w6. Name the deployed reference separately if contextualizing the supporting result.

## What remains open

The method's agreement is not test execution. An actual passing supporting result will not turn independent live expiry into PASS. Any coverage limitation/condition must appear in C/D's actual release-specific decision. No final acceptance, broad no-defect conclusion or ClassPulsePartD completion follows from this proposal. Important remaining coverage and the professor exercise-entry gate still need explicit review.

If a later live controlled method requires code/schema/config/release/deploy, announce the Issue and exact files before action and coordinate with the Lab7/Sprint2 chat. This method requires no such production change. Preserve survey26/responses13–15 and existing accounts/enrollments. [Proposal and method record](../../../evidence/lab-06/checkpoint-20261124/r2-companion-review-20261125/expiry-support-method.json).
