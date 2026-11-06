# AI-use declaration — ClassPulse (Deliverable 1)

**Draft 6 Nov 2026. Each student confirms and completes their own part before the report is built (every `TODO` must be replaced).**

## Tools

| Student | AI tools | Notes |
|---|---|---|
| Student A (`Punge089`) | Claude Code (Claude Opus 5.5 for planning, Claude Sonnet 5.5 afterwards) | Used in the Claude desktop app on A's computer |
| Student B (`book6349`) | TODO tool and model | TODO |

## Tasks assisted by AI

| Area | What the AI did | What the student did |
|---|---|---|
| Planning (`docs/plan.md`, `docs/design.md`) | Read the course specifications, proposed the product, the Issue split, the registry of requirements, data model and API; drafted the plan | A delegated the choice of context to the AI ("choose what best"), picked the work split, asked for the changes in the plan, and approved the plan |
| Documents (SRS, features, traceability, sprint plan, SDS, contracts) | Drafted the text from the plan registry; generated tables from plan data | The author of each Issue read it, edited it, and the other student reviewed it in a PR (TODO: B confirms for the SDS and B's contracts) |
| Code and tests | Wrote tests and implementation from the committed contract, ran them, saved the red and green output | The author read the test assertions and the output before opening the PR |
| Issue and PR comments | Drafted comments from the templates in `docs/comment-playbook.md`, filled only with real data (commits, test counts, checks that were run) | The student whose account posted it read and checked every claim, edited it, and posted it from their own account (TODO: each student confirms this is how it happened for their comments) |
| Reviews | Ran the review checks on the checked-out PR and drafted the review | The reviewing student read the diff and tests, and decided approve or request changes (TODO: confirm per PR) |
| Report (PDF) | `tools/build_report.py` assembles the documents into the PDF | Students filled names, IDs, evidence and screenshots |

## Responsibility

All AI output was inspected before it was accepted; tests were run by the student who owns the Issue and the counts were checked. Each student can explain the requirements, tests and design decisions they own. Commits that an AI helped write carry a `Co-Authored-By` trailer; the first repository commit (`2fa7ae0`) was made without one and was AI-assisted.

## Known limits of this declaration

TODO each student adds anything not covered above (for example, tasks done without AI, or any comment posted without checking it first).
