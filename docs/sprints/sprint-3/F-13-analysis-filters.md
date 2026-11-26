# F-13: analysis filters and text answers — proposed contract

Issue #124 · version 0.1 · 27 November 2026 · owner A/Punge089 · reviewer B/book6349

This is a proposal for peer review, not an implemented feature. No F-13 tests or application code may be written before B's C3 and agreed implementation file inventory. It addresses FR-18 and depends on the accepted F-07 text-answer and F-10 section designs. BR-08 ownership, BR-13 identity separation, BR-14 anonymous threshold, NFR-02/03 and NFR-07 remain binding.

## Baseline and scope

At staging baseline a3a0424, owner summary uses the existing owner-scoped aggregate endpoint; the schema has identified responses and rating/single-choice answers, without a TEXT answer field or section entity. F-07 and F-10 are planned, not present in this baseline. F-13 therefore cannot treat section or text data as already available. Existing summary and owner authorization must continue working when no filter is selected. This contract does not add or change submission, eligibility, survey lifecycle, response ownership, schema or anonymity by itself.

The proposed first working slice is **identified surveys only**: an owner may select one valid section of the survey's course, see the existing aggregates restricted to that section, and see submitted text answers for the selected population. Clearing the filter restores the unfiltered summary. Anonymous surveys remain explicitly unsupported by this slice until a separately reviewed F-11 privacy design defines safe filtered disclosure and a threshold for each displayed population. Do not infer anonymous safety from the global count alone.

## Decisions requiring B review

1. For identified surveys, which reviewed F-10 source defines a respondent's section for historical responses: a submission-time snapshot or current enrollment? The choice affects transfers, missing sections and historical reproducibility. No implementation should infer one before F-10 specifies it.
2. Should text answer display reveal respondent identities? This proposal shows text only, without identity, and preserves existing owner access boundaries. B should confirm against FR-18 and the F-12 identified export policy.
3. F-07 must define text answer storage, maximum length, blank/optional answers and immutable historical rendering. F-13 consumes that accepted contract without creating a competing answer schema.

## Proposed interaction and API boundary

An authenticated owner opens an owned survey's summary. A section selector offers All sections and sections valid for the survey's course. Changing selection requests a fresh owner-scoped summary; loading is announced, an empty population is explicit, and errors provide a retry without displaying stale results as current. A text-answer list is read-only and renders ordinary escaped text. The UI must not call an endpoint to expose answers for another owner or another course.

The exact API endpoint, query representation, response DTO, stable ordering and pagination for text answers, field errors, section-history source and file list will be specified in a reviewed revision after F-07/F-10 contracts are available. Server-side ownership and input validation are mandatory. An unknown, malformed or foreign-course section must not silently broaden the filter; no answer data may accompany an error. Existing anonymous protections and threshold semantics cannot be weakened by filter selection, empty states or pagination.

## Proposed acceptance and system checks

IDs are provisional pending registry collision check and B review; do not cite them as accepted baseline IDs.

| Scenario | Acceptance / test expectation |
|---|---|
| Owner, no filter | Existing summary behavior remains unchanged; no cross-owner rows. |
| Owner, valid section | Aggregates and text answers use the same defined eligible response population; compare to known seeded responses in two sections. |
| Clear filter | The unfiltered result is freshly requested and correct. |
| Empty section | A truthful empty result, with no fabricated responses or counts. |
| Invalid or other-course section | A documented client error; no unfiltered fallback or response data. |
| Authentication and ownership | Missing session returns 401, wrong role 403; foreign or missing survey gives the agreed indistinguishable 404. |
| Privacy | Identified slice does not leak respondent identity in text output. Anonymous mode remains unavailable until reviewed F-11 integration specifies safe behavior and per-population threshold. |
| Text safety | Long, empty/optional and markup-like text follow accepted F-07 rules and render as text, not executable markup. |
| Async UI | Loading, empty, error/retry, changing filters rapidly and stale responses are tested. |
| Persistence/regression | Reads do not change any survey, response, answer or enrollment; existing summary, submission, role and lifecycle regression tests remain enabled. |

## Dependencies and completion

Before tests: record B C3 on a versioned contract with stable AC/STS IDs; agree F-07/F-10 data semantics and scope concrete application/test/evidence files in the issue; coordinate any F-11 privacy interaction. Then preserve a meaningful failing assertion on the actual old code before implementation, capture the same checks green, run relevant server/client/browser regression and builds, and obtain independent exact-head review and current CI before a staging merge. D2 evidence must embed the actual contract, review and results rather than claim a planned slice is working.

Version 0.1: A and Codex GPT-6 drafted the proposal from baseline a3a0424. The three decisions above, exact API contract and implementation scope remain open; no tests, code, deployment or acceptance are claimed.
