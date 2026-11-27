# Lab 7 report evidence

The report uses the 25 November historical test and metrics snapshot plus a separate 27 November readback for the accepted Lab 6 Sprint 1 baseline and the merged PR #92. The latter includes the baseline disposition, old lifecycle source comparison, exact B review and inline finding, CI checkout/run/counts, and the staging merge. The CI checkout and staging merge have the same parents and tree. B's metric definitions are credited, and the dated B-owned source files are preserved.

Run the document tools from the report worktree with Python, ReportLab, Pillow, pypdf and pdfplumber:

```powershell
python -B tools/lab7-report/build_source.py
python -B tools/lab7-report/check_source.py
python -B tools/lab7-report/render_draft.py
python -B tools/lab7-report/check_pdf_draft.py
```

The default source build runs offline, verifies 37 stored input hashes, and produces 71 source checks. The historical `--capture` option re-reads its original 25 November cutoff and preserves both the historical review snapshot and the 27 November readback. The evidence manifest records file hashes and provenance. Two historical inputs disclose normalization of trailing whitespace with original byte hashes retained. Screenshot bytes are preserved.

The 30-page v0.3 working PDF contains A3-13, B14-25, C26-28 and D29-30. All pages were visually inspected and checked for bounds, content and draft labeling. Four Part navigation destinations and all three original image pixel hashes passed. Two renders gave SHA-256 `a5e5a47555ea697811dda7e5b1e160a1c40dab25e47fee180d7afdc7216ee13f`. See `pdf-draft-qa.json` for page checks.

Lab 7 remains **NOT READY**. The reviewed main release, GCP migration and serving-revision readback, changed and preserved behavior on that deployment, B's final metrics and PDF review, and the LEB2 receipt are pending.
