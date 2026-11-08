# ClassPulse — Deliverable 1 design (approved 6 Nov 2026)

## Intent
CPE 334 Project Deliverable 1, theme #10 (Review, Feedback, and Survey System), team of two.
Due 8 Nov 2026 23:59. Prove the team can plan the whole product (Parts A–D) and engineer a
tested, reviewed, released Sprint 1 slice (Parts E–F). The plan matters as much as the code:
graders score traceability, pre-implementation contracts, TDD evidence and reviewed PRs.

## Context (team's call, delegated to Claude)
University course feedback. **Survey Owner** = lecturer who owns a course. **Respondent** =
student enrolled in a course. Eligibility = enrolment in the survey's course.

## Goals
- Sprint 1 slice equal to the theme example: owner creates + publishes an identified survey,
  enrolled respondent submits a validated response and sees confirmation, owner views an
  aggregate summary. Reject repeat submissions and responses to unpublished/closed surveys.
- Real login/logout/current user, two roles, backend role + ownership enforcement, tests.
- Whole-product baseline (SRS, features, traceability, System SDS, 3-sprint plan).

## Non-goals (Sprint 1)
Self-registration, password recovery, anonymous mode, text/multi-choice questions, draft
editing, export, Docker/CI/GCP (Lab 5).

## Anti-goals
- Splitting the team into "spec writer" and "coder" roles (spec forbids it).
- Labelling identifiable responses anonymous.
- Frontend-only access control; disabled or weakened tests; AI "all tests pass" claims as evidence.

## Approaches considered
1. **Pair setup + auth, then two parallel feature lanes — CHOSEN.** Foundation and login done
   together (both must explain auth); then Student A owns the survey-owner lane, Student B the
   respondent lane. Sprint 1 schema is fixed in the SDS and migrated in the foundation Issue so
   lanes do not block each other. Fits 2.5 days; satisfies "both participate in everything".
2. Journey split with auth inside one lane — rejected: the other student idles ~½ day.
3. Pair everything — rejected: halves throughput; does not fit the deadline.

## Decided how
Same stack as the team's TokTickIT labs: Express 4 + TypeScript + Prisma 5 + PostgreSQL;
React 18 + Vite 6 + Bootstrap 5; Vitest + Supertest; Playwright. Opaque session token
(SHA-256 hash stored in DB) in an httpOnly cookie; scrypt password hashing.
Branches `main` ← `sprint-1-staging` ← `feature/<issue>-<slug>`; release tag `v1.0.0-sprint1`.
Survey states DRAFT → PUBLISHED → CLOSED only. One response per respondent per survey,
enforced by a DB unique constraint. Owners see aggregates only in Sprint 1.

## Visual identity (Claude's call, user: "anything that looks good")
"Pulse": paper background, navy ink, one coral accent (`#C8431D`, chosen over a brighter coral for
contrast), heartbeat-line motif, rating as five dots. Light theme on purpose, so screenshots stay
readable when the report is printed. Tokens, components and contrast numbers are in docs/plan.md §2.9.

## Skills
Design and plan used the brainstorming and writing-plans skills. All installed skills were
scanned; the per-Issue choice (TDD, verification, UI/UX, dataviz, code/security review, docx/pdf,
verify-work …) is in docs/plan.md §6.2.

## Left to the builder
Component structure inside each screen, styling, exact copy of non-error UI text, internal
helper names not listed in docs/plan.md.
