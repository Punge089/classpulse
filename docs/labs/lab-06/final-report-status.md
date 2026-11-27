# Lab 6 report and current decision register â€” 27 November 2026

Issue #132, Student A/Punge089. This report/evidence update changes no application, schema, workflow, assessed tag, main branch or deployment.

## Current decisions

| Product | Recorded decision and evidence |
|---|---|
| ClassPulse Sprint 1 identified surveys | D records **Accepted** on CP-FIX-001 `bee0d122bf23410e3d2db69649ad5e44959b6cd8`, supplied live revision `classpulse-00007-6t9`, 27 Nov 01:35:39 Bangkok. C separately confirms the isolated TEST-04 evidence and acknowledges D's decision at 02:01:21. The local auth run has revision N/A. Historical live M01 remains BLOCKED; no live replay PASS or TA approval is invented. |
| Workflow original Sprint 1 | A records **Accepted with explicitly documented minor limitations** on `41a8fefa7a5d93b6531dff88daae39574d72dcb7`, 27 Nov 02:28:53 Bangkok. Prior A/B deployed checks used `scd928edd-00009-fsg` from C/D's mapping. Later agreed independent local setups use revision N/A: unchanged suite 19/19, SQL rollback and seven observations across six groups passed. C/D acknowledges the outcomes. |
| B owner confirmation and ca77 review | New issued record confirms **Papangkorn Jitvoottikrai /67070503421 /book6349** and concurrence with A's limited Workflow acceptance on 27 Nov. Exact human-message time is unknown; receipt observed **by 16:18:31 ICT**, not an invented exact instant. B reviewed ca77 / PDF f4739f (76 pages), ran the document verifier25/25 without app rerun, and requests insertion followed by fresh new-head/CI review. Earlier human-pending review files remain historical. No GitHub approval/merge or future-file approval is claimed. |

CP-EX-F01 is fixed and independently verified on the corrected ClassPulse deployment: five Cloud subcases passed and the original local exercise drafts were separately retained. WF-BUG-001 is also fixed/independently verified. Their correction/retest chains and exact versions are embedded in the report; Lab 7/Sprint 2 remain separate.

## Review copy and reproduction

The [review PDF](report/ClassPulse_Lab6_REVIEW_20261127.pdf) and [exact receipt](report/report-receipt.json) are not a submitted or approved final-file version; the human B product-decision concurrence is now recorded separately. Historical status text is explicitly dated and preserved. The earlier measured-observation table starts on a fresh page to clear the footer. The later C/D acknowledgment and B's original review files are embedded.

On Windows with Tahoma/Consolas fonts, Python packages `reportlab`, `pypdf`, `Pillow` and `PyMuPDF`:

```powershell
python -B tools/lab6/build_report.py
python -B tools/lab6/verify_report.py
```

The build uses deterministic PDF metadata; runtime observation times remain the original evidence times. The verifier checks the actual PDF, source/receipt hashes and decision provenance. Rendered visual QA is recorded under `evidence/lab-06/finalization-20261127/`. Building a document does not rerun the app.

The existing complete Sprint 1 case definitions, STS, selected readbacks/screenshots, RED/GREEN, actual PR reviews, CI, deployed correction and independent retest are in this single PDF. The curated inputs and frozen baseline snapshots are byte-preserved with scoped Git attributes so original newline formats/hash values survive Windows and Linux checkout; private credentials, DB cluster files and private input loaders are excluded.

## Remaining closeout

- Human B identity/decision concurrence is received and embedded with bounded time provenance. B reviews the new acknowledgment-bearing PDF/current PR head and green CI; the old ca77 review is not reused as approval of a changed file.
- B reviews this PR's actual current head and required CI before approval/merge. A cannot approve or merge this A-authored PR.
- Human A/B verify cover details and actual extended deadline/course filename, then submit the final PDF to LEB2 and retain receipt. No deadline or submission is invented.

No selected new runtime test is pending by default. Further testing follows an actual review finding or new observed defect, not the act of assembling this report. Residual live eight-hour observation, production storage/full logs, internal concurrency schedule and optional exploratory checks retain their documented limits. 06c-N was not selected because actual local 06c-R was the agreed alternative.
