# Actual initial RED and disclosed evidence-order deviation

Test commit6839effe99e25cfa422c02d0ec4878fc8533db6d ran clean: `npm test -- tests/api/uat6TitleRegression.test.ts` =>2failed/2passed/0skipped. Both failures were actual201 instead of400. Exact raw log/result retained. The fresh owned local classpulse_test cluster stopped normally.

The runner saved this RED output before the first implementation change. However, a Python evidence-copy step then read result.json with Windows default encoding instead of UTF-8 and failed. Dependent tool calls incorrectly continued, so the intended RED-evidence commit did NOT exist before first fix73b640d. This is a process deviation, not compliant committed-before-fix RED. Do not claim these files were committed earlier, amend/reorder commits or rewrite history.

Preserve the first fix and actual run as history. An explicitly labeled append-only repeat will restore the same reported defective rule on this isolated feature branch, run/commit a fresh actual RED while the rule remains faulty, then apply the final guard restoration and GREEN. This does not change D finding, staging/main/cloud, or test assertions. A operator Codex GPT-6 under Punge089. This repeat is correction of evidence ordering, not a new independent defect discovery.
