# R3 baseline result review and conditional Part D gate

Issue111. A/Punge089 with Codex GPT-6 reviewed C/D run `UAT6-20261125-CodexD-R3`, **25Nov2026 21:39-21:44 Bangkok**, actual operator **Codex GPT-6 under Thira/D**. This is artifact/source review, not A live execution. [Received report/results](../../../evidence/lab-06/r3-baseline-20261125/README.md), [assessment](../../../evidence/lab-06/r3-baseline-20261125/a-review.json). Partner PR75 at `2f8581d70570e50ba5c375c14d40c11d9899c2d5` was OPEN at receipt; Ashira's own review remains pending. A reviewer request or osizk repository metadata does not establish C's actual contribution.

## Version, coordination and scope

All R3 live paths report CP-V01 source `1fe3e3b82dfb0537be30223c9b598b3479b4affe`, revision `classpulse-00006-6w6`,100% traffic, digest `sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795`. Mapping basis: A's25Nov21:15:48readonly CloudConsole observation and prior source mapping for the identical immutable digest. C/D independently observed origin/asset `/assets/index-Bi1ZvEdG.js` and health200 at21:37:53.211/21:43:56.976Bangkok. No new C/D cloud mapping or continuous-version proof is inferred. The public post check precedes final cleanup at21:44:25/26. Source/revision on future exercise releases must be independently recorded rather than reusing this baseline metadata.

C/D reports the private start notice posted/verified21:39; A received that assertion through the report, not a new private-DM observation. Proposed26/27Nov slots remain unbooked; B human availability remains unconfirmed. Raw timestamps and notice attribution are retained without retroactive inference.

## Actual branch dispositions

| Branch | Received evidence and disposition |
|---|---|
| CD06 anonymous PUT | **Scoped PASS.** Separate signed-out context identity401; PUT{} to response16 at21:43:39.770 returned401 UNAUTHENTICATED. |
| CD06 anonymous DELETE | **Scoped PASS.** DELETE response16 at21:43:40.062 returned401 UNAUTHENTICATED. Both methods have exact before/after response and aggregate equality. This is not a full malicious-edit matrix or full error-envelope capture. |
| UAT07 respondent reload | **Scoped PASS.** Before/after roleRESPONDENT, route/surveys, headingAvailable surveys and identity200; then logout204 and login-routeidentity401. JSON uses syntheticIdentity booleans; the exact same-person assertion is narrative-supported rather than an exposed pair of user IDs. |
| CD01 live cookie attributes/clearing | **Scoped PASS.** Dedicated HTTPS login200/logout204. Recorded HttpOnly/SameSiteLax/Secure/pathRoot true for login/logout; expiry metadata present; clearingDirective false on login/true on logout. No raw value/header is published. Clearing metadata is not proof of server-side invalidation. |
| CD01 live old-session replay | **BLOCKED.** No old-cookie request/result was recorded. The provided explanation describes ordinary browser logout and local TEST04 support; it does not specify the technical reason live replay could not be attempted. Request that reason or a safe independent replay result. Do not upgrade this to PASS. |

Three named live branch groups passed, including two separately recorded anonymous methods; one named live replay branch remains BLOCKED. Do not describe this as five complete cases or whole-CD01 completion. Survey27/response16 are new retained synthetic records (4/Online,count1,average4.00); response ID, submission time, question64/65 answers, rating distribution and choice counts are exactly equal before/after. The preserved survey26 readback remains count3/average4.33/Online3/In person0 with responses13-15 reported retained. No account/enrollment/cloud changes are reported; A performed no database inspection in this review.

## Existing support and remaining limits

The newly received earlier verbose local log explicitly names TEST04 PASS within auth8/8. Its stdout starts20:20:18 and lacks independent full source/date/zone proof; report context supplies that attribution. The separately reviewed exact-command20:30CP-V01 clean-source auth8/8 includes the unchanged TEST04 too. Pinned TEST04 checks session-row deletion, clear-cookie metadata and401 after replaying the saved cookie on a fresh request. These are **local supporting PASS**, revision **N/A**, not live replay. TEST05 similarly remains local supporting PASS while natural eight-hour live expiry is **OPEN**. Do not combine the local run times or count TEST06 within auth8/8.

Independent production password/token storage and comprehensive log inspection remain unobserved; local authTEST57 is narrow support. PasswordTEST06 has not been run in R3 and is a separate suite. Additional rounding tie remains NOT RUN;4/4/5->4.33/zero buckets are already observed. External duplicate outcome is observed without internal concurrency-schedule proof. C/D acknowledged these proposed limits earlier; this does not turn any limited branch into PASS or ignore a known defect.

## Conditional gate recommendation and next owners

A accepts the above **scoped observed PASS results** based on the supplied artifacts; no genuine product defect is established in their completed scope. The baseline is closer to the no-defect exercise gate, but the gate remains **PENDING** until:

1. **D** gives the specific technical reason for live replay BLOCKED, or supplies an independently operated safe replay result. If replay remains blocked, both teams explicitly retain it as a coverage limitation supported by local TEST04; no live-PASS claim or secret disclosure.
2. **C/Ashira** records his actual PR75/result/limitation review under his own authority. This is not a demand to rerun already passing branches or a claim C tested them.
3. **B** reviews the actual R3 results and residual limits at this A PR's current head/CI, then records a reasoned baseline-entry disposition. Earlier PR110 approved a plan, not these results. A/B and C/D record the actual gate decision and staging readiness together.

If those reviews accept the explicit limits and still identify no genuine defect, A recommends proceeding to the professor's educational defect cycle on a separately verified isolated Sprint staging release. This is a conditional entry recommendation, **not final acceptance or completed PartD**. A genuine finding instead follows the normal defect-correction chain. No educational defect has been selected/reintroduced and no exercise staging endpoint/build exists yet. Before any code/schema/shared-document/release/deploy work, announce a separate Issue and exact files for coordination with the Lab7/Sprint2 chat. No changes to healthy CP-V01 or protected tag; humans perform mutating cloud actions. Keep the eventual defect choice private until independent discovery. [Full PartD gates](part-d-readiness.md).
