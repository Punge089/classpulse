# ClassPulse — Lab 6 report source

**DRAFT / NOT FOR SUBMISSION.** Prepared 20 November 2026 for Issue #72. This is an assembly framework with reviewed preparation references and pending execution fields. It is not a completed UAT report, final PDF, acceptance or submission. Complete all assessed material from actual records before rendering and peer review. Current [professor clarification](instructor-clarification.md), [independent coverage audit](coverage-review.md) and [standard exercise protocol](exercise-protocol.md) govern these additions.

Current checkpoint: 24 November 2026, Issue #74 review correction. Earlier pending fields described the 20 November preparation snapshot. The known progress below supersedes those fields without converting reported partner observations into final acceptance. A reports a deadline extension; official confirmation and the exact revised deadline remain PENDING. The elapsed 20–22 November plan is historical in [plan.md](plan.md), with current dependency-based next steps and no invented appointments.

## Cover and navigation

| Required field | Actual value / pending action |
|---|---|
| A full name / student ID | Prior finalized team record: Bannasorn Thongkorn / 67070503420; GitHub Punge089; verify final cover details before submission |
| B full name / student ID | Prior finalized record and B's report: Papangkorn Jitvoottikrai / 67070503421; GitHub book6349; B requests direct confirmation before inventory freeze |
| Section / group | Confirm course values; prior Lab 5 used section31 / EN-034_P0 |
| Project | ClassPulse: identified course-feedback surveys |
| Repository | https://github.com/Punge089/classpulse |
| Sprint 1 baseline | v1.0.0-sprint1 / d4bad74211729032697164f378638efb834a67b6 |
| ClassPulse deployed source / digest / serving revision / traffic / URL / observation time | CP-V01: source 1fe3e3b82dfb0537be30223c9b598b3479b4affe; digest sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795; classpulse-00006-6w6 / 100%; https://classpulse-zdwglar6eq-as.a.run.app/ ; last saved A Console readback 24 Nov 02:16:41 Bangkok; reverify after deployment/traffic changes |
| Independent partner product / repo / scope / URL / version | Workflow and Approval System / https://github.com/osizk/WorkflowAndApprovalSystem / Sprint 1 contract v0.6 / https://scd928edd-4d7hbszvwq-as.a.run.app/login / proposed lab5 source 82a4806b5291b57ad7e76a28fb7d40e1e947b9a6; full serving-version confirmation still pending |
| Independent C/D names, student IDs and team | C: Ashira Sansoda / 67070503445; D: Thira Rungruangkaset / 67070503419; EN-037_P5, supplied by the partner |
| Final ClassPulse decision / date / testers / exact release | PENDING; no independent decision received |
| Our final decision for the partner product | PENDING actual A/B execution |
| Submission deadline | Exact revised deadline PENDING official confirmation. Extension reported by A, not independently verified. Original 22 Nov 2026 23:59 Bangkok and 21:00 internal target are historical, not current deadlines. |

The final PDF needs actual page numbers, not these placeholders. There is no fixed page limit or required separate video in the supplied handout. Inspect filename requirements in LEB2 before upload.

| Part | Marks | Final PDF page range | Evidence IDs |
|---|---:|---|---|
| A — UAT preparation and handoff | 20 | PENDING layout | PENDING |
| B — Independent execution of partner app | 25 | PENDING layout | PENDING |
| C — Defect reporting and triage | 20 | PENDING layout | PENDING |
| D — Resolution and independent retest | 35 | PENDING layout | PENDING |
| Contributions, AI use, limitations, submission | Included | PENDING layout | PENDING |

## A — UAT preparation and handoff (20)

### Assessed Sprint 1 scope

Login/logout and current identity; owner creates/publishes/closes own identified surveys for own courses; enrolled respondent sees eligible published surveys, submits once, reads saved confirmation; owner sees aggregate counts/rating distribution/choice counts; backend role/ownership/enrollment/lifecycle/input rules. Sprint2/3 editing, new question types, anonymous mode, exports and other later-sprint features are outside this acceptance. A saved direct response read is in Sprint1; a full response-history-list feature is not claimed.

### Complete cases and contract material to embed

Use the reviewed [handoff](handoff.md), [coverage table](coverage.md) and [applicable contract/source crosswalk](contract-extracts.md) as canonical sources. Final PDF assembly must include the complete agreed case texts and relevant authoritative contract excerpts directly, with internal page references. Links alone are insufficient. Keep IDs stable. Embed the independent UAT Team’s R11 assessment of important requirement/AC coverage, proposed additional cases and actual dispositions. Then record the expanded agreed case/subcase inventory/version. Twelve supplied cases are a starting point; simply executing them does not satisfy the professor’s clarified expectation.

Include safe account LABELS/roles/enrollment, private-delivery acknowledgement without values, unique run/data setup, declared sequence/dependencies, retention/cleanup agreement, tested version and instructions another team can execute without verbal guidance. Preserve explicit partial AC coverage; no listed AC ID implies full execution.

### Agreement and live version

Populate the actual [coordination](coordination.md) and [version register](versions.md) from R01/R02 in [records](records-template.md). C/D identities and A's time-specific CP-V01 mapping are now supplied above; C/D reports all five ClassPulse synthetic accounts accessible. Their actual initial run occurred on 24 November around17:31–18:03 Bangkok. Exact future initial/retest slots, private findings-channel agreement, B availability and final inventory remain pending; A deferred scheduling discussion to25November. Older heartbeat reports are historical scheduler reports, not current availability or consent.

## B — Independent execution of partner app (25)

This section is the work A/B perform as independent UAT Team on the other team's product. Results of C/D testing ClassPulse belong in our incoming findings/retest chain, not as substitutes for PartB.

### Partner handoff, independent coverage audit and expanded inventory

Received Workflow's six original UAT-01–06 cases and pinned contract/SRS. A prepared a coverage audit and six PARTNER-ADD proposals; B reports static review and requests purpose/reason Unicode boundaries, careful trimmed-reason expectations and explicit restart versus new-instance scope. Preserve revisions and ask C/D for actual dispositions. Mutual inventory freeze and full serving-version mapping remain pending. UAT-01 precedes UAT-04 on the same request; A's main01/04/05 and B's02/03/06 cases remain NOT RUN.

### All agreed execution results

PENDING: every agreed case/subcase, actual tester name/date/time/timezone, exact version/inputs/actions, observed values/status/messages, PASS/FAIL/BLOCKED with reason and evidence IDs. Both A and B must participate; list actual driver/observer roles. Until run, status is NOT RUN. Do not copy expected text into actual observations.

| Partner case / requirement | Actual tester / time | Tested version / inputs | Actual observation | Result | Evidence / finding |
|---|---|---|---|---|---|
| Await actual agreed case inventory | PENDING | PENDING | NOT RUN | NOT RUN | PENDING |

Separate actual exploratory confirmation: on24November19:09:37Bangkok A's Codex independently ran the Workflow Product Team's WF-BUG-001 reproducer.102400-byte JSON returned422 and102401-byte JSON returned500 versus the engineering expectation413;2tests,1passed,1failed,0skipped. Visible marker82a4806b5291 matched the proposed source tag; full cloud version mapping remains pending. Attribute original discovery/test design to the Workflow team and confirmation to A. This single finding does not complete A/B's main Workflow UAT; embed the reviewed original report, actual output and exact provenance in the final PDF.

Record case and subcase counts separately, account for all agreed IDs, and keep original and retest totals separate. No numeric pass total is prefilled.

### Readable selected evidence

PENDING: normal journey and negative/access evidence. Every rejected operation needs the rejection plus authorized unchanged-state/no-disclosure check. Embed readable screenshots/observations with action/expected/actual/time/version/tester captions. Clarifications/help from the Product Team must be recorded. Use R03/R08; no credential fields, session headers or cookies.

## C — Defect reporting and triage (20)

### Outgoing reports about partner product

WF-BUG-001 is received and independently confirmed as above; proposed Minor severity still needs the Workflow team's actual triage. Expected413 comes from the parser's documented client-error classification; the pinned Workflow contract does not explicitly name a payload-size limit/413 code. Keep that distinction, qualification of version mapping, original Product Team discovery, and actual1pass/1fail output. No fix/GREEN/retest is claimed. For each real failure embed IssueID, owner/team, reporter, tested version/case/AC, synthetic preconditions/data, numbered repro, expected/actual, severity explained by user impact, evidence and actual notification/acknowledgement. Distinguish defects from enhancements; do not invent a count.

### Incoming findings about ClassPulse

Received C/D progress package Lab6_Progress_For_ClassPulse_20261124.zip (SHA256 b35afab341b8a13b19a80e56156d3b272567e801f9c60cd61756b6a6b61daa46):95 accumulated execution/tool records and seven inspected screenshots. The continuation reports passing behaviors across all twelve original ClassPulse cases, with API fixture setup for08/10/11 disclosed and accepted by A after execution for setup only. Available additional observations establish no genuine ClassPulse defect yet; CD-01 inactive/controlled-session, CD-07 third respondent and CD-08 missing-ID residual coverage remain pending actual completion/disposition. Do not infer comprehensive no-defect UAT or acceptance. Preserve the original reports/logs, all deviations and operator/input corrections for readable final embedding; a95-record log is not95 test cases.

| Finding / reporter / tested version | Contract / evidence | Classification and reason | Severity / user impact | Owner / fix status / disposition | Duplicate link / minor-limit consent |
|---|---|---|---|---|---|
| C/D R1 progress, CP-V01 | Original12 and available added observations; retained reports/logs/screenshots | No accepted ClassPulse defect established in completed observations; residual branches open | No severity assigned without a real finding | Fixture/inventory/actual contribution review pending; no correction claimed | No independent minor-limit consent or final decision yet |

Use R04/R05 for every finding: accepted defect, duplicate linked to original, not-defect or enhancement, with contract/evidence-based reason. Never relabel a failing requirement as enhancement. Critical/major findings block acceptance until corrected and independently retested; minor findings must be fixed or explicitly accepted by the independent team as documented limitations.

## D — Resolution and independent retest (35)

### Natural correction or standardized educational exercise

PENDING: if legitimate defects are accepted, record each natural correction chain. If coverage audit and thorough independent testing still find no genuine defect, use the supplied professor-standardized procedure: Developer Team creates a NEW Sprint staging commit reintroducing one previously corrected defect; if none is suitable, disable one existing required-field validation. UAT Team independently tests/reports that version without advance disclosure of the exact defect. Then reproduce RED, fix GREEN, run regression, obtain teammate review/pass CI, deploy the corrected release and obtain independent retest.

The standardized announcement supersedes a blanket wait for an individually assigned TA exercise. Embed its supplied-source provenance and the complete CP-EX sequence, preserving healthy baseline and all history. Do not bypass existing tests/CI/protection to deploy faulty main. Stage exercise exposure separately per [protocol](exercise-protocol.md); ask TA/human operator only about a real unresolved policy/environment conflict. Record disclosure timing and any advance defect knowledge honestly. Original healthy UAT/acceptance and educational exercise remain distinct; no completed exercise is claimed.

### Meaningful automated RED / GREEN / regression

For every accepted defect corrected in this lab, embed the regression file/test/assertion excerpt, exact command/setup, defective and test commits, real failing output/counts before implementation, relevant fix diff/commit, the same assertions passing, and appropriate existing regression output/counts. Syntax errors/broken fixtures/always-green tests do not establish reproduction. Preserve all failures/skips and never disable/focus/weaken tests. This report currently contains no such completed chain.

### Review, integration and corrected deployment

PENDING defect chain: link owning Issue -> feature branch from staging -> substantive teammate review of exact head -> passing current-head CI/integration -> reviewed release to main -> actual deployment/source/digest/revision/traffic -> post-deploy smoke. Include readable review text/results and output snippets within the PDF, not only icons/URLs. Do not self-approve/self-merge. Explain legitimate fix-versus-merge SHA differences. Notify independent testers before deployment affects their run.

### Independent retest and both decisions

PENDING: C/D independently rerun each corrected ClassPulse release-blocker and affected cases using the original repro/fresh data; A/B independently retest the partner's corrections. Record actual identity/time/version/observations/evidence per R06.

Embed actual R07 records for ClassPulse's received decision and our decision on the partner product: Accepted; Accepted with explicitly documented minor limitations; or Not Accepted. Each needs exact release/scope, actual testers/date, all agreed case counts and reasons/conditions. Required BLOCKED/not-run cases or unresolved critical/major findings prevent Accepted. Only independent testers may provide their own confirmation. No sign-off is currently received.

## Version lineage

| Stage | Actual value | Supporting record |
|---|---|---|
| Protected Sprint1 baseline | d4bad74211729032697164f378638efb834a67b6 | v1.0.0-sprint1 |
| Initial independent UAT source/revision/digest | PENDING | R02 |
| Defective source / actual failure | PENDING if applicable | R03/R04 |
| RED test commit / command / counts | PENDING if applicable | R06 |
| Fix / GREEN / regression | PENDING if applicable | R06 |
| Reviewed feature and main release merge | PENDING correction | R06 |
| Corrected deployed image/revision + smoke | PENDING correction | R02/R06 |
| Independently accepted final release | PENDING decision | R07 |

Use a separate CP-EX lineage for a standardized exercise. Document preparation stagingb14cf38 is not an independently tested/deployed/accepted version. Historical Lab5 image/revision/smoke does not verify current serving traffic or Lab6 UAT.

## Actual preparation evidence and contributions

The preparation PRs are actual repository process evidence only. B approved A PR69 at692a71f and merged3d652d8 after CI44574038895; A approved B PR71 at648aaf5 and mergedb14cf38 after CI44576544456. See [evidence index](evidence-index.md) and [actual contribution records](contributions.md). Embed relevant readable review excerpts in the final report where useful, but do not present these documentation PRs as a completed defect-correction chain.

On24November A reviewed B PR76 exactfa3f1810fda69c5ab63a7f390998e05c19fb2767 with32 offline document/helper checks (0failed,0skipped), verified CI45396597109 and approved/mergedb98369cc94526bba8745faa0e8720ab512ca9949 into staging. The first local checker reported29passed/2failed from CRLF/apostrophe assumptions; those checker issues were corrected, original output retained, and the full twelve-case section comparison added. This is documentation review evidence, not app UAT or a fix's RED/GREEN chain. B's date-correction re-review of A PR75 remains pending at its next head.

A's model-assisted source preparation and offline checks are disclosed in [docs/ai-use.md](../../ai-use.md). B reports static review/AI assistance and actual review of A PR75 at ec74e5a, then B PR76. C/D's declaration attributes the technical ClassPulse observations to Codex under Thira's instructions; it does not establish Ashira's actual contribution. Record actual review/remaining testing from both team members without inventing personal clicks or agent ownership. Final PDF review and human submission remain pending. Equal commit counts and full prompt transcripts are not required.

## Limitations and unresolved dependencies

- Partner identities/product and received C/D observations are recorded; exact future two-way sessions and final case/fixture agreement remain pending.
- B personal availability/direct identity confirmation remains unconfirmed; historical scheduler reports are not session appointments. Scheduling discussion was deferred to25November, not booked as a test slot.
- A's CP-V01 mapping is time-specific and C/D reports five-account access. Workflow full serving mapping, third CPE334 respondent, inactive account and controlled session support remain pending; no new credentials/provisioning are claimed.
- Main A/B Workflow UAT, final C/D contribution/acceptance, ClassPulse correction/exercise, independent retest and final PDF/submission are incomplete. A's WF-BUG-001 confirmation and C/D's progress must not be hidden or misrepresented as a completed full cycle.
- The extension is user-reported and not officially verified here; the exact revised deadline remains PENDING. Do not use29November partner availability as the deadline.
- Original B AI-assisted commit7fbac15 omitted its trailer; B disclosed the omission and original model is unverified. Merge3d652d8 has no assisting-model trailer in metadata; A asked B to clarify actual operator/AI assistance, which remains unverified at this report checkpoint. Preserve history rather than guessing attribution.
- Filename rules, final exact-file peer review, LEB2 upload and receipt remain pending.

## Final assembly and submission gate

Before submission: replace all execution-dependent placeholders from real records; embed complete agreed cases/AC excerpts, actual findings/dispositions, test excerpts/output/diff, review/CI/release/deployment evidence and independent acceptance. Keep one readable self-contained PDF with real TOC/page/evidence references, contributions/AI-use/limits, no secrets, and no unsupported approval or on-time-submission claim. Unresolved dependencies must be clearly disclosed rather than hidden.

A assembles; B reviews actual PDF bytes/hash and readable figures. Changed evidence needs actual re-review. A/B inspect the final file and human uploads it to the real LEB2 assignment before the deadline, opens the uploaded file and retains receipt privately. Record filename/hash/pagecount/reviewer/upload timestamp/confirmation. Until then this remains DRAFT / NOT FOR SUBMISSION.

## Source history

| Version | Date | Author / assistance | Status |
|---|---|---|---|
| 0.1 | 20 Nov2026 | Punge089 assisted by Codex GPT-6.1 Sol | Report scaffold only; B review and all independent results pending |

| 0.2 | 20 Nov 2026 | Punge089 assisted by Codex GPT-6.1 Sol | Add independent coverage audit/expanded cases and professor-standardized no-defect staging exercise; all results still pending |

| 0.3 | 24 Nov 2026 | Punge089 assisted by Codex GPT-6 | Address B's date review: original deadline/targets historical, extension user-reported and revised deadline pending; record known partner/CP-V01/progress/WF confirmation without claiming full UAT or acceptance |
