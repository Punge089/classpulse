# Part D entry and isolated staging contract — v1.0

Issue115. Owner A/Punge089; reviewer B/book6349. A assistance: Codex GPT-6. This contract is **awaiting B C3 and the explicit staging-route decision**. No exercise defect is selected, injected or exposed; final acceptance remains pending.

## Baseline entry evidence and proposed decision

C/D updated R3 at `b60329a4579b8d84fc8b640a2e558965c3d28eb3`; C/osizk review6060843684 approved that exact head, and partner PR75 merged `f964d714522ae9fb91baeef32998cbd19219fa90`. [Updated receipt and review](../../../evidence/lab-06/part-d-entry-20261125/README.md). The original snapshot's pending-C wording is historical and superseded by the actual review, not silently edited.

The reported live-replay blocker is a cyber-safety policy constraint in D's assistant session that prevented presenting a revoked session credential. A records that as **D's reported execution constraint**, not a ClassPulse defect or a general prohibition on authorized application testing. Live replay stays BLOCKED; earlier local TEST04 supports server invalidation. Natural eight-hour live expiry remains OPEN with local TEST05 support. Production storage/full-log inspection, extra rounding tie and internal concurrency-schedule limitations remain explicit. The C/D auth8/8 excluded TEST06; A's new local full healthy suite includes it, which is separate developer supporting evidence, not new C/D UAT.

**A proposes accepting these documented limits for educational-exercise entry.** Original12/additional executed paths and R2/R3 support no genuine defect in their observed scope; no limited assertion is marked PASS. C accepted the updated scoped results/limit for baseline discussion. B previously accepted the other scoped limits in review6060147578; B must now explicitly dispose the actual clarified replay limit and this entry proposal. C/D's later readiness message does not itself prove an A/B gate decision. D is available immediately once a real build is ready; no advance appointment or26/27Nov booking is required. Actual operator/start/version evidence is still required for the future exercise.

## Preserved healthy reference

CP-V01 source `1fe3e3b82dfb0537be30223c9b598b3479b4affe`, healthy revision `classpulse-00006-6w6`, digest `sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795`. The last actual A cloud observation was25Nov21:15:48Bangkok; it is not refreshed by this contract. Protected tag `v1.0.0-sprint1` stays at its existing object/peeled commit. Preserve survey26/responses13-15, survey27/response16 and all existing fixtures.

A independently reran the unchanged healthy source in a new owned loopback database: [actual local baseline result](../../../evidence/lab-06/part-d-entry-20261125/healthy-baseline/result.json). These are existing source tests/builds, revision N/A, not the exercise RED/GREEN or corrected independent retest. Initial runner setup failed before product tests and is disclosed. Docker and browser E2E were not run locally; neither is reported as passed or skipped within the executed Vitest totals.

## Contract acceptance criteria

| ID | Requirement and evidence |
|---|---|
| PD-01 | A/B and C/D explicitly record the baseline/coverage-limit entry disposition. B C3 is actual, not A authored on B's behalf. Final product acceptance remains separate. |
| PD-02 | Pin the healthy source and the exact future source ancestry. A feature branch starts from then-current sprint-2-staging under AGENTS. Record any runtime differences from CP-V01. At this planning base9bf820a, the server/src/client/src/schema comparison differs only by the provisioner helper server/src/lib/uat6Provisioner.ts; no runtime equality claim is made for an uninspected future base. |
| PD-03 | B C3 settles the designated Sprint staging test ref and exposure route **before** an intentional defect commit. The professor requires a new Sprint staging commit; ordinary feature/main/protection rules are not silently overridden. No knowingly failing merge into protected staging/main, CI disabling, force push or protected-tag movement. If the proposed dedicated staging ref is not allowed, record that specific conflict for human/TA resolution. |
| PD-04 | After entry/route agreement, choose one verifiably previously corrected defect, or document why the required-field fallback applies. Preserve auth, privacy and data safeguards. Developer-only provenance and exact affected field/route/regression stay private until independent discovery. A/B review can know; C/D tester materials cannot reveal them. |
| PD-05 | Expose only the reviewed exact staging exercise SHA through a separate synthetic test runtime. Healthy CP-V01 remains available. Existing failing tests are retained/reported honestly; a deliberately red exercise is not called a green production release. No protected merge/check bypass. |
| PD-06 | Preferred public staging proposal: separate Cloud Run service/data/secret/job targets from the runbook. AGENTS says "Only releases from main deploy"; B/human must explicitly agree the separately isolated educational **test exposure** path, or choose independently accessible local testing. This contract does not silently grant a non-main normal deployment. Humans provision/IAM/credentials and run mutating cloud commands. |
| PD-07 | Before C/D starts, obtain actual endpoint, exact source SHA, image digest/artifact identity, serving revision/runtime ID, traffic allocation, observed time and successful health/login smoke. The receipt marks environment differences. For local hosting, Cloud Run revision/traffic are N/A; do not fabricate them. C/D must agree the chosen environment and independent access. |
| PD-08 | Share only broad Sprint1 scope/cases, actual version/access and synthetic-data instructions. Private access stays outside public Git/logs/screenshots. Ask C/D to test the app without inspecting the injection diff until its finding is recorded; the public repository limits technical secrecy. Record any prior exact-defect knowledge. |
| PD-09 | C/D independently discovers and files an actual defect with case/requirement/inputs/expected/actual/severity/version/operator/time/evidence. Do not prefill the finding, guarantee discovery, or describe the intentionally introduced fault as natural. |
| PD-10 | After the finding, write/extend a meaningful reported-case regression; commit it and actual RED on the defective source before fixing. Keep existing assertions; a setup failure is not RED. Then minimal fix, same regression GREEN and full relevant regression. |
| PD-11 | B exact-head review, actual regression/build checks and mandatory green CI precede integration. Reviewed corrected staging→main release and actual deployment follow coordinated release order with Lab7/Sprint2. Do not deploy pending unrelated features merely to finish this exercise. Preserve distinct commits even if corrected runtime bytes equal the healthy reference. |
| PD-12 | C/D independently retests the corrected deployed release and records the original reproduction plus affected regression and actual disposition. Only then prepare final acceptance and the self-contained PDF; B reviews the actual PDF hash and a human submits/opens the uploaded file. |

## Concrete route decisions for B C3

Proposed exercise ref: an explicitly designated isolated Sprint1 staging test ref derived from the approved feature exercise commit; its exact name/ancestry is to be recorded before creation. It is not an unreviewed protected staging merge. B should either agree this course-specific route with its rationale or identify the exact unresolved branch rule. No fault or staging ref is created by Issue115.

Default exposure proposal is a separate HTTPS Cloud Run service using a dedicated exercise database and synthetic records. [Human-run targets/preflight](../../../deploy/uat6/STAGING-RUNBOOK.md). If human provisioning/exception is unavailable, B/C/D may agree a separately owned local runtime on the tester's machine using the same exact source. Record local development/HTTPS/session differences and Cloud fields N/A. Do not publish a local-only URL as though another laptop can reach it. No unapproved tunnel, firewall/IAM expansion or fake cloud revision.

Cross-chat order: Issue115 changes only Lab6 docs/evidence and deploy/uat6/STAGING-RUNBOOK.md. Before the later implementation/release, announce its **exact** source/test/schema/shared/release files and hold the coordinated release order. Lab7 PR92 and Sprint2 work are separate; reading their status is not permission to change them. No peer chat message has been sent by this work.

## Review request and status

@book6349: C3 should explicitly answer PD-01 (clarified replay limit/entry), PD-02/03 (base/ref/protection), PD-05/06 (faulty test exposure while CI stays mandatory), PD-07 (actual access/version proof), and PD-10/11 (reported-case RED/GREEN and corrected release order). Do not approve an unbuilt endpoint or infer human availability. Implementation and new product regression-writing wait for actual C3; evidence verification and existing healthy tests are preparation only.

Version history: v1.0,25Nov2026, A with Codex GPT-6: updated C-reviewed baseline receipt, actual healthy-source validation and concrete isolated-staging contract; B C3 pending, exercise selection NONE.
