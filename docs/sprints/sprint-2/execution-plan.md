# Sprint 2, Lab 7 and Deliverable 2 execution plan

Version 1.0, 25 November 2026. Coordination Issue #86. Author/driver: Bannasorn Thongkorn (67070503420, Punge089, A), assisted by Codex GPT-6. Proposed reviewer and partner: Papangkorn Jitvoottikrai (67070503421, book6349, B). B acceptance/review is pending; this is not a record of B having worked.

## Scope and sources

Both PDFs are due 29 November 2026 at 23:59 Asia/Bangkok. Lab 7 is 100 points; Deliverable 2 (D2) is 70 points. The [source update](../../labs/lab-07/assignment-changes.md) removes individual instructor/TA approval, but retains meaningful team-selected change, contract review, RED before implementation, regression, reviewed delivery and evidence. A's reported TA clarification also requires a distinct Lab 7 Issue, branch and PR. One implementation may serve both submissions; each PDF must contain its own complete assessed material.

D2 requires all five planned Sprint 2 features F-06..F-10, complete contracts for F-11..F-14, and at least one meaningful implemented/tested Sprint 3 workflow/rule. Reopening is a maintenance extension of F-03, not a substitute for any planned Sprint 2 feature. No requirement is silently deferred. Group Work Specifications v1, theme 10, page 9 agrees with the existing survey scope; its source hash is retained in the source manifest.

The user explicitly chose one coordinating chat per student for Lab 7 + Sprint 2. This supersedes old Sprint 1 advice to use one session per Issue. File/Issue/branch ownership still applies: switch explicitly between Issue contexts and worktrees, not through the shared Lab 6 checkout. B reads the historical partner brief first, then follows current AGENTS.md and this plan for current branch/work sequencing. B's own session determines B's authorization; A's standing authority is not transferred.

## Snapshot and version boundaries

| Reference | Observed value | Meaning |
|---|---|---|
| Protected Sprint 1 tag | `v1.0.0-sprint1`, commit `d4bad74211729032697164f378638efb834a67b6` | Historical submitted baseline; never move/recreate |
| Starting staging | `c99748c` | Current staging used for this worktree on 25 November; contains intervening Lab 5/6 work |
| Lab 6 CP-V01 source | `1fe3e3b82dfb0537be30223c9b598b3479b4affe` | Attributed from Lab 6 register, not a fresh cloud verification by this chat |
| Lab 6 final accepted baseline | PENDING | PR #85 and independent CD01/CD07/Part D/final acceptance were still pending at inspection |
| Actual Lab 7 pre-change code | PENDING at RED | Pin full commit, code tree and migration state before tests; do not substitute the tag for actual old code |
| Accepted Sprint 2 main release | PENDING | Preserve its own immutable tag/commit even if a later RC adds Sprint 3 |
| D2 candidate / deployed revision | PENDING | Match source SHA, CI run, immutable image digest and serving revision/traffic |

The Lab 6 chat owns its actual case records and acceptance decision. Preparation does not assert an accepted Lab 6 baseline. Before completing Lab 7 version evidence, reconcile the eventual accepted Lab 6 release with the actual pre-change implementation and explicitly list intervening work. If later UAT finds a conflicting rule/defect, revise the contract and review it before dependent implementation.

## Ownership and order

| Work | Owner / reviewer | Issue | First action / dependencies | Proposed target |
|---|---|---|---|---|
| Coordination and source/rubric map | A / B | #86 | Document-only PR; B checks allocation and missing work | 25 Nov |
| Lab 7 F-03 reopen + audit | A / B | #87 | Contract, team C3, meaningful RED, code/GREEN; dedicated PR | 25-27 Nov |
| F-09 my responses | B / A | #88 | B accepts assignment, writes contract/C2 now; independent response-list slice | 25-26 Nov |
| Lab 7 metrics/readiness | B / A | #89 | Define metrics now, collect real candidate data later; A reviews B work | 25-29 Nov |
| F-06 draft editing | A / B | #90 | Contract now; owner-route implementation after #87 | 26 Nov |
| F-07 TEXT/MULTI_CHOICE | B / A | To scope | Separate Issue/Files/contract before work; after #88 and owner files from #90 | 26-27 Nov |
| F-08 scheduled closing | A / B | To scope | Contract must reconcile deadline with #87 reopen; owner/response-file slot after F-07 | 27 Nov |
| F-10 sections + response rate | B / A | To scope | Define section enrollment semantics; after F-07 and F-08 shared-file integration | 27-28 Nov |
| F-11 anonymous mode contract | B / A | To scope | Privacy design, identity/answer separation, threshold >=5; implementation completion by final | contract 27 Nov |
| F-12 export contract | B / A | To scope | Identified vs anonymous export rules, formula-injection handling, ownership | contract 27 Nov |
| F-13 analysis contract + working slice | A / B | To scope | Selected D2 Sprint 3 progress: owner-only text answers and section filtering, after F-07/F-10 | 28 Nov |
| F-14 hardening contract | A / B | To scope | Existing NFR-06/07/10 metrics, screen/state inventory, no fabricated PASS | contract 27 Nov |
| Current SRS/features/traceability | A / B | To scope | Integrate actual accepted per-feature changes, complete all baseline rows | 28 Nov |
| Current System SDS | B / A | To scope | Final schema/API/permissions from actual integrated work; after #87 spec edits | 28 Nov |
| Integration, release and both PDFs | A drives / B reviews | To scope | Full suite, release review, CI, human cloud steps, deployed checks, both PDFs | 28-29 Nov |

Dates are proposed milestones, not promises or completed evidence. If throughput misses a target, record the actual gap and revise the plan with the team; do not relabel unfinished Sprint 2 features as Sprint 3. One feature Issue/branch at a time per write set; parallel contract drafting in disjoint files is allowed. Do not implement any unscoped row.

## Shared-file and environment coordination

1. Lab 6 retains its current worktrees and `docs/labs/lab-06/**`, `evidence/lab-06/**`, provisioner and report work. This chat uses sibling `classpulse-worktrees/work86` and separate Issue worktrees. Never `checkout`, `reset`, `stash`, clean, or run broad staging commands in the Lab 6 root/worktrees.
2. A owns owner lifecycle/detail changes #87 -> #90, then B F-07, then A F-08, then B F-10. Serialize schema/migration/helper changes in that same dependency sequence. Merge/rebase is not automatic: preserve history using reviewed merge commits and re-review changed heads. No force pushes or history rewriting.
3. B #88 owns respondent list/history routes/navigation now. A's later F-06 route registration waits for that integration. Do not copy uncommitted work between branches. Each completed PR references its exact contract, RED and GREEN commits.
4. `docs/ai-use.md` is append-only by the current owner; re-read newer staging and preserve other declarations at integration. Global SRS/SDS/traceability edits are serialized. Local `autopilot/gates.md` and `autopilot/digest.md` live in each worktree; do not overwrite Lab 6's local logs.
5. Reserve local A application ports 3107/5177 for this work; verify availability before use. B uses its own machine or agrees distinct ports. Inspect actual runner configuration; a proposed port is not configured yet.
6. Existing server test safety guard requires database name `classpulse_test`. Use a separate local PostgreSQL instance/container/port whose database keeps that name. Do not disable the guard to run elsewhere. Never copy the root `.env.test` blindly or reset the instance used by another chat. Record private setup status without displaying connection strings. Tests needing a database wait for verified isolation; contract checks need no DB.
7. Lab 6 keeps control of the currently served UAT deployment until its active runs and acceptance handoff are settled. No chat publishes to main during an uncoordinated UAT run. The later release Issue explicitly names one release driver, freeze window, head and reviewer. Humans own cloud changes/credentials and LEB2 submission under AGENTS.md.

## Review protocol and evidence gates

Use docs/comment-playbook.md with actual Issue checks. C1 -> contract commit/C2 -> teammate C3 -> test-only RED commit and saved output -> implementation/GREEN -> C6 PR -> exact-head peer review/CI -> merge commit -> C10. Do not start feature tests until C3. For Lab 7, record old/new rule and genuine test failure on old behavior, not a compilation/fixture error. Existing tests remain enabled. Any legitimate changed expectation needs versioned rationale and preserved unaffected assertions.

Reserve separate AC/TEST ranges (unused in inspected numeric registry): Lab 7 100-119; F-06 120-139; F-07 140-159; F-09 160-179; F-08 180-199; F-10 200-219; F-11 220-239; F-12 240-259; F-13 260-279; F-14 280-299. If more IDs are needed, extend through a reviewed allocation; never reuse or renumber prior IDs. Lab 7 proposes FR-19 and BR-15; all original FR/BR remain identifiable.

Full rubric and report requirements are in the [D2/Lab 7 evidence plan](../../deliverable-2/evidence-plan.md). A doc PR passing CI is not feature completion. A green local run is not peer review, deployment, independent UAT or acceptance.

## Finish plan through 13 December

By 29 Nov: all Sprint 2 accepted; F-11..14 contracts; tested meaningful F-13 slice in candidate; independent PDF content checks; peer review exact candidate and PDF hashes; human uploads both PDFs and verifies receipts. Current status of all new features is PLANNED/CONTRACT PREPARATION, not implemented.

30 Nov: inspect actual outstanding AC list and assign each gap/test/defect with named owner; preserve submitted candidate. During 1-11 Dec exams: bounded completion slots agreed by A/B, not assumed availability. Proposed F-11/F-12 completion by 6 Dec (B), remaining F-13/F-14 by 8 Dec (A), affected UAT retests/integration by 11 Dec, final video and release review on 12 Dec, human final submission by 13 Dec. Each later Issue must list exact unmet AC and evidence, not only feature titles.

## Version history

v1.0, 25 Nov 2026, A: initial plan from supplied assignments and later announcement; B assignment and contract decisions pending review. No code or test implementation.
