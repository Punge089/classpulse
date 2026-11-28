# F-12 Owner CSV export

Issue #138 · v1.0 · 28 November 2026. Driver: Bannasorn Thongkorn (A/Punge089). Reviewer: Papangkorn Jitvoottikrai (B/book6349). Proposed contract; pending review and implementation.

## 1. Feature and requirements

FR-17 lets an owner export responses to their own survey. Identified exports include the respondent. Anonymous exports remove identity and preserve BR-13, BR-14 and NFR-08. Preserve BR-08/10 and NFR-02/03/09. Depends on F-05 owner access, F-07 for added answer types, and F-11's reviewed anonymous storage and release rules.

## 2. Behavior and workflow

1. The owner opens an owned, published or closed survey summary and sees its mode and export availability.
2. Download CSV requests a read-only export. The backend authorizes the caller and loads the survey, mode and data from one consistent snapshot.
3. The browser saves the response as a CSV file. Failures leave the current summary usable and offer retry.
4. D2 proposes an identified-only slice. Demonstrate two persisted submissions via the UI download and a denied actor. Reject anonymous mode in this slice. Full mode support remains a required later outcome.

## 3. Rules

Use UTF-8, comma delimiters, CRLF records, one header and CSV double-quote escaping. Identified order: response_id, respondent_name, respondent_email, submitted_at, question_position, question_text, question_type, answer. Output one row per response and question, sorted by saved submission time, response ID and question position. Use UTC ISO 8601 timestamps, decimal ratings, option labels as a JSON array in the saved question option order, and saved TEXT values. Optional unanswered cells are blank. Unknown stored shapes fail with a sanitized error.

Anonymous output is a separate query and header: question_position, question_text, question_type, answer. Require at least five completed anonymous responses in the same snapshot. Sort by question position and rendered answer value so no record links answers across questions. Omit all respondent, section, response and time fields. Leave the raw anonymous TEXT answer cell blank because free text can contain identity; show that policy in the UI and require F-11 review before enabling anonymous export. No identity joins, grouping, internal IDs or chronology. Never fall back to the identified query.

Prefix textual cells that may start a spreadsheet formula with a single apostrophe before CSV quoting. Check =, +, -, @ after leading whitespace/control characters and a leading tab, CR or LF. Exercise actual decoded CSV cells with Thai text, whitespace, quotes, separators and newlines. The protective apostrophe may show in readers. An authorized identified export with zero responses contains the header. Cap at 5,000 responses and 100,000 rows; reject in full above the cap without writing any CSV bytes.

## 4. Permissions

Server-side OWNER guard and owned survey lookup. Return 401 for no session, 403 for wrong role, and identical 404 for foreign/missing survey before reading status, mode or counts. An identified file contains personal data; restrict it to its authorized owner and set private, no-store. All data and log handling must preserve NFR-08/09.

## 5. UI

Add a named keyboard-accessible Download CSV control on the owner summary. State that identified CSV includes respondent names and emails. Anonymous mode states that identities and free-text answers are omitted when that full feature is enabled. Show pending status, disable duplicate requests, retain summary on failure and provide retry. Label empty, below-threshold and unavailable states distinctly. The filename uses the numeric ID and never the title.

## 6. API

GET /api/owner/surveys/:id/export.csv, using the existing owner session. Positive integer survey ID, no query parameters. 200 text/csv; charset=utf-8, Content-Disposition attachment with filename classpulse-survey-<id>.csv, Cache-Control private, no-store. Validate and prepare the complete bounded output before sending headers. Failures use the existing JSON envelope: 400 invalid ID/query; 401 unauthenticated; 403 wrong role; 404 missing/foreign; 409 EXPORT_NOT_AVAILABLE (draft or unavailable mode), ANONYMOUS_THRESHOLD_NOT_MET (full feature under five), EXPORT_TOO_LARGE; 500 sanitized unexpected/invalid stored data. No partial success.

## 7. Data and migration

No migration or persistent export file. Use bounded projections from an isolated read snapshot of survey, question, option, response, answer and user relations for identified exports. Full anonymous export reads the reviewed F-11 answer store separately, without querying participation or identity. Verify safe query projections before enabling both modes.

## 8. Failure and boundary cases

Cover zero, cap and cap+1, 4 versus 5 anonymous submissions, CSV and Unicode field boundaries, stored unsupported answer/mode, draft and foreign IDs, concurrent submit, optional blanks, interruption/retry, sanitized errors and absence of any DB writes. No alternate output exposes suppressed data.

## 9. Acceptance criteria

| AC | Observable result |
|---|---|
| AC-240 | Owner downloads exact persisted identified rows and metadata from their own survey. |
| AC-241 | Unauthenticated, wrong role, missing and foreign requests get 401/403/404 and no CSV. |
| AC-242 | Published/closed identified surveys can export; draft and unsupported mode fail; first slice rejects all anonymous data. |
| AC-243 | After F-11 review, anonymous export requires five responses and contains no identity, chronology, linked answers or raw free text. |
| AC-244 | Supported question and answer types serialize with stable ordering; unanswered optional cells are blank. |
| AC-245 | Quote/newline/Unicode preservation and protective formula prefixes survive CSV readback. |
| AC-246 | Snapshot is consistent; zero contains the header, and over-limit export fails before bytes. |
| AC-247 | Keyboard download, mode notices, pending and error/retry work on the owner summary. |
| AC-248 | Export leaves database unchanged, avoids sensitive logs and disables caching. |

## 10. Software test specification

File paths are proposals until #138 is updated before test changes.

| Test | AC | Level | Input and action | Expected result | Planned file |
|---|---|---|---|---|---|
| TEST-240 | 240 | API/DB | Two real saved identified submissions; fetch as owner and parse | Exact stored values, header, content type, filename, no-store | server/tests/api/ownerExport.test.ts |
| TEST-241 | 241 | API/DB | No session, respondent, foreign owner and missing ID | 401/403/404 and no CSV | server/tests/api/ownerExport.test.ts |
| TEST-242 | 242 | API/DB | Draft, closed, published and anonymous fixtures | Success on supported states; deny draft and anonymous in slice | server/tests/api/ownerExport.test.ts |
| TEST-243 | 243 | API/DB | After F-11, four then five anonymous submissions with unique markers | Denial then deidentified export without markers or grouping | server/tests/api/ownerExport.test.ts |
| TEST-244 | 244 | Unit/API | All supported types, optional blank and reversed selected order | Stable positions, correct answers and canonical option array | server/tests/unit/surveyCsv.test.ts |
| TEST-245 | 245 | Unit | Thai text, quote/CRLF and spreadsheet formula markers | CSV parser sees original structure and protective prefixes | server/tests/unit/surveyCsv.test.ts |
| TEST-246 | 246 | API/DB | Zero, cap/cap+1, concurrent submit | Header-only or complete snapshot; JSON error above cap | server/tests/api/ownerExport.test.ts |
| TEST-247 | 247 | Browser | Identified owner summary, saved row, forced failure, keyboard retry | Accurate mode notice, pending/retry and correct downloaded CSV | e2e/owner-export.spec.ts |
| TEST-248 | 248 | API/DB | Success/denial runs with logs and counts captured | Private/no-store, no stored changes or sensitive logs | server/tests/api/ownerExport.test.ts |

## 11. Completion evidence

B approves the exact contract through C3. Update #138 with exact paths. Preserve executable test-only RED before code, then same assertions GREEN. Record full test counts and exact source, review and CI, staging merge and approved main candidate. Repeat a saved-data download and denial on the authorized release. Show unexecuted modes/types and dependencies explicitly in D2.

## 12. Version history

v1.0 · 28 November 2026 · A with Codex GPT-6.2 Sol. Initial full FR-17 contract and identified-only first slice for review.

### v1.1 C3 clarifications, 28 November 2026

B's C3 at #138 covers the identified-only first slice and requests these verification clarifications. In TEST-242, reject a valid owned survey request with an unexpected query parameter as a 400 JSON error before sending CSV headers. In TEST-246, pin count and row reads to one PostgreSQL repeatable-read or stronger transaction, and coordinate an actual concurrent submission between them with database barriers. Verify the same observation excludes the intervening submission and a fresh request includes it. No time-based sleep or weakened assertion. Keep newer question types pending their F-07 implementation and anonymous export disabled.
