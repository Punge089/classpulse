# Final Sprint 1 acceptance readiness — 26 November 2026

Issue #122. A/Punge089, assisted by Codex GPT-6. **D records NOT ACCEPTED as of 26 November, 19:05:26 Bangkok, on CP-FIX-001. C's final-decision review is PENDING. Workflow whole-product decision is NOT RECORDED.** D's decision was relayed by the user; no separate final-decision attachment was supplied with this message. This register does not replace either team's sign-off. [Decision receipt](../../../evidence/lab-06/corrected-retest-20261126/d-decision-20261126.json).

## ClassPulse candidate and completed evidence

The proposed decision target is CP-FIX-001, main `bee0d122bf23410e3d2db69649ad5e44959b6cd8`, revision `classpulse-00007-6t9`, 100% traffic in A's 26 November 17:34:24 Cloud / 17:37:19 Registry mapping. OCI index `sha256:ff599f3bdf57eb83d2840709b83fbdc5b1e56ae5994e4866e10e5dfa8d25a89f` contains runtime manifest `sha256:e00257d3b1c9cfdaabbe9b3f1d238c1d26fb342665f80122dcddc4550bc4388d`. D used A's supplied mapping. [Versioned closure](cp-ex-f01-closure.md).

Scope remains Sprint 1 identified surveys F-01/F-03/F-04/F-05 and their authentication, authorization, lifecycle, validation, persistence and aggregate criteria. Later sprint features are outside this release. CP-V01 original cases, agreed setup deviations and R2/R3 evidence keep their original source/revision. D independently retested the affected defect branches on the corrected release. Developer regression supports continuity; it is not an independent rerun of every earlier case.

Completed evidence includes D's 5 Cloud subcases and separate local retention observation, C's actual review, substantive A/B code and release reviews, GREEN regression, successful CI and the main deployment. CP-EX-F01 is fixed and independently verified. [Received artifacts](../../../evidence/lab-06/corrected-retest-20261126/README.md).

D's Not Accepted decision does not reopen CP-EX-F01 or establish another application defect. It records an unresolved verification gap: the operator's safety constraint prevented the live CD-01/AC-04 check. Ordinary logout and isolated TEST-04 remain supporting evidence. C's completed retest artifact review is separate from the pending review of this final decision.

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

## Proposed independent verification method M01 — awaiting agreement

The Product Team authorizes C/D to verify authentication using their own synthetic test access on the pinned CP-FIX-001 release. The preferred way to finish the outstanding live branch is an independently operated, permitted client under a human C/D tester's control. The tester records the actual start, release, logout/server-rejection result and sanitized evidence. Credentials and session values stay private; only temporary test sessions are involved. Preserve business records and do not alter Cloud configuration, session TTL, the clock or shared database rows. If the chosen operator's tool rules prevent the method, stop that method; do not ask it to override its constraints. A's own run would be developer evidence, not C/D's independent result.

For evidence planning, A compared 8 files at exact CP-V01 `1fe3e3b82dfb0537be30223c9b598b3479b4affe` and CP-FIX-001 `bee0d122bf23410e3d2db69649ad5e44959b6cd8`: app wiring, auth route, session helper, auth middleware, Prisma accessor, schema, auth tests and F-01 contract are byte-identical. [Blob IDs and SHA-256 comparison](../../../evidence/lab-06/corrected-retest-20261126/auth-source-continuity.json). This is source inspection, not a new test or proof of live behavior.

The F-01 contract defines AC-05 as rejection when `expiresAt` is in the past; its specified verification is TEST-05. Natural eight-hour observation is a separate live coverage question. If C/D needs additional independent evidence on the corrected source, it can propose the existing complete auth-file command, `npm test -- tests/api/auth.test.ts`, from the server directory at exact `bee0d122`, in a fresh **owned isolated loopback PostgreSQL instance** with disposable `classpulse_test`. The existing fixture resets that database; it must never target Cloud SQL, a shared database or the preserved exercise database. Do not change the test, database-name guard or fixture to accommodate another target. Report actual output, counts, exit code and settings; serving revision is N/A for that local run. No such new run has occurred or been authorized as a substitute for the live branch here.

Before revisiting the decision, C/D and B should record which permitted method completes each required criterion, and which live observations remain supplemental limits. Existing local TEST-04/05 support, unchanged source and the supplied live configuration can inform that decision; they do not automatically close the required live BLOCKED branch. M01 is PROPOSED, not agreed, executed or passed. Keep D's Not Accepted decision until an actual later independent decision supersedes it.

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

C/D now reports a fresh mapping at 26 November 19:04:21 Bangkok: source `41a8fefa7a5d93b6531dff88daae39574d72dcb7`, revision `scd928edd-00009-fsg`, 100%, digest `sha256:06e187cc4d1a9dc809925d4b68873014092a1c0cd6e83e440ec9a9e9bb60193d`. Public marker `41a8fefa7a5d`, health and DB readiness were observed by C/D at 19:04:52, signed out; private access is not verified by that observation. This is C/D-supplied mapping, not A's Cloud readback or a new A/B UAT run.

A's read-only GitHub comparison to the historical fixed source finds 6 runtime/deployment files changed, including requester withdrawal, request/UI logic and two schema migrations. Therefore, no credential change does not mean unchanged Sprint 1 behavior. Obtain C/D's Lab 6 applicability/case disposition and keep later-sprint withdrawal outside the original Sprint 1 assertions unless explicitly agreed. Coordinate the current version and real start before new execution. Preserve all existing requests. [Mapping and source comparison](../../../evidence/lab-06/corrected-retest-20261126/workflow-latest-release-20261126.json).

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
