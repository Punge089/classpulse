# Lab 7 evidence and PDF submission checklist

Issue #94, v1.1, 27 November 2026. A prepares and B reviews a self-contained Lab7 PDF, separately submitted from Deliverable2. Deadline 29 November 2026, 23:59 Bangkok. [PR #104](https://github.com/Punge089/classpulse/pull/104) contains working draft v0.3.

| Part | Points | Include directly in the Lab7 PDF | Owner / current state |
|---|---:|---|---|
| A | 25 | Old/new implemented Sprint1 behavior; team selection and superseding announcement; accepted baseline/actual pre-change versions; impact across SRS/feature SDS/system SDS/AC/STS/code; revised relevant excerpts and B review before code | A #87; B's pre-code C3 and accepted Lab6 baseline are recorded |
| B | 50 | Actual setup/assertions and RED on old behavior; same-test GREEN and code diff; relevant existing regression with commands/SHA/pass/fail/skip; dedicated Issue/branch/PR, substantive review, CI, staging/main/deployed mapping; changed and preserved deployed checks | A #87 and B #92 review/staging verified; main release and deployed checks pending |
| C | 15 | Five defined dated metrics with scope/window, values, sources/evidence IDs; compact underlying lists reconciling at least two values offline; <=100-word interpretation naming action/owner | B #89 dated snapshot exists; final metrics refresh and A review pending |
| D | 10 | Maintained-Sprint1 READY/NOT READY checklist, deployed version, defects/severity/status, test failures/skips, technical debt distinct from defects, config/secrets/docs/setup/deploy checks; helped/hurt/change retrospective; actual contributions/AI/limits | B #89, A report assembly; NOT READY |

## Required version and evidence record

Version table: immutable original Sprint1 tag/commit -> actually accepted Lab6 reference -> actual pre-change code/deployment and intervening work -> contract/review -> test-only RED -> implementation/GREEN -> reviewed staging merge -> reviewed main release -> CI run/image digest/serving revision/traffic -> changed/preserved smoke/persistence. Explain legitimate merge-SHA differences. The accepted baseline is CP-FIX-001 `bee0d122`. Retain the protected original tag and actual RED version as separate records.

Every evidence item includes ID, actual operator/tool/model, Bangkok/UTC time, relevant AC/TEST, starting conditions, command/steps, expected/actual, full tested commit or deployed revision and pass/fail/skip counts. Label manual results. Retain failed runs and later fixes separately. Compiler/setup/fixture errors do not qualify as the meaningful old-behavior RED.

Include complete relevant changed SRS/SDS/STS sections and test excerpts in this PDF; do not paste the entire unchanged SRS/application. Embed readable Issue/PR review text and actual outcomes, not just links. Reused product screenshots/logs are acceptable only when relevant and independently present here. Another submission is never a substitute for Lab7 assessed content.

## Five metric definitions

1. Completed ClassPulse Issues within a stated window: list IDs/dates and separate duplicates/cancellations from delivered work.
2. Merged ClassPulse PRs: IDs/dates/target branches for the same declared scope/window.
3. One named automated suite on one identified candidate SHA/run: command and passed/failed/skipped, not an old unrelated green result.
4. ClassPulse UAT defect status: IDs/severity/status; define resolved using actual correction and required retest, separate unknown/not-run findings.
5. Named CI workflows/branches/window: all successful/failed/cancelled outcomes and run IDs; paginate source queries.

Keep partner Workflow records outside ClassPulse metrics. Percentages state numerator/denominator. Zero is valid only with source support. Embed compact source lists so at least two values can be independently reconciled without leaving the PDF. Interpretation <=100 words identifies concrete risk/action and owner or milestone; no inflated counts or fabricated problems.

## PDF and upload

Cover: Bannasorn Thongkorn67070503420 and Papangkorn Jitvoottikrai67070503421, theme10/course-feedback context, repo URL, accepted Sprint1 baseline, pre-change SHA, submitted main tag/SHA, app URL/deployed version. Navigation maps A-D to actual page ranges/evidence IDs. Appendices are inside this same Lab7 PDF. Contributions distinguish real A/B roles from planned assignments and AI assistance.

Render and inspect every final page, legibility, tables, screenshots, logs and page references. Verify actual evidence and final PDF hash; B reviews that artifact. Human uploads only this Lab7 PDF to the Lab7 assignment on LEB2 and opens the uploaded file/receipt. Deliverable2 uses a separate PDF, navigation and upload governed by its own plan. Keep repository/deployment available through grading and credentials in private course handoff only.

## Version history

v1.0,25Nov2026,A: extract Lab7-specific rubric, metrics and submission requirements into its own planning Issue/branch/PR after the user requested visible separation from D2. All unexecuted evidence remains pending.

v1.1, 27 Nov 2026, A: mark verified baseline and staging evidence, link the report draft, and retain the pending release and final-review checks.
