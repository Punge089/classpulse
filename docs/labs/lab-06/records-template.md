# Working records — copy a blank record for each real event

These are templates, not evidence. See [coordination](coordination.md), [versions](versions.md) and [evidence index](evidence-index.md). B-owned handoff and contract excerpts are pending publication/review. Blank fields and `PENDING` must be replaced only from real observations. Do not choose an acceptance decision in advance. Keep ClassPulse and the partner product in separate ledgers; prefix IDs `CP-` and `PARTNER-`. All timestamps include timezone, preferably `2026-11-20T10:15:00+07:00`.

## R01 — Participants and agreement

| Field | Actual value |
|---|---|
| ClassPulse A full name / student ID / GitHub | PENDING / PENDING / Punge089 |
| ClassPulse B full name / student ID / GitHub | Papangkorn Jitvoottikrai (confirm spelling) / PENDING / book6349 |
| Partner C full name / student ID / GitHub | PENDING |
| Partner D full name / student ID / GitHub | PENDING |
| ClassPulse section / group | Confirm actual values; prior Lab 5 used section 31 / EN-034_P0 |
| Partner group / product / repo / URL | PENDING |
| Shared contact and defect-report channel | PENDING — no credentials here |
| Private credential-delivery channel and acknowledgement time | PENDING — channel/receipt only |
| ClassPulse initial UAT / correction window / retest | PENDING — actual agreed times |
| Partner app initial UAT / correction window / retest | PENDING |
| Agreed ClassPulse case/subcase IDs and handoff version/hash | PENDING |
| Agreed partner case IDs and their handoff version/hash | PENDING |
| Data retention/reset agreement for each product | PENDING |
| Agreement confirmed by each participant / timestamp / evidence | PENDING |

## R02 — Version and deployment register

Never equate branch HEAD with the image currently serving requests. Add a new row for every actual initial/retest deployment. Do not overwrite initial evidence.

| Version ID | Product | Purpose | Baseline tag + SHA | Contract SHA | Tested source SHA | Image digest | Serving revision(s) + traffic | URL | Observed time/operator | Release/CI evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| CP-V01 | ClassPulse | Initial UAT | v1.0.0-sprint1 / d4bad74211729032697164f378638efb834a67b6 | PENDING | PENDING | PENDING | PENDING | https://classpulse-zdwglar6eq-as.a.run.app/ | PENDING | PENDING |

For each correction, add: original defective source → regression-test commit → fix commit → feature merge → release merge/main → deployed image/revision → independent retest run. Explain merge SHA differences. For a standardized exercise, use `CP-EX-V01` etc. and explicitly identify the isolated environment.

## R03 — Actual execution record

Copy once per case, and once per subcase where results differ. Never use a copied expected paragraph as the actual observation.

```text
Execution ID: [CP-RUN01-UAT-01 or PARTNER-RUN01-caseID]
Product / Product Team:
Independent UAT Team:
Tester full name / student ID:
Other participant and actual role (observer/evidence reviewer/etc.):
Date/time start and end / timezone:
Version ID + exact source SHA / revision / URL:
Handoff version / case ID / subcase / requirement or AC:
Browser and version:
Account LABEL / role (no password/cookie):
Fresh run ID / actual input values / survey-question-option-response IDs:
Preconditions verified:
Actions actually performed:
Expected result (from agreed case):
Actual observation (specific values/status/text):
Protected state before/after for negative cases:
Result: [leave blank until run; PASS / FAIL / BLOCKED]
If BLOCKED, reason and dependency:
Evidence IDs / filenames:
Finding Issue ID(s), if any:
Clarifications or help received from Product Team:
Reviewer name / date / actual observation about evidence:
```

Execution overview (planning state is NOT RUN, not PASS):

| Product / run / version | Case-subcase | Assigned tester | Actual result | Evidence | Finding/blocker |
|---|---|---|---|---|---|
| CP-RUN01 / version pending | UAT-07 | C (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-01 | C (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-03 | D (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-04 | C (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-06 | D (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-09 | D (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-12 | D (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-05 | C (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-10 | C (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-02 (independent data) | D (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-08 (independent data) | D (confirm) | NOT RUN | — | — |
| CP-RUN01 / version pending | UAT-11 (independent data) | D (confirm) | NOT RUN | — | — |
| PARTNER-RUN01 / version pending | Await partner's actual agreed case list | A/B (confirm split) | NOT RUN | — | Handoff pending |

Counting rule: keep the agreed case inventory fixed for each run. A case is PASS only when every required subcase passed. Any failed subcase makes it FAIL; if none failed but a required step cannot run, use BLOCKED. NOT RUN is a planning state and cannot support acceptance. Report subcase counts separately and account for every ID. Initial and retest totals are separate.

## R04 — Reproducible finding / issue report

```text
Finding ID / actual GitHub Issue URL:
Product / Product Team / responsible repository:
Reporter (independent tester name/team):
Reported date/time / agreed notification channel:
Tested version ID / source SHA / deployed revision:
Case/subcase / requirement/AC:
Short title describing user-visible behavior:
Preconditions / account labels / synthetic input IDs:
Reproduction steps:
1.
2.
3.
Expected:
Actual:
Severity proposed: critical / major / minor
User-impact reason (who is affected and whether core work/data/security is blocked):
Evidence IDs:
Frequency / reproducible attempts (actual only):
Product Team acknowledgement / time / response:
```

Severity guide for agreement, not a substitute for facts: critical = severe exposure/loss or unusable core service; major = important contracted journey/access rule broken without an acceptable workaround; minor = limited impact with core requirements still usable. Explain severity, do not select it to improve marks. Suggestions outside the Sprint 1 contract are enhancements, not invented defects.

## R05 — Triage of ALL received findings

| Finding | Received time / reporter | Contract + evidence | Classification | Reason | Severity + impact | Owner | Fix status / disposition | Duplicate/original link | UAT minor-limitation agreement |
|---|---|---|---|---|---|---|---|---|
| PENDING | | | | | | | | | |

Allowed classification: accepted defect, duplicate, not-defect, enhancement. Reproduce/clarify before rejection. Link duplicates to the original. An accepted defect remains recorded even when corrected. Product-owner opinion alone does not constitute independent acceptance of a minor limitation.

If actual received findings are none, replace the empty table with a dated statement identifying the completed run, case counts, testers and acceptance evidence; then follow the professor-standardized exercise after completing its independent coverage/thorough-testing entry gate; no generic exercise-assignment request is required. Until execution occurs, say “No results received yet”, not “No defects”.

## R06 — Correction and independent retest

```text
Finding / Issue:
Natural-defect correction OR professor-standardized educational exercise:
Professor clarification reference; any actual branch/environment clarification if needed:
Original defective version / failed execution:
Regression test file/name and assertion excerpt:
RED commit / exact command / actual pass-fail-skip counts / output evidence:
Fix commit / relevant diff evidence:
GREEN commit / same-test command/counts/output:
Broader regression command/counts/output + environment:
Author / actual assisting model / reviewer:
PR and exact reviewed head / substantive review excerpt / CI run result:
Feature merge / reviewed main release / release CI:
Deployed source SHA / digest / revision / traffic / URL:
Smoke command/counts/time/evidence:
Independent retester full name/team:
Retest date/time / version / original failed case and affected cases:
Actual observations + evidence IDs:
Retest result and remaining findings:
Issue closure/disposition and who recorded it:
```

Retest starts from the original failing steps and fresh agreed data, then runs affected cases. If the correction changes a shared component such as authentication, include affected roles and journeys. Owner-side regression green does not replace this record.

## R07 — Independent acceptance record (one per product)

```text
Product / Product Team:
Independent UAT Team and both full names/IDs:
Decision date/time / timezone:
Baseline tag/SHA:
Exact tested final source SHA / deployed revision / digest / URL:
Accepted-for-test Sprint 1 scope + handoff version:
Executed case/run IDs and counts (PASS / FAIL / BLOCKED / NOT RUN):
Retested correction IDs and evidence:
Remaining findings with severity/disposition:
Explicitly accepted minor limitations, impacts and conditions (or none):
Decision: [leave blank; choose only after real execution]
  Accepted
  Accepted with explicitly documented minor limitations
  Not Accepted
Evidence-based reasons:
Evidence IDs supporting decision:
Confirmation by independent tester(s), actual names/date/channel or signed record:
Product Team acknowledgement (not a substitute for independent confirmation):
```

Do not choose Accepted while any critical/major defect is unresolved or a required test is BLOCKED/not executed. For minor limitations, record explicit UAT Team consent. A signature image is not essential if a traceable written confirmation identifies the actual testers, version, date and decision. Never type a tester's name as their approval without their real confirmation.

## R08 — Evidence index

Naming convention: `CP-E001`, `PARTNER-E001`, `CP-EX-E001`. Preserve originals privately where needed; include sanitized readable excerpts in the PDF.

| Evidence ID | File | Product / role | Case or Issue | Action | Expected / actual | Time / tester | SHA / revision | PDF page(s) | Sanitization checked by |
|---|---|---|---|---|---|---|---|---|---|
| PENDING | | | | | | | | | |

Screenshot caption must explain what it proves. Negative cases need rejection plus no-change/no-disclosure evidence. Logs need command, tested commit, test names and pass/fail/skip counts. Capture no credential fields, request headers, cookies or environment dumps.

## R09 — Contributions, review and AI use

| Person | Actual role/work | Test/case/Issue/PR/evidence IDs | Peer review actually performed | AI assistance and limits |
|---|---|---|---|---|
| Punge089 / full name pending | Planning kit requested; other contributions pending | this kit v1.0 | Pending | Earlier local planning used Codex GPT-6; repository preparation uses Codex GPT-6.1 Sol; no independent UAT performed |
| book6349 / full name confirm | Supplied initial eight-case draft; subsequent work pending | supplied draft | Pending | B to state own actual AI use |
| Partner C | Pending | | | |
| Partner D | Pending | | | |

Record pair work with driver/navigator or tester/evidence reviewer, actual dates and outputs. Equal commit counts are not required. Neither template rows nor planned ownership prove participation.

## R10 — Open dependency / TA request / submission record

```text
Dependency ID:
What is blocked:
Owner and next action:
First observed / notified time:
Actual message/reference and recipient:
TA/partner response and date:
Completed independent work while waiting:
Current status and next check:
Resolution evidence OR precise PDF disclosure:
```

For submission record: final PDF filename/hash/pages; A/B actual review references; human uploader; LEB2 assignment; submission timestamp; private receipt reference; uploaded file content checked. Do not infer submission from the existence of a local PDF.

## R11 — Independent coverage assessment and additional cases

Use the complete [coverage-review form](coverage-review.md). Independent team maps important implemented Sprint 1 requirements/ACs to supplied cases, marks covered/partial/missing/unclear with reasons, proposes stable additional case IDs with executable steps/expected/protected-state evidence and records actual agreement. Both teams must do this for the other's app before freezing the initial inventory. Suggestions alone remain NOT RUN.

## R12 — Standard exercise provenance and blind discovery

Use the complete [exercise record](exercise-protocol.md). Document thorough no-defect entry evidence, new staging commit/expected existing test failures, independent-accessible instance, shared-information timing, actual independent discovery/finding, RED/GREEN/regression/review/CI/corrected deployment and independent retest. Keep the exact selected defect and diagnostic choice out of shared pre-discovery copies; disclose full educational provenance afterwards. Do not fabricate discovery or treat it as a natural bug.
