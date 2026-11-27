# CP‑EX‑001 independent local UAT — finding CP‑EX‑F01

**Run** `CP-EX-001-D-20261126`. **Operator** Codex (GPT‑6) under Thira (D). **Date/time** 26 November 2026, 14:55:12 Bangkok start, blank-title confirmation at 14:58:20, post-run integrity check at 14:59:00. Thira confirmed relaying the private start notice before the first independent browser check. The operator had no prior knowledge of the exact exercise defect and used app behavior and the earlier contract to determine the finding.

## Finding · UAT‑02 / CD‑02 · AC‑11 and AC‑19

**Confirmed FAIL. A survey owner can create a persistent draft with an empty title.**

1. Sign in as the synthetic owner of CPE334 and open **New survey**.
2. Keep the title input untouched and empty. Enter one valid required rating question, “Rate this class (CP-EX-001 blank title confirmation)”.
3. Select **Create survey**. Reload the resulting detail page and read the owner's survey list.

**Expected** HTTP 400 `VALIDATION_ERROR` with a title field error, an inline title message and no new survey.  
**Actual** HTTP **201** from the normal create action. The owner was redirected to `/owner/surveys/9`, which displayed Draft and the question. The creation response, detail readback HTTP 200 after reload, and owner list all contained title `""`. Exactly one new draft, ID **9**, was added in the confirmation run. Earlier observations had already left two blank-title drafts, IDs **3** and **6**.

**Impact** An owner can save a record prohibited by the contract and ends up with an unlabeled draft in the management list. This finding covers creation and persistence. Publication and respondent impact for the blank drafts were outside the confirmed scope. Preserve drafts 3, 6 and 9 as evidence.

- [Untouched blank input before submission](CP-EX-F01-before.png)
- [Created draft](CP-EX-F01-created-draft.png)
- [Sanitized response status and persisted readback](CP-EX-F01-finding.json)

## Release and isolation

Source `4199888409fefafa920a773991d735f14ffb4ac8`, ref `sprint-1-staging` verified before and after. Runtime ZIP SHA‑256 `9cafee1d2d7180933bd3a4dad1e1d0dadea093fb1b85fdc4b28e30427888f9fd`. All 35 manifest entries matched before setup and after the run. Microsoft Edge, Windows, Node 24.14.0, npm 11.9.0 and PostgreSQL 16.16. Frontend `http://127.0.0.1:5173`, backend `http://127.0.0.1:3000`, persistent isolated `classpulse_uat6_exercise` on loopback. The backend was started with a loopback-only launcher and the artifact bytes remained unchanged. Cloud Run revision and traffic allocation N/A. The two owned app listeners were stopped after testing and the exercise database was retained. CP‑V01 and its records were outside this run.

## Other completed observations

| Scope | Result |
|---|---|
| Normal published survey, one valid response, empty/populated aggregate, respondent reload and owner/non-enrolled list visibility | Observed expected outcomes. Core survey 2 and responses 1–2 preserved. |
| Optional rating and summary arithmetic | Overall ratings 4 and 5 gave 4.50. Optional Extra rating retained one answer of 1. Zero-count choice remained present and in order. |
| Duplicate response and Submitted badge | Duplicate returned 409, original answer and count were unchanged. The first badge check looked at an inner link container and missed the badge. Rechecked the whole survey card on survey 4/response 3 and observed **Submitted** plus `hasResponded: true`. |
| Other title/question/option/description boundaries and rating validation | Title length 120 created draft 5. Title 121, zero questions, prompt 301, one-option list, duplicate options and description 1001 were rejected. Ratings 0, 6, 2.5 and string “3”, and missing choice were rejected. Ratings 1 and 5 succeeded on survey 8 with mean 3.00. |
| Lifecycle and stale form | Draft close, repeated publish, repeated close and publish from Closed returned 409. A filled stale form on survey 7 returned 409 `SURVEY_NOT_OPEN`, displayed the closure message and retained count 0. |

[Browser results](browser-results.json) · [Verification results](verification-results.json) · [Lifecycle results](lifecycle-results.json) · [After-run proof](after-run-proof.json)

ClassPulse can triage the finding using the blank-title case. C’s separate review, corrected release, independent retest, Part D and final acceptance remain pending.
