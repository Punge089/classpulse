# Lab 7 maintenance and submission plan

Issue #94, v1.2, 28 November 2026. Author and driver: Bannasorn Thongkorn (67070503420, Punge089, A). Peer reviewer: Papangkorn Jitvoottikrai (67070503421, book6349, B). Assisted by Codex GPT-6.

## Separate assessment

Lab7 is its own100-point assessment, due29 November2026 at23:59 Asia/Bangkok. It has a separate PDF with Parts A-D, its own navigation, evidence, contribution/AI-use/limitations and LEB2 upload. It is not a section or appendix of the Deliverable2 PDF. The D2 planning PR #91 does not submit or replace Lab7.

The same accepted code change may be in the evolving product and D2 candidate. That sharing does not merge assessments: each PDF must embed the material its rubric assesses. The Sprint2 chat coordinates the release. The Lab7 chat owns the separate report, with its own Issue, worktree and files. See the [assignment change record](assignment-changes.md) for the supplied no-TA-approval announcement and prior separate-Issue/branch/PR clarification.

## Dedicated work and roles

| Work | Owner / reviewer | Issue / PR | Current state |
|---|---|---|---|
| Lab7 plan, source provenance and report checklist | A / B | #94 / PR #95 | B reviewed the previous integration head; review and CI required for the current commit |
| Change request, impact and revised contract | A / B | #87 / PR #92 | Contract `8017c91`; B's C3 preceded tests |
| Test-first RED, implementation/GREEN, regression | A / B | #87 / PR #92 | Retained RED/GREEN, B review and staging merge `e6043a9` verified |
| Five metrics, readiness and retrospective | B / A | #89 / PR #114 | Interim #114 merged at `7d543a5`; B updates release metrics after deployed checks |
| Lab7 PDF assembly | A / B | #101 / PR #104 | Use [PR #104](https://github.com/Punge089/classpulse/pull/104) for the current draft. The 28 November snapshot was v0.4 at `6948d6dfcf5baf038212d9851ea8188e23d75036`; deployed evidence and B's final PDF review pending |
| Reviewed main release/deployed checks | Sprint2 release coordinator / non-author reviewer | Reviewed main release PR | Coordination pending; human operator handles GCP and supplies version readback |

The reviewed change is controlled reopening of a closed survey with owner reason, lifecycle version, transactional audit and unchanged historical answers/duplicate-response restrictions. This changes previously correct terminal-CLOSED behavior from Sprint1. It is not an unchanged Sprint2 backlog feature. B checked the proposal before tests in C3. The newer announcement waived individual TA approval for the change request.

## History and accepted-version gate

Protected original Sprint1 tag `v1.0.0-sprint1` points to `d4bad74211729032697164f378638efb834a67b6`. The initial planning base was staging `c99748c`. On 27 November at 01:35:39 ICT, D recorded acceptance for ClassPulse Sprint 1 identified surveys on CP-FIX-001 `bee0d122`, serving revision `classpulse-00007-6t9`. C acknowledged the decision at 02:01:21 ICT. The isolated TEST-04 passed and the historical live M01 remains BLOCKED. The actual primary RED test head was `3f8918c` on the old lifecycle code. See [Lab 7 draft report](https://github.com/Punge089/classpulse/pull/104) for the full version map.

B merged the feature into staging at `e6043a9`. At the 27 November readback, GitHub main was still `bee0d122`. Coordinate the reviewed main release, identify the deploy run and serving revision, then record changed and preserved behavior on that release.

## Isolation and order

Use the Issue-specific Lab7 worktrees `classpulse-worktrees/work87`, `work94` and `work101`; B uses its own scoped branch/worktree. Lab6 keeps its own files, local logs, UAT database and deployment. Lab7 does not switch branches or reset/seed in that checkout. Before tests, verify a separate local PostgreSQL instance/port keeping database name `classpulse_test`; preserve its existing guard. Verify/coordinate application ports rather than reusing another chat's server.

Shared app files must be integrated in sequence: Lab7 lifecycle #87 before A draft editing #90; later scheduled closing must explicitly reconcile reopen/deadline semantics through a contract revision. Shared docs/AI declarations are merged preserving both authors' additions, followed by exact-head re-review. No force push, squash, history rewrite or protected-tag movement. No self-approval/merge. B works under B's own authority and credentials.

Use C1 -> committed contract/C2 -> actual teammate C3 -> test-only RED and saved output -> implementation/same-test GREEN -> substantive peer review/current CI -> merge commit. Preserve failing and skipped run evidence alongside successful outcomes. The state/action design, 12 AC and15 STS designs are not execution evidence.

## Milestones and human actions

- 25 Nov: B reviews change/contract and allocation; A/B agree boundary/transaction/migration details.
- 26-27 Nov: meaningful RED, implementation/GREEN/regression and exact-head review. Dates are proposed, not claimed achievements.
- 28 Nov: coordinated reviewed release, actual deployed changed/preserved checks; B collects real dated metrics/readiness.
- 29 Nov: complete Lab7 PDF, inspect every rendered page, B reviews exact PDF hash, human submits to the Lab7 LEB2 assignment and verifies receipt before23:59 Bangkok.

Human cloud/account/credential/migration actions are recorded with exact steps in the local gates file once a concrete reviewed release exists. No speculative command is presented as approved. The maintained scope remains NOT READY pending the reviewed Lab7 release, deployed checks and final evidence review. Metrics/retrospective must describe actual outcomes, not invented activity.

## Version history

v1.0,25Nov2026,A: create visibly separate Lab7 planning/submission track under #94 at user's request. Earlier combined coordination commit1354a2a remains historical; no report was combined or submitted.

v1.1, 27 Nov 2026, A: record the verified baseline, feature review and staging merge, draft report and outstanding release coordination. v1.0 remains in Git history.

v1.2, 28 Nov 2026, A: refresh the report and interim metrics pointers after B's review and retain the pending release gates.
