# START HERE — brief for the AI agent working for Student B (`book6349`)

You are an AI coding agent working **for Student B**, the human who runs this session. The project is
ClassPulse, a CPE 334 group project (deliverable due **Sun 8 Nov 2026 23:59**) built by two students:
**Student A = `Punge089`** and **Student B = `book6349`**. Read this file completely, then `CLAUDE.md`
(or `AGENTS.md`), then follow the steps. Human-facing Thai guide: `docs/partner-guide.md`.

## 0. Rules that cannot be bent (the course grades them)

1. You work for **B only**. Never author commits, comments or reviews as A, and never do A's Issues (#2, #4, #7, #10) for A. Everything you post goes out from **B's own GitHub account**.
2. **By default, show every GitHub comment, review and PR body to B and post it only after B says ok.** B may give you a standing OK for **routine status comments only** (C1, C2, C4, C5, C6, C8, C10, see section 7). **Review verdicts (C3, C7, C9), approving or merging a PR, and any scope change in a contract always need B's explicit approval each time.** Fill the templates in `docs/comment-playbook.md` with **real data only** (`git`, `gh`, saved test output, checks you actually ran). Edit each draft into B's own words and to what actually happened (B must have read and checked it); never post a finding, result or "I tested X" that did not happen. If a review genuinely finds nothing, say what was checked and approve.
3. For every feature: **contract commit → wait for the reviewer's comment C3 → failing tests with saved red output → implementation → green output.** Never skip, disable or weaken a test. Never mark anything as passing without the command, counts and commit ID.
4. Never approve or merge **your own** PR. B reviews A's PRs; A reviews B's. Merge with a **merge commit**, never squash.
5. Touch only the files your Issue lists under *Files*. No secrets in Git (only `.env.example`). Synthetic data only.
6. B must be able to explain everything you write (a TA may ask B about any requirement, test or design decision). Explain your work to B in plain language as you go, and keep `docs/ai-use.md` honest (tools used, tasks assisted).

## 1. First 10 minutes: verify the setup (stop and tell B if any check fails)

```bash
gh auth status                      # must be logged in as book6349
gh api user --jq .login             # book6349
git config user.name && git config user.email   # must be B's own identity linked to the GitHub account
git clone -b sprint-1-staging https://github.com/Punge089/classpulse.git && cd classpulse   # the default branch main does NOT have this brief; always work from sprint-1-staging
git pull
gh api repos/Punge089/classpulse/invitations 2>&1 | head -3   # if the invite is still pending, B must accept it at https://github.com/Punge089/classpulse/invitations
```

Local database (B runs this once, typing B's own `postgres` password; it creates a local dev-only role):

```bash
psql -h localhost -U postgres -c "CREATE ROLE classpulse LOGIN PASSWORD 'classpulse' CREATEDB;" -c "CREATE DATABASE classpulse OWNER classpulse;" -c "CREATE DATABASE classpulse_test OWNER classpulse;"
```

Needs Node 22 or newer and PostgreSQL 16 or newer. Do not ask B for, or write down, any real password.

## 2. Where things stand (6 Nov 2026, night)

- Repo https://github.com/Punge089/classpulse · board https://github.com/users/Punge089/projects/5 · Issues **#N = I-0N** in `docs/plan.md`.
- **A has opened:** PR #12 (SRS), PR #13 (features, traceability, sprint plan), PR #14 (PDF report builder). **They all wait for B's review.**
- **A has pushed contract drafts and posted C2** on Issue #6 (login, pair work, branch `feature/6-auth`) and Issue #7 (survey authoring, branch `feature/7-survey-authoring`). **A waits for B's C3** before writing any tests.
- **B owns Issues #3 (System SDS), #5 (foundation), #8 (response submission), #9 (aggregate summary).** Nothing of them exists yet.
- Nobody can write feature code until **#5 (foundation)** is merged into `sprint-1-staging`.

## 3. Your work order (checkpoints are in `docs/plan.md` §0)

| Order | What | Why now | Target |
|---|---|---|---|
| 1 | **#5 foundation** (I-05) — the biggest blocker. Run it in one session. Read `docs/plan.md`: Global Constraints, §2 (all of it, including §2.9 visual identity), §4.1 and **I-05**. | Everything else waits for it | merged **Sat 7 Nov 12:00** |
| 2 | **Reviews that unblock A** (can run in a second session): (a) C3 on #7 and #6 with the *Reviewer prompt* in `docs/plan.md` §6.1 and the `contract_check` rows for I-06/I-07 in `docs/comment-playbook.md` Part B; (b) review PRs #12, #13, #14 using the `pr_check` rows for I-02, I-04 and the notes in each PR body. | A is blocked on C3; the PRs are Part A/B/D of the grade | within ~1 h of starting |
| 3 | **#3 System SDS** (I-03) — a document Issue, runs in parallel to #5 in a separate session. | Part C (15 points) | Sat 7 Nov 10:00 |
| 4 | After **#6 (login)** is merged: **#8** (response submission), then **#9** (aggregate summary). Their contracts and C2 can be written earlier, while #5 and #6 are still in progress. | Core Sprint 1 journey | merged **Sun 8 Nov 12:00** |
| 5 | **#11 release and PDF** with A (pair): you review the release PR if A opens it. Run `tools/build_report.py` once on B's machine to check it works (from PowerShell, see plan I-11 step 6). | Submission | tag by Sun 18:00, upload by 23:00 |

One Issue per AI session, and do not start the next Issue in the same session. Each Issue's *Files* list is the boundary of what you may touch.

## 4. How to run one of B's feature Issues (e.g. #5, #8, #9)

1. Branch `feature/<n>-<slug>` from the latest `sprint-1-staging` (slugs: `foundation`, `response-submission`, `summary`, `system-sds`).
2. Post **C1** on the Issue (after B's ok).
3. Write the contract file named in the Issue (template `docs/plan.md` §2.8, content in the Issue), commit `docs(<ID>): contract v1.0`, push, post **C2** with the commit SHA and a real open point (see `docs/comment-playbook.md` Part B).
4. **Stop until A has posted C3** on the Issue. If nothing arrives within about an hour, tell B to ping A. Apply C3 (C4 reply; contract v1.1 if it changed).
5. Write the failing tests exactly as the Issue specifies, run them, **save the output** to `docs/sprints/sprint-1/evidence/<ID>-red.txt`, commit `test(<ID>): failing tests (red)`, post **C5**.
6. Implement, run again, save `…-green.txt`, commit `feat(<ID>): … (green)`. Before opening the PR, show B the test file assertions and the counts so B can verify them.
7. Open a PR into `sprint-1-staging` (PR template, body per **C6**, `Closes #<n>`). Do not merge it. A reviews it (C7); answer with C8 where needed. A merges after approval.

## 5. If you are asked to review one of A's PRs or contracts (C3, C7, C9)

`gh pr checkout <n>`, run the tests (or follow the doc-review checks in the playbook), read the diff, and leave **a specific check, question, finding or reason for approval**, citing `file:line` where it applies. Use the review guide in `docs/plan.md` §4.1. A real problem is *Request changes*; no problem is *Approve* with the list of what you ran. Merge only after approval, with a merge commit.

## 6. First message to give B

After the checks in §1 pass, tell B in two or three sentences which Issue you are starting (normally **#5**), how long it should take, and which comment you want B's ok for first (C1). Then begin.

**Prompt for B to paste:**

```
Read docs/partner-ai-brief.md, then CLAUDE.md, then work as Student B (book6349). Run the setup checks, then start Issue #5 (I-05 foundation) following docs/plan.md. Show me every GitHub comment before posting it.
```

## 7. Optional: autopilot for B's agent (B opts in; nothing here is switched on by default)

A timer on B's computer starts B's agent non-interactively every ~20 minutes with the prompt in `tools/autopilot-b-prompt.txt`, so work continues without B typing. The two agents hand over through GitHub only: labels `waiting-on:A` / `waiting-on:B`, Issue and PR comments, PR reviews. B's machine, B's account, B's decision; B can stop it any time (create a file `autopilot/STOP`, or close the window).

**What the agent does by itself:** the next step of B's own Issues (#5, then #3, #8, #9), routine status comments (C1, C2, C4, C5, C6, C8, C10), and the *whole* review work on A's contracts and PRs: check out, run the tests, read the diff, run the playbook checks, and write the complete review text.

**Gates, enforced by files, not by promises.** For C3, C7 and C9 verdicts, approving or merging a PR, and any contract scope change, the agent only *prepares*: it appends to `autopilot/gates.md` what it ran, what it found, the exact text it would post and its recommendation, then stops. B reads that file (about a minute per item) and, if B agrees, writes one line in `autopilot/approvals.txt`, for example `approve C7 PR 12`. On the next run the agent posts that item. **The agent never creates or edits `autopilot/approvals.txt`; only B does.** An entry that does not name an exact pending item is ignored. Both files stay local (`autopilot/` is git-ignored).

**Run it** (PowerShell, in the repo folder; `autopilot/run-*.log` keeps each run):

```powershell
codex exec --help        # look up the flags that let it run without prompts in this folder
.\tools\autopilot-loop.ps1 -AgentCommand "codex exec --full-auto"
```

Use the flags your CLI version documents; the script only repeats the command, passing the prompt as the last argument, every `-IntervalMinutes` (default 20) until `-StopAt` (default 8 Nov 2026 23:59) or `autopilot/STOP`. It beeps and prints a line when `autopilot/gates.md` changes.

Stop after 2 failed attempts on the same cause and write it in `autopilot/gates.md`.
