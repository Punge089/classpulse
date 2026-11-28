# Lab 7 report evidence

The report uses the 25 November historical test and metrics snapshot plus a separate 27 November readback for the accepted Lab 6 Sprint 1 baseline and the merged PR #92. The latter includes the baseline disposition, old lifecycle source comparison, exact B review and inline finding, CI checkout/run/counts, and the staging merge. The CI checkout and staging merge have the same parents and tree. B's metric definitions are credited, and the dated B-owned source files are preserved.

Run the document tools from the report worktree with Python, ReportLab, Pillow, pypdf and pdfplumber:

```powershell
python -B tools/lab7-report/build_source.py
python -B tools/lab7-report/check_source.py
python -B tools/lab7-report/render_draft.py
python -B tools/lab7-report/check_pdf_draft.py
```

The default source build runs offline, verifies 47 stored input hashes (listed in `source-manifest.json`) and passes 93 source checks with 0 failed and 0 skipped (`source-checks.json`). The historical `--capture` option re-reads its original 25 November cutoff and preserves both the historical review snapshot and the 27 November readback. Two historical inputs disclose normalization of trailing whitespace with original byte hashes retained. Screenshot bytes are preserved. `inputs/nov28-release-pr143-reviews.json` holds B's two release PR #143 reviews verbatim, read from GitHub on 28 November.

The current version 1.1 PDF has 32 pages: A 3-13, B 14-26, C 27-29, D 30-32. Its SHA-256 and structural and visual QA are in `pdf-draft-qa.json`: all pages bounded and nonblank, four Part navigation targets, three original screenshot pixel hashes preserved, and every page rendered and inspected.

Lab 7 readiness for the maintained Sprint 1 scope is **NOT READY**. Two items remain open: no independent Lab 7 user test of the reopen change is recorded, and README setup has not been checked on a fresh clone. Report D1 names an owner and action for each. The main release, GCP migration, serving revision and deployed changed and preserved checks are recorded in report B6. B's exact-hash PDF review (PR #104) and the human LEB2 upload are separate submission steps.
