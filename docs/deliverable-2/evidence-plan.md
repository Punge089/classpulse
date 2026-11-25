# Deliverable 2 evidence and submission plan

Issue #86, version 1.1, 25 November 2026, A author / B review pending. This is a preparation checklist, not a submitted PDF or a completion claim. Deadline: 29 November 2026 23:59 Asia/Bangkok. Build and submit one self-contained D2 PDF. Lab7 is a separate submission governed by Issue #94; it is not appended to or combined with this PDF. Repository links supplement embedded assessed material.

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

## Evidence record format and immutable sequence

Each execution record includes evidence ID, owner/operator and tool/model where assisted, Bangkok/UTC timestamp, feature/AC/TEST IDs, starting conditions, command/steps, expected/actual outcome, tested full SHA or source/image/revision, pass/fail/skip counts and raw-output path. Manual observations are labeled manual; setup/tool failures are not product RED. Preserve failed runs and later corrections separately.

Version table: protected original Sprint 1 -> accepted Lab 6 reference (pending) -> actual pre-change code + intervening changes -> contract/review -> RED commit -> GREEN commit -> feature merge -> Sprint 2 main release -> later D2 RC if different -> CI run/image digest/serving revision/traffic -> smoke/persistence and user checks. Explain merge SHA differences; no moved tags or overwritten baseline evidence.

## PDF and submission checks

The D2 cover identifies Bannasorn Thongkorn/67070503420 and Papangkorn Jitvoottikrai/67070503421, theme 10 context, repo URL, immutable submitted tag/commit, app URL/version. Navigation maps rubric parts to actual page ranges and evidence IDs. Use internal page references, readable tables/diagrams/screenshots/log excerpts, contributions, AI-use and honest limitations. No secret values.

Render the complete D2 PDF, inspect every page, verify readable text, page navigation, required complete documents and exact source hashes. B reviews the actual final D2 PDF hash. Human uploads it to the Deliverable 2 LEB2 assignment and opens the uploaded file/receipt. Lab7 uses its own PDF and separate upload. Submission and continued assessed deployment availability are human gates, not agent assumptions. No final PDF exists at this preparation checkpoint.

Version1.1,25Nov2026,A: split Lab7 rubric/metrics/PDF preparation into Issue94 at the user's request. Retain D2's obligation to report relevant Lab5-7 change status, without importing Lab7's assessed report as a substitute.
