# Lab 6 evidence index

Status: evidence structure prepared; independent execution/defect/retest/acceptance evidence not yet received. No empty template represents a passed test. Record real evidence as it arrives and embed assessed excerpts in the final PDF.

## Inventory (initially empty)

| Evidence ID | File or immutable reference | Product / role | Case / Issue | Action | Expected / actual | Time / tester | Tested SHA / revision | PDF page | Secrets check |
|---|---|---|---|---|---|---|---|---|---|
| Pending actual evidence | — | — | — | — | — | — | — | — | — |

IDs: CP-E001 for ClassPulse, PARTNER-E001 for partner product, CP-EX-E001 for the isolated TA exercise. Retain original execution and separate retest evidence. Never populate actual observations by copying expected text. Record PASS/FAIL/BLOCKED only after execution; account for NOT RUN in summaries.

## Required evidence groups

- A: versioned complete handoff/cases/AC excerpts, safe account roles/setup/sequence/retention and actual tested release metadata.
- B: A/B independent testing of the other product, every agreed case, both actual participants, data/time/version/result and readable normal journey plus negative rejection/unchanged protected state.
- C: outgoing issue reports, every incoming finding, contract-based disposition/severity/owner/fix status, duplicates linked and explicit independent acceptance for minor limitations.
- D: our defect/exercise original reproduction; meaningful RED test/assertions/command/commit/output/counts; same-test GREEN and regression; diff; exact-head substantive review/CI; reviewed release/deployment/smoke; independent retest and recorded decision.
- Closure: actual contributions/pair roles and AI use/limits, version lineage, PDF exact-file review and human submission confirmation. Include TA notification/dependency if no exercise/tester has been supplied.

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
