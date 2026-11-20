# Standard no-defect educational exercise

Apply the professor's standardized procedure as supplied on 20 November 2026; see [clarification](instructor-clarification.md). This is conditional planning. **No exercise defect has been selected, inserted, executed or reported.** Natural independent UAT comes first.

## Entry gate

- Independent coverage audit R11 is complete for the important implemented Sprint 1 scope, with agreed additional cases and actual thorough execution including boundaries/invalid input/access/unusual actions.
- Real results/findings/triage support no genuine defect in that tested scope; no missing important agreed case is disguised as a pass. Obtain and retain the actual healthy-release decision subject to normal acceptance conditions.
- Record healthy source/release/image/revision/data and preserve its availability. Both teams agree exercise session/version/environment, synthetic accounts/data and retest slot. They may know this is an educational exercise, but not the exact injected defect.
- Identify developer owner/reviewer and scoped exercise Issue. The professor supplies the standardized course procedure; a generic wait for individual TA exercise assignment is no longer required. Ask TA only about actual unresolved implementation/exposure conflicts, recording the specific question.

## Stage 1: new staging-version commit

Developer Team privately chooses **one previously corrected defect** from verifiable history. Record the original defect/fix provenance for the final report after independent discovery. If no suitable earlier defect exists, the announced fallback is intentionally disabling one existing required-field validation rule. Do not substitute an enhancement, intentionally remove authorization, leak identities, touch credentials or wipe data. Do not select a defect now merely because these documents mention a candidate coverage gap.

The announcement specifies a **new commit on Sprint staging**, not a tag reset or history rewrite. Keep the original Sprint 1 tag fixed. Preserve a healthy recovery reference, the new exercise SHA and the actual diff. No exercise code is included in the planning PR. Implement the chosen exercise only after the entry gate, under its own scoped Issue and actual teammate coordination.

Keep all existing tests/assertions/mandatory CI. A deliberately defective version may make existing tests fail: save that expected RED honestly. Do not skip/delete/weaken a test, change the contract or falsify CI so the exercise passes. Never self-approve/self-merge or bypass protection. If staging protections prevent the specified faulty commit, stop that mutation and ask TA for an agreed isolated staging route; preserve the blocker, rather than silently bypassing checks or treating the new announcement as permission to alter rulesets.

## Stage 2: expose the exercise version for blind independent testing

Agree a separate test instance of the exact staging exercise SHA using synthetic data. A local/test deployment accessible to C/D can serve this purpose if it supports genuinely independent execution and records exact version; if cloud provisioning or credentials are required, an authorized human handles them. The clarification requires the UAT Team to test this version and explicitly requires the **corrected** release to be deployed; it does not prescribe pushing the knowingly faulty version through the healthy production main pipeline.

Normal ClassPulse deployment remains reviewed-main-only. Keep healthy assessed production available; do not publish a known-failing exercise to it or call a staging commit deployed without evidence. If no independent-accessible exercise instance is available, record the technical dependency and ask TA/human operator the specific exposure question. There is no hidden permission to create cloud resources or bypass CI.

Share only exercise label, test URL/version/session, broad agreed Sprint 1 scope/cases, accounts and data instructions. **Do not share the exact defect, affected field/route, chosen former fix or targeted regression test before the independent finding.** Developer-only selection notes and diagnostic instructions stay out of the C/D package. The repo is public, so technical secrecy cannot be guaranteed: ask testers to perform black-box discovery without inspecting the injection diff until their finding is recorded; disclose if the exact defect was revealed/learned in advance instead of claiming blind discovery.

## Stage 3: UAT Team independently discovers and reports

C/D test the exact exercise version, including their own coverage audit/additions. They create a normal reproducible R04 finding: actual reporter/time/version/case/AC/inputs, expected/actual, impact/severity and evidence. Do not prefill the report or guarantee they will find the defect. If not discovered, retain honest results and deepen testing without revealing the exact fault; seek TA guidance if the exercise cannot achieve its intended learning outcome.

Label the chain CP-EX-* so it is distinguished from natural release defects. Product Team triages the actual received report against the unchanged contract. Independent discovery must precede disclosure of the exact planned injection to the UAT Team.

## Stage 4: meaningful RED, correction, GREEN and regression

After the independent report, add or explicitly reuse a meaningful automated regression reproducer under the unchanged contract. Run it against the defective SHA first and save actual failure/assertions/setup/command/commit/counts before implementation. If a relevant existing test already fails, retain that exact result as supporting evidence and record whether the reproducer is new or existing; do not pretend a pre-existing test is newly written. The final report must demonstrate the reported failure, not a syntax/setup failure.

Commit the reproducing test/evidence before fixing. Fix the reported behavior in a new commit, run the same assertions GREEN and the relevant broader regression suite, retaining actual pass/fail/skip output. Never fabricate red history or weaken an assertion to pass. Follow the existing contract/C2/C3 protocol for any genuine contract change; do not revise an expected rule to excuse the deliberately introduced defect.

## Stage 5: review, CI and corrected deployment

Non-author checks exact fix PR head, runs appropriate tests and reviews substantive diff/reproduction/RED/GREEN. Require current-head CI and green integration. Use merge commits preserving injected/test/fix history; release the corrected staging integration through a reviewed main PR and the existing CI/CD process. A-authored PR needs B approval/merge; B-authored PR needs A. Every AI-assisted commit/merge records its actual assisting model.

Only ship a fully corrected/verified main version. If the healthy app code is unchanged from the recovery reference, document that equality and the distinct history/test commits; do not invent an unnecessary code difference or deploy result. Record actual source SHA, image digest, serving revision/traffic and smoke checks. Notify testers before deployment affects them. Human cloud/credential/ruleset boundaries still apply.

## Stage 6: independent retest and report

Send corrected deployed version and the **original independently reported repro** plus affected cases. UAT Team independently retests and records R06/R07 with actual observations/version/testers/time/evidence. Keep initial healthy acceptance separate from the CP-EX chain, and do not claim the initial product had a naturally discovered defect. Include complete educational provenance, required red/green/regression, review/CI/deploy and independent retest in Part D.

## R12 exercise record and disclosure timing

```text
Entry-gate coverage review / thorough initial run / healthy decision evidence:
Professor-standardized procedure reference:
Developer-only selection record reference (do not send exact choice to UAT Team before finding):
Prior corrected defect provenance OR reason no suitable one / required-validation fallback:
Healthy source/recovery reference:
New staging exercise commit / expected existing-test failures:
Branch-policy conflict and actual resolution, if any:
Independent test URL/environment/version/accounts/data/session:
What was shared with testers / time (no exact-defect hint):
Tester declaration of any advance defect knowledge / effect on independence:
Actual independent discovery and R04 finding / time:
Time exact injection provenance disclosed after finding:
Defective SHA -> reproducing test RED -> fix GREEN -> regression commands/counts:
Exact-head teammate review / CI / integration / corrected main release:
Corrected deployed SHA/digest/revision/traffic/smoke:
Independent retest and actual final exercise decision:
Educational-versus-natural-defect disclosure / final PDF pages and evidence:
```

The ordinary R03-R10 records still apply. Do not put private choice details into a shared pre-test R12 copy. Publish the complete assessed exercise evidence only after discovery; privacy is about preserving independent discovery, not concealing the exercise from graders.
