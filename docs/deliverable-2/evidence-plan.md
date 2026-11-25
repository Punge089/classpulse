# Deliverable 2 and Lab 7 evidence plan

Issue #86, version 1.0, 25 November 2026, A author / B review pending. This is a preparation checklist, not a submitted PDF or a completion claim. Deadlines: 29 November 2026 23:59 Asia/Bangkok. Keep both PDFs self-contained; repository links supplement embedded assessed material.

## D2 coverage (70 points)

| Part | Points | Required embedded material | Source / owner / current state |
|---|---:|---|---|
| A | 5 | Sprint 1 tag and original journey on candidate; Lab 5-7 change/defect register with source, FR/F, decision, status, fix release and retest | Lab 6 records attributed; A integrates later; pending |
| B | 25 | Complete F-06..F-10 contracts, linked requirements, feature SDS/workflow, UI/API/data or explicit no-change, errors/permissions/boundaries, AC, STS, DoD, version history; feature completion table with actual tests/results/releases | #88/#90 and later scoped feature Issues; contracts pending |
| C | 15 | Complete F-11..F-14 contracts/AC/STS; meaningful implemented/tested Sprint 3 workflow; per-AC remaining work/owner/date | Proposed F-13 working slice; all pending |
| D | 10 | Complete current SRS, feature inventory, System SDS, complete FR/BR/important-NFR -> feature -> sprint -> AC -> planned/actual test or measurement -> result/version matrix; gaps visible | A baseline/traceability and B System SDS after feature integration; pending |
| E | 15 | Integrated main candidate demonstrations; build/full regression/integration/CI; cloud release mapping and persistence/smoke; setup; readiness and dated finish plan through 13 Dec | A release driver, B reviewer; human cloud/submission; pending |

Program evidence must show two meaningful Sprint 2 features, at least one implemented Sprint 3 workflow/rule and original Sprint 1 continuity. Prefer F-06 authoring + F-07 answer types, then F-13 section/text analysis. Show saved-data retrieval, a rule rejection and backend forbidden-role/ownership response. UI appearance alone proves neither persistence nor backend access enforcement.

Embed two short real automated test excerpts with setup/assertions/results (one domain/cross-feature, one access restriction), meaningful TDD versions, and two actual Issue/PR chains with author/reviewer, substantive review, staging and release history. Keep original Sprint 2 accepted main release identifiable separately from any later candidate.

## Lab 7 coverage (100 points)

| Part | Points | Required embedded material | Owner / state |
|---|---:|---|---|
| A | 25 | Team-selected old/new behavior; newer announcement; baseline/pre-change versions; impact table through SRS/feature SDS/system SDS/AC/STS/code; revised excerpts and B review before code | A #87, B review; pending |
| B | 50 | Setup/assertions and actual old-code RED; same-test GREEN and diff; relevant existing regression with rationale/counts; distinct Issue/PR, review, CI, staging/main/deploy sequence; changed and preserved deployed checks | A #87, B review; pending |
| C | 15 | Five defined dated metrics, scope/windows, values, evidence IDs; compact underlying lists for at least two reproducible values; interpretation <=100 words with owner/action | B #89, A review; pending |
| D | 10 | READY/NOT READY for maintained Sprint 1 scope, actual release/revision, defects/severity/status, failures/skips, debt, configuration/secrets, docs/setup, deployment; helped/hurt/change; contributions/AI/limits | B #89 + A report assembly; NOT READY |

Lab 7 must embed relevant changed sections, not the entire unchanged SRS/application source. D2 must embed its complete required baseline documents. Reusing the same screenshot/log/test is allowed if it is relevant and independently included/readable in each PDF.

## Evidence record format and immutable sequence

Each execution record includes evidence ID, owner/operator and tool/model where assisted, Bangkok/UTC timestamp, feature/AC/TEST IDs, starting conditions, command/steps, expected/actual outcome, tested full SHA or source/image/revision, pass/fail/skip counts and raw-output path. Manual observations are labeled manual; setup/tool failures are not product RED. Preserve failed runs and later corrections separately.

Version table: protected original Sprint 1 -> accepted Lab 6 reference (pending) -> actual pre-change code + intervening changes -> contract/review -> RED commit -> GREEN commit -> feature merge -> Sprint 2 main release -> later D2 RC if different -> CI run/image digest/serving revision/traffic -> smoke/persistence and user checks. Explain merge SHA differences; no moved tags or overwritten baseline evidence.

Lab 7 Part C metric definitions: completed ClassPulse Issues (exclude cancelled/duplicate from delivered counts); merged ClassPulse PRs with branch/date; one named suite on one candidate SHA; ClassPulse UAT defect status with resolved meaning fixed plus specified retest; CI successes/failures/cancellations for named workflow/branches/window. Paginate source queries. Keep Workflow partner data outside ClassPulse counts. Preserve failed/cancelled runs. Zero is valid only from complete source coverage.

## PDF and submission checks

Both covers identify Bannasorn Thongkorn/67070503420 and Papangkorn Jitvoottikrai/67070503421, theme 10 context, repo URL, immutable submitted tag/commit, app URL/version; Lab 7 additionally identifies accepted Sprint 1 and pre-change versions. Navigation maps rubric parts to actual page ranges and evidence IDs. Use internal page references, readable tables/diagrams/screenshots/log excerpts, contributions, AI-use and honest limitations. No secret values.

Render each complete PDF, inspect every page, verify readable text, page navigation, required complete documents and exact source hashes. B reviews the actual final PDF hashes. Human uploads one Lab 7 PDF and one D2 PDF to the respective LEB2 assignments and opens each uploaded file/receipt. Submission and continued assessed deployment availability are human gates, not agent assumptions. No final PDF exists at this preparation checkpoint.
