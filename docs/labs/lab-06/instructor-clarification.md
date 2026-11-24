# Lab 6 instructor clarification

**Current planning guidance, recorded 20 November 2026.** Student A supplied the full announcement titled “Lab 6: Clarification for Teams with No UAT Defects” and asked us to apply it. This records that supplied text's meaning; the original post's author/date/access have not been independently checked. The provided Facebook link points to a user within a group, so it is not used as a verified post permalink.

## What changes

1. **Independent coverage review is required.** The UAT Team must assess whether the Developer Team's cases adequately cover important delivered Sprint 1 requirements and ACs, and suggest additional cases where necessary. Executing the supplied cases alone is insufficient. Both teams do this when testing the other's product.
2. **Test thoroughly before concluding no defects.** Focus on boundaries, invalid inputs, access restrictions and unusual user actions. Report the actual outcome honestly; no defect count is required.
3. **There is now a standardized no-defect exercise.** If thorough independent testing still finds no genuine defect, the Developer Team introduces one previously corrected defect in a new commit on Sprint staging. If no suitable earlier defect exists, the permitted fallback is to disable one existing required-field validation rule.
4. **Discovery must remain independent.** Give the UAT Team the exercise version without revealing the exact defect beforehand. They test and report it through normal Lab 6 reporting.
5. **Part D stays a complete engineering chain.** Reproduce with meaningful automated RED, correct to GREEN, run regression tests, obtain teammate PR review, pass CI, deploy the correction and obtain independent retest. Mark the introduced defect as the educational exercise in the final evidence; do not misrepresent it as a natural defect.

## How this changes our earlier plan

The standardized procedure replaces the earlier blanket instruction to wait for TA to assign/approve a team-specific isolated exercise before any no-defect work. Do not send another generic “please give us an exercise” request merely because no defect was found. Use [exercise protocol](exercise-protocol.md) once its prerequisites are met. Contact TA only if a real ambiguity/blocker remains, such as an inaccessible partner or an exercise exposure/branch-policy conflict.

The professor specifies a new staging commit, but does not say to weaken tests, remove mandatory CI, move the assessed tag, bypass branch protection, leak credentials, or serve a faulty version on the healthy assessed production URL. Keep those repository controls. Separate staging-version exposure from the corrected main deployment; see the protocol's concrete decision rules. Preserve the healthy initial UAT evidence and identify every version.

## What remains unchanged

Both students participate; both teams perform both roles; all actual results/findings/dispositions/versions/testers/evidence are recorded; major/critical defects require correction and independent retest; minor limitations require explicit independent acceptance. One self-contained PDF per team is due 22 November 2026 at 23:59 Asia/Bangkok under the supplied handout. The clarification supplies no new deadline or evidence of an actual run.

## Current status and ownership

No actual independent UAT or no-defect conclusion has been received, so no defect insertion or code change is started. [Coverage review](coverage-review.md) must happen before finalizing the case inventory. A updates coordination/records/report and exercise process. B owns the canonical handoff/coverage/contract-extracts and has been asked for a scoped update in Issue #74. Until that merges, this clarification and its two addenda take precedence over superseded general no-defect wording in the earlier handoff. Existing contract expected outcomes remain unchanged.

## Provenance and history

| Version | Input / date | Editor | Effect |
|---|---|---|---|
| 1.0 | Full announcement pasted by Student A, 20 Nov 2026 | Punge089 assisted by Codex GPT-6.1 Sol | Independent coverage audit and standardized staging exercise; preparation only, B review pending |
