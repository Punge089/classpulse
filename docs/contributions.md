# Contributions

Who did what, taken from the repository history (Issues, branches, pull requests, reviews). Every pull request was opened by one student and reviewed by the other; the merge was done by the student who did not open it, with the one exception below.

| Issue | Work | Author | Reviewer | Pair? | Pull requests | Summary |
|---|---|---|---|---|---|---|
| I-01 | Repository, board, branches, local environment | A drives, B joins | pair | — | commits on `main` | Public repo, 11 Issues, labels and board, baseline commit `2fa7ae0`, both laptops set up. |
| I-02 | SRS (Part A) | Punge089 | book6349 | no | #12 | Requirements FR/BR/NFR, decisions D-01…08; v1.1 after B's review (D-04 split, NFR-01 log check). |
| I-03 | System-Level SDS (Part C) | book6349 | Punge089 | no | #16 | Role matrix, data model, API conventions, architecture and ER diagrams; revised after review. |
| I-04 | Feature inventory, traceability, three-sprint plan (Parts B and D) | Punge089 | book6349 | no | #13 | 42-row traceability matrix, feature inventory, sprint plan; NFR-03 mapping corrected after review. |
| I-05 | SR-01 Foundation: skeleton, schema, migration, seed, test harness | book6349 | Punge089 | no | #15 | Express/Prisma/PostgreSQL server, React client, Pulse theme components, seed and test harness. |
| I-06 | F-01 Authentication, session, access control | Punge089 | book6349 | pair (A drives) | #17, #19 | Login, logout, session cookie, role middleware; Secure-cookie and no-secrets-in-logs checks added after review. |
| I-07 | F-03 Survey authoring and lifecycle | Punge089 | book6349 | no | #18 | Owner API and pages: create, list, read, publish, close; ownership checks; TEST-58 and TEST-21a/b renumbering. |
| I-08 | F-04 Response submission | book6349 | Punge089 | no | #21 | Respondent API and pages: list, answer, one response per survey, confirmation; TEST-32. |
| I-09 | F-05 Aggregate summary | book6349 | Punge089 | no | #22 | Summary API and page; decimal-safe half-up rounding; fixtures that separate decimal from binary-float rounding added after review. |
| I-10 | Full-journey E2E, results table, README | Punge089 | book6349 | no | #20, #24 | Results-table generator that fails on any failed suite, TEST-40 journey, TEST-38 summary page test, traceability results. |
| I-11 | Release, evidence, PDF, AI-use declaration | both | the student who did not open each PR | pair | #14, #23, release PR | PDF report builder (#14, A, reviewed by B); AI-use declaration of B (#23); release PR and tag. |

## Exception to the merge rule

Pull request #17 (login, I-06) was opened by Punge089, approved by book6349 on its last commit (`17fd0ae`), and then merged by Punge089, who had opened it, on the explicit instruction of the human owner of the account. This breaks the rule that an author never merges their own pull request; it is disclosed here. All other pull requests were merged by the student who did not open them.

## Work split

Student A (`Punge089`) owns I-02, I-04, I-07 and I-10; Student B (`book6349`) owns I-03, I-05, I-08 and I-09; I-01, I-06 and I-11 are shared. The review chain is symmetrical: each student reviewed the other's Issues (see the review comments on the pull requests listed above).

## In their own words

**Student A (`Punge089`):** I planned the product and the split of work, wrote the SRS, the feature inventory and traceability, the authentication and survey-authoring features, the journey test and the results tooling, and reviewed B's foundation, SDS, response-submission and summary work by running the code, not only reading it. I used Claude Code for drafting and for running tests; I approved every review verdict and every merge myself.

**Student B (`book6349`)**, in the words of Student B:

- I built the I-05 foundation, including the server and client shell, database schema and seed, and shared test helpers.
- I wrote the I-03 System SDS and diagrams, then revised them after review.
- I implemented the I-08 respondent flow and I-09 aggregate summary, including the API, UI, and tests.
- I reviewed the SRS, traceability, PDF, authentication, survey-authoring, log-check, results-tooling, and journey PRs, running the checks reported in my reviews.
