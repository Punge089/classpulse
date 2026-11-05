# ClassPulse — Issue/PR comment playbook

Every comment for every Issue is pre-written here, in a natural teammate tone. The AI in each
session fills the `{{slots}}` **only from real data**: `git log`, `gh`, saved `evidence/*.txt`
and the checks it actually ran. It shows the finished text, posts it with `gh` once the account
owner says "ok", and moves on. A slot with no real data yet is never guessed: the AI waits for
the event. Human effort is about 1 minute per message.

Who posts: the **owner's** AI posts C1, C2, C4, C5, C6, C8 and C10 from the owner's account.
The **reviewer's** AI posts C3, C7 and C9 from the reviewer's account.

## Tone rules (so it reads like two people, not a bot)

1. Write like a teammate in chat: first person, short sentences, no headings or bold, 2–5 lines.
2. Pick one variant below, then **rephrase it slightly**. Never post the exact same sentence in two
   Issues, and don't open two messages in a row the same way.
3. Address the other person by first name or `@handle`. Say "thanks" or "good catch" only when
   something actually helped.
4. At most one emoji per message, and not in every message.
5. Keep IDs (`AC-22`, `BR-06`) and commit links in the text so the PDF can quote the thread.
6. Small imperfections are fine (lowercase start, "lgtm"). Fake stories are not ("I tested this on
   my phone" when nobody did).
7. Language: English, the same in all Issues. Thai is fine too if both agree. Don't mix within a thread.

---

## A. Message templates with variants

**C1: Issue, owner, when work starts**
- a) `Picking this up now. Branch is {{branch}} — I'll push the contract first ({{ac_range}}) so you can look before I write tests. Should be up around {{eta}}.`
- b) `Starting on this one. Contract → tests → code as usual, working on {{branch}}. Aiming for {{eta}}.`
- c) `On it 👋 contract for {{ac_range}} coming first on {{branch}}, I'll ping you when it's up.`

**C2: Issue, owner, after the contract commit**
- a) `@{{reviewer}} contract is up: {{contract_sha}}. {{ac_count}} ACs ({{ac_range}}), tests planned as {{test_range}}. One thing I'm not fully sure about: {{open_point}} Can you have a look before I start the tests?`
- b) `Contract pushed ({{contract_sha}}). Covers {{ac_range}}. @{{reviewer}} mind checking it? Mainly wondering about this: {{open_point}}`

**C3: Issue, reviewer, before any test is written** (after actually running `contract_check`)
- a) agree: `Read through it. I {{contract_check}} and {{contract_check_result}}. On your question — {{agree_reason}}. Go ahead with the tests 👍`
- b) missing case: `Went over the contract. {{contract_check_result}}, but I think one case is missing: {{case}}. Maybe add it under {{ac_id}}? Rest looks fine to me.`
- c) question: `Looks mostly good ({{contract_check_result}}). Quick question though: {{real_question}}`

**C4: Issue, owner, reply to C3**
- a) changed: `Good point, added it — {{sha}} (v1.1, noted in the version history). Starting the tests now.`
- b) unchanged: `I'd keep it as is: {{reason}}. So no contract change, moving on to tests.`
- c) answer only: `{{answer}}. Thanks, starting tests.`

**C5: Issue, owner, after the red commit**
- a) `Tests are in and failing like they should — {{failed}}/{{total}} red ({{red_sha}}, output saved in {{red_file}}). They fail because {{why_red}}. Writing the code now.`
- b) `Red commit: {{red_sha}}. {{failed}} of {{total}} failing, all for the expected reason ({{why_red}}). Implementation next.`

**C6: PR body, owner** (first lines conversational, then the template checklist)
```
{{one of:
  "This adds {{feature_short}}. Everything from the contract is in, nothing skipped."
  "{{feature_short}} — ready for review. Followed the contract as it was after the v{{contract_version}} change."}}

Closes #{{issue_no}} · {{feature_ids}} · AC {{ac_range}}
Contract {{contract_sha}} → red {{red_sha}} → green {{green_sha}}
`{{cmd}}` → {{passed}} passed, {{failed}} failed, {{skipped}} skipped ({{green_file}})
- [x] contract before code  - [x] no skipped/disabled tests  - [x] no secrets

@{{reviewer}} worth a close look: {{review_focus}}. {{self_review_note}}
```

**C7: PR review, reviewer** (after `gh pr checkout`, running the tests, the `pr_check` and reading the diff)
- a) approve: `Pulled it and ran {{cmd}} → {{passed}} passed, {{failed}} failed, {{skipped}} skipped. Also {{pr_check}}: {{pr_check_result}}. Left one note on {{file}}:{{line}}, not blocking. Approving — {{reason}}.`
- b) request changes: `Suite is green on my machine ({{counts}}), but when I {{pr_check}} I got {{problem}}. Details on {{file}}:{{line}}. Can you fix that before we merge?`
- c) question first: `Ran everything, {{counts}}. {{pr_check_result}}. One question on {{file}}:{{line}} before I approve: {{real_question}}`

Inline comment (on the exact line, written from what was read):
- `Why {{thing}} here instead of {{alternative}}? {{why_asking}}`
- `This is the part that makes {{ac_id}} pass, right? Checked it against {{test_id}} — matches.`
- `Nit: {{small_issue}}. Fine to leave for Sprint 2.`

**C8: PR, owner, one reply per C7 comment**
- a) `Fixed in {{fix_sha}} — {{what_changed}}. Re-ran everything: {{counts}}.`
- b) `I left it on purpose: {{reason}}. Happy to change it if you still think it's worth it.`
- c) `Good question — {{answer}}.`

**C9: PR review, reviewer, after C8**
- a) `Checked {{fix_sha}}, {{result}}. lgtm, merging 🚀`
- b) `Makes sense, {{reason}}. Approving and merging.`

**C10: Issue, owner, after the merge**
- a) `Merged in {{merge_sha}} (#{{pr_no}}). {{ac_range}} all green, traceability updated. Closing.`
- b) `Done ✅ merged to sprint-1-staging ({{merge_sha}}). Closing this one.`

### Tone example (values made up — shows the feel only, never post this)
> **A (C2):** @bee contract is up: 3f2a91c. 9 ACs (AC-20…28), tests planned as TEST-22…32. One thing I'm not fully sure about: I check NOT_ELIGIBLE before SURVEY_NOT_OPEN so a student outside the course never learns the status. Can you have a look before I start the tests?
> **B (C3):** Read through it. I checked that AC-22 has the double-submit case and it does. On your question — agree, 403 first makes sense. Go ahead with the tests 👍
> **A (C5):** Red commit: 8c01d4e. 11 of 11 failing, all because the route doesn't exist yet. Implementation next.

---

## B. Per-Issue values

`{{open_point}}` is a real design decision from the plan, which the owner raises as their own question.
`contract_check` and `pr_check` are what the reviewer's AI must actually **run or read**.
`{{real_question}}` comes from the review guide in plan §4.1 and is used only if it still applies after the check.

| Issue | Owner → Reviewer | Branch slug | Contract / doc | AC / TEST range | `open_point` (C2) |
|---|---|---|---|---|---|
| I-01 | A+B (pair) | — (commit on `main`) | — | — | Only C1 + C10, e.g. "Repo, board and branches are set up, and both laptops connect to classpulse + classpulse_test." |
| I-02 | A → B | `srs` | `docs/srs.md` | FR-01…18, BR-01…14, NFR-01…10 | "BR-07: if an optional question is left blank I just store no Answer row instead of rejecting. Agree?" |
| I-03 | B → A | `system-sds` | `docs/system-sds.md` | role matrix + §2.4/§2.5 | "Another owner's survey returns 404, not 403, so it doesn't reveal the survey exists. OK for the matrix?" |
| I-04 | A → B | `features-trace-plan` | `docs/features.md`, `traceability.md`, `sprints/plan.md` | 42 rows | "NFR-05 shows up twice (Sprint 1 restart, Lab 5 redeploy). Clearer than one row, or confusing?" |
| I-05 | B → A | `foundation` | `SR-01-foundation.md` | AC-50…54 / TEST-50…54 | "Prisma can't generate the rating CHECK, so I added it to migration.sql by hand and noted it in SDS §2." |
| I-06 | A drives → B | `auth` | `F-01-authentication.md` + DoD | AC-01…08 / TEST-01…09 | "An inactive user gets the same INVALID_CREDENTIALS as a wrong password, so nobody can probe accounts. OK?" |
| I-07 | A → B | `survey-authoring` | `F-03-survey-authoring.md` | AC-10…19 / TEST-10…21 | "Creating with 0 questions is a 400 (BR-02), not a draft you can't publish, since draft editing is Sprint 2." |
| I-08 | B → A | `response-submission` | `F-04-response-submission.md` | AC-20…28 / TEST-22…32 | "I check NOT_ELIGIBLE (403) before SURVEY_NOT_OPEN (409), so a student outside the course never learns the status." |
| I-09 | B → A | `summary` | `F-05-aggregate-summary.md` | AC-30…34 / TEST-33…38 | "`Math.round(x*100)/100` gets 4.335 wrong, so I'll use a small decimal-safe rounding helper." |
| I-10 | A → B | `journey-e2e` | `test-results.md`, README | TEST-40 + all | "The journey only uses the fixture accounts, and global setup re-seeds before every run." |
| I-11 | pair; release PR reviewed by the non-opener | `sprint-1-staging → main` | release PR | all Sprint 1 | Release PR body = C6 listing all Issues + integration counts; review = C7 with the release checks below. |

**Reviewer checks** (the AI runs these, then fills C3/C7 with the actual output):

| Issue | `contract_check` (C3) | `pr_check` (C7) |
|---|---|---|
| I-02 | Write one test idea for each of BR-04, BR-06, BR-07; check every NFR row has a target, a method and a sprint | Diff `docs/srs.md` IDs against plan §2.2 (no missing/renamed IDs) |
| I-03 | Map each role-matrix row to a §2.5 route | Compare the ER diagram entities/constraints with §2.4 |
| I-04 | Count matrix rows = 42 | Follow 3 random rows to feature + sprint + AC/TEST |
| I-05 | AC-50…54 each have an STS row | Fresh clone → README steps → `npx vitest run`; `grep CHECK prisma/migrations/*/migration.sql` |
| I-06 | Every AC has a test level and expected result | `curl -i` login → read the `Set-Cookie` flags; logout → reuse the cookie on `/api/auth/me` (expect 401); security-review skill on the diff |
| I-07 | Every invalid input in AC-11 has a row in TEST-11 | `curl` publish on a CLOSED survey → 409 + DB status unchanged; read the ownership `where` clause |
| I-08 | AC-22 includes the simultaneous case | Run TEST-25 5×; submit to the CLOSED seed survey in the UI |
| I-09 | AC-30 example recomputed by hand | Recompute `[4,4,5]` → 4.33; search the summary JSON for `respondentId`/`email`/`fullName` |
| I-10 | — | Fresh clone, README only, full suite; any skipped tests? |
| I-11 | — | All Sprint 1 Issues closed; secret `git grep` empty; PR counts = `evidence/integration-*.txt`; the tag will go on the merge commit |

---

## C. Timeline of the conversation (one feature Issue)

```
owner AI : C1 ─ contract commit ─ C2 ─────────────── C4 ─ red commit ─ C5 ─ green ─ PR+C6 ──────────── C8 ────────── C10
reviewer AI:                          C3 (≤1 h)                                          C7 (≤1 h)          C9+merge
```
If C7 finds nothing real, C7 approves with the checks it ran, and C8/C9 are skipped. A real
problem gets *Request changes* → C8 fix → C9. No problem is ever invented to make the thread look longer.
