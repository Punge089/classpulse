# CP-EX-F01 triage and correction evidence

D independent local run CP-EX-001-D-20261126, source `4199888409fefafa920a773991d735f14ffb4ac8`, ref sprint-1-staging, runtime ZIP9cafee1d2d7180933bd3a4dad1e1d0dadea093fb1b85fdc4b28e30427888f9fd. Cloud revision/traffic N/A. Start26Nov14:55:12 Bangkok, confirmation14:58:20; Codex GPT-6 under Thira/D. [Original report](received-d/REPORT.md), [finding](received-d/CP-EX-F01-finding.json), [A artifact review](received-d/a-artifact-review.json).

Received ZIP SHA25660d9ad4b72a4a3279db3e4b3f637905edf57bc0070797ef6b40ca5ead80eaf82; CRC and12/12 original payload hashes verified. Five screenshots visually inspected by A. Raw bytes and original SHA256SUMS retained. A did not rerun D's runtime; private start relay and no advance defect knowledge are attributed to D's report. The14:54:28 preflight precedes the reported14:55:12 start; it is not a contradictory final result.

A triage: accept CP-EX-F01 against UAT02/CD02, existing AC11/19 and BR02. Owner+valid required RATING prompt+empty title returns201, creates and persists Draft9; expected400 VALIDATION_ERROR/title detail, inline feedback and no draft. Proposed severity Medium (A assessment, not supplied by D): contract-invalid persistent record, authorized owner only, no observed security/privacy breach. Preserve D drafts3/6/9 and all existing CP-V01 records. Publication/respondent impact was not confirmed.

This is the instructor-standardized educational fallback: the developer deliberately removed the existing trimmed-title lower bound in source4199888. It is not a naturally occurring CP-V01 finding. The field is disclosed here only AFTER the independent finding. Earlier producer5failures are existing tests, not the new reported-case RED.

Keep raw observation history: initial Submitted-badge FAIL checked an inner container; later whole-card/API verification supports PASS without a code change. The initial empty-title PASS also had an invalid question and does not negate the later valid-question201 reproduction. Counts are observations, not independent full test-case totals. C review remains separate/pending.

Follow the [correction contract](../../../docs/labs/lab-06/exercise-correction-contract.md). Actual reported-case RED/GREEN/full regression, B review/current CI, corrected release/deployment, independent retest and final acceptance are pending at this contract commit. No resets/cleanup of D data or cloud operations are authorized by these records.

## Actual correction results

[Correction summary](correction-summary.json), [reported-case RED](red/README.md), [GREEN/full regression](green/README.md), [browser feedback regression](ui/README.md), [exact one-line runtime diff](corrected-runtime-diff.patch). Final tested fix3d6f087:4/4 focused,143/143 server,1/1 client,2/2 existing owner browser cases, both builds pass;0failed/0skipped in GREEN.

The initial RED-output copy failed due Windows text decoding; dependent commands incorrectly committed a first fix before RED evidence entered Git. [Initial runs/deviation](initial-red/README.md) remain in history; the explicit append-only repeat29c1d51 ran fresh RED, committed evidence aed4be8 while still faulty, then final fix3d6f087 and clean GREEN. No backdating/amending/reordering.

[Historical educational provenance](disclosed-exercise-provenance/README.md) is now disclosed after discovery. B current-head review/green CI, corrected staged/main release/deployment, independent retest, C review and final acceptance remain pending. All owned local clusters/processes stopped; D drafts3/6/9 and CPV01 data untouched.

Byte preservation: original evidence remains -text. A plain diff --check flagged CR-at-EOL in appended Windows text; this directory explicitly recognizes cr-at-eol rather than rewriting original received/run bytes. No product assertion or failure was altered.
