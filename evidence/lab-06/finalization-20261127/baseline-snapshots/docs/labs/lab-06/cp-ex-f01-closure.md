# CP-EX-F01: fixed and independently verified

Issue #122. Product Team A/Punge089, assisted by Codex GPT-6. This records the defect disposition; final Sprint 1 acceptance remains separate. [Received evidence](../../../evidence/lab-06/corrected-retest-20261126/README.md).

## Finding and correction

CP-EX-F01 is the instructor's standardized required-field exercise. The healthy CP-V01 was not reported to contain this defect. Exercise source `4199888409fefafa920a773991d735f14ffb4ac8` deliberately removed the normalized title lower-bound check on original Sprint 1 staging. D independently created and reloaded a draft with an empty title and a valid required rating question. This contradicts UAT-02/CD-02, AC-11/AC-19 and BR-02. A adopted C's Minor functional severity; A's earlier Medium proposal remains historical. ClassPulse A/B owns the correction.

| Stage | Exact source and actual evidence |
|---|---|
| Healthy reference | CP-V01 `1fe3e3b82dfb0537be30223c9b598b3479b4affe`, revision `classpulse-00006-6w6`. Historical tag `v1.0.0-sprint1` still peels to `d4bad74211729032697164f378638efb834a67b6`. |
| Defective exercise | `4199888409fefafa920a773991d735f14ffb4ac8`, D's isolated local runtime; Cloud revision/traffic N/A. D started 26 November at 14:55:12 Bangkok and confirmed the finding at 14:58:20. Local drafts 3, 6 and 9 retained. |
| Contract and regression | [Correction contract](exercise-correction-contract.md) `997353a7df9c3a2e0f3e2186e71fd285245f280d`, then new regression tests `6839effe99e25cfa422c02d0ec4878fc8533db6d`. |
| Initial process deviation | Initial RED ran and was saved before first fix `73b640db908016ef0515be55be9a432f496e2abd`, but an encoding error interrupted copying the evidence; the fix was committed before the RED output commit. This first sequence is not claimed compliant. History was preserved. |
| Committed repeat RED | The same defect was explicitly restored at `29c1d51bc6c884dac60ae1f86480e3bce4c756ee`. The same four tests produced 2 failed / 2 passed / 0 skipped, actual 201 versus expected 400. Output commit `aed4be8` preceded the final fix while the code was still defective. [RED evidence](../../../evidence/lab-06/exercise-correction-20261126/red/README.md). |
| Final fix and GREEN | `3d6f0874ccbaa8a14756ada9b12c2e20fa003e2b` restores the existing guard. Focused tests 4/4, full server 143/143, client 1/1 and both builds passed; 0 failed or skipped. Two existing owner browser tests passed; later release review ran all 8 preserved browser tests. [GREEN evidence](../../../evidence/lab-06/exercise-correction-20261126/green/README.md). |
| B review and integration | Exact head `0b8df1c8cb067a8e8249887925bb1f4b96948184`; B review 6070920924 included actual 4 focused / 143 server / 1 client tests and builds. Feature CI 45783244281 passed. Sprint 2 merge `50e71091ef937cd82e61822b9fa6f3ee15b71c1c` is not the deployed source. [B review](../../../evidence/lab-06/corrected-retest-20261126/b-correction-review.json). |
| Reviewed main release | B authored PR #121; A approval 6072306247. Release CI 45792413066 passed on checkout `98c7ee9899fd929968ac254fa73ba2d6075be4be`, whose full tree equals `0b8df1c`. Human-initiated main merge `bee0d122bf23410e3d2db69649ad5e44959b6cd8` occurred 26 November at 17:30:18 Bangkok. [A review](../../../evidence/lab-06/corrected-retest-20261126/a-release-review.json). |
| Deployment | Main workflow 45801951833 succeeded, including migration, service, traffic and smoke checks. A's Cloud readback at 17:34:24 and Registry readback at 17:37:19 verified `classpulse-00007-6t9`, 100% traffic. [Release record](../../../evidence/lab-06/corrected-retest-20261126/CP-FIX-001-verified-release.json). |

The full source tag `bee0d122bf23410e3d2db69649ad5e44959b6cd8` maps to OCI index `sha256:ff599f3bdf57eb83d2840709b83fbdc5b1e56ae5994e4866e10e5dfa8d25a89f`. Its Registry Manifest JSON explicitly includes the linux/amd64 runtime manifest `sha256:e00257d3b1c9cfdaabbe9b3f1d238c1d26fb342665f80122dcddc4550bc4388d`, matching Cloud Run. [Mapping evidence](../../../evidence/lab-06/corrected-retest-20261126/registry-index-membership.json). These are different digest roles. This release did not deploy later Lab 7/Sprint 2 runtime or schema changes.

## Independent retest

D ran `CP-FIX-001-D-20261126` on 26 November, **18:30:40.777–18:30:49.443 Bangkok**, in Microsoft Edge on Windows. Actual operator: **Codex (GPT-6) under Thira/D**. Source was `bee0d122bf23410e3d2db69649ad5e44959b6cd8`, revision `classpulse-00007-6t9` from A's verified mapping. D checked main and matching public origin, asset and health before/after; this is not a fresh D Cloud Console readback. The private start notice is D-reported; its private URL is retained only in the original handoff.

| Check | Actual result |
|---|---|
| CP-RT-01: empty title, valid required rating | 400 `VALIDATION_ERROR`, title detail and visible inline message. Stayed on New survey. Owner-list IDs unchanged at 27 records. |
| CP-RT-02: three spaces, valid required rating | 400 with title detail and inline message. Owner-list IDs unchanged at 27 records. |
| CP-RT-03: valid title control | 201, new Cloud Draft 28. Reload/readback 200 with matching title and question; owner list grew from 27 to 28. |
| CP-RT-04a: 120 ASCII characters | 201, new Cloud Draft 29. Readback 200 with the exact 120-character title; list grew from 28 to 29. |
| CP-RT-04b: 121 ASCII characters | 400 with title detail and inline message. Owner-list IDs unchanged at 29 records. |
| CP-RT-05: separate local retention | At 18:26:54, before the Cloud run, a read-only query on D's owned loopback PostgreSQL 16.16 confirmed local blank-title drafts 3, 6 and 9. The local app stayed stopped. No post-18:30 local readback is claimed. |

Five Cloud subcases and one separate local retention observation passed. A verified all 9 original payload hashes, archive CRC, JSON comparisons and 6 screenshots; A did not rerun the application. Raw `aria-invalid: null` is retained: inline feedback and `aria-describedby` were observed, without claiming full accessibility conformance. Unchanged owner-list IDs establish no new owner-visible draft, not a complete production database snapshot. New Cloud drafts 28/29 and original local drafts 3/6/9 are separate namespaces and remain preserved.

**C's separate evidence review is complete.** [osizk comment 7190900011](https://github.com/Punge089/classpulse/issues/120#issuecomment-7190900011) checked the 9 hashes, screenshots and readbacks, and supports the scoped PASS. C did not rerun the checks. C's exact assisting model was not specified and is not inferred from D's model. [Review receipt](../../../evidence/lab-06/corrected-retest-20261126/c-retest-review.json).

**A disposition: CP-EX-F01 is FIXED / INDEPENDENTLY VERIFIED on CP-FIX-001 `bee0d122bf23410e3d2db69649ad5e44959b6cd8`, A-mapped `classpulse-00007-6t9`.** Final Sprint 1 acceptance remains the independent UAT Team's separate decision after reconciling required coverage. [Remaining decisions](final-acceptance-readiness.md). This defect closure does not sign acceptance for C/D or establish full Lab 6 completion.

Subsequent decision: D records **Not Accepted** on this release at 26 November 19:05:26 Bangkok because live CD-01/AC-04 verification remains BLOCKED by the operator's safety constraint. D explicitly acknowledges this defect as fixed and independently verified. C's final-decision review is pending; the completed C retest evidence review is not that decision review. [User-relayed decision receipt](../../../evidence/lab-06/corrected-retest-20261126/d-decision-20261126.json). No new genuine defect or failed correction retest is inferred.
