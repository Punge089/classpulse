# TEST-287 mobile identified answer form

Observed on 28 November 2026 ICT. A/Punge089 authored the test and GitHub Actions ran the isolated verification on PR #99 head c9ff0728a1cdda50430f23701c92d8cb71e7d2e6, tested merge 59b5a638a70098395fb869a9039f0c0971c683d9 against staging 7d543a5. The run used seeded synthetic users.

## Observed behavior

At 375 x 812 Chromium CSS pixels, an owner creates and publishes the survey. A synthetic respondent sees the identified notice before answering. Keyboard submission with the required rating missing produces the real server validation message. Both notice and validation alert stay inside the viewport. The respondent selects a rating using Space and ArrowRight, Tabs to Submit, and presses Enter. The confirmation shows the saved question and is readable after reload. No interception or mock was used for this form path.

## Execution

[CI 46040116779](https://github.com/Punge089/classpulse/actions/runs/46040116779), step Test complete browser suite, listed TEST-287 as 8/16. The full job reported:

| Command | Passed | Failed | Skipped |
| --- | --- | --- | --- |
| npm test in server | 249 | 0 | 0 |
| npm test in client | 16 | 0 | 0 |
| npm run test:e2e -- --reporter=line | 16 | 0 | 0 |

Both application builds and Docker build passed. This is a baseline-green check alongside the TEST-286 list-state work. It supports part of AC-284 and AC-285; it does not cover all forms, details, states, final Sprint 2 or deployment. Exact candidate screen inventory, screenshots, persistence and smoke remain pending.
