# Three-sprint plan - ClassPulse

**Version 1.0 · 6 Nov 2026 · Author: Punge089 · Reviewer: book6349**

| Sprint | Window | Goal | Features | Depends on | Completion outcome | Checkpoint |
|---|---|---|---|---|---|---|
| 1 | until 8 Nov | Small working domain slice with authentication, permissions and persistence | SR-01, F-01, F-03, F-04, F-05 | - | An owner publishes an identified survey; an enrolled student answers once; the owner sees aggregates; a tagged release `v1.0.0-sprint1` on `main` | Deliverable 1, 8 Nov |
| 2 | 9–29 Nov | Completed core expansion under engineering contracts | F-06, F-07, F-08, F-09, F-10 (plus Lab 5 Docker/CI/GCP and Lab 6 UAT fixes) | Sprint 1 release | Owners edit drafts, use all four question types, schedule closing, limit eligibility by section and see the response rate; students see their own history; deployed on GCP | Deliverable 2, 29 Nov |
| 3 | contracts and progress by 29 Nov; complete by 13 Dec | Remaining features, integration and product hardening | F-11, F-12, F-13, F-14 | Sprint 2 (F-07, F-10) | Anonymous mode with privacy design, CSV export, filters and text answers, performance and usability hardening; final release | Final delivery, 13 Dec |

## Why Sprint 1 has this scope

The slice is the theme's own Sprint 1 example: it is the smallest slice that contains real authentication, a
meaningful state transition (DRAFT → PUBLISHED → CLOSED), business rules with persistence (eligibility,
one response per respondent, open-only), and role/ownership restrictions. Everything else is allocated to
a later sprint so nothing is dropped silently.

## Why this order

- Anonymous mode (F-11) is Sprint 3 because it needs the extra question types (F-07) and a separate privacy
  design with identity/answer separation that must be specified and tested.
- Draft editing (F-06) is Sprint 2 because Sprint 1 authoring creates a draft in one step and rejects invalid
  input up front (BR-02), so a draft never needs repair yet.
- Hardening (F-14) is last because it measures the finished product.

## Feasibility and risks

- Sprint 1 has about 2.5 days and two people; scope is limited to what the plan's checkpoints allow.
- Sprint 2 shares its window with Labs 5 and 6 and the exam period starts 1 Dec; Sprint 3 contracts are
  written by 29 Nov so the final days are bounded completion, not new design.
- A contract for each feature is committed and reviewed before its tests and code (see `docs/plan.md` §4.1).
