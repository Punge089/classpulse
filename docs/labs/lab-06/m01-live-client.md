# Live M01 client - Issue 127

This standalone evidence utility implements the existing F-01 AC-04 and reviewed [M01 method](final-acceptance-readiness.md#proposed-independent-verification-method-m01--awaiting-agreement). It adds no application feature or endpoint and does not change the contract. User authorization on 27 November permits C/D's AI to operate the test independently using authorized synthetic access; human-only operation is no longer a user requirement. Name the actual operator/model honestly. A's execution cannot count as C/D's independent UAT.

## Review and version gates

B must review the exact executable SHA/file hash and actual offline checks before C/D uses it live. Before that review this is a review candidate, not an approved tester. Do not infer approval from a prior documentation review or this page. No merge into main or app deployment is needed to execute the standalone reviewed file. Keep the pinned ClassPulse release coordinated through completion; further Workflow testing is separate.

Application target is CP-FIX-001 source `bee0d122bf23410e3d2db69649ad5e44959b6cd8`, revision `classpulse-00007-6t9`, runtime manifest `sha256:e00257d3b1c9cfdaabbe9b3f1d238c1d26fb342665f80122dcddc4550bc4388d`, traffic100%. The tool's own feature commit/hash is separate from this deployed source. Each result calculates its actual client-file SHA256. Match it to B's reviewed file/package; do not execute a subsequently changed file under an older approval.

## Requirements and private access

Python3.10+ with standard library; no npm install, local app, database, cloud credentials or admin tools. Only the normal authorized `student1@classpulse.test` RESPONDENT account is accepted. Use C/D's existing private synthetic access source. Do not publish credentials or place passwords/tokens in CLI arguments, source, reports or messages.

For unattended AI operation, use an existing private JSON file containing exactly the synthetic account's `email` and `password` fields, or an already privately configured `CLASSPULSE_UAT_PASSWORD` environment variable. The utility reads it and never writes it. The private JSON is **not part of the outgoing evidence/package**. It must not be a production connection string or unrelated secret file. If the tester's existing secret storage has another format, use its permitted private loading mechanism; never paste values into the group/AI output or a shell command. Hidden interactive input is a fallback, not a required human step.

No password argument is accepted. The executable is restricted to the fixed ClassPulse HTTPS origin and four auth/health endpoints. TLS verification stays enabled, redirects are not followed, responses/timeouts are bounded and raw exception text is suppressed. Only temporary normal login/logout sessions are affected. No survey/request, database row manipulation, reset, clock/TTL, cloud setting or deployment action is performed.

## Supplied release record

Use the accompanying `release-verification.json` supplied by A. Required fields are `sourceCommit`, `revision`, `runtimeManifestDigest`, `trafficPercent`, `serviceOrigin`, `releaseHoldThroughFinish: true`, and `verifiedAtBangkok` with the actual UTC+7 confirmation time. They must match the pinned target. Source/revision are not inferred from health200. Do not update the timestamp yourself or invent a fresh mapping.

The release hold remains in effect through the tester's finish; use the latest A-confirmed mapping. The client reports its supplied timestamp and the limits of HTTP-only observation. A must perform the post-run serving verification; that can be returned after the actual JSON result. An HTTP PASS is not itself a Cloud source/traffic readback or whole-product acceptance.

## Run as the independent C/D operator

After B's exact-file review, record the real start notice in the agreed LAB6 channel. Then run from the extracted review package or exact reviewed checkout. Replace the private path and model label with the tester's actual values; never insert a secret value in the command.

```powershell
python tools/uat/m01_live_check.py --release-record release-verification.json --credentials-file C:/private/student1.json --operator "Thira D / EN-037_P5" --operator-kind ai --model "ACTUAL_MODEL_NAME" --output M01-live-result.json
```

If using an already privately configured environment variable, omit `--credentials-file`. For actual human operation use `--operator-kind human`; do not call AI execution human merely because a student owns the account. Choose a new output filename for each attempt: existing evidence is never overwritten. No scheduled slot is needed once current version/access and B's executable approval are confirmed.

The client performs, without revealing session values:

1. Public health200; normal synthetic login200.
2. Keeps exactly one `cp_session` pair only in process memory; identity200 must match that login and RESPONDENT role.
3. Normal logout204 using that session. Parses the response in memory to verify an empty `cp_session` with Max-Age0 or an expired clearing directive.
4. Sends **the exact same pre-logout pair once**, explicitly on a new `/api/auth/me` request. Expects401 with only the standard `UNAUTHENTICATED` error and no user data.
5. Public health200; record actual finish. If an earlier step stops before logout, attempt one normal cleanup logout without emitting secrets.

The client does not merely trust a browser-cleared cookie jar. It does not inspect production Session rows; the previously supplied local deletion evidence retains its separate scope. It does not test natural eight-hour expiry, password storage or other criteria.

## Return only sanitized evidence

Return `M01-live-result.json` and actual start/finish notice. It records source/revision/digest/traffic **as A-supplied**, confirmation time, actual operator/model/Python version/client hash, request observation times/statuses and booleans for matching identity, clearing, exact old-cookie use and error-only rejection. No user response object, credential, token value/fingerprint, raw cookie/auth header, HAR or browser storage dump belongs in evidence. A later verifies the serving version; C reviews the actual evidence and D issues the independent decision.

Exit0/PASS means the observed protocol assertions passed, not final acceptance or a production DB inspection. Exit1/FAIL records a measured mismatch. Exit2/BLOCKED records genuinely unavailable access/network/local prerequisites; do not relabel it PASS or claim automation guarantees success. Preserve failed attempts and precise non-secret circumstances. A repeated attempt uses a new normal test session and a new output file, not the old Edge capture's lost session.

## A/B offline verification

```powershell
python -m unittest discover -s tools/uat -p test_m01_live_check.py -v
```

These fake-transport tests verify utility behavior/privacy/guards and use no application, real password, network, Cloud or database. Their results are **not ClassPulse UAT PASS**. The existing mandatory PR CI still checks application/build compatibility; its workflow does not run the Python utility suite, so B also runs this command locally. No tests were disabled, focused or weakened.

Assistance: A/Punge089 with Codex GPT-6 implemented this utility and its offline validation. B exact-code review and C/D independent execution remain separately attributable and pending until their actual records exist.
