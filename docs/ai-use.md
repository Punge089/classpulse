# AI-use declaration - ClassPulse

## Lab 5 and Sprint 2 — Student A, 11 November 2026

Student A (`Punge089`) switched to OpenAI Codex (GPT-6) and authorized it to work through A's account. Codex verified the account and Git identity, installed dependencies, generated the local Prisma client, ran the backend suite, created A's Lab 5 Issues and drafted the shared agent rules. A set the scope and retains responsibility. The local digest records what the agent actually did for A to read afterwards.

Under this authorization Codex may write contracts, tests, implementation and comments. On B's changes it may check the contract or check out the PR, run the tests and Issue checks, read the diff, post a verdict and merge an approved PR with green CI. These actions can take place without A reading each message or deciding each verdict in advance. The GitHub review, check and merge records identify which actions occurred. B reviews A's PRs from B's account. B documents their own AI use. Human-only cloud, credential, GitHub settings and submission work stays with the students.

On 12 November A explicitly authorized one exception for GitHub main-branch protection. Codex configured the `main-reviewed-ci` ruleset through A's signed-in browser; A personally completed GitHub's Confirm access authentication. Codex verified the active rules through the API and prepared the contract-approved C-02 failing-test demonstration. This settings action was AI-assisted, rather than performed entirely by a human. The remaining cloud, credential, environment and submission gates retain their earlier human-only boundary.

## Deliverable 1 (historical declaration)

**Declaration of 8 Nov 2026 for the release `v1.0.0-sprint1`. Each student wrote and answers for their own part: Student A in this file's history before 8 Nov, Student B in pull request #23.**

## Tools

| Student | AI tools | Notes |
|---|---|---|
| Student A (`Punge089`) | Claude Code (Claude Opus 5.5 for planning, Claude Sonnet 5.5 afterwards) | Used in the Claude desktop app on A's computer |
| Student B (`book6349`) | OpenAI Codex (model label: GPT-6) | Codex desktop app in the ClassPulse workspace; used for planning, coding, test execution, and review drafts. Student B checked outputs and remains responsible for changes and claims. |

## Tasks assisted by AI

| Area | What the AI did | What the student did |
|---|---|---|
| Planning (`docs/plan.md`, `docs/design.md`) | Read the course specifications, proposed the product, the Issue split, the registry of requirements, data model and API; drafted the plan | A delegated the choice of context to the AI ("choose what best"), picked the work split, asked for the changes in the plan, and approved the plan |
| Documents (SRS, features, traceability, sprint plan, SDS, contracts) | Drafted the text from the plan registry; generated tables from plan data | The author of each Issue read it, edited it, and the other student reviewed it in a PR. Student B confirms: AI drafted the SDS and B-owned contracts; B read and edited each document before use, then submitted it for partner review. |
| Code and tests | Wrote tests and implementation from the committed contract, ran them, saved the red and green output | The author read the test assertions and the output before opening the PR |
| Issue and PR comments | Drafted comments from the templates in `docs/comment-playbook.md`, filled only with real data (commits, test counts, checks that were run) | The student whose account posted it read and checked every claim, edited it, and posted it from their own account. Student B confirms for comments posted from B's account: drafts were checked against the templates, repository state, and actual evidence before posting; Student B showed draft comments and review verdicts to Student A before posting, while Student B made and owned each final decision. |
| Reviews | Ran the review checks on the checked-out PR and drafted the review | The reviewing student read the diff and tests, and decided approve or request changes. Student B confirms for reviews posted from B's account: read the diff, ran the required checks, and verified claims before deciding the verdict; Student B showed some draft verdicts to Student A before submission; Student B retained responsibility for the final decision. |
| Report (PDF) | `tools/build_report.py` assembles the documents into the PDF | Students filled names, IDs, evidence and screenshots |

## Responsibility

All AI output was inspected before it was accepted; tests were run by the student who owns the Issue and the counts were checked. Each student can explain the requirements, tests and design decisions they own. At the time of Punge089's review of `c22da58`, Student B (`book6349`) had authored 41 commits; none had a `Co-Authored-By` trailer, although Codex helped write them. Student B's commits from now on include the required trailer. Student A's commits carry a `Co-Authored-By` trailer (Claude Opus 5.5 or Claude Sonnet 5.5) with seven exceptions: the baseline commit `2fa7ae0`, which was AI-assisted, and the six merge commits that GitHub created for pull requests #15, #16, #17, #21, #22 and #23 when Student A's account merged them.

## Known limits of this declaration

Student A: Claude Code drafted most of the text and code and ran the tests; A directed the work, approved every review verdict and every merge before it was posted (pull request #17 was merged by its own author, see `docs/contributions.md`), and relied on the tests, the other student's reviews and the mutation checks to find mistakes.

Student B: AI-generated drafts and code can contain mistakes, so B checked owned code, test assertions, and evidence. Local machine/setup facts are only declared complete after both students verify them; Student B's checks on their laptop (database connections, and pushing then deleting a test branch) are recorded in the comments of Issue #1, which is now closed.
