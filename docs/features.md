# Feature inventory — ClassPulse

**Version 1.0 · 6 Nov 2026 · Author: Punge089 · Reviewer: book6349**

Stable IDs. `SR-xx` is a system responsibility, `F-xx` a user-facing feature. `F-02` is intentionally unused;
the number is left empty so existing IDs never change.

| ID | Feature / responsibility | Requirements | Depends on | Sprint |
|---|---|---|---|---|
| SR-01 | Persistence foundation: schema, migrations, seed, test DB | NFR-05, NFR-09 | — | 1 |
| F-01 | Authentication, session and access control | FR-01, NFR-01, NFR-02, NFR-03, NFR-04 | SR-01 | 1 |
| F-03 | Survey authoring and lifecycle | FR-02, FR-03, FR-04, FR-05, FR-09, BR-02, BR-03, BR-08 | F-01 | 1 |
| F-04 | Response submission | FR-06, FR-07, BR-04, BR-05, BR-06, BR-07, BR-09, BR-10 | F-01, SR-01 (F-03 only for the UI journey) | 1 |
| F-05 | Aggregate summary | FR-08 | F-01, SR-01 | 1 |
| F-06 | Draft editing | FR-10, BR-01 | F-03 | 2 |
| F-07 | Extended question types | FR-11, BR-12 | F-03, F-04, F-05 | 2 |
| F-08 | Scheduled closing | FR-12, BR-11 | F-03, F-04 | 2 |
| F-09 | My responses | FR-13 | F-04 | 2 |
| F-10 | Eligibility by section + response rate | FR-14, FR-15 | F-04, F-05 | 2 |
| F-11 | Anonymous mode | FR-16, BR-13, BR-14, NFR-08 | F-04, F-05 | 3 |
| F-12 | CSV export | FR-17 | F-05, F-11 | 3 |
| F-13 | Analysis filters + text answers | FR-18 | F-07, F-10 | 3 |
| F-14 | Hardening: performance, responsive UI, error handling | NFR-06, NFR-07, NFR-10 | all | 3 |

## Feature descriptions

- **SR-01 Persistence foundation: schema, migrations, seed, test DB** (1) — Project skeleton, PostgreSQL schema with constraints, migration and reproducible seed, test database and harness, visual theme. Not a user-facing feature but every feature depends on it.
- **F-01 Authentication, session and access control** (1) — Email + password login, logout, current-user lookup, cookie session with expiry, role middleware. Protects every other endpoint (401 unauthenticated, 403 wrong role).
- **F-03 Survey authoring and lifecycle** (1) — Owner creates a draft survey with rating and single-choice questions for an owned course, publishes and closes it, and lists own surveys. Owns the status-transition rule.
- **F-04 Response submission** (1) — Respondent lists published surveys of enrolled courses, submits one validated response, and reads own response. Owns eligibility, duplicate and open-status rules.
- **F-05 Aggregate summary** (1) — Owner reads an aggregate summary: response count, rating average and distribution, option counts. Never returns respondent identity.
- **F-06 Draft editing** (2) — Owner edits or deletes questions while a survey is still a draft.
- **F-07 Extended question types** (2) — Adds text and multi-choice question types to authoring, answering and the summary.
- **F-08 Scheduled closing** (2) — Optional closing time; responses after it are rejected.
- **F-09 My responses** (2) — Respondent views own past responses.
- **F-10 Eligibility by section + response rate** (2) — Eligibility limited to selected course sections; owner sees the response rate.
- **F-11 Anonymous mode** (3) — Anonymous surveys with identity/answer separation, a minimum of 5 responses before results show, and a notice before answering.
- **F-12 CSV export** (3) — CSV export of responses (with respondent for identified surveys, without for anonymous).
- **F-13 Analysis filters + text answers** (3) — Summary filters by section and reading of text answers.
- **F-14 Hardening: performance, responsive UI, error handling** (3) — Hardening: performance target, usability states on all screens, 375 px layout.

## Dependency notes

- F-03, F-04 and F-05 need F-01 (login) and SR-01 (schema). F-04 and F-05 can be built and unit/API-tested
  without F-03, because tests create surveys directly in the database; only the full UI journey needs F-03.
- F-07 touches authoring, answering and the summary, so it follows F-03, F-04 and F-05.
- F-11 (anonymous) needs F-07 types and the Sprint 3 privacy design; F-12 needs F-11.
