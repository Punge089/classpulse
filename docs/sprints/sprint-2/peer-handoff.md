# Sprint 2 / D2 handoff

## Current checkpoint - 27 November 2026

B's next review action is to independently check out the exact head of F-06 PR #93, run the scoped verification and record C7. The 7f19aaf source/CI reading is already recorded. A keeps the head stable. B confirmed #134/F-07 as driver with A C3; F-10 #135 is unassigned. #130 asks B for the paired F-08 reopen contract decision, and its shared implementation slot follows F-07. Use #86 to agree the Sprint 3 working slice and any change to ownership.

At the start of a D2 work round, inspect open Issues and PRs marked waiting-on for your account and direct review requests. Work the highest-priority actionable D2 item to a verifiable handoff and update the next person after posting the evidence. Lab 7 retains its separate report, scope and review queue.

## Historical checkpoint - 25 November 2026

The original preparation messages below are dated history. Actual B C3 now exists on #87/#90/#96/#98, and B authored the #88 contract/C2 at f4a5db8. A's #88 review7163876159 agrees retained own history after unenrollment, while precise cursor/query and mandatory policy/UI-state designs still need a committed revision before C3 test permission. Do not treat the earlier draft's optional unenrollment precondition as sufficient evidence.

For B's current review queue: PR92 implementation head45f48cd has complete isolated CI45613368930 (219server/10client/10browser,0failed/0skipped,builds/Docker) and is ready for genuine exact-head review. If the OneDrive Git path is unusable as B's disclosure reports, use B's own verified isolated checkout; never switch/reset the Lab6 checkout. Client tests need no DB. API/browser tests can use a verified separate instance or the existing disposable CI workflow; record B's actual commands/observations and rerun/inspect the exact commit rather than inventing local results. A cannot review/approve as B.

F-06 tests/product edits remain after #87 integration; its client main route also waits #88. F-08 reopen/deadline interaction still needs separately reviewed integration. The Lab7 source/working PDF #101/PR104 is a separate draft, not D2 report content or a request to bypass final release/PDF review. D2 planning PR91 and Lab7 planning PR95 still require separate B reviews. No cross-chat/private-message delivery, B automation status or final acceptance is inferred by this checkpoint.

Prepared by A, 25 November 2026, Issue #86, revision1.1: D2 planning only. Lab7 has separate planning #94 and a separate PDF. These are messages for the humans to send; no cross-chat or private message delivery is claimed.

## To the existing Lab 6 chat

Continue Lab 6 in its existing worktrees. A's other chat has started Sprint 2 + Lab 7 coordination in Issue #86 and sibling worktrees under `classpulse-worktrees`; it will not change Lab 6 evidence or run tests against your database. Proposed Lab 7 #87 changes CLOSED-terminal behavior to owner reopen with reason and audit; no implementation has begun. Tell us the exact accepted Lab 6 source/revision and remaining blockers when they exist. If Lab 6 needs application/schema/shared-spec changes or a release, report the owning Issue, Files and target commit first so we serialize overlap. Keep the current UAT serving revision stable during active runs; coordinate before any main release/deploy. Lab 6 continues to own PR #85 and its acceptance/report work.

## To Student B / B's agent

Work as Student B (`book6349`) in one coordinating chat for Lab 7 + Sprint 2, as requested by the team. Verify `gh api user --jq .login` and Git author identity before acting. Read `docs/partner-ai-brief.md` first, then current `AGENTS.md`, `docs/comment-playbook.md` and Issue #86. The brief's Sprint 1 branch/date/Issue queue is historical; use latest `sprint-2-staging` and `feature/<issue>-<slug>` today. Follow permissions B grants in B's own session; A cannot grant them for B.

First review D2 planning PR #91 for #86 and accept or propose changes to allocation. Review Lab7 planning separately under #94. Review A's #87 Lab 7 contract and #90 F-06 contract at their exact pushed commits; post genuine C3 findings/decision only after reading old/new requirements, AC and STS. The newer announcement removes individual instructor/TA approval, but team selection and peer contract review remain. Then start your #88 F-09 contract, post C2 and wait for A C3 before tests. Issue #89 belongs to the separate Lab7 track; it is not D2 report content. Do not claim unrun candidate tests or final acceptance.

Proposed later B work is F-07, F-10, F-11/F-12 contracts and current System SDS, each with a separate scoped Issue and A review. These are proposals until B accepts. A will review B's actual contracts/PRs; do not use A's credentials or manufacture A/B conversation. Keep GitHub as the shared handoff record; no timer/automation is enabled by this plan.

## Before each feature work block

- Read the current Issue Files, branch/worktree path, exact base/head, next participant and teammate comments.
- Check status/diff before commits; stage named files only. Include the actual assisting model in every AI-assisted commit trailer.
- Isolate test instance and ports from Lab 6; never copy credentials into comments/evidence.
- Record commands, tested commits, pass/fail/skip counts, real reviewer/merger and remaining dependencies.
- Append 3-6 plain-language lines to this worktree's local `autopilot/digest.md`; human-only tasks go in its `autopilot/gates.md`.

## Expected first returns

From Lab 6: actual scope overlap and accepted-version handoff when ready. From B: D2 allocation decision, C3 on #90, and the pushed #88 contract SHA for A review. Review of Lab7 #87/#94 is a separate work item in the same coordinating chat. Neither review is assumed to have happened.
