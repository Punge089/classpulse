# Lab 6 · CP‑EX‑F01 independent corrected-release retest

**Disposition: PASS on CP‑FIX‑001 for the reported defect and affected checks.** Run `CP-FIX-001-D-20261126` on 26 November 2026 at 18:30:40–18:30:49 Asia/Bangkok. Operator Codex (GPT‑6) under Thira (D), Microsoft Edge on Windows. Private start notice: D-reported; exact private URL retained in the original private handoff sent before execution.

## Corrected deployed release

The nine handoff payload hashes matched. Source `bee0d122bf23410e3d2db69649ad5e44959b6cd8` was GitHub `main` before and after. Release PR 121 is merged at that SHA and workflow 45801951833 completed successfully. The reviewed feature source supplied by A is `0b8df1c8cb067a8e8249887925bb1f4b96948184`. [Release PR](https://github.com/Punge089/classpulse/pull/121) · [Deployment run](https://github.com/Punge089/classpulse/actions/runs/45801951833)

The partner mapping identifies revision `classpulse-00007-6t9` at 100% traffic. OCI image index `sha256:ff599f3bdf57eb83d2840709b83fbdc5b1e56ae5994e4866e10e5dfa8d25a89f` and linux/amd64 runtime manifest `sha256:e00257d3b1c9cfdaabbe9b3f1d238c1d26fb342665f80122dcddc4550bc4388d`. A supplied the Cloud Console mapping at 17:34:24.572 and Registry mapping at 17:37:19.125 Bangkok. D observed the same public origin, asset path and health HTTP 200 before and after. Those public indicators corroborate continuity. The exact revision/digest mapping remains attributed to A.

## Recorded results

The CPE334 synthetic owner used the normal browser create form throughout. Every case supplied one valid required rating question with the run ID in the prompt. The full HTTP status, submitted title, error field, and before/after owner-list IDs are in [retest-results.json](retest-results.json).

| Case | Expected | Actual |
|---|---|---|
| CP‑RT‑01 · UAT‑02 / CD‑02 · AC‑11/19 | Empty untouched title gives 400 with inline feedback and adds no draft | **PASS.** HTTP 400 `VALIDATION_ERROR`, detail field `title`, “Title must be 1 to 120 characters” under Title. Stayed on New survey. Owner list unchanged at 27. |
| CP‑RT‑02 · whitespace neighbor | Three spaces rejected with an inline title error and no draft | **PASS.** HTTP 400, title detail and inline feedback. List unchanged at 27. |
| CP‑RT‑03 · valid control | Valid title creates a Draft, and title/question survive reload | **PASS.** HTTP 201, new Cloud Draft **28**, detail 200 after reload with matching title/question. List 27 → 28. |
| CP‑RT‑04a · upper valid boundary | 120 ASCII characters accepted and persisted | **PASS.** Exactly 120 characters sent and read back. HTTP 201, new Cloud Draft **29**, detail 200. List 28 → 29. |
| CP‑RT‑04b · upper invalid boundary | 121 ASCII characters rejected and adds no Draft | **PASS.** Exactly 121 characters sent. HTTP 400, title detail and inline feedback. List unchanged at 29. |
| CP‑RT‑05 · local evidence retention | Original drafts 3/6/9 remain on the isolated exercise DB | **PASS.** At 18:26:54 Bangkok a read-only query verified the owned data directory, loopback target and all three local rows with empty title and DRAFT state. The local app was kept stopped. [Local readback](local-retention.json) |

Cloud Drafts 28 and 29 are retained. D did not target the Cloud records with numbers 3, 6 and 9, which belong to a separate namespace from the local exercise evidence. No seed/reset was performed.

The original failure was on local CP‑EX‑001. This retest used the corrected Cloud service and its synthetic owner. Recommend closing the reported defect on this version after ClassPulse records its disposition. Final acceptance and the separate remaining coverage limits remain pending. Natural live expiry remains OPEN, old-session replay BLOCKED, with isolated TEST‑05 and TEST‑04 as supporting evidence. Production storage/log inspection and the extra rounding boundary were outside this retest.

## Public derivative notice

A redacted only the private Discord start-notice URL from this public narrative copy. The original private report and source ZIP are retained unchanged; original/public hashes are distinguished in ../source-archive-receipt.json and ../SHA256SUMS.json. Execution/results were not rewritten.
