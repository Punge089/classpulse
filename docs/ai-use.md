# AI-use declaration - ClassPulse

## Lab 5 and Sprint 2 — Student A, 11 November 2026

Student A (`Punge089`) switched to OpenAI Codex (GPT-6) and authorized it to work through A's account. Codex verified the account and Git identity, installed dependencies, generated the local Prisma client, ran the backend suite, created A's Lab 5 Issues and drafted the shared agent rules. A set the scope and retains responsibility. The local digest records what the agent actually did for A to read afterwards.

Under this authorization Codex may write contracts, tests, implementation and comments. On B's changes it may check the contract or check out the PR, run the tests and Issue checks, read the diff, post a verdict and merge an approved PR with green CI. These actions can take place without A reading each message or deciding each verdict in advance. The GitHub review, check and merge records identify which actions occurred. B reviews A's PRs from B's account. B documents their own AI use. Human-only cloud, credential, GitHub settings and submission work stays with the students.

On 12 November A explicitly authorized one exception for GitHub main-branch protection. Codex configured the `main-reviewed-ci` ruleset through A's signed-in browser; A personally completed GitHub's Confirm access authentication. Codex verified the active rules through the API and ran the contract-approved C-02 failing-test demonstration. B reviewed and approved that operational demonstration, then A's Codex captured the remaining failed required-check blocker and closed the demonstration PR unmerged. This settings and evidence work was AI-assisted. The remaining cloud, credential, environment and submission gates retain their earlier human-only boundary.

## Lab 5 browser setup and live checks - Student A, 13-14 November 2026

A subsequently gave specific browser-action authorizations for Artifact Registry setup, the runtime service account and its three intended permissions, and the GitHub `demo` environment. Codex enabled the required APIs, created the `classpulse` registry repository, prepared the PostgreSQL instance form, created the empty `classpulse` application database during the requested setup continuation, and created `classpulse-runner`. A entered the PostgreSQL administrator password and submitted instance creation personally. A also entered and submitted the application-user and Secret Manager values privately; Codex prepared their nonsecret names and settings. These cloud preparation actions were AI-assisted rather than all performed manually by A.

The intended runtime IAM grants could not be applied from A's Editor account. Codex reported the missing permission and supplied the narrow commands; B reported applying and reading back the grants as project owner in [the release handoff](https://github.com/Punge089/classpulse/pull/44#issuecomment-6857109052). Codex did not broaden A's access or create a key. B's own declaration governs which of B's subsequent setup actions were human- or agent-operated; this section does not invent that distinction.

With A's explicit approval, Codex created GitHub environment `demo`, restricted it to branch `main` with no tag rule, and entered the four nonsecret project/region/WIF identifiers. It verified those settings through GitHub API readbacks. A did not personally click every environment setting. Codex inspected provider conditions, resource-scoped deployer roles, runtime identities and key-list metadata without reading credential values. The initial manual Cloud Run bootstrap preceded the main release; it was recorded separately and was not presented as the main-triggered C-06 result.

A temporary local helper assembled the database connection URL from a password that A entered in the browser. It encoded the password locally and copied the URL after A clicked; it did not send the password to the helper server or store it in a file. Codex did not read that input or the clipboard. A pasted and submitted the value privately, after which the helper was closed and its server stopped. Later database-password rotation and secret version 2 were reported by B; A's agent inspected references and metadata only.

Codex reviewed release readiness and marked A-authored [PR #44](https://github.com/Punge089/classpulse/pull/44) ready after actual checks. It did not approve or merge that PR. B's account merged it, and the main workflow deployed the accepted merge. Codex verified [run 43475436003](https://github.com/Punge089/classpulse/actions/runs/43475436003), ran the public read-only smoke checks, and matched the accepted main tag to the serving image digest and revision. Repository actions and their review/merge authors remain visible in GitHub; they are not described as human decisions where the agent made them under standing authorization.

For the live application checks, A privately signed in to the seeded synthetic accounts. Codex then operated the owner/respondent UI, created and published a synthetic survey, chose and submitted synthetic answers, verified duplicate rejection and backend role denial, and checked the owner aggregates. It also added clearly labelled classroom demo surveys at A's request. These are generated demonstration data, not feedback from real students. Codex collected the screenshots and local observation records. B reviewed the baseline/restart figures in PR #57; the remaining C-04 validation/access figures and final report review are separate outstanding work. After A requested browser-only background work, Codex stopped native mouse/keyboard and foreground-tab control.

These exceptions do not grant general authority for future cloud mutations, credentials, IAM, GitHub settings or submission actions. At that earlier checkpoint the C-05 restart had not run and was assigned to a human under the existing contract; the later agent-executed exception is recorded below. A remains responsible for understanding and checking the evidence, and both students must review the final report before a human submits it to LEB2.

## C-05 same-image restart exception - Student A, 14 November 2026

After Codex had prepared the guarded restart script and explained the human-only boundary, A directly asked it to control the browser and perform that step. Codex treated this as a specific session override for that restart and executed the existing script through A's signed-in Google Cloud Shell as `punge089@gmail.com`. This was an agent-executed cloud mutation, not a command personally run by A or B. It does not authorize unrelated cloud, IAM, credential or GitHub-setting changes. The original script and contract predated the operation; no new teammate C3 approval of this actor exception is claimed.

The script checked the expected live revision and image digest before changing only `LAB5_RESTART`. Cloud Run created `classpulse-00003-5jd` from `classpulse-00002-54d`, kept digest `sha256:8b5d63ae5e29b373601908b0f0be9817461de8db466d8bf27f0a3b15288a6c09`, and directed 100% of traffic to the new revision. The accepted source remained main `a63719dd823dd77c86fbf187b4bc6663b4e07d8b`; this was not the separately reviewed redeployment. Codex recorded the actual actor and result in [Issue #32](https://github.com/Punge089/classpulse/issues/32#issuecomment-6873806997). A browser disconnect and later Cloud Shell session transfer required recovery; the mutation was not rerun after the result became uncertain.

A privately signed in again to the synthetic owner and respondent accounts. Codex then used browser DOM controls to reread survey 2, its owner summary, and response 1. The original Published survey, three questions, ratings 4/5, Cloud deployment choice, response count 1 and averages 4.00/5.00 remained present. Codex saved screenshots and ran four passing public read-only smoke checks. It did not read passwords, session cookies, tokens, keys or secret values, or submit another response. B reviewed and approved the restart record and its six before/after figures in [PR #57](https://github.com/Punge089/classpulse/pull/57) at `ba5f11f` before merging it at `f6caa69`. That restart review is complete; the separately reviewed main redeployment, compatible rollback/forward observations and final C-05 acceptance remain pending.

The related disclosure [PR #56](https://github.com/Punge089/classpulse/pull/56) was merged at `ff85b14` on 14 November at 08:07:29 UTC; B's formal approval of `5db25b7` was recorded afterwards at 08:10:13 UTC. B reports the initial review submission failed validation. The later approval does not establish approval before that merge. Release PR #58 therefore requires B's fresh review and approval of its actual updated head before merge, with green required CI; the earlier history is preserved rather than rewritten.

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
