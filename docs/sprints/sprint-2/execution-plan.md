# Sprint 2 and Deliverable 2 execution plan

Version 1.4, 27 November 2026. Issue #86. Owner: Bannasorn Thongkorn (67070503420, A/Punge089), assisted by Codex GPT-6. Reviewer: Papangkorn Jitvoottikrai (67070503421, B/book6349). B approved the earlier planning head of PR #91. This revision awaits review.

## Current execution checkpoint - 27 November 2026

Staging `5fe00fd` contains the reviewed Lab 7 reopening feature and the Lab 6 report. Main still serves as the earlier release lane; the D2 candidate is pending.

| Work | Actual evidence | Next gate |
|---|---|---|
| F-06 #90 / PR #93 | Ready at `7f19aaf`; CI 45989314078 tested merge `b0d952f`: 272 server, 23 client, 12 browser passed, zero failed or skipped; builds/Docker passed. B inspected source and CI step outcomes and reported a Git write blocker for independent execution. | B runs the exact-head checks from a writable checkout and records C7. |
| F-07 #134 | [B confirmed ownership](https://github.com/Punge089/classpulse/issues/86#issuecomment-7217335398); A reviews C3. | B commits contract and C2. Shared implementation follows F-06. |
| F-08 #96 / PR #97 | TEST-180 preimplementation RED retained at `143529a`. CI 45993529144 at `1f16805` reported 239 server passes, 1 expected 404 vs 200 failure and 0 test skips. Eight downstream CI steps were skipped. | B reviews the paired #130/#131 and F-08 proposed canonical revisions. Implementation follows F-07. |
| F-09 #88 / PR #119 | Independent A review and CI, merged to staging at `f46805f`. | Integrate and demonstrate on the release candidate. |
| F-10 #135 | Scoped. B reports limited capacity for implementation by the D2 deadline. Driver is unassigned. | A coordinates ownership. Contract is independent of the shared implementation slot. |
| Sprint 3 | F-13 #124/#125 is a proposal with F-07/F-10 dependencies. F-14 #98 has real C3 on the contract. F-11 and F-12 contracts remain required. | Agree the working slice with B. Identified F-12 export is a fallback discussed on #86. The tested domain outcome and release evidence are pending. |

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
| F-06 draft editing | A / B | #90 / PR #93 | B's independent exact-head review and staging merge are pending | Immediate |
| F-07 TEXT/MULTI_CHOICE | B / A, confirmed | #134 | Contract and A C3, then shared implementation after F-06 | Contract now |
| F-08 scheduled closing | A / B | #96 / draft PR #97 | B C3 on a874218 exists. Deadline/reopen integration requires reviewed revision; owner/response-file slot after F-07 | 27 Nov |
| F-10 sections + response rate | Driver unassigned / teammate review | #135 | A coordinates ownership. Draft contract independently; shared implementation follows F-08 | Owner confirmation ASAP |
| F-11 anonymous mode contract | B / A | To scope | Privacy design, identity/answer separation, threshold >=5; implementation completion by final | contract 27 Nov |
| F-12 export contract | B / A | To scope | Identified vs anonymous export rules, formula-injection handling, ownership | contract 27 Nov |
| F-13 analysis contract + working slice | A / B | #124 / PR #125 | Proposed owner-only text answers and section filtering depend on F-07/F-10. Agree the tested D2 slice on #86. | Decision before candidate freeze |
| F-14 hardening contract | A / B | #98 / draft PR #99 | B C3 on4ca7cd1 exists. Measurements, screen/state execution and actual findings remain NOT RUN | contract 27 Nov |
| Current SRS/features/traceability | A / B | To scope | Integrate actual accepted per-feature changes, complete all baseline rows | 28 Nov |
| Current System SDS | B / A | To scope | Final schema/API/permissions from actual integrated work; after #87 spec edits | 28 Nov |
| D2 integration, release and PDF | A drives / B reviews | To scope | Full suite, release review, CI, human cloud steps, deployed checks, D2 PDF | 28-29 Nov |

Dates are proposed milestones, not promises or completed evidence. If throughput misses a target, record the actual gap and revise the plan with the team; do not relabel unfinished Sprint 2 features as Sprint 3. One feature Issue/branch at a time per write set; parallel contract drafting in disjoint files is allowed. Do not implement any unscoped row.

## Shared-file and environment coordination

1. Lab 6 retains its current worktrees and `docs/labs/lab-06/**`, `evidence/lab-06/**`, provisioner and report work. This chat uses sibling `classpulse-worktrees/work86` and separate Issue worktrees. Never `checkout`, `reset`, `stash`, clean, or run broad staging commands in the Lab 6 root/worktrees.
2. The shared-file sequence is #87 (staged) → A F-06 → B F-07 → A F-08 → F-10 once its driver is assigned. Serialize schema/migration/helper changes in that same dependency sequence. Merge/rebase is not automatic: preserve history using reviewed merge commits and re-review changed heads. No force pushes or history rewriting.
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

By 29 Nov: all Sprint 2 accepted; F-11..14 contracts; tested meaningful F-13 slice in candidate; D2 PDF content checks; peer review exact candidate and D2 PDF hash; human uploads D2 and verifies its receipt. Lab7 is submitted separately through its own checklist. The 27 November checkpoint records actual status and remaining dependencies.

30 Nov: inspect actual outstanding AC list and assign each gap/test/defect with named owner; preserve submitted candidate. During 1-11 Dec exams: bounded completion slots agreed by A/B, not assumed availability. Proposed F-11/F-12 completion by 6 Dec (B), remaining F-13/F-14 by 8 Dec (A), affected UAT retests/integration by 11 Dec, final video and release review on 12 Dec, human final submission by 13 Dec. Each later Issue must list exact unmet AC and evidence, not only feature titles.

## Version history

v1.0, 25 Nov 2026, A: initial plan from supplied assignments and later announcement; B assignment and contract decisions pending review. No code or test implementation.

v1.1,25 Nov2026,A: user requested visibly separate planning/submission tracks. Remove Lab7 planning/source/evidence content from PR91 into separate Issue94/branch/PR. Preserve cross-feature integration dependencies and all prior Git history.

v1.2,25Nov2026,A/Codex GPT-6.1 Sol: replace F-08/F-14 unscoped placeholders with actual Issues96/98 and contract-review PRs97/99; preserve pending B agreement and unexecuted implementation/results.

v1.3,25Nov2026,A/Codex GPT-6.1 Sol: record actual scoped B C3/C2 participation, exact maintenance candidate versus baseline documentation CI, F-09 review clarifications and remaining serialized gates. Import current reviewed staging documentation without changing Lab6/B evidence; clarify CI isolation as an available lane. Retain all D2 obligations and separate Lab7 report ownership; no feature/release completion inferred.

v1.4, 27 November 2026, A/Codex GPT-6: retain the prior assessment plan and record the current evidence, actual F-07 ownership, unassigned F-10 implementation and exact-head reviewer bottleneck. Resolve the staging disclosure conflict. No product work moved between sprints.
