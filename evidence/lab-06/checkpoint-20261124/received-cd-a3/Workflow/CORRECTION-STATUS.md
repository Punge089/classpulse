# Workflow correction status

Issue62 accepts WF-BUG-001 as a Minor error-handling defect. ClassPulse A's independent reproduction is preserved in lab6-partner-confirmation-20261124/wf-confirmation.

Local correction checkout is workflow-lab6-correction, branch codex/lab6-oversized-json. PR #63 targets lab5-staging and is ready for review. Review is requested from osizk; no submitted review was present at the latest check. Only src/auth.ts and tests/auth-safety.test.mjs changed. The staging branch had an older commit history with the same tree as released main when the branch was prepared.

| Stage | Exact identifier | Actual result |
|---|---|---|
| Original deployed source | 82a4806b5291b57ad7e76a28fb7d40e1e947b9a6 | Bug reproduced locally through live requests and independently by ClassPulse A |
| Regression commit | 0e4897310d8382ec915b6a122ba9121cad22c919 | Build passed,1 test passed,1 intended test failed500 versus 413,0 skipped |
| Correction commit | 84a62c781c730ecf5779c80be0607df7ce0fe74f | Build passed;2/2 safety tests passed;7/7 focused regression checks passed,0 skipped |
| Review-ready PR | https://github.com/osizk/WorkflowAndApprovalSystem/pull/63 | Open, review requested from osizk; actual teammate review pending |
| Corrected live release | PENDING | Peer review, integration, release/deployment and independent retest pending |

repository-red-output.txt and repository-green-output.txt contain the same repository test with the implementation before/after correction. focused-regression-output.txt contains the7-test selection. The initial missing Prisma client and sandboxed engine-download attempts were setup failures and are excluded from the successful-build RED claim. Prisma was generated before the recorded RED run.

Full database/browser/Docker CI passed. Run https://github.com/osizk/WorkflowAndApprovalSystem/actions/runs/45407729755 completed successfully2026-11-24T13:53:08Z. It ran PostgreSQL 16, Chromium, migrations, build and 17 tests with 17 passed,0 failed,0 skipped, then successfully built the Docker image. Deployment-checks passed in run 45407729713. Actual log is full-ci-output.txt. The pull-request event skipped live deployment by design.

current-serving-version.json is a fresh read-only Cloud Run/Artifact Registry source-tag/digest/traffic mapping for the original deployed source. The correction has not been deployed.

Actual contribution and AI-use attribution are in LAB-6-AI-USE-AND-CONTRIBUTIONS.md. No peer approval, corrected deployment or independent retest is entered in advance.
