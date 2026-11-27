# F-14 TEST-285 first baseline execution

Issue #98 and PR #99. B's existing [C3](https://github.com/Punge089/classpulse/issues/98#issuecomment-7159684729) precedes the cases. This is an executed subset of AC-283 and the keyboard/controls portion of AC-285.

- [CI 45994788683](https://github.com/Punge089/classpulse/actions/runs/45994788683) evaluated feature head `26d02b9adcc7f02a74d8492b46dfc3f48f7fb1c1`, base `5fe00fd3e065cc6fb0cb1edd0aaf80ae5bfbd347` and the pull-request checkout `4c6bc90def379993b95fdb96c1d4d7f8ca1817ca`.
- `npm test` in server: 239 passed. `npm test` in client: 16 passed. Root `npm run test:e2e -- --reporter=line`: 13 passed, including the two new TEST-285 cases. Zero tests failed or were skipped. Builds and Docker passed.
- Chromium exercised the login and owner draft form at 375×812 and 1280×812 using synthetic accounts and the workflow's disposable app and PostgreSQL instances. Named controls were inside the viewport, root overflow stayed within 1 CSS pixel, sign-in submitted by keyboard and the saved draft heading was present after reload.
- Endpoint timing and the remaining routes, states and screenshot inventory are pending. This baseline demonstrates the selected viewport behavior on an existing journey. No product changes or deadline-candidate readiness follow from it. The runner noted the existing upload-artifact Node 20 deprecation; it did not fail or skip a step.

Selected original workflow lines, with formatting removed:

```text
test-and-docker	Check out source	2026-11-27T11:58:59.3095065Z 4c6bc90def379993b95fdb96c1d4d7f8ca1817ca
test-and-docker	Test server	2026-11-27T11:59:41.6740663Z       Tests  239 passed (239)
test-and-docker	Test client	2026-11-27T11:59:43.5472879Z       Tests  16 passed (16)
test-and-docker	Test complete browser suite	2026-11-27T12:00:05.9968482Z [4/13] hardening.spec.ts:22:7 › TEST-285 owner can sign in and save a long titled draft at 375px
test-and-docker	Test complete browser suite	2026-11-27T12:00:07.0384886Z [5/13] hardening.spec.ts:22:7 › TEST-285 owner can sign in and save a long titled draft at 1280px
test-and-docker	Test complete browser suite	2026-11-27T12:00:24.0184463Z   13 passed (22.4s)
```
