# Lab 6 · Independent ClassPulse acceptance disposition

**D decision: Not Accepted on current evidence.** Recorded 26 November 2026 at 19:05:26 Bangkok time. Tester Thira Rungruangkaset (D), with the actual automated/browser operations performed by Codex under D as identified in the run records. Reviewer Ashira Sansoda (C) recorded a scoped retest evidence review through `osizk` without rerunning the case. C’s final-decision review and team acknowledgment remain separate, with no sign-off claimed here. [C retest review](https://github.com/Punge089/classpulse/issues/120#issuecomment-7190900011)

## Exact decision candidate

- CP‑FIX‑001, ClassPulse Sprint 1 identified-survey scope F‑01, F‑03, F‑04 and F‑05.
- Source `bee0d122bf23410e3d2db69649ad5e44959b6cd8`; revision `classpulse-00007-6t9`, 100% in ClassPulse A’s supplied 26 November readback (Cloud 17:34:24.572 and Registry 17:37:19.125 Bangkok).
- OCI image index `sha256:ff599f3bdf57eb83d2840709b83fbdc5b1e56ae5994e4866e10e5dfa8d25a89f`; Cloud Run linux/amd64 runtime manifest `sha256:e00257d3b1c9cfdaabbe9b3f1d238c1d26fb342665f80122dcddc4550bc4388d`. I checked the GitHub source and received mapping record. Cloud revision, traffic and registry association are attributed to A. [Versioned evidence and readiness register](https://github.com/Punge089/classpulse/pull/123)

## Required-case evidence

| Cases | Actual evidence and version scope |
|---|---|
| Original UAT‑01–12 | Expected behaviors observed on CP‑V01. A accepted the API fixture setup variation for UAT‑08/10/11. R3 confirmed respondent reload. These remain baseline observations. |
| CD‑01 | Invalid/inactive sign-in, ordinary logout, signed-out denial and live cookie flags/clearing have scoped passing observations. **Independent deployed post-logout server-side invalidation (AC‑04) remains BLOCKED.** The assistant’s cyber-safety constraint prevented using a revoked session credential against the deployed service. No such live result was recorded. Isolated TEST‑04 remains supporting PASS. AC‑05/TEST‑05 are detailed below. |
| CD‑02 and corrected CP‑EX‑F01 | CP‑V01 authoring matrix observed expected results. The exercise-specific original FAIL on CP‑EX‑001 was corrected. D’s five Cloud subcases passed on CP‑FIX‑001, including restored blank and spaces rejection, ordinary/120-character acceptance and 121-character rejection. Retained Cloud Drafts 28–29 and read-only verified local Drafts 3/6/9 in their separate namespace. A accepted the defect as **FIXED / INDEPENDENTLY VERIFIED**. [A disposition](https://github.com/Punge089/classpulse/issues/120#issuecomment-7191345870) |
| CD‑03–05 | Baseline observations passed for malformed-answer/no-write, duplicate outcome and single saved response, stale-form rejection and disabled submit in flight. |
| CD‑06 | Baseline protected GET/POST and signed-out PUT/DELETE passed in the observed scopes. Authenticated respondent PUT/DELETE retained the recorded 404 interpretation. |
| CD‑07 | Baseline three-person required aggregate 4/4/5 → 4.33, expected buckets, an ordered zero-count choice and summary privacy passed. |
| CD‑08 | Baseline non-enrolled Draft, enrolled Closed and agreed external missing-resource observations passed. The missing-resource result is an external service observation. |

[Baseline case-by-case evidence](https://github.com/osizk/WorkflowAndApprovalSystem/blob/lab6/docs/labs/lab-06/classpulse/COVERAGE-DISPOSITION.md) · [Corrected retest report](D-RETEST-REPORT.md)

## Expiry method and remaining limits

**AC‑05 is required.** F‑01 §9 requires rejection of an expired session. F‑01 §10 specifies an isolated API/DB test with an already-expired fixture. The exact-source CP‑V01 TEST‑05 passed at this supporting scope. **A natural eight-hour wall-clock wait is supplemental to that prescribed method**, and the deployed observation remains **OPEN**. No live expiry PASS is claimed. If a signed inventory separately requires elapsed live observation, retain it as a required open item until both teams explicitly disposition it. [F‑01 §9–10 at the decision source](https://github.com/Punge089/classpulse/blob/bee0d122bf23410e3d2db69649ad5e44959b6cd8/docs/sprints/sprint-1/F-01-authentication.md)

Production storage and complete log inspection remain **unobserved**, with source/local evidence at its recorded scope. The prior eight-test auth file excludes password TEST‑06. Additional rounding-tie coverage remains **NOT RUN**. The external concurrent-duplicate outcome was observed; the exact internal interleaving remains outside observation. Explicit limits accepted for exercise entry are not a final acceptance waiver.

**Remaining action:** obtain authorized independent evidence of the required AC‑04 branch on the pinned candidate, or agree a documented alternative verification basis with ClassPulse and the course reviewer if needed. Keep the branch BLOCKED and the decision Not Accepted until the required gap is resolved. Record C’s separate final-decision review. The corrected title checks and C’s received retest evidence review need no repeat. Lab 6 §3.4 prevents acceptance while a required test remains blocked.

## Separate Workflow release record

WF‑BUG‑001 stays closed based on its original corrected-version retest. Fresh read-only Cloud Run/Artifact Registry verification at **26 November 2026, 19:04:21 Bangkok** found source `41a8fefa7a5d93b6531dff88daae39574d72dcb7`, revision `scd928edd-00009-fsg` at 100%, and matching serving/source-tag digest `sha256:06e187cc4d1a9dc809925d4b68873014092a1c0cd6e83e440ec9a9e9bb60193d`. Public marker `41a8fefa7a5d` and health/readiness HTTP 200 were corroborated at 19:04:52 Bangkok by read-only public HTTP checks.

The release diff contains requester withdrawal, its schema constraints, tests, documentation and CI trigger. It contains no credential or account-provisioning change. Existing privately supplied synthetic access remains the handoff basis. This was a signed-out serving verification and did not validate private login access. Preserve existing requests, use dedicated new synthetic records for agreed checks that change state, and coordinate start and exact version before A/B run remaining cases. Workflow whole-product acceptance remains A/B’s separate decision. [Workflow deployment](https://github.com/osizk/WorkflowAndApprovalSystem/actions/runs/45813696804) · [Coordination Issue #61](https://github.com/osizk/WorkflowAndApprovalSystem/issues/61)
