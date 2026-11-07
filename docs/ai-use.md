# AI-use declaration — ClassPulse (Deliverable 1)

**Draft 6 Nov 2026. Each student confirms and completes their own part before the report is built (every `TODO` must be replaced).**

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
| Reviews | Ran the review checks on the checked-out PR and drafted the review | The reviewing student read the diff and tests, and decided approve or request changes. Student B confirms for reviews posted from B's account: read the diff, ran the required checks, and verified claims before deciding the verdict; Student B showed each draft verdict to Student A before submission; Student B retained responsibility for the final decision. |
| Report (PDF) | `tools/build_report.py` assembles the documents into the PDF | Students filled names, IDs, evidence and screenshots |

## Responsibility

All AI output was inspected before it was accepted; tests were run by the student who owns the Issue and the counts were checked. Each student can explain the requirements, tests and design decisions they own. At the time of Punge089's review of `c22da58`, 0 of 41 commits across the repository's branches had a `Co-Authored-By` trailer; this included the AI-assisted baseline commit (`2fa7ae0`). Pair-work commits going forward will carry the required trailer.

## Known limits of this declaration

Student B: AI-generated drafts and code can contain mistakes, so B checked owned code, test assertions, and evidence. Local machine/setup facts are only declared complete after both students verify them; Issue #1 remains open until its remaining checks are complete.
