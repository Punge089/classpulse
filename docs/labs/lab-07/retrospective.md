# Lab 7 retrospective - interim

Issue #89. Student B/book6349. Written 25 November 2026, 18:06 Asia/Bangkok. These are interim observations about work actually completed so far; revisit after the candidate and final evidence exist.

- **Helped:** The Issue #87 contract check mapped AC-100..111 to TEST-100..114 and reviewed state transitions, version concurrency, audit rollback, access/error ordering, migration, and preserved response/summary behavior. That surfaced the separation needed between the Lab 7 reopening change and the D2 F-08 cutoff feature.
- **Hurt:** The connected ClassPulse folder reported `feature/38-deploy-workflow`, but `git status --short --branch` failed with “this operation must be run in a work tree.” I did not switch or use that branch. At the time this retrospective was first drafted, the Issue #89 branch had not yet had a local diff check; that statement is historical, as clarified below.
- **Change next time:** Start from a usable isolated worktree for the Issue branch, then run `git diff --check` and record the exact candidate/source queries alongside the documents. Refresh UAT and CI evidence immediately before PDF assembly instead of carrying forward a stale green run.

No code, database, cloud deployment, UAT execution, or Deliverable 2 document was changed for this interim retrospective.


## Diff-check provenance correction - 25 November 2026, 18:48 Asia/Bangkok

The earlier “no local diff check” statement is a dated historical note, not the final check record. On the detached isolated worktree `C:\\Users\\Jitvoottikrai\\Documents\\Codex\\2026-11-25\\new-chat\\work\\classpulse-issue89-check`, I ran `git diff --check c99748c0f5d7044aa6cbf8e7124fa9300e0006ff 04dab39dad4a622edccf1c8368865612086f7cf4`. It exited 0 at HEAD `04dab39dad4a622edccf1c8368865612086f7cf4`; the command was run after that commit and before PR #100 was opened at 18:14:32 Bangkok, but its exact minute was not captured. I reran the same command in this session and again got exit 0 at that same local HEAD. This local worktree has not advanced to the latest GitHub branch head, so these results do not claim a diff check on the current PR head. A independently reported their own check on 04dab39; that is A's evidence, not B's. The latest branch commit is documentation disclosure only, and PR #100's latest CI run 45607613095 succeeded. Application tests and UAT were not run by B.
