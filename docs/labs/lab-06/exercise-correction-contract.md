# CP-EX-F01 correction contract — v1.0

Issue117 continuation, A/Punge089 with Codex GPT-6; reviewer B/book6349. Existing feature/117-lab6-exercise was created from then-current sprint-2-staging9bf820a and contains actual exposed source4199888. Preserve that ancestry; no rebase/history rewrite. [D finding/triage](../../../evidence/lab-06/exercise-correction-20261126/README.md).

Authority: original Sprint1 AC11/19/BR02 and B's actual PD10–12 C3 [7168743313](https://github.com/Punge089/classpulse/issues/115#issuecomment-7168743313) already require post-finding reported-case RED→fix/GREEN→regression→review/green CI→coordinated corrected release→independent retest. This is restoration of the existing requirement, with no new product acceptance criterion. The actual exposure decision7185418731 was exposure-only and does not approve correction integration/deployment. Post this committed scope as C2 before adding the regression; actual B current-head review remains required. Do not invent a new C3/review or claim a later approval.

## Exact change and meaningful regression

Restore only `title.length < 1` beside the unchanged maximum120 guard in server/src/lib/surveyValidation.ts, after existing trim/type normalization. No client/API/schema/auth/privacy/lifecycle/workflow change. Existing NewSurveyPage already renders a returned title field detail inline and stays on the form; confirm this on the corrected runtime before declaring UI coverage complete.

Add server/tests/api/uat6TitleRegression.test.ts, using existing app/fixtures only on a fresh owned loopback classpulse_test database:

- CP-EX-F01-A/B: owner CPE334, title empty or whitespace-only, one otherwise valid required RATING prompt. Expect400 VALIDATION_ERROR, explicit title detail and unchanged Survey/Question/QuestionOption counts and existing survey tree/owner list. This prevents another invalid field from masking the reported failure.
- CP-EX-F01-C/D: valid one-character and120-character title controls create201, store/reload the expected normalized title and valid question. No rejection of every request to make the regression green.
- Save and commit new tests plus actual failing output BEFORE the one-line fix. Record full tested HEAD and source4199888 ancestry; a setup/compilation error is not RED. Then restore guard and run the SAME tests, followed by all existing server/client tests and both builds. Keep every failure/skip and exact commands; do not use .only or disable old tests.

Regression uses new isolated producer data only. D persistent classpulse_uat6_exercise and drafts3/6/9, CP-V01 data and Cloud SQL are untouched. No migration/reset/repair of D's invalid drafts. Preservation assertions concern developer fixture originals, not a claim of A independently inspecting D's database.

## Review, release and independent retest gates

B checks current exact head, diff/test assertions, actual regression/build and green mandatory CI before integration. PR118 can become Ready only once corrected/green; old defective419/expected-red CI remain immutable historical evidence. No self-approval/merge, protection change or faulty merge into S2/main.

Latest sprint-2-staginge6043a9 has Lab7 source/schema changes absent from D's exercised build. Do not silently replace the test subject or deploy these unrelated changes. A corrected S1 release can retain the existing exercise-branch ancestry; the exact integration/staging→main payload and release order require B review and coordination with the other chat before any ref/main/deploy mutation. No deploy occurs in this correction block, and no future branch movement is pre-authorized by this contract. Humans perform mutating cloud commands and private configuration.

After a reviewed corrected deployed release is actually verified, provide its exact commit/ref/artifact or digest, serving revision/runtime/traffic and observation time, then independent D reproduction: empty/whitespace titles reject with inline title error and400/no newly created draft; valid title creates normally; retained3/6/9 remain unchanged. C records his own review. Current live replay/expiry and other agreed coverage limits remain explicit. Do not close defect/final acceptance/PartD on developer GREEN alone.

Version history: v1.0,26Nov2026: after actual independent CP-EX-F01 discovery, record the existing-AC restoration, meaningful API/no-write controls, unchanged approved PD10 process and separate release gates. Tests/fix not yet written at this contract commit. A assistance Codex GPT-6.
