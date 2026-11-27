# F-14 TEST-286 mobile list states

[CI 46000029026](https://github.com/Punge089/classpulse/actions/runs/46000029026) tested checkout `3b75e8705ac1156d695e729b3a80ca0136d0532b` for feature head `9411c6d` on staging `7d543a5`. Server/client npm test passed 249/16, and npm run test:e2e -- --reporter=line passed 15 including both new TEST-286 cases. Zero failures or skips; builds and Docker passed.

Playwright authenticated actual synthetic owner and respondent accounts, then controlled each list API so loading could be observed before a successful empty response, followed by a 503 after reload. It verified visible and bounded loading/empty/error states at 375 CSS px, including that no empty message appears while pending or after failure. The list response states in these cases are simulated; live permission checks are covered separately. The remaining full-candidate screen inventory is open.

```text
test-and-docker	Check out source	2026-11-27T12:36:43.6868148Z 3b75e8705ac1156d695e729b3a80ca0136d0532b
test-and-docker	Test server	2026-11-27T12:37:34.4811911Z       Tests  249 passed (249)
test-and-docker	Test client	2026-11-27T12:37:36.8896982Z       Tests  16 passed (16)
test-and-docker	Test complete browser suite	2026-11-27T12:38:04.0849862Z [6/15] hardening.spec.ts:72:7 › TEST-286 owner list presents loading, empty and API failure at 375px
test-and-docker	Test complete browser suite	2026-11-27T12:38:04.9377179Z [7/15] hardening.spec.ts:72:7 › TEST-286 respondent list presents loading, empty and API failure at 375px
test-and-docker	Test complete browser suite	2026-11-27T12:38:23.6587772Z   15 passed (27.1s)
```
