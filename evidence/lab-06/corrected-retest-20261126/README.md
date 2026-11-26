# Independent CP-EX-F01 corrected-release retest

Issue #122. A/Punge089, assisted by Codex GPT-6. [D narrative, redacted](received-d/D-RETEST-REPORT.redacted.md), [Cloud results](received-d/retest-results.json), [local retention](received-d/local-retention.json), [A artifact review](a-artifact-review.json), [C's actual review](c-retest-review.json).

The source ZIP SHA-256 is `1f4c502d1cab678ce3eb662e93fcd7120d698930a59c72d90c0b3619fb659e3a`. Archive CRC and all 9 original payload hashes were verified. Eight public JSON/PNG payloads retain their original bytes. The public narrative removes one private Discord DM URL and has a separate hash. [Provenance receipt](source-archive-receipt.json) distinguishes original hashes from the current public manifest, `SHA256SUMS.json`. The original ZIP remains private and unchanged.

D's actual operator was Codex (GPT-6) under Thira/D. Five Cloud subcases passed on 26 November at 18:30:40.777–18:30:49.443 Bangkok, source `bee0d122bf23410e3d2db69649ad5e44959b6cd8`, revision `classpulse-00007-6t9` from A's 17:34:24 Cloud / 17:37:19 Registry mapping. D checked source/main and public continuity, not Cloud Console directly. C's actual osizk comment 7190900011 supports the scoped PASS after artifact review, without rerun. A reviewed 9 hashes, JSON comparisons and 6 screenshots, without an application rerun.

Empty, three-space and 121-character titles returned 400 with title details and visible inline feedback; owner-list IDs stayed unchanged. Valid and 120-character controls returned 201, creating Cloud drafts 28/29 with readback 200 and exact title/question persistence. This is not a complete database snapshot. The 120-character screenshot is viewport-clipped; exact length comes from JSON. Raw `aria-invalid: null` is retained without asserting full accessibility conformance.

The separate local read at 18:26:54 preceded the Cloud run. It confirmed D's owned loopback `classpulse_uat6_exercise` database, PostgreSQL 16.16, read-only mode, and blank-title drafts 3/6/9. It is not a post-Cloud readback. Local and Cloud IDs refer to different databases. No reset or seed was reported.

A records CP-EX-F01 as **FIXED / INDEPENDENTLY VERIFIED** for the reported defect and affected branches. [Closure chain](../../../docs/labs/lab-06/cp-ex-f01-closure.md). Final acceptance remains **NOT RECORDED** and belongs to the independent UAT Team. [Remaining decisions](../../../docs/labs/lab-06/final-acceptance-readiness.md).

[Deployed release](CP-FIX-001-verified-release.json), [source/index/runtime mapping](registry-index-membership.json), [main deployment](main-deploy-verified.json), [B correction review](b-correction-review.json) and [A release review](a-release-review.json) support the engineering chain. Release receipts were captured before D's retest; their embedded NOT RUN/PENDING fields are historical, not the current scoped result. A's 8 public and 5 authentication developer observations are distinct from D's retest. The initial RED output commit-order deviation and explicit repeat remain disclosed in the correction evidence.

Run the offline artifact audit from the repository root:

```powershell
python evidence/lab-06/corrected-retest-20261126/verify.py
```

This audit checks evidence consistency and provenance; it does not run the application or create new UAT results.
