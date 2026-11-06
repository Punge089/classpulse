# ClassPulse — rules for AI agents

**If you are working for Student B (`book6349`), read `docs/partner-ai-brief.md` first.** Each AI works only for its own student and never posts as the other.

1. Read `docs/plan.md`: *Global Constraints*, §2 Shared Contracts, §4.1, and **only your Issue** (I-xx = GitHub #xx).
2. Read `docs/comment-playbook.md` for every Issue/PR comment. Fill slots only from real data
   (`git`, `gh`, `evidence/` files, checks you actually ran). Show the text to the human and post it with `gh` only after they say ok.
3. Branch `feature/<n>-<slug>` from the latest `sprint-1-staging`. PRs target `sprint-1-staging`.
4. Order per feature: contract commit → failing tests + saved red output (`docs/sprints/sprint-1/evidence/`) → implementation → green output.
5. After the contract commit (C2), wait for the reviewer's C3 before writing tests.
6. Never skip, disable, `.only` or weaken a test. Report failures honestly.
7. Never merge your own PR, never approve your own PR, never squash-merge.
8. Never commit `.env`, real passwords or tokens. Synthetic data only (`@classpulse.test`).
9. Touch only the files your Issue lists under *Files* (Create/Modify).
10. Authorization lives on the backend. UI hiding is not access control.
11. Identified surveys are never called "anonymous".
12. Stack: Express + TypeScript + Prisma + PostgreSQL, React + Vite + Bootstrap, Vitest + Supertest, Playwright.
13. Before saying "done", run the tests and show the counts. Evidence, not claims.
