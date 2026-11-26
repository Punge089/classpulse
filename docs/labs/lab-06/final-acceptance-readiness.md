# Final Sprint 1 acceptance readiness — 26 November 2026

Issue #122. A/Punge089, assisted by Codex GPT-6. **ClassPulse independent final decision: NOT RECORDED. Workflow whole-product decision: NOT RECORDED.** This register is not either team's sign-off.

## ClassPulse candidate and completed evidence

The proposed decision target is CP-FIX-001, main `bee0d122bf23410e3d2db69649ad5e44959b6cd8`, revision `classpulse-00007-6t9`, 100% traffic in A's 26 November 17:34:24 Cloud / 17:37:19 Registry mapping. OCI index `sha256:ff599f3bdf57eb83d2840709b83fbdc5b1e56ae5994e4866e10e5dfa8d25a89f` contains runtime manifest `sha256:e00257d3b1c9cfdaabbe9b3f1d238c1d26fb342665f80122dcddc4550bc4388d`. D used A's supplied mapping. [Versioned closure](cp-ex-f01-closure.md).

Scope remains Sprint 1 identified surveys F-01/F-03/F-04/F-05 and their authentication, authorization, lifecycle, validation, persistence and aggregate criteria. Later sprint features are outside this release. CP-V01 original cases, agreed setup deviations and R2/R3 evidence keep their original source/revision. D independently retested the affected defect branches on the corrected release. Developer regression supports continuity; it is not an independent rerun of every earlier case.

Completed evidence includes D's 5 Cloud subcases and separate local retention observation, C's actual review, substantive A/B code and release reviews, GREEN regression, successful CI and the main deployment. CP-EX-F01 is fixed and independently verified. [Received artifacts](../../../evidence/lab-06/corrected-retest-20261126/README.md).

## Coverage decisions still needed

Lab 6 handout section 3.4 (page 5) reserves independent acceptance for the UAT Team and prohibits acceptance with required tests still BLOCKED. The [reporting agreement](handoff.md#results-reporting-and-acceptance) follows that rule. B's earlier acceptance of explicit limits concerned entry into the educational exercise, not final product acceptance. The instructor's later clarification governed that exercise; no new TA exercise assignment is requested.

| Branch | Actual state and next decision |
|---|---|
| CD-01: old live session rejected after logout; AC-04/NFR-04 | R3 remains BLOCKED. Browser logout followed by identity 401 and isolated TEST-04 are supporting evidence, not a live old-cookie replay. An authorized independent check can use a fresh own synthetic session: `/me` 200 → logout 204 → replay that same old cookie once → 401 `UNAUTHENTICATED`, with no user data. Keep the token in memory and omit raw headers/cookies from evidence. A tester-controlled client or authorized human may operate it. Record the actual blocker if it cannot run; a required blocked test prevents Accepted. |
| CD-01: natural eight-hour live expiry; AC-05/NFR-04 | OPEN. Isolated TEST-05 PASS and configured TTL 8 are not eight elapsed live hours. C/D should identify the agreed required verification method from the inventory/contract, explain how the received support satisfies it or what remains required, and record any supplemental live observation as OPEN. A has not waived or renamed a required test. |
| Production storage/full-log inspection | UNOBSERVED. Preserve the actual source/local support and its versions. Public users normally lack this capability; no production password/hash/log disclosure or administrator access is requested. C/D records the scope and significance of this evidence limit. |
| Additional rounding tie | NOT RUN. The specified ratings 4, 4, 5 → 4.33 and zero buckets were independently observed. Keep the extra tie check separate. |
| Internal concurrent interleaving | Outside observation. The external 201/409 duplicate outcome and one retained response are evidence; the exact internal schedule was not observed. |

Reconcile the final required inventory explicitly. Do not silently drop agreed cases, turn OPEN/BLOCKED into PASS, or reclassify a requirement solely to obtain acceptance. A genuine supplemental limit can remain documented as such; it is not automatically a product defect. If required coverage remains blocked, the UAT Team records **Not Accepted** with the reason and remaining action.

## Independent final record from C/D

After the coverage decision, C/D supplies **Accepted**, **Accepted with explicitly documented minor limitations**, or **Not Accepted**, including:

- exact source, revision, index/runtime digests, scope, and mapping attribution/time;
- actual testers/reviewers, operator/model and Bangkok decision date/time;
- original and retest case references, closed CP-EX-F01 and remaining defects;
- required-case results and any supplemental limits/conditions with reasons;
- C's actual review role, without inventing a C rerun.

A/B can record Product Team triage and propose the release; only C/D can issue ClassPulse independent acceptance. Keep the release coordinated and preserve local drafts 3/6/9, Cloud drafts 28/29, surveys 26/27, responses 13–16 and existing accounts/enrollments. The successful correction retest does not need to be repeated merely to obtain the final record.

## Workflow: separate A/B UAT responsibilities

The original 6 Workflow cases have scoped results and C/D dispositions. A independently retested WF-BUG-001 on corrected source `ad2cbef67decf9953219694898327dea0bb66034`, marker `ad2cbef67dec`, revision `scd928edd-00008-9zd`: 2 original plus 5 supplemental checks passed on 24 November, 23:03:13–15 Bangkok. That is a historical supplied mapping, not a fresh current readback. Workflow whole-product acceptance remains separate.

| Additional inventory | Actual received state and owner |
|---|---|
| ADD-01: authentication/session | A leads. Audit the remaining subcases and methods; earlier ordinary login/logout does not automatically complete them. |
| ADD-02: boundaries/payload | B recorded 17 supplemental UI attempts. This is partial evidence, not full API execution; status 422 was not measured. API-only requesterId/status claims and exact response/readback coverage remain open. |
| ADD-03: reason limits | B has boundary/UI evidence. For APPROVE-501 the immediate capture showed Saving decision; unchanged state alone does not establish the completed response outcome. |
| ADD-04: repeated/competing decisions | B API probes NOT RUN in received evidence. |
| ADD-05: backend role/assignment/PUT | B probes NOT RUN. Original UI isolation is separate evidence. |
| ADD-06: durability/special setup | A leads. Distinguish actual restart from a new instance and obtain C/D setup/version coordination. No A/B cloud restart, database or assignment mutation is authorized. |

C/D technically accepted A2; an older agreement-pending heading is historical. Technical agreement is not execution. [B results](../../../evidence/lab-06/checkpoint-20261124/b-workflow/RESULTS.txt) and [C/D dispositions](../../../evidence/lab-06/checkpoint-20261124/received-cd-corrected/EN037-B-V2-DISPOSITION.md) preserve the partial observations. A/B must reconcile the required inventory, obtain fresh serving-version and start coordination for any new run, then record their own evidence-based Workflow decision.

## Report and submission

The report remains DRAFT. Its final PDF needs both role streams, complete cases and actuals, the RED/GREEN sequence and disclosed deviation, reviews, CI, deployment, independent retest and actual decisions, with readable embedded evidence. B's exact-file report review and human LEB2 submission are separate remaining steps. No guaranteed score or submission is claimed.

Once acceptance is actually recorded, send the other chat the accepted version, retest outcomes and remaining items. Preliminary release/retest messages do not lift the coordinated release freeze.
