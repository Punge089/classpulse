# TEST-285 staged F-06 mobile editor result

Observed in isolated [CI 46042976806](https://github.com/Punge089/classpulse/actions/runs/46042976806). PR #99 head 552abab938f56eb231e02a29b513968e69d492f2; base 4f1f03a; CI checkout 759149270663da1d7a1502808c6bacdcdd63339a.

At 375 × 812 CSS pixels, a synthetic owner created a draft, inspected named edit controls within the viewport, saved an edited question by keyboard, confirmed its stored value, then discarded a second edit using Cancel and return. Reload followed by reopening the editor showed the last saved value. The test directly covers this staged F-06 path and part of F-14 AC-283/285.

| Command | Pass | Fail | Skip |
| --- | --- | --- | --- |
| npm test in server | 282 | 0 | 0 |
| npm test in client | 23 | 0 | 0 |
| npm run test:e2e -- --reporter=line | 18 | 0 | 0 |

Both builds, migrations and Docker passed. TEST-285 staged editor ran as browser test 10/18. This isolated PR check is not final candidate screen coverage or deployment evidence. Current staging has since advanced.
