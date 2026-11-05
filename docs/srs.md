# Software Requirements Specification — ClassPulse

**Version 1.0 · 6 Nov 2026 · Author: Punge089 (Student A) · Reviewer: book6349 (Student B)**
Course CPE 334, Project Deliverable 1, theme #10 (Review, Feedback, and Survey System).
Source of the registry: `docs/plan.md` §2.2 (IDs are stable and never renumbered).

## 1. Stakeholder problem

A university department collects course feedback with paper forms or general-purpose online forms.
Nobody controls who may answer, so outsiders and repeat submissions distort the numbers; results are
compiled by hand; and students cannot tell whether their name is attached to their answers.
Lecturers need a quick aggregate view of their own courses. Students need a short, trustworthy way to
answer once. The department needs only enrolled students counted, each at most once per survey.

## 2. Chosen context

Course feedback at one department. A lecturer owns one or more courses and creates surveys for them;
students enrolled in a course may answer that course's published surveys. Accounts, courses and
enrolments are synthetic and seeded. Sprint 1 surveys are **identified** (the respondent is stored with
the answers). Anonymous surveys are planned for Sprint 3 with a separate privacy design.

## 3. Actors and responsibilities

| Actor | Role code | Responsibilities | Must not |
|---|---|---|---|
| Survey Owner (lecturer) | `OWNER` | Creates, publishes and closes surveys for courses they own; reads aggregate results of own surveys | Edit another owner's survey; read an individual respondent's answers (Sprint 1) |
| Respondent (student) | `RESPONDENT` | Lists published surveys of enrolled courses; submits one response per survey; reads own response | Create or change surveys; read another student's response; answer twice |
| System | — | Seeds demo data; creates and expires sessions; enforces every rule on the server | — |

Out of scope as actors: department administrator, teaching assistant, external parties.

## 4. Scope and explicit exclusions

**In scope (whole product):** login/logout; survey authoring and lifecycle; response submission with
eligibility and duplicate prevention; aggregate analysis; later: more question types, scheduled closing,
section eligibility, anonymous mode, CSV export, filters.

**Excluded:** self-registration, password recovery, email verification, single sign-on, multiple roles per
account, user administration screens, grading or identity verification of students, notifications,
payment or any external API, real student data.

## 5. Functional requirements

| ID | Requirement | Sprint |
|---|---|---|
| FR-01 | A user logs in with email + password, sees their name and role, and logs out. | 1 |
| FR-02 | An owner creates a draft survey (title, optional description, 1–20 questions) for a course they own. | 1 |
| FR-03 | Questions are `RATING` (integer 1–5) or `SINGLE_CHOICE` (2–6 options); each is required by default. | 1 |
| FR-04 | An owner publishes a draft survey. | 1 |
| FR-05 | An owner closes a published survey. | 1 |
| FR-06 | A respondent lists published surveys of their enrolled courses and sees which they already answered. | 1 |
| FR-07 | A respondent submits a response and sees a confirmation with the submission time. | 1 |
| FR-08 | An owner views an aggregate summary of an own survey (count, rating average + distribution, choice counts). | 1 |
| FR-09 | An owner lists own surveys with status and response count. | 1 |
| FR-10 | An owner edits or deletes questions of a draft survey. | 2 |
| FR-11 | Additional question types: `TEXT` (≤ 500 chars) and `MULTI_CHOICE`. | 2 |
| FR-12 | An owner sets an optional closing time; the survey stops accepting responses after it. | 2 |
| FR-13 | A respondent views their own past responses. | 2 |
| FR-14 | An owner limits eligibility to selected course sections. | 2 |
| FR-15 | An owner views response rate (responses ÷ eligible respondents). | 2 |
| FR-16 | An owner creates an anonymous survey; respondents are told before answering. | 3 |
| FR-17 | An owner exports responses as CSV (identified: with respondent; anonymous: without). | 3 |
| FR-18 | An owner filters the summary by section and reads text answers. | 3 |

**Observable behaviour of Sprint 1 requirements**

- **FR-01** — Valid email + password → the app shows `Full name · ROLE` in the navbar; Logout returns to the login page and the old session no longer works.
- **FR-02** — Owner submits the new-survey form for an own course → survey appears in the owner's list with status Draft and its questions in order.
- **FR-03** — A rating question accepts only 1–5; a single-choice question shows 2–6 options and accepts exactly one of them.
- **FR-04** — Owner presses Publish on a draft → status becomes Published and the survey appears for enrolled students.
- **FR-05** — Owner presses Close on a published survey → status becomes Closed and students can no longer submit.
- **FR-06** — A student sees only published surveys of courses they are enrolled in, with a Submitted badge on those already answered.
- **FR-07** — Valid submission → confirmation page with the submission time and the student's own answers.
- **FR-08** — Owner opens a survey's summary → response count, per-rating average and distribution, per-option counts (zero-count options shown).
- **FR-09** — Owner's list shows only own surveys with status, course code and number of responses.

## 6. Business rules

| ID | Rule | Sprint |
|---|---|---|
| BR-01 | Only `DRAFT` surveys may have questions added, changed or removed. | 2 |
| BR-02 | A survey has 1–20 questions; prompt 1–300 chars; a `SINGLE_CHOICE` question has 2–6 distinct, non-empty options (≤ 100 chars); a `RATING` question has no options. Title 1–120 chars, description ≤ 1000. | 1 |
| BR-03 | Status changes only `DRAFT → PUBLISHED` (publish) and `PUBLISHED → CLOSED` (close). Any other request is rejected and the status is unchanged. | 1 |
| BR-04 | Responses are accepted only while the survey is `PUBLISHED`. | 1 |
| BR-05 | Only respondents enrolled in the survey's course may respond. | 1 |
| BR-06 | At most one response per respondent per survey, including simultaneous attempts. | 1 |
| BR-07 | A response answers every required question exactly once; a rating is an integer 1–5; a choice is an option of that question; answers to questions not in the survey are rejected. | 1 |
| BR-08 | An owner may create and manage surveys only for courses they own. | 1 |
| BR-09 | A submitted response cannot be edited or deleted by the respondent. | 1 |
| BR-10 | Identified surveys are labelled "Identified" before answering; identifiable responses are never labelled anonymous. | 1 |
| BR-11 | Closing time, if set, must be in the future when publishing; after it, responses are rejected. | 2 |
| BR-12 | `TEXT` answers ≤ 500 chars; `MULTI_CHOICE` answers pick 1…n distinct options of that question. | 2 |
| BR-13 | Anonymous mode: no stored link between a respondent and their answers; participation is recorded separately; mode cannot change after publish. | 3 |
| BR-14 | Aggregate results of an anonymous survey are hidden until it has ≥ 5 responses. | 3 |

Clarification of BR-07: a question marked `required: false` may be left unanswered; no `Answer` row is stored for it.

## 7. Non-functional requirements

| ID | Requirement and measurable target | Verification | Sprint |
|---|---|---|---|
| NFR-01 | Passwords stored only as scrypt hashes; no plaintext anywhere in DB or logs. | DB/unit test TEST-06 | 1 |
| NFR-02 | 100 % of protected endpoints return 401 with no private data when unauthenticated. | Table-driven API test TEST-07 | 1 |
| NFR-03 | 100 % of protected operations in the role/permission matrix have at least one passing negative API test (wrong role and, where records are owned, wrong owner). | API tests TEST-18, 19, 30, 31, 36 + matrix-to-test check in `test-results.md` | 1 |
| NFR-04 | Session expires after `SESSION_TTL_HOURS` (8 h); logout invalidates it server-side immediately. | API tests TEST-04, TEST-05 | 1 |
| NFR-05 | Saved surveys/responses survive an application restart (and, from Lab 5, redeployment). | Sprint 1: DEMO-1 restart check; Lab 5: redeploy check | 1 / Lab 5 |
| NFR-06 | Summary endpoint responds in ≤ 500 ms (p95 of 20 calls) for a survey with 500 responses, local machine. | Measurement script | 3 |
| NFR-07 | 3/3 Sprint 1 forms (login, new survey, answer survey) show a message for each invalid field, and 3/3 lists (owner surveys, respondent surveys, summary) show loading, empty and error states. | Sprint 1: E2E (TEST-08, 21, 32) + manual checklist in `test-results.md`; Sprint 3: all screens | 1 / 3 |
| NFR-08 | In anonymous mode no API response or export can relate a respondent to their answers. | API + DB tests | 3 |
| NFR-09 | All configuration via environment variables; no secrets in Git or client bundle. | Review checklist in PR template + `git grep` check in I-11 | 1 |
| NFR-10 | Usable at 375 px width (no horizontal scroll on core screens). | Playwright mobile viewport | 3 |

## 8. Assumptions

| ID | Assumption |
|---|---|
| A-01 | Each course has exactly one owner (lecturer). |
| A-02 | A student may be enrolled in several courses; enrolments are seeded, not managed in the product. |
| A-03 | All accounts are seeded; email addresses are synthetic (`@classpulse.test`). |
| A-04 | One language (English) and one time zone (server local time) are used throughout. |
| A-05 | A survey belongs to a whole course; sections are introduced in Sprint 2 (FR-14). |

## 9. Decisions

| ID | Decision | Reason |
|---|---|---|
| D-01 | Context is university course feedback. | Clear eligibility rule (enrolment) and easy synthetic data. |
| D-02 | Sprint 1 surveys are identified only. | Anonymous mode needs identity/answer separation that must be specified and tested; the theme allows it later. Identifiable responses are never labelled anonymous (BR-10). |
| D-03 | Owners see aggregates only in Sprint 1. | Smallest slice; raw access is decided with export (FR-17) in Sprint 3. |
| D-04 | One response per respondent per survey; no edit or delete. | Keeps counts trustworthy; enforced by a database unique constraint (BR-06, BR-09). |
| D-05 | Wrong role → 403; a record the caller does not own → 404. | A 404 does not reveal that another owner's survey or another student's response exists. |
| D-06 | Opaque session token in an httpOnly cookie, hash stored in a `Session` table. | Logout can invalidate immediately (NFR-04); no token in client code. |
| D-07 | Ratings are integers 1–5. | Simple, comparable averages and distributions. |
| D-08 | Status flow is only DRAFT → PUBLISHED → CLOSED. | Deterministic lifecycle; reopening is not needed for the stakeholder problem. |

## 10. Open questions and their resolution

| ID | Question | Resolution |
|---|---|---|
| Q-01 | Can owners see raw identified answers? | Not in Sprint 1 (D-03). Reconsidered with CSV export in Sprint 3 (FR-17). |
| Q-02 | May a respondent edit a submitted response? | No (BR-09, D-04). |
| Q-03 | Is anonymity needed in Sprint 1? | No. Allowed later by the course specification; planned as F-11 in Sprint 3. |
| Q-04 | What happens to an optional question left blank? | No answer row is stored (clarification under BR-07). |
