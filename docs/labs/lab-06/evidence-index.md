# Lab 6 evidence index

Status: evidence structure prepared; independent execution/defect/retest/acceptance evidence not yet received. No empty template represents a passed test. Record real evidence as it arrives and embed assessed excerpts in the final PDF.

## Inventory (initially empty)

| Evidence ID | File or immutable reference | Product / role | Case / Issue | Action | Expected / actual | Time / tester | Tested SHA / revision | PDF page | Secrets check |
|---|---|---|---|---|---|---|---|---|---|
| Pending actual evidence | — | — | — | — | — | — | — | — | — |

IDs: CP-E001 for ClassPulse, PARTNER-E001 for partner product, CP-EX-E001 for the isolated standardized exercise. Retain original execution and separate retest evidence. Never populate actual observations by copying expected text. Record PASS/FAIL/BLOCKED only after execution; account for NOT RUN in summaries.

## Required evidence groups

- A: versioned complete handoff/cases/AC excerpts, safe account roles/setup/sequence/retention and actual tested release metadata.
- B: A/B independent testing of the other product, every agreed case, both actual participants, data/time/version/result and readable normal journey plus negative rejection/unchanged protected state.
- C: outgoing issue reports, every incoming finding, contract-based disposition/severity/owner/fix status, duplicates linked and explicit independent acceptance for minor limitations.
- D: our defect/exercise original reproduction; meaningful RED test/assertions/command/commit/output/counts; same-test GREEN and regression; diff; exact-head substantive review/CI; reviewed release/deployment/smoke; independent retest and recorded decision.
- Closure: actual contributions/pair roles and AI use/limits, version lineage, PDF exact-file review and human submission confirmation. Include actual TA notification/dependency for missing independent testers or a specific unresolved exercise environment/branch-policy blocker. The standardized exercise itself no longer awaits individual assignment.

A caption includes evidence ID, action, expected/actual, date/time, actor/tester and relevant SHA/revision. Automated output includes file/test names, exact command and pass/fail/skip counts. Label manual versus automated checks. External URLs corroborate; they do not replace readable assessed evidence inside the PDF. No passwords, session cookies, request headers, tokens, connection strings, real personal app data or env dumps.

See [blank records R03-R10](records-template.md), [plan and final-PDF checks](plan.md) and [versions](versions.md). File paths for future evidence must be explicitly included in an owning Issue's Files scope before adding them; Issue #68 does not grant unbounded evidence-directory ownership.

## Reviewed preparation evidence (not UAT results)

| ID | Actual reference | What it supports | Limits |
|---|---|---|---|
| PREP-01 | [A PR69 review discussion](https://github.com/Punge089/classpulse/pull/69) and merge3d652d8 | Actual B approval of692a71f and CI44574038895; coordination/record preparation | Final PDF must embed the actual readable review text/results, not merely this link; no UAT |
| PREP-02 | [A exact-head approval of B PR71](https://github.com/Punge089/classpulse/pull/71#pullrequestreview-5980039341); mergeb14cf38 | Corrected handoff/order/attribution history,23/23offline checks and CI44576544456 | Document/helper checks, not actual server/UAT execution |
| PREP-03 | [A initial change request](https://github.com/Punge089/classpulse/pull/71#pullrequestreview-5979419349) | Actual7fbac15 review:21passed/2failed/0skipped plus contradictory instructions | Retain original findings; final green result does not erase them |
| PREP-04 | [A closeout](https://github.com/Punge089/classpulse/issues/68#issuecomment-7016788339) / [B closeout](https://github.com/Punge089/classpulse/issues/70#issuecomment-7017003769) | Reviewed preparation integrated;6integration checks,20relative links | Independent partner/version/access/execution/acceptance still pending |

Preparation observations occurred during19NovUTC /20NovBangkok. Use exact GitHub timestamps/commit references and real actor declarations when embedding excerpts. These PREP IDs must not be counted among executed UAT cases or used as the defect-correction evidence demanded in PartD. The final [report source](report.md) and [contribution register](contributions.md) preserve those limits.

## Additional evidence required by professor clarification

Include independent R11 coverage assessment of supplied cases, gap/additional-case suggestions and actual expanded inventory/dispositions; thorough initial results before a no-defect conclusion; then (if applicable) CP-EX new staging commit/exposure version, actual blind-discovery finding, disclosure timing, RED/GREEN/regression/review/CI/corrected deployment/independent retest. Keep exact developer selection notes out of the pre-discovery partner package and publish the complete exercise trace after discovery. Reference [clarification](instructor-clarification.md), [coverage review](coverage-review.md), [exercise protocol](exercise-protocol.md). That sentence described the20November protocol preparation. Current24November observed/received evidence is indexed below; a completed ClassPulse correction/exercise/retest chain still does not exist.

## 24 November current evidence ledger

| ID | Retained artifact | What it supports / limits |
|---|---|---|
| CP-R1 | [Received continuation](../../../evidence/lab-06/checkpoint-20261124/received-cd-r1/CONTINUATION-REPORT.md) and seven screenshots | Original12 observed behaviors; disclosed API setup08/10/11. Earlier REPORT is superseded by continuation/A2. Not final acceptance. |
| CP-A2 | [Technical response](../../../evidence/lab-06/checkpoint-20261124/received-cd-a2/EN037-TECHNICAL-RESPONSE-A2.md) | Scope/dispositions, CD06 agreement and remaining fixture/participant gates. Not a final decision. |
| CP-CD08 | [Original result](../../../evidence/lab-06/checkpoint-20261124/received-cd-a2/ClassPulse/CD08-missing-ID-result.json) | Authenticated RESPONDENT200, guarded404 and original404 at20:45:30 Bangkok. External lookup evidence, not DB inspection. |
| WF-V01 | [C/D mapping](../../../evidence/lab-06/checkpoint-20261124/received-cd-a2/Workflow/current-serving-version.json) | Original82a4806 source/digest/revision/traffic. Not corrected84a62c7 or A's own cloud readback. |
| WF-A-R1 | [A narrative](../../../evidence/lab-06/checkpoint-20261124/a-workflow/RESULTS.md), [observations](../../../evidence/lab-06/checkpoint-20261124/a-workflow/observations.json) | Actual01/04/05 paths,15 observations,26 evidence files,2 retained IDs. Later A3 accepts the setup variation; no B work inferred. |
| WF-A-NEG | [Blank reason denial](../../../evidence/lab-06/checkpoint-20261124/a-workflow/evidence/13-uat05-empty-reason-denial.jpg), [requester readback](../../../evidence/lab-06/checkpoint-20261124/a-workflow/evidence/17-uat05-requester-readback.jpg) | Actual UI denial, unchanged-state reload, valid rejection/readback. No inferred HTTP status. |
| WF-A-BUG | [Independent confirmation](../../../evidence/lab-06/checkpoint-20261124/a-wf-bug-confirmation/INDEPENDENT-CONFIRMATION.md) | A confirms Workflow's original discovery:2 tests,1 passed,1 failed,0 skipped. Not ClassPulse PartD. |
| WF-FIX | [Correction status](../../../evidence/lab-06/checkpoint-20261124/received-cd-a2/Workflow/CORRECTION-STATUS.md), [CI summary](../../../evidence/lab-06/checkpoint-20261124/repository/workflow-pr63-ci.json) | Attributed RED/GREEN and inspected remote CI success. Not A rerunning tests, approving their PR or independently retesting a deployment. |
| PREP-05 | [PR75 reviews](../../../evidence/lab-06/checkpoint-20261124/repository/pr75-reviews.json) | B's request changes then05134a3 approval/merge3425a5e. Documentation only. |
| PREP-06 | [PR78 A review](../../../evidence/lab-06/checkpoint-20261124/repository/pr78-A-review.txt), [16 check results](../../../evidence/lab-06/checkpoint-20261124/repository/pr78-static-checks.json), [merge](../../../evidence/lab-06/checkpoint-20261124/repository/pr78-merge.json) | Approved49289a5, successful current CI, later B Ready and mergecdcf460. Review's earlier Draft wording is history. No DB preflight or fixture creation. |

The [evidence README](../../../evidence/lab-06/checkpoint-20261124/README.md), copied-source manifest and SHA256SUMS preserve provenance/integrity. Final PDF must embed readable figures and assessed text with actual captions; links/checksums alone are insufficient. Remaining PartD, acceptance and submission work stays pending in the [readiness checklist](part-d-readiness.md).

New evidence: [C/D A3 disposition](../../../evidence/lab-06/checkpoint-20261124/received-cd-a3/EN037-A3-SETUP-DISPOSITION.md) and [later A case adjudication](../../../evidence/lab-06/checkpoint-20261124/a-workflow/a3-later-disposition.json) resolve the prior browser gate for three recorded paths. Original run files remain unchanged. [Current PR63 snapshot](../../../evidence/lab-06/checkpoint-20261124/repository/workflow-pr63-after-a3.json) records Ready/unmerged, superseding the earlier Draft snapshot without implying deployment.
