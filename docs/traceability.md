# Requirements traceability — ClassPulse

**Version 1.0 · 6 Nov 2026 · Author: Punge089 · Reviewer: book6349**

One row per baseline requirement (18 FR + 14 BR + 10 NFR = 42). Sprint 1 AC and test IDs come from the
Sprint 1 contracts (`docs/sprints/sprint-1/`). The last two columns are filled from real execution output
on the release commit (Issue I-10); until then they say "not run yet", never "pass".

| Requirement | Feature or responsibility | Sprint | AC | Planned test | Actual test (file::name) | Result @ commit |
|---|---|---|---|---|---|---|
| FR-01 | F-01 Authentication, session and access control | 1 | AC-01, AC-02, AC-03, AC-04, AC-08 | TEST-01…05, 08, 09 | not run yet | not run yet |
| FR-02 | F-03 Survey authoring and lifecycle | 1 | AC-10, AC-11 | TEST-10, 11, 12 | not run yet | not run yet |
| FR-03 | F-03 Survey authoring and lifecycle | 1 | AC-10, AC-11 | TEST-10, 11, 12 | not run yet | not run yet |
| FR-04 | F-03 Survey authoring and lifecycle | 1 | AC-13 | TEST-14 | not run yet | not run yet |
| FR-05 | F-03 Survey authoring and lifecycle | 1 | AC-15 | TEST-17 | not run yet | not run yet |
| FR-06 | F-04 Response submission | 1 | AC-20 | TEST-22 | not run yet | not run yet |
| FR-07 | F-04 Response submission | 1 | AC-21, AC-28 | TEST-23, 32 | not run yet | not run yet |
| FR-08 | F-05 Aggregate summary | 1 | AC-30, AC-31, AC-33, AC-34 | TEST-33, 34, 35, 37, 38 | not run yet | not run yet |
| FR-09 | F-03 Survey authoring and lifecycle | 1 | AC-18 | TEST-20 | not run yet | not run yet |
| FR-10 | F-06 Draft editing | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-11 | F-07 Extended question types | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-12 | F-08 Scheduled closing | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-13 | F-09 My responses | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-14 | F-10 Eligibility by section + response rate | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-15 | F-10 Eligibility by section + response rate | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-16 | F-11 Anonymous mode | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-17 | F-12 CSV export | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| FR-18 | F-13 Analysis filters + text answers | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| BR-01 | F-06 Draft editing | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| BR-02 | F-03 Survey authoring and lifecycle | 1 | AC-11 | TEST-11, 12 | not run yet | not run yet |
| BR-03 | F-03 Survey authoring and lifecycle | 1 | AC-14 | TEST-15, 16 | not run yet | not run yet |
| BR-04 | F-04 Response submission | 1 | AC-23 | TEST-26 | not run yet | not run yet |
| BR-05 | F-04 Response submission | 1 | AC-24 | TEST-27 | not run yet | not run yet |
| BR-06 | F-04 Response submission | 1 | AC-22, AC-50 | TEST-24, 25, 50 | not run yet | not run yet |
| BR-07 | F-04 Response submission | 1 | AC-25 | TEST-28, 29 | not run yet | not run yet |
| BR-08 | F-03 Survey authoring and lifecycle | 1 | AC-12 | TEST-13 | not run yet | not run yet |
| BR-09 | F-04 Response submission | 1 | AC-26 | TEST-30 (F-04 contract must also assert PUT/DELETE → 404) | not run yet | not run yet |
| BR-10 | F-04 Response submission | 1 | AC-28 | TEST-32 | not run yet | not run yet |
| BR-11 | F-08 Scheduled closing | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| BR-12 | F-07 Extended question types | 2 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| BR-13 | F-11 Anonymous mode | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| BR-14 | F-11 Anonymous mode | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| NFR-01 | F-01 Authentication, session and access control | 1 | AC-06 | TEST-06 | not run yet | not run yet |
| NFR-02 | F-01 Authentication, session and access control | 1 | AC-07 | TEST-07 | not run yet | not run yet |
| NFR-03 | F-01 Authentication, session and access control | 1 | AC-16, AC-17, AC-26, AC-27, AC-32 | TEST-18, 19, 30, 31, 36 | not run yet | not run yet |
| NFR-04 | F-01 Authentication, session and access control | 1 | AC-04, AC-05 | TEST-04, 05 | not run yet | not run yet |
| NFR-05 | SR-01 Persistence foundation: schema, migrations, seed, test DB | 1 / Lab 5 | manual check in DEMO-1 (restart, then reload saved response) | manual, no automated test | not run yet | not run yet |
| NFR-06 | F-14 Hardening: performance, responsive UI, error handling | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| NFR-07 | F-14 Hardening: performance, responsive UI, error handling (Sprint 1: the screens of F-01, F-03, F-04, F-05) | 1 / 3 | AC-08, AC-19, AC-28 (3 forms) + manual list-state checklist | TEST-08, 21, 32 + manual | not run yet | not run yet |
| NFR-08 | F-11 Anonymous mode | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |
| NFR-09 | SR-01 Persistence foundation: schema, migrations, seed, test DB | 1 | review checklist in PR template + `git grep` secret check | manual, release PR | not run yet | not run yet |
| NFR-10 | F-14 Hardening: performance, responsive UI, error handling | 3 | to be defined in the Sprint 2/3 contract | planned later | not run yet | not run yet |

## Coverage gaps

- NFR-05 is split: the restart half is checked manually in Sprint 1 (DEMO-1); the redeployment half is verified in Lab 5.
- NFR-06 (performance) has no acceptance criterion yet; it is specified and measured in Sprint 3 (F-14).
- NFR-07 is verified for 3 forms and 3 lists in Sprint 1; the remaining screens are verified in Sprint 3.
- NFR-10 (375 px layout) is verified in Sprint 3; Sprint 1 only avoids breaking it.
- NFR-05 and NFR-09 have no automated Sprint 1 test; they use a manual check and a release-PR review checklist, which is disclosed here on purpose.
- All Sprint 2 and Sprint 3 FR/BR/NFR rows have a feature and sprint but no AC or test yet; this is allowed at this checkpoint and is filled when each sprint's contracts are written.

## Approved changes

| Change | Date | Reason | Approved by |
|---|---|---|---|
| (none yet) | | | |
