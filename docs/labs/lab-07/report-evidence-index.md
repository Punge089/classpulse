# Lab 7 report evidence index - v1.0 PDF review candidate

Issue #101. Pages below refer to the v1.0 PDF. Submission review is tracked in #104.

| Assignment requirement | Status | Evidence and source | Draft PDF pages | Owner / next action |
|---|---|---|---|---|
| pp. 1-2, Part A: precise old/new rule and accepted/actual pre-change versions | Verified | L7-A01; scope and acceptance recorded by D, C acknowledgment, CP-FIX-001, and identical old router/lifecycle blobs on CP-FIX-001, 8017c91 and 3f8918c | 2-4 | A recorded versions and chronology |
| p. 2, Part A: trace impact and review the versioned contract before code | Verified | L7-A02..A04; 8017c91 contract, 12 ACs, 15 STS cases, B C3 and dated commit order | 4-13 | B reviewed before tests; A preserved review |
| p. 3, Part B: meaningful old-code RED, same-test GREEN and actual diff | Verified | L7-B01..B02; 3f8918c and run 45597034491, unchanged primary assertions, retained backend/GUI GREEN and implementation | 14-17 | A pinned and reproduced the evidence |
| p. 3, Part B: regression, preservation and authorization | Verified in disposable CI | L7-B03..B07; historical logs, TEST-111 data check, owner/response tests and three browser figures | 17-23 | A retains expected RED and every recorded failure/skip |
| p. 3, Part B: peer review, CI and staging | Verified | L7-B08; B review 6061752216 on 698b1e9, CI 45645429150, actual merge e6043a9 | 24-25 | B approved and merged; A compared tested and merged trees |
| pp. 3 and 6, Part B: main, GCP and deployed changed/preserved checks | Verified: main, Cloud Run, migration, sampled legacy retention and live reopen | L7-B09..B12; #143, 8316f27 and deploy run 46050688714 | 2, 24-25 | B reviews the live evidence |
| p. 4, Part C: five dated metrics, sources and action | Final metrics source verified | L7-C01..C03; #148, 26 historical issue/PR rows, release suite and two deploy jobs, independent UAT pending | 26-28 | B authored metrics; A verified source evidence |
| p. 5, Part D: readiness, defects/debt, three answers and contributions | Readiness assessment and retrospective included | L7-D01..D03 and D4; defect/debt, observed failures/skips, and independent UAT boundary | 29-30 | B checks PDF against reviewed source |
| pp. 6-7: self-contained PDF, reviewed version and handoff | Candidate verified; B exact-hash review pending | Version map, internal navigation, checked draft hash and evidence above | 1-2, 30 | A renders; B reviews exact hash; human hands off private test accounts and uploads to LEB2 |

Pinned input paths and hashes are in `evidence/lab-07/report/source-manifest.json`. The report is scoped to Lab 7. Release and deployment results are embedded; independent Lab 7 UAT remains unrecorded.
