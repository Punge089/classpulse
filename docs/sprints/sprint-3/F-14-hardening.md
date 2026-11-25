# F-14 Performance, usability states and responsive layout

Issue #98. Version 1.0,25 November2026. Owner/driver: Bannasorn Thongkorn (Punge089, A), assisted by Codex GPT-6.1 Sol. Reviewer: Papangkorn Jitvoottikrai (book6349, B), C3 pending. Initial branch base `c99748c`; implementation/tested candidate SHA PENDING. This is the required Sprint3 contract for D2, not a claim of tested Sprint3 domain progress.

## 1. Feature and requirements

F-14 verifies the finished product against NFR-06 (summary endpoint <=500ms p95 of20 calls for500 responses, local machine), NFR-07 (all forms/lists/screens have meaningful loading/empty/error/validation behavior), and NFR-10 (core screens usable at375px, no horizontal overflow). Preserve NFR-02/03 backend access, NFR-09 secrets, all baseline FR/BR and later approved changes. Scope is measured behavior and user-visible handling, not a rewrite of business rules.

No new product API/model/schema/migration is proposed by this contract. Measurement/browser tools operate only in verified isolated local fixtures. Existing pages retain their feature contracts; any required code fix needs its own specific Files and reviewed test-first change. A passing benchmark alone never establishes full product readiness.

## 2. Workflow

Reviewer agrees benchmark, screen/state inventory and acceptance boundaries before new tests. After C3, establish an honest baseline on an identified integrated commit: run benchmark and screen checks, retain all failures and successful results. For a real failure, commit a meaningful reproducer/RED before a separately scoped fix, then rerun unchanged checks/GREEN and affected regression. Do not invent failure to fill a RED field when a requirement already passes.

At D2 checkpoint, embed the complete contract plus actual achieved/unexecuted status. Required meaningful Sprint3 workflow/rule is planned under F-13 separately. By final delivery, rerun F-14 on actual integrated main candidate, preserving both earlier and final evidence. Finish target from execution plan: bounded implementation by8Dec, integration/user checks by11Dec, reviewed release12Dec, human submission13Dec; dates are planned, not achieved.

## 3. Rules and measurement definitions

### Summary benchmark

Use one synthetic IDENTIFIED survey with20 questions (10RATING,10SINGLE_CHOICE with6options each),500 distinct eligible synthetic respondents and complete valid answers. Values cycle1..5 and option positions1..6 deterministically; expected count500, each rating bucket100/average3.00, choice counts84/84/83/83/83/83. Preserve stable zero-bucket behavior in a separate small fixture/regression rather than claiming this populated dataset proves it. This is a defined representative workload, not a bound on all future question types or raw-text endpoints.

Setup in an isolated test instance using normal valid relations and existing password helpers. Password/connection handling follows human-controlled private environment setup; scripts never print secrets, cookies, hashes or connection strings. Names/emails use @classpulse.test only. Verify database name classpulse_test and approved local instance/port before any write. Refuse remote/public/cloud targets or unknown/reused fixture IDs; do not reset/seed shared databases. Record dataset IDs/counts, schema/commit and setup method; temporary fixture cleanup removes only run-created IDs in foreign-key-safe order and refuses unexpected ownership. Cleanup failures stay visible; no broad deletes.

Time the actual authenticated GET `/api/owner/surveys/:id/summary` endpoint through loopback HTTP, including request/DB/serialization/body receipt; exclude login, fixture creation, server startup and JSON correctness validation from timed region. Use high-resolution monotonic clock. Keep DB/app on same declared local host, production server build, concurrency1,5 untimed warmup calls then20 sequential measured calls, no client/application response cache added to game measurement. All25 responses must be200 and match expected summary; any transport/status/data failure invalidates acceptance, remains a failure and is not dropped or retried as a faster sample.

Sort20 raw elapsed-ms samples ascending; nearest-rank p95 is element19 (1-based, ceil(.95*20)). Pass iff that value<=500. Record every raw sample in order, sorted samples, p95 formula/value, command, actual SHA, OS/CPU/RAM, Node/PostgreSQL versions, database/app mode, timer and UTC/Bangkok time. Single local result is not a GCP SLO or cross-machine comparison. No rounding a value above500 down to pass. Instrument computation tests with a known vector to prevent percentile/index mistakes.

### Responsive and state checks

Use Playwright Chromium viewport375x812 CSS px, deviceScaleFactor1, browser version reported, default zoom100%, and await meaningful settled state/fonts. Check root/document scrollWidth<=clientWidth+1px for fractional rendering tolerance; separately verify key controls/content bounding boxes remain visible or intentionally scroll within a clearly labeled component. Do not hide overflowing content with global overflow-x:hidden, clipping, unreadable shrink-to-fit or removals. Capture375px and1280px comparison evidence using synthetic long prompt/title/labels/multichoice/text/audit data and normal populated/empty states. Screens lacking implemented features remain NOT IMPLEMENTED/NOT RUN, never silently excluded from the inventory.

NFR07 checks actual data empty states, in-flight loading, recoverable errors and validation/disabled pending controls. Browser network interception may hold/error an endpoint to test UX; label this simulated condition. A mock403 proves error rendering only; direct backend API tests separately prove actual denial. Test keyboard focus/tab/label linkage for core controls; color alone never communicates errors/status. Existing identified/anonymous notices must match actual data mode. Automated checks do not constitute full accessibility certification.

## 4. Permissions and privacy

Benchmark authenticates as owning OWNER; assert unauthenticated401, RESPONDENT403 and foreign OWNER404 without summary leakage before accepting the result. Do not store session tokens. Performance access probes use the same local fixtures but run outside timing samples. Browser hardening includes role route guards plus actual negative API paths from the feature tests; UI visibility is insufficient. Existing anonymous suppression/identity separation remains F-11's responsibility and must be verified separately when integrated.

## 5. UI specification and screen inventory

| Screen/group | Relevant states and behavior | Readiness at initial contract |
|---|---|---|
| Login | labeled fields, invalid credentials/field validation, pending/error, keyboard submit,375px | Existing route; new verification NOT RUN |
| Owner survey list | loading, empty, populated long titles, error/retry,375px | Existing route; NOT RUN |
| New survey | field validation, repeatable questions/options, pending/network, long values,375px | Existing route; NOT RUN |
| Owner detail/lifecycle | loading/error, permissions, status actions, new reopen reason/history empty/loading/pagination/conflict | Existing base; Lab7 additions pending |
| Draft editing | load/error/invalid/non-draft/stale/cancel/save, question reorder and long fields | F-06 pending |
| Schedule configuration | timezone/deadline, invalid/stale/pending/expired recovery | F-08 pending |
| Respondent open list | loading/empty/error/populated, submitted indication/deadline/eligibility,375px | Existing base; extensions pending |
| Answer form | identified/mode notice, required validation, all integrated types, pending/closed/error/duplicate handling | Existing base; extended types pending |
| Saved confirmation/history | reload persistence, empty/paginated history/error/loading, immutable answers | Existing confirmation; F-09 pending |
| Owner summary/rate/filter/text | loading/empty/error/populated, zero buckets, section/rate boundaries, text wrapping,375px | Existing summary; F-10/F-13 pending |
| Anonymous mode/export | privacy notice/threshold-denied/errors/download state where defined | F-11/F-12 contracts/implementation pending |

The final run must expand grouped rows into actual route/feature/AC/state entries from integrated contracts. No feature is omitted because it arrived late; re-review the inventory and record its version. Error messages must be actionable/sanitized and keep user-entered values when retry is reasonable; no silent automatic duplicate write. Actual missing UI behavior gets a scoped fix after genuine failure, not an unfounded checklist tick.

## 6. API and tooling specification

No new application endpoint or API envelope. `tools/performance/summary-benchmark.mjs` takes nonsecret local target/survey parameters and reads authorized private setup through environment; validates loopback-only target/expected test DB before fixture mutation. Print only sanitized metadata,20 sample durations, computed percentile and correctness/access checks; produce machine-readable JSON and human-readable output under evidence/sprint-3/F-14. Never include cookie/token/request credential headers or raw DB errors. Nonzero exit on any guard, correctness, sample count, access, timing threshold or cleanup failure; no success report on partial data. Never silently reduce500responses/20samples or change500ms threshold to pass.

Browser tests and helpers use explicit isolated baseURL and current fixtures. Existing root Playwright config currently hardcodes3000/5173 and can reuse servers; before execution either verify exclusive correct instances or obtain scoped configuration changes through review. Do not reuse another chat's server. No config change is authorized by this Files list. Report exact startup/configuration commands, not only the test filename.

## 7. Data and migration

No product schema/migration. Benchmark adds temporary synthetic data only in verified isolated local test DB under guarded setup, with actual cleanup outcome. Compare snapshot of preexisting record IDs/counts/values where relevant; no live/shared writes. Fixture methodology must adapt through reviewed contract history when new schema fields become required. Benchmark itself may not weaken relational/answer constraints. Screenshots use synthetic values and avoid visible secrets. Full raw evidence is tied to source/schema version.

## 8. Failures, boundaries and dependencies

Benchmark p95=500 passes,500.001 fails; vector20 vs19/21 count fails, unsuccessful response never excluded; invalid sample values reject. Warmups are excluded from timing but validated. A machine/environment failure is reported as such, not product RED or performance pass. Known timing noise never authorizes selective sample removal; any full rerun is a separately retained run with reason.

Shared application changes wait for F-06..F-13/Lab7 integration and scoped ownership. F-14 tools cannot overwrite feature routes, global styles, tests, schemas or test safety guards. Planned code optimization must preserve aggregate correctness, rounding/empty buckets, access, deadline/eligibility and privacy. Any new index/query change requires impact/migration/rollback design and exact Files before implementation. No actual performance defect or horizontal overflow is asserted from source inspection alone.

## 9. Acceptance criteria

| ID | Observable outcome |
|---|---|
| AC-280 | Reproducible guarded local500-response dataset, correctness totals and fixture-only cleanup preserve existing rows; metadata identifies source/schema/environment. |
| AC-281 | Actual endpoint20-sample nearest-rank p95<=500ms after5 validated warmups; all samples/status/data retained and correct, no discarded failures. |
| AC-282 | Benchmark rejects invalid/unsafe target/setup/sample vectors/failed response/data mismatch and reports nonzero without exposing secrets; actual backend401/403/404 preserved. |
| AC-283 | Every final core screen at375px has no root horizontal overflow beyond1px tolerance and key content/controls remain usable without global clipping. |
| AC-284 | Every final form/list/detail inventory entry has executed loading/empty/error/validation/pending states as applicable with explicit N/A reason; unimplemented/unrun remains visible. |
| AC-285 | Core controls have keyboard operation/accessible names, readable errors/status/mode notices and preserved user input where safe; actual permissions stay enforced server-side. |
| AC-286 | Real failing hardening cases precede scoped fixes; same cases GREEN and affected feature regressions preserve business/data/privacy contracts, all failures/skips disclosed. |
| AC-287 | D2 includes complete contract/honest checkpoint status; final candidate rerun has actual commit/commands/counts/environment/screenshots, peer review/current CI and readiness/remaining-action record. |

## 10. Software Test Specification

All new test/tool implementation waits for actual B C3.

| Test | AC | Level | Preconditions/input/action | Expected result | Planned file |
|---|---|---|---|---|---|
| TEST-280 | 280 | guarded setup/manual DB readback | Isolated known local instance; build500respondents/20questions/full answers with prior-row snapshot | Exact deterministic fixture counts/totals; untouched prior rows; cleanup deletes only run IDs | tools/performance/summary-benchmark.mjs; evidence/sprint-3/F-14/setup.txt |
| TEST-281 | 281 | measurement | Owning auth/local production app;5warmups then20timed actual summary calls | All200/correct;20raw samples, p95 rank19<=500, metadata retained | tools/performance/summary-benchmark.mjs |
| TEST-282 | 281,282 | unit | Known ordered/reversed sample vectors; exact500/500.001; lengths19/21; NaN/negative/infinite; HTTP/data failures | Correct nearest-rank/threshold, invalid run fails without dropping samples | server/tests/tools/summaryBenchmark.test.ts |
| TEST-283 | 282 | unit/tool guard | Remote/nonloopback URL, unknown/shared DB marker, existing fixture collision, secret-like failure text | Refuse setup; no unsafe writes or credential/header/error leakage | server/tests/tools/summaryBenchmark.test.ts |
| TEST-284 | 282,285 | API/manual probe | Same synthetic survey; no auth,student,foreign owner then owner |401/403/404/200 with no foreign/private data | tools/performance/summary-benchmark.mjs; evidence/sprint-3/F-14/access.txt |
| TEST-285 | 283 | E2E | Final route inventory,375x812 and1280viewports, populated/empty/worst-case valid synthetic text | Root no overflow within1px, primary controls visible/usable, screenshots/version retained | e2e/hardening.spec.ts; e2e/hardening.helpers.ts |
| TEST-286 | 284 | E2E UX simulation | Hold/error fetches, real empty fixtures, valid/error/pending form submissions | Visible deterministic states and field messages, disabled pending mutation, retry/input retained | e2e/hardening.spec.ts |
| TEST-287 | 284,285 | E2E | Tab/keyboard submit/change/cancel across core forms, invalid inputs and integrated mode notices | Named controls/focus and textual state/errors; notices match actual survey mode | e2e/hardening.spec.ts |
| TEST-288 | 285,286 | existing API/DB/E2E | Integrated old/new auth/ownership, lifecycle, answers, summaries, eligibility/deadline/privacy tests | All existing assertions enabled; exact counts/head/outcomes, no test weakening | evidence/sprint-3/F-14/regression.txt |
| TEST-289 | 286 | actual reproducer/fix chain | Only where baseline fails a real agreed hardening assertion; preserve initial failure before scoped code fix | Same behavioral case GREEN after fix with explicit diff/scope/review; baseline passes stay honest | evidence/sprint-3/F-14/red-green-index.md |
| TEST-290 | 287 | document/result audit | Final screen inventory/candidate raw output, requirement->AC->test/result/version mappings | Every inventory row disposition and every NFR verification accounted for; all gaps/limitations visible | evidence/sprint-3/F-14/checkpoint.md |
| TEST-291 | 283,284,287 | selected deployed/manual | Reviewed final main revision and public browser journey plus saved data/denial paths | Actual versioned UX/persistence/permission smoke, no inference of local performance result as cloudSLO | evidence/sprint-3/F-14/deployed-checks.md |

No product RED exists yet and none is invented. For a new tool implementation use test-first calculation/guard assertions and retain meaningful failures, avoiding missing-import/compile errors as RED. For existing product behavior record baseline outcomes before choosing any corrective code work.

## 11. Definition of Done

- [ ] B C3 validates full NFR scope, percentile/workload/measurement, privacy and screen inventory before new tools/tests.
- [ ] Exact integrated source and isolated local environment identified; all raw sample/errors/cleanup and screen-state results retained. No secrets, live seed/reset or shared instance interference.
- [ ] Genuine failures have separately scoped RED/fix/GREEN evidence and unaffected tests kept. Commands include `node tools/performance/summary-benchmark.mjs`, `npm --prefix server test`, `npm --prefix client test`, both builds and `npx playwright test` with actual safe configuration; report full SHA/counts/failures/skips.
- [ ] Peer reviews actual proposed changes/head and current required CI; staging/main release uses merge commits. D2 contract checkpoint and final rerun are version-specific; final deployed smoke is separately observed.
- [ ] Human runs required concrete cloud actions and uploads reviewed reports. D2 and Lab7 PDFs remain separate. No full product readiness claim from counts or a single benchmark.

Current status CONTRACT PROPOSED, NOT IMPLEMENTED/NOT RUN/NOT ACCEPTED. No performance, overflow or accessibility result is inferred from current sources. These12 STS rows are designs, not executed test cases.

## 12. Version history

v1.0,25Nov2026,A/Codex GPT-6.1 Sol: initial F-14 complete NFR/UI/API-no-change/data-no-change/AC/STS/DoD contract, before tests/tools/code; B review pending, actual hardening findings unknown.
