# Lab 7 retrospective - interim

Issue #89. Student B/book6349. Written 25 November 2026, 18:06 Asia/Bangkok. These are interim observations about work actually completed so far; revisit after the candidate and final evidence exist.

- **Helped:** The Issue #87 contract check mapped AC-100..111 to TEST-100..114 and reviewed state transitions, version concurrency, audit rollback, access/error ordering, migration, and preserved response/summary behavior. That surfaced the separation needed between the Lab 7 reopening change and the D2 F-08 cutoff feature.
- **Hurt:** The connected ClassPulse folder reported `feature/38-deploy-workflow`, but `git status --short --branch` failed with “this operation must be run in a work tree.” I did not switch or use that branch. At the time this retrospective was first drafted, the Issue #89 branch had not yet had a local diff check; that statement is historical, as clarified below.
- **Change next time:** Start from a usable isolated worktree for the Issue branch, then run `git diff --check` and record the exact candidate/source queries alongside the documents. Refresh UAT and CI evidence immediately before PDF assembly instead of carrying forward a stale green run.

No code, database, cloud deployment, UAT execution, or Deliverable 2 document was changed for this interim retrospective.
