# F-12 identified export API verification

- Test-only source `a819fbf`, CI 46058262944, checkout `84f9f69`. Server `npm test` reported 272 passed and two expected 404 failures, zero skipped tests and eight skipped workflow steps. The tests expected a 200 CSV response for persisted rows and 400 JSON for an extra query parameter.
- With F-07 in staging at `bd77c46829d78dd983a8abed892fc79de3570c91`, B confirmed use of the already scoped owner-summary router in PR #139 comment 7233731889. The original API assertions remained byte-identical.
- Source `06b165632bec7a19a075658a8496b6a665625b4d`. [CI 46108677062](https://github.com/Punge089/classpulse/actions/runs/46108677062) tested checkout `404ac5f2cd3ae823f7814f0bfd4d3c1e13bcb628`. Server `npm test` passed 296 including both unchanged API tests. Client `npm test` passed 27, and complete browser suite passed 13. Zero failures or skipped tests. Migrations, builds and Docker passed.
- A independently ran server `npm test` with a disposable PostgreSQL database on a loopback port against the same source code before committing. It passed 296, including the two F-12 tests, with zero failures/skips. The tests verify two real stored responses, owner CSV contents, private/no-store, role/ownership denials and unchanged response count, plus JSON for an unexpected query parameter.
- This checkpoint tests the identified rating/single-choice API and existing browser regressions. TEST-247 browser download/retry and later answer types/anonymous export have separate verification.

## Browser test-only RED

Source `53df47cdd88259b5f4edcf5d4bdb960b6fe29867`, staging `bd77c46`. [CI 46108850322](https://github.com/Punge089/classpulse/actions/runs/46108850322) tested `8a997eac24aa41bb4075b7694c5abe06476cb24d`. The real owner created and published a synthetic identified rating survey, the enrolled respondent submitted, and the summary displayed one saved response. TEST-247 then failed as expected because the respondent-identity notice and download control were absent. Full browser suite 13 passed, 1 expected failure, 0 test skips; 2 downstream steps skipped. Trace artifact ID 15248329267.
