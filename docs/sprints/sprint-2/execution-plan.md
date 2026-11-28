# Sprint 2 and Deliverable 2 execution plan

Version 1.6, 28 November 2026. Issue #86. Owner: Bannasorn Thongkorn (67070503420, A/Punge089), assisted by Codex GPT-6. Reviewer: Papangkorn Jitvoottikrai (67070503421, B/book6349). B approved the earlier planning head of PR #91. This revision awaits review.

## Current execution checkpoint - 28 November 2026

Staging is [bd77c46](https://github.com/Punge089/classpulse/commit/bd77c46829d78dd983a8abed892fc79de3570c91). Interim main release #143 is 8316f27. Deploy run 46050688714 passed migration/update and read-only smoke. The integrated D2 release and deployed journey are pending.

| Work | Actual evidence | Next gate |
|---|---|---|
| F-06 #90 / PR #93 | B approved 6aa7b21. Merged to staging at 4f1f03a and included in interim main. | Demonstrate on the D2 candidate. B must merge approved compatibility addendum #142 at 7e26743. |
| F-07 #134 / PR #137 | B fixed the invalid TEXT input found by A. A approved exact ed9e11f after an independent run; CI 46106869657 passed 294/27/13, no failures/skips. Merged to staging bd77c46. | Rerun on the integrated D2 candidate. |
| F-08 #96 / PR #97 | B reviewed the cutoff and paired reopen contracts. TEST-180–182 ran test-only in CI 46076042447 at merge 361c581: 272 passed, 3 expected absent-route failures, 0 skipped tests and 8 downstream skips. Evidence retained at f87039c. | Server checkpoint 7b823a0 passed 297 server, 27 client and 13 browser checks in CI 46108983921. UI and expanded boundary checks remain open. |
| F-09 #88 / PR #119 | A reviewed and merged to staging at f46805f, included in interim main. | Demonstrate persisted history on the D2 candidate. |
| F-10 #135 / PR #136 | A drives and B reviews. B approved contract v1.0 in C3 [7232904938](https://github.com/Punge089/classpulse/issues/135#issuecomment-7232904938). | TEST-200 RED retained at 41eb32a. Shared implementation follows F-08. |
| F-11 #140 / PR #141 | B approved privacy contract v1.0 in C3 [7232906862](https://github.com/Punge089/classpulse/issues/140#issuecomment-7232906862). | A scopes exact files before tests. Anonymous behavior is pending. |
| F-12 #138 / PR #139 | B approved the identified-only slice. CI 46058262944 retained TEST-240/242 RED with 272 passes, 2 expected failures, 0 skipped tests and 8 downstream skips. Isolated data-helper checks are preliminary. | The identified CSV workflow passed 296 server, 27 client and 14 browser tests in CI 46109115975 at 580cf35. Peer review and candidate verification remain open. |
| F-13 #124 / PR #125 | B approved contract v1.0 in C3 [7232908860](https://github.com/Punge089/classpulse/issues/124#issuecomment-7232908860). | A pins accepted fields from F-07/F-10 before scoped tests. |
| F-14 #98 / PR #99 | Contract C3, isolated 49.0904 ms p95 measurement and mobile baseline; CI 46069525698 passed 282 server, 23 client and 19 browser tests. | Recheck integrated candidate and complete coverage review. |

## Historical execution checkpoint - 25 November 2026

The initial snapshot/proposed milestones below remain historical, not a claim that later observations were known earlier. Current staging `5e7a164` includes the reviewed Lab6 documentation PR103 and B's interim metrics PR100; final Lab6 accepted-version/independent disposition remains pending. No new main release or deployed candidate is inferred.

| Work | Actual current evidence | Next gate / participant |
|---|---|---|
| Separate maintenance dependency #87 / PR92 | B C3 on8017c91 preceded retained primary/expanded RED and implementation. Current feature45f48cd/CI45613368930 passes219server/10client/10browser,0failed/0skipped,builds/Docker | B exact-head implementation review/merge; not a completed Sprint2 backlog feature |
| F-06 #90 / draft PR93 | B C3 comment7159681538; current checkpoint e0d5900 has9AC/12STS and6document checks. Documentation CI45613893620 passes baseline139server/1client, not F-06 runtime | #87 integration before test/product Files; #88 integration before client main route registration; A then saves genuine old-code RED |
| F-09 #88 | B authored20AC/20STS contract f4a5db8 and C2 comment7163448974. A read exact source/current detail and posted clarification request7163876159; own history after unenrollment agreed | B commits precise cursor/query and mandatory unenrollment/client-state test designs; A rechecks before C3 test permission. No F-09 tests/implementation observed |
| F-08 #96 / draft PR97 | B C3 comment7159683176 approves a874218's independent cutoff design | Shared-file slot after F-07; #87 reopen/deadline interaction still needs its separately reviewed revision before dependent implementation |
| F-14 #98 / draft PR99 | B C3 comment7159684729 approves4ca7cd1's workload/p95/state inventory | Actual measurement/tool/screen execution not yet run; no performance/mobile result or feature completion claimed |
| D2 planning and final integration | PR91 remains D2-only; all F-06..F-10, all F-11..F-14 contracts and a meaningful tested F-13 workflow remain required | B planning review; unscoped features/global baseline/release/D2 PDF still need their own Issues/Files before work |

Only actual comments/commits establish participation. B's work on #88 and #89 does not approve all proposed later allocations, A's own feature PR or any final release. B's #89/PR100 interim NOT READY record belongs to the separate Lab7 assessment. A's Lab7 report #101/draftPR104 and working PDF also belong to that separate track; they neither submit nor replace D2's own assessed content.

Actual isolated runtime lane: existing GitHub Actions PostgreSQL 16 `classpulse_test` service, Node 24 and its disposable app ports have run the maintenance API/client/full-browser checks without using a local Lab6 server/database. Local 3107/5177/5547 remain prepared only and must be independently verified before any local DB/browser run. There is no human local-instance prerequisite for the already-isolated CI route, and no guard/reuse/credential bypass is allowed. Documentation-branch baseline checks are distinct from each feature's own RED/GREEN.

## Scope and sources

Deliverable 2 is a separate 70-point submission due29 November2026 at23:59 Asia/Bangkok. This plan and PR #91 cover D2 only. Lab7 has its own planning Issue #94, feature Issue #87/PR #92, metrics Issue #89, A-D checklist and separately submitted PDF. No combined report will be built. D2 may include the same accepted maintenance code, but must embed its own evidence of continuity/change status.

D2 requires all five planned Sprint 2 features F-06..F-10, complete contracts for F-11..F-14, and at least one meaningful implemented/tested Sprint 3 workflow/rule. Reopening is a maintenance extension of F-03, not a substitute for any planned Sprint 2 feature. No requirement is silently deferred. Group Work Specifications v1, theme 10, page 9 agrees with the existing survey scope; its source hash is retained with the separate Lab7 source inventory in Issue #94.

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

## D2 ownership and order

| Work | Owner / reviewer | Issue | First action / dependencies | Proposed target |
|---|---|---|---|---|
| D2 planning and evidence map | A / B | #86 / PR #91 | Document-only PR; B checks D2 allocation and missing work | 25 Nov |
| F-09 my responses | B / A | #88 / PR #119 | Merged to staging at f46805f; candidate readback pending | Candidate validation |
| F-06 draft editing | A / B | #90 / PR #93 | B approved 6aa7b21 and merged 4f1f03a | Candidate validation |
| F-07 TEXT/MULTI_CHOICE | B / A, confirmed | #134 | Corrected, independently reviewed, and merged to staging | Candidate validation |
| F-08 scheduled closing | A / B | #96 / draft PR #97 | Cutoff/reopen C3 and RED recorded. Owner/response-file slot follows F-07 | After F-07 |
| F-10 sections + response rate | A / B | #135 / PR #136 | C3 recorded. Scope tests before RED; shared implementation follows F-08 | After F-08 |
| F-11 anonymous mode contract | A / B | #140 / PR #141 | Reviewed privacy design; scope exact files before tests | Contract reviewed |
| F-12 export contract | A / B | #138 / PR #139 | Identified API and browser GREEN observed; B reviews the final exact head | D2 working slice |
| F-13 analysis contract + working slice | A / B | #124 / PR #125 | Reviewed owner-only text answers and section filtering depend on F-07/F-10 | Pin accepted fields before tests |
| F-14 hardening contract | A / B | #98 / draft PR #99 | B C3 on4ca7cd1 exists. Measured and browser-tested a baseline; repeat checks on integrated candidate | Candidate validation |
| Current SRS/features/traceability | A / B | To scope | Integrate actual accepted per-feature changes, complete all baseline rows | 28 Nov |
| Current System SDS | B / A | To scope | Final schema/API/permissions from actual integrated work; after #87 spec edits | 28 Nov |
| D2 integration, release and PDF | A drives / B reviews | To scope | Full suite, release review, CI, human cloud steps, deployed checks, D2 PDF | 28-29 Nov |

Dates are proposed milestones, not promises or completed evidence. If throughput misses a target, record the actual gap and revise the plan with the team; do not relabel unfinished Sprint 2 features as Sprint 3. One feature Issue/branch at a time per write set; parallel contract drafting in disjoint files is allowed. Do not implement any unscoped row.

## Shared-file and environment coordination

1. Lab 6 retains its current worktrees and `docs/labs/lab-06/**`, `evidence/lab-06/**`, provisioner and report work. This chat uses sibling `classpulse-worktrees/work86` and separate Issue worktrees. Never `checkout`, `reset`, `stash`, clean, or run broad staging commands in the Lab 6 root/worktrees.
2. The shared-file sequence is #87 (staged) → A F-06 → B F-07 → A F-08 → A F-10. Serialize schema/migration/helper changes in that same dependency sequence. Merge/rebase is not automatic: preserve history using reviewed merge commits and re-review changed heads. No force pushes or history rewriting.
3. B #88 owns respondent list/history routes/navigation now. A's later F-06 route registration waits for that integration. Do not copy uncommitted work between branches. Each completed PR references its exact contract, RED and GREEN commits.
4. `docs/ai-use.md` is append-only by the current owner; re-read newer staging and preserve other declarations at integration. Global SRS/SDS/traceability edits are serialized. Local `autopilot/gates.md` and `autopilot/digest.md` live in each worktree; do not overwrite Lab 6's local logs.
5. Reserve local A application ports 3107/5177 for this work; verify availability before use. B uses its own machine or agrees distinct ports. Inspect actual runner configuration; a proposed port is not configured yet.
6. Existing server test safety guard requires database name `classpulse_test`. Use a separate local PostgreSQL instance/container/port whose database keeps that name. Do not disable the guard to run elsewhere. Never copy the root `.env.test` blindly or reset the instance used by another chat. Record private setup status without displaying connection strings. Tests needing a database wait for verified isolation; contract checks need no DB.
7. Lab 6 keeps control of the currently served UAT deployment until its active runs and acceptance handoff are settled. No chat publishes to main during an uncoordinated UAT run. The later release Issue explicitly names one release driver, freeze window, head and reviewer. Humans own cloud changes/credentials and LEB2 submission under AGENTS.md.

## Review protocol and evidence gates

Use docs/comment-playbook.md with actual Issue checks. C1 -> contract commit/C2 -> teammate C3 -> test-only RED commit and saved output -> implementation/GREEN -> C6 PR -> exact-head peer review/CI -> merge commit -> C10. Do not start feature tests until C3. For Lab 7, record old/new rule and genuine test failure on old behavior, not a compilation/fixture error. Existing tests remain enabled. Any legitimate changed expectation needs versioned rationale and preserved unaffected assertions.

Reserve separate AC/TEST ranges (unused in inspected numeric registry): Lab 7 100-119; F-06 120-139; F-07 140-159; F-09 160-179; F-08 180-199; F-10 200-219; F-11 220-239; F-12 240-259; F-13 260-279; F-14 280-299. If more IDs are needed, extend through a reviewed allocation; never reuse or renumber prior IDs. Lab 7 proposes FR-19 and BR-15; all original FR/BR remain identifiable.

D2 rubric and report requirements are in the [D2 evidence plan](../../deliverable-2/evidence-plan.md). Lab7 requirements are maintained separately in Issue #94. A doc PR passing CI is not feature completion. A green local run is not peer review, deployment, independent UAT or acceptance.

## Finish plan through 13 December

By 29 Nov: all Sprint 2 accepted; F-11..14 contracts; tested meaningful F-12 identified export slice in candidate; D2 PDF content checks; peer review exact candidate and D2 PDF hash; human uploads D2 and verifies its receipt. Lab7 is submitted separately through its own checklist. The 28 November checkpoint records actual status and remaining dependencies.

30 Nov: inspect actual outstanding AC list and assign each gap/test/defect with named owner; preserve submitted candidate. During 1-11 Dec exams: bounded completion slots agreed by A/B, not assumed availability. Proposed F-11/F-12 completion by 6 Dec (A, B reviews), remaining F-13/F-14 by 8 Dec (A), affected UAT retests/integration by 11 Dec, final video and release review on 12 Dec, human final submission by 13 Dec. Each later Issue must list exact unmet AC and evidence, not only feature titles.

## Version history

v1.0, 25 Nov 2026, A: initial plan from supplied assignments and later announcement; B assignment and contract decisions pending review. No code or test implementation.

v1.1,25 Nov2026,A: user requested visibly separate planning/submission tracks. Remove Lab7 planning/source/evidence content from PR91 into separate Issue94/branch/PR. Preserve cross-feature integration dependencies and all prior Git history.

v1.2,25Nov2026,A/Codex GPT-6.1 Sol: replace F-08/F-14 unscoped placeholders with actual Issues96/98 and contract-review PRs97/99; preserve pending B agreement and unexecuted implementation/results.

v1.3,25Nov2026,A/Codex GPT-6.1 Sol: record actual scoped B C3/C2 participation, exact maintenance candidate versus baseline documentation CI, F-09 review clarifications and remaining serialized gates. Import current reviewed staging documentation without changing Lab6/B evidence; clarify CI isolation as an available lane. Retain all D2 obligations and separate Lab7 report ownership; no feature/release completion inferred.

v1.4, 27 November 2026, A/Codex GPT-6: retain the prior assessment plan and record the current evidence, actual F-07 ownership, unassigned F-10 implementation and exact-head reviewer bottleneck. Resolve the staging disclosure conflict. No product work moved between sprints.

v1.5, 28 November 2026, A/Codex GPT-6.2 Sol: address PR #91 review with current staging and interim main, F-07 review outcome, A's F-10 assignment and C3s, and the identified F-12 slice and release dependencies. Preserve earlier checkpoint history in Git.

v1.6, 28 November 2026, A/Codex GPT-6.2 Sol: record F-07 staging and current F-08, F-10 and F-12 test evidence. Keep candidate and submission gates open.
