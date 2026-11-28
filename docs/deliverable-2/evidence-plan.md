# Deliverable 2 evidence and submission plan

Issue #86, version 1.4, 28 November 2026, A author / B review pending for this revision. This is a preparation checklist, not a submitted PDF or a completion claim. Deadline: 29 November 2026 23:59 Asia/Bangkok. Build and submit one self-contained D2 PDF. Lab7 is a separate submission governed by Issue #94; it is not appended to or combined with this PDF. Repository links supplement embedded assessed material.

## D2 coverage (70 points)

| Part | Points | Required embedded material | Source / owner / current state |
|---|---:|---|---|
| A | 5 | Sprint 1 tag and original journey on candidate; Lab 5-7 change/defect register with source, FR/F, decision, status, fix release and retest | Lab 6 records attributed; A integrates later; pending |
| B | 25 | Complete F-06..F-10 contracts, linked requirements, feature SDS/workflow, UI/API/data or explicit no-change, errors/permissions/boundaries, AC, STS, DoD, version history; feature completion table with actual tests/results/releases | #90/#134/#96/#88/#135; F-06 and F-09 staged; see the execution checkpoint |
| C | 15 | Complete F-11..F-14 contracts/AC/STS; meaningful implemented/tested Sprint 3 workflow; per-AC remaining work/owner/date | Identified F-12 CSV passed scoped API/browser checks; peer review and candidate evidence pending |
| D | 10 | Complete current SRS, feature inventory, System SDS, complete FR/BR/important-NFR -> feature -> sprint -> AC -> planned/actual test or measurement -> result/version matrix; gaps visible | A baseline/traceability and B System SDS after feature integration; pending |
| E | 15 | Integrated main candidate demonstrations; build/full regression/integration/CI; cloud release mapping and persistence/smoke; setup; readiness and dated finish plan through 13 Dec | A release driver, B reviewer; human cloud/submission; pending |

Program evidence must show two meaningful Sprint 2 features, at least one implemented Sprint 3 workflow/rule and original Sprint 1 continuity. Prefer F-06 authoring + F-07 answer types, then identified F-12 CSV export. Show saved-data retrieval, a rule rejection and backend forbidden-role/ownership response. UI appearance alone proves neither persistence nor backend access enforcement.

Embed two short real automated test excerpts with setup/assertions/results (one domain/cross-feature, one access restriction), meaningful TDD versions, and two actual Issue/PR chains with author/reviewer, substantive review, staging and release history. Keep original Sprint 2 accepted main release identifiable separately from any later candidate.

## Observed evidence as of 28 November

- Part A: protected Sprint 1 tag resolves to d4bad742. Lab 6's final report register attributes acceptance for the isolated exact-source evidence to D on CP-FIX-001 (bee0d122; supplied live revision classpulse-00007-6t9). The historical live M01 remains blocked. Run and document the original journey on the future D2 candidate. Lab 7 reopening was integrated at e6043a9; record its actual regression and version in D2.
- Parts B and C: F-06 and F-09 are staged and included in interim main 8316f27. F-07 is staged at bd77c46 after the corrected head passed CI and independent review. F-08 backend checks passed at 7b823a0. A owns F-10 and retained TEST-200 RED. F-12 has retained RED and scoped API/browser GREEN evidence. No Sprint 3 working slice is verified on a D2 candidate.
- Parts D and E: current standalone documents and candidate traceability remain to assemble. Interim #143 deploy run 46050688714 passed migration/update and read-only smoke. The integrated D2 release PR, version mapping, persisted journey, peer PDF review and human LEB2 upload remain pending.

## Evidence record format and immutable sequence

Each execution record includes evidence ID, owner/operator and tool/model where assisted, Bangkok/UTC timestamp, feature/AC/TEST IDs, starting conditions, command/steps, expected/actual outcome, tested full SHA or source/image/revision, pass/fail/skip counts and raw-output path. Manual observations are labeled manual; setup/tool failures are not product RED. Preserve failed runs and later corrections separately.

Version table: protected original Sprint 1 -> accepted Lab 6 reference (pending) -> actual pre-change code + intervening changes -> contract/review -> RED commit -> GREEN commit -> feature merge -> Sprint 2 main release -> later D2 RC if different -> CI run/image digest/serving revision/traffic -> smoke/persistence and user checks. Explain merge SHA differences; no moved tags or overwritten baseline evidence.

## PDF and submission checks

The D2 cover identifies Bannasorn Thongkorn/67070503420 and Papangkorn Jitvoottikrai/67070503421, theme 10 context, repo URL, immutable submitted tag/commit, app URL/version. Navigation maps rubric parts to actual page ranges and evidence IDs. Use internal page references, readable tables/diagrams/screenshots/log excerpts, contributions, AI-use and honest limitations. No secret values.

Render the complete D2 PDF, inspect every page, verify readable text, page navigation, required complete documents and exact source hashes. B reviews the actual final D2 PDF hash. Human uploads it to the Deliverable 2 LEB2 assignment and opens the uploaded file/receipt. Lab7 uses its own PDF and separate upload. Submission and continued assessed deployment availability are human gates, not agent assumptions. The separate D2 PDF is a working draft awaiting integrated evidence and final review.

Version1.1,25Nov2026,A: split Lab7 rubric/metrics/PDF preparation into Issue94 at the user's request. Retain D2's obligation to report relevant Lab5-7 change status, without importing Lab7's assessed report as a substitute.

Version 1.2, 27 November 2026, A: add observed D2 evidence and distinguish accepted Lab 6, staged Sprint 2 work and the pending D2 candidate.

Version 1.3, 28 November 2026, A: align the rubric evidence map with current F-06/F-09 staging and interim release, F-07/F-08/F-10 gates, and the identified F-12 slice.

Version 1.4, 28 November 2026, A: record F-07 staging and F-08/F-12 verified progress without asserting integrated candidate acceptance.
