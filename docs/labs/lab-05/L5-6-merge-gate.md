# L5-6 release identity and merge-gate verification contract

Issue [#31](https://github.com/Punge089/classpulse/issues/31). Owner Punge089, reviewer book6349. Covers R-06, the release identity portion of R-07, and C-02. This contract precedes the demonstration test and evidence collection.

## 1. Scope and prerequisites

Agents document and verify the setup. Humans configure GCP IAM/WIF and the GitHub environment/ruleset. No application, authentication, database schema or existing test behavior changes.

The live demonstration requires the reviewed L5-2/L5-3/L5-4 integration, a genuine passing CI run, and a human-configured active ruleset on main. Contract review and preparation may proceed before those prerequisites. The separate deployment workflow contract governs release execution and C-06.

## 2. Human setup and Done checks

| Setup | Human action | Done check |
|---|---|---|
| GitHub environment | Create demo and restrict deployments to main. Supply the agreed GCP_PROJECT_ID, GCP_REGION, WIF_PROVIDER and WIF_SERVICE_ACCOUNT variables. | The environment exists, its branch policy permits main, and all four variable names are present. |
| WIF | Create the provider and deployer identity for this repository and the reviewed deploy.yml. Match numeric repository/owner IDs, main ref, workflow ref and demo environment subject. Grant the scoped registry, existing Cloud Run resource and runtime-service-account permissions the reviewed pipeline needs. | Provider conditions match the actual repository OIDC settings, no user-managed service-account key exists, and a later accepted main run authenticates successfully. |
| Main ruleset | Activate a main-targeted ruleset requiring a PR, one teammate approval, the real test-and-docker check and an up-to-date branch. Leave the bypass list empty and allow merge commits. | Read back effective main rules. The check is required on a normal PR and its failure blocks merging. |

The real region and resource identifiers must agree with the human-created resources and deployment contract. A screenshot of switches alone does not complete the merge-gate check. Observe the effective PR state as well.

## 3. Demonstration workflow

1. After B's C3, prepare one new Vitest file on a separate demonstration branch, feature/31-merge-gate-demo, based on the latest accepted staging. The proposed file is server/tests/unit/lab5MergeGateDemo.test.ts. It contains one explicit failing assertion explaining the C-02 exercise. Leave all existing tests intact.
2. Before adding that test, record the base SHA and the passing baseline CI run. Commit the new test with the actual model trailer and push. Open a normal, non-draft PR into main, labelled lab5, sprint-2, owner:A and waiting-on:B. State prominently that this is the C-02 demonstration.
3. Wait for the exact head SHA's test-and-docker check. Verify that the single new assertion caused the failure and that the normal tests retain their expected results. Record actual counts from the run. Other infrastructure failures must be diagnosed separately.
4. Read the effective main rules and the PR merge state. Capture the failed required check and blocked merge control together, with PR number and head SHA identifiable. Perform read-only verification of the blocked state.
5. B reviews the evidence. Close the demonstration PR without merging after capturing its final state. Preserve the test commit, branch and CI run as grading evidence. Implementation work continues through ordinary reviewed PRs.

## 4. Boundaries

- No released branch receives the demonstration assertion. The demonstration PR is never merged.
- A draft PR cannot establish the rule because draft status itself prevents merging.
- A merge blocked by missing approvals, conflicts or an outdated branch alone does not establish that the failed required check blocked it. Capture the required check and active main rule explicitly, and make the demonstration branch current before the run.
- Never attempt a bypass, modify the ruleset, delete the run, or weaken existing tests to obtain a result.
- Store only public repository/check identifiers and cropped evidence without secret values.

## 5. Acceptance criteria and verification

| Criterion | Verification |
|---|---|
| L5-6-AC1 | Human setup is documented with separate Done checks for environment, WIF and main rules. |
| L5-6-AC2 | A non-draft demonstration PR targets main with exactly one newly introduced failing assertion. Existing tests retain their results. Record base/head SHAs, a green baseline and actual failed-run counts. |
| L5-6-AC3 | The failed test-and-docker check is required by the active main ruleset and the PR shows a blocked merge. Record a direct run link and a readable screenshot of the required check and blocked state. |
| L5-6-AC4 | The demonstration is closed unmerged and the source/test/run history is preserved. |

| Test ID | Criterion | Method and expected result |
|---|---|---|
| L5-6-T1 | AC1 | Review the effective environment/provider/main-rule settings against the documented Done checks. Record the inspection date and public identifiers. |
| L5-6-T2 | AC2 | Run the complete suite through CI at the exact demonstration head. The one new assertion fails. Record the actual passed, failed and skipped counts, including any unexpected failures. |
| L5-6-T3 | AC3 | Inspect the check run, effective required-check rule and PR state at the same head. Confirm the required check failed and merging is blocked. |
| L5-6-T4 | AC4 | Read back PR state CLOSED with no merge commit and link the retained branch/commit/run. |

The intentionally failing PR is the required C-02 evidence. It remains a failing check throughout its lifetime. This operational demonstration has no green implementation that turns the assertion into a pass. A genuine baseline green run and the verified blocked merge complete the verification.

## 6. Completion evidence

- [ ] B's C3 on the contract commit before the demonstration test.
- [ ] Effective main-rule readback and human environment/WIF setup status.
- [ ] Green baseline and failing demonstration run with tested SHAs and actual counts.
- [ ] B-reviewed C-02 evidence in docs/labs/lab-05/evidence/C-02.md, including the readable blocked-merge capture.
- [ ] Demonstration PR closed unmerged, with history retained.

## 7. Version history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-11-12 | Punge089 with OpenAI Codex (GPT-6.1 Sol) | Initial operational verification contract before demonstration tests. |
