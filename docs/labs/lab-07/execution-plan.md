# Lab 7 maintenance and submission plan

Issue #94, version1.0,25 November2026. Author/driver: Bannasorn Thongkorn (67070503420, Punge089, A); proposed reviewer/partner: Papangkorn Jitvoottikrai (67070503421, book6349, B). B acceptance and reviews remain pending. Assisted by Codex GPT-6.

## Separate assessment

Lab7 is its own100-point assessment, due29 November2026 at23:59 Asia/Bangkok. It has a separate PDF with Parts A-D, its own navigation, evidence, contribution/AI-use/limitations and LEB2 upload. It is not a section or appendix of the Deliverable2 PDF. The D2 planning PR #91 does not submit or replace Lab7.

The same accepted code change may be in the evolving product and D2 candidate. That sharing does not merge assessments: each PDF must embed the material its rubric assesses. One coordinating chat per student is allowed by the user's instruction, with explicit Issue/worktree/file ownership. See the [assignment change record](assignment-changes.md) for the supplied no-TA-approval announcement and prior separate-Issue/branch/PR clarification.

## Dedicated work and roles

| Work | Owner / reviewer | Issue / PR | Current state |
|---|---|---|---|
| Lab7 plan, source provenance and report checklist | A / B | #94 / its own planning PR | Drafted; B review pending |
| Change request, impact and revised contract | A / B | #87 / draft PR #92 | Contract8017c91; team choice/C3 pending |
| Test-first RED, implementation/GREEN, regression | A / B | #87 / same dedicated PR #92 | NOT STARTED; wait C3 |
| Five metrics, readiness and retrospective | B / A | #89 / future B PR | Proposed B assignment, acceptance/work pending |
| Lab7 PDF assembly | A / B | Later scoped report Issue/PR | NOT STARTED; requires actual assessed evidence |
| Reviewed main release/deployed checks | Named release driver / other student | Later explicit release Issue/PR | NOT STARTED; coordinate current Lab6 UAT first |

The meaningful proposed change is controlled reopening of a closed survey with owner reason, lifecycle version, transactional audit and unchanged historical answers/duplicate-response restrictions. This changes previously correct terminal-CLOSED behavior from Sprint1. It is not an unchanged Sprint2 backlog feature. B must evaluate and agree to the specific change through contract review. There is no individual TA approval gate under the newer announcement.

## History and accepted-version gate

Protected original Sprint1 tag `v1.0.0-sprint1` points to `d4bad74211729032697164f378638efb834a67b6`. Current preparation base is staging `c99748c`. Lab6's CP-V01 source `1fe3e3b82dfb0537be30223c9b598b3479b4affe` is attributed from its records, not freshly cloud-verified here. Lab6 final acceptance remains PENDING. Keep these distinct from the actual implementation commit tested at RED and the later accepted/deployed maintained version.

Preparation can proceed in parallel. Before calling Lab7 complete, obtain the actual Lab6 accepted reference/decision, identify intervening work and any conflicting defect/rule changes, pin actual pre-change code, and retain meaningful old-code RED -> new-code GREEN -> review -> staging -> main -> deployed changed/preserved checks. Do not infer acceptance from the old tag or a green CI icon.

## Isolation and order

Work only in Lab7 worktrees `classpulse-worktrees/work87` and `work94`; B uses its own scoped branch/worktree. Lab6 keeps its own files, local logs, UAT database and deployment. Lab7 does not switch branches or reset/seed in that checkout. Before tests, verify a separate local PostgreSQL instance/port keeping database name `classpulse_test`; preserve its existing guard. Verify/coordinate application ports rather than reusing another chat's server.

Shared app files must be integrated in sequence: Lab7 lifecycle #87 before A draft editing #90; later scheduled closing must explicitly reconcile reopen/deadline semantics through a contract revision. Shared docs/AI declarations are merged preserving both authors' additions, followed by exact-head re-review. No force push, squash, history rewrite or protected-tag movement. No self-approval/merge. B works under B's own authority and credentials.

Use C1 -> committed contract/C2 -> actual teammate C3 -> test-only RED and saved output -> implementation/same-test GREEN -> substantive peer review/current CI -> merge commit. Lab7's new tests are not yet written. Any failing/skipped runtime checks must remain visible. The state/action design, 12 AC and15 STS designs are not execution evidence.

## Milestones and human actions

- 25 Nov: B reviews change/contract and allocation; A/B agree boundary/transaction/migration details.
- 26-27 Nov: meaningful RED, implementation/GREEN/regression and exact-head review. Dates are proposed, not claimed achievements.
- 28 Nov: coordinated reviewed release, actual deployed changed/preserved checks; B collects real dated metrics/readiness.
- 29 Nov: complete Lab7 PDF, inspect every rendered page, B reviews exact PDF hash, human submits to the Lab7 LEB2 assignment and verifies receipt before23:59 Bangkok.

Human cloud/account/credential/migration actions are recorded with exact steps in the local gates file once a concrete reviewed release exists. No speculative command is presented as approved. Pending baseline, tests, B work and deployment mean maintained scope is NOT READY now. Metrics/retrospective must describe actual outcomes, not invented activity.

## Version history

v1.0,25Nov2026,A: create visibly separate Lab7 planning/submission track under #94 at user's request. Earlier combined coordination commit1354a2a remains historical; no report was combined or submitted.
