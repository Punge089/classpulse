# Independent UAT coverage review

Use this before freezing the initial case list for **each product**. The independent UAT Team owns the assessment, using the actual Sprint 1 requirements/ACs and Developer Team handoff. ClassPulse's existing [coverage table](coverage.md) is an input; C/D must form their own judgment rather than copying its conclusions. A/B do the equivalent audit on the partner app. Follow the [instructor clarification](instructor-clarification.md).

## Procedure

1. Obtain the actual delivered scope/ACs and baseline/tested version. Distinguish Sprint 1 requirements from later-sprint features. Record the independent reviewer names/time.
2. Map important requirements/AC branches to the supplied case IDs and specific expected outcomes. Mark covered, partial, missing or unclear, with reasons and user impact. Developer tests may support confidence but do not become independent UAT results.
3. Examine boundaries, invalid/malformed input, role/ownership/enrollment, state/history and unusual actions. Propose additional concrete cases where important gaps remain. Every addition needs a stable ID, AC reference, role/preconditions/synthetic inputs, numbered actions, expected result, protected-state readback and sequence/data implications.
4. Send suggestions/questions to the Product Team; record actual disposition and reasons. An important unmet requirement cannot be waived simply to fit time. Seek TA clarification if scope/access is genuinely disputed. Freeze a versioned inventory containing original and agreed additional cases.
5. Execute the full agreed inventory, with both student participants and actual operator/AI assistance recorded. If exploration finds a new issue, preserve the observation and turn it into a reproducible case/finding; do not retroactively invent an executed case. Keep original/retest results separate.
6. Only conclude “no genuine defects found” after this audit and thorough actual execution support it. Document residual coverage limitations explicitly. An important agreed case that is BLOCKED or NOT RUN is not evidence of a sound no-defect result.

## ClassPulse suggestions for C/D to evaluate independently

These are candidate additions, **not executed/agreed cases or hints for an introduced defect**. C/D choose and refine cases from their own assessment. Existing IDs UAT-01–12 stay stable; proposed additions use UAT-CD-01 etc. A/B use PARTNER-ADD-01 etc. for the other app.

| Area / AC | Gap or unusual action to consider | Concrete expectation from contract |
|---|---|---|
| BR-02 / AC-11 | Title 120 versus 121 characters, prompt length, 0/21 questions, invalid/duplicate options | Valid boundary accepted; invalid field rejected with 400 VALIDATION_ERROR via API and no saved survey; UI validation distinguished from backend result |
| BR-07 / AC-25 | Required SINGLE_CHOICE omitted while rating valid; foreign question/option, duplicate question, malformed answer shapes | 400 with field details, no response stored; optional omission accepted rather than treated as zero |
| BR-06 / AC-22 | Two simultaneous valid submissions on one fresh eligible pair | Exactly one 201 and one 409 ALREADY_RESPONDED, one stored response; preserve both results and owner count |
| AC-28 / state change | Owner closes while respondent form is already open; double-click Submit | Closed submission gets clear server error/no stored response; in-flight Submit disabled and successful first request not duplicated |
| AC-07/12/17/27/29 | Protected verbs/routes not yet checked; owner create on other course; malformed ID; cross-role write | Contract-specific 401/403/404/400, no disclosure and unchanged protected state; use the exact contract matrix |
| AC-04 / authentication | Browser logout alone does not prove the old server session invalidated | Controlled secret-safe support for old-session rejection; do not expose/copy cookie values into evidence. Record coverage limitation if unavailable |
| AC-30 | Only two CPE334 responders cannot prove literal [4,4,5] -> 4.33 or decimal half-cent boundaries | Agree a controlled synthetic fixture or distinguish supporting automated evidence; do not live-reseed or add unauthorized enrollment |

These examples are ordinary contract coverage, publicly shared before any exercise choice. Do not tell the independent testers which one, if any, is later used as the educational exercise.

## R11 coverage audit and additional-case record

```text
Product / Product Team:
Independent UAT Team / actual reviewers / time:
Requirements/AC document and version:
Tested product baseline/release:
Supplied handoff/case inventory version:
Important AC or branch:
Existing case IDs and exact expected outcome:
Independent assessment: covered / partial / missing / unclear
Reason and user impact:
Proposed additional case ID / purpose:
Role, preconditions and fresh synthetic inputs:
Numbered actions:
Expected status/UI/data outcome and unchanged-state readback:
Dependencies/order/retention/evidence to collect:
Product Team response / actual agreement / time:
Final inventory version and required case/subcase list:
Execution/retest record references (only when actually performed):
Residual limitations / escalation if needed:
```

The final PDF embeds this independent assessment, case additions/dispositions and actual results. A suggestion alone is not an executed PASS or a defect. Neither team should sign the other team's assessment or decision on their behalf.
