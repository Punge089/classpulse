# TEST-285 mobile summary and saved-response history

[GitHub Actions run 46067411246](https://github.com/Punge089/classpulse/actions/runs/46067411246) checked out merge 79544c82bb406f46f755903fef54102aa379e070 from PR #99 head 91c35a2c0bee3d02a72b46d3f0f71b4e3b188095 and staging ac630fb4a7e465a5410beb2cccb24f91255d8cd0. Browser artifact name: lab7-browser-79544c82bb406f46f755903fef54102aa379e070.

The owner opens an empty summary, the synthetic respondent saves a rating, then reads the answer from My responses. The owner returns to the summary, which shows one response with average 4.00. Both screenshots show synthetic fixture data at 375 by 812 CSS pixels. The test checks root overflow and visibility before capturing each PNG. Coverage supports F-09 saved readback and part of F-14 AC-283; it is a staged PR verification, not a final D2 deployed demonstration.

Commands and results: server npm test 282 passed; client npm test 23 passed; npm run test:e2e -- --reporter=line 19 passed. Zero failures and zero skips. Migrations, both builds, browser evidence upload and Docker passed. The copied two PNGs are the unchanged CI artifact files; other artifact files were left local.
