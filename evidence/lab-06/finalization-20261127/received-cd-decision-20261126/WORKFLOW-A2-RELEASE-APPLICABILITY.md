# Lab 6 · Workflow A2 applicability on the current release

This is a source and contract review completed 26 November 2026 at 20:08 Bangkok. The review compared the last Lab 6 fix source with the current release and checked release PR #77 against the agreed Workflow A2 inventory. Runtime status comes from the recorded 19:04 serving verification. A/B have yet to start the remaining checks. [Release PR #77](https://github.com/osizk/WorkflowAndApprovalSystem/pull/77) · [Serving record in #61](https://github.com/osizk/WorkflowAndApprovalSystem/issues/61#issuecomment-7191263451)

- Source `41a8fefa7a5d93b6531dff88daae39574d72dcb7`, public marker `41a8fefa7a5d`.
- Revision `scd928edd-00009-fsg`, 100% traffic, digest `sha256:06e187cc4d1a9dc809925d4b68873014092a1c0cd6e83e440ec9a9e9bb60193d`. Cloud and registry evidence at 19:04:21 Bangkok and public marker/readiness at 19:04:52.

## Applicable cases

**Original UAT-01–06 and A2 ADD-01–06 remain applicable to the original Sprint 1 paths.** The release adds owner withdrawal and `WITHDRAWN` as a terminal state/event. Existing authentication, create, read and approve/reject handlers have no changes in the comparison. The migration extends terminal event uniqueness to include withdrawal. Run original cases using the original expected statuses and history. Keep the new Withdraw control, withdrawal endpoint and withdrawal races outside the original assertions. [Source comparison](https://github.com/osizk/WorkflowAndApprovalSystem/compare/ad2cbef67decf9953219694898327dea0bb66034...41a8fefa7a5d93b6531dff88daae39574d72dcb7) · [A2 inventory](https://github.com/osizk/WorkflowAndApprovalSystem/blob/lab6/docs/labs/lab-06/handoff/WORKFLOW-ADDITIONAL-CASES-A2.md)

| Case | Expected behavior and remaining boundaries |
| --- | --- |
| ADD-01 | Generic credential failure, requester/reviewer identity, reload, logout/idempotency and masked cookie attributes retain their expected behavior. Controlled expiry and prior-session checks retain their separate setup limits. |
| ADD-02 | ASCII and Unicode code-point limits and unexpected identity/status key rejection remain applicable. Invalid API inputs expect 422 with an unchanged record list. Exact title-length runs may put the run marker in the purpose and evidence. Retain the earlier partial UI evidence at its recorded scope. |
| ADD-03 | Reason validation and unchanged state/history readbacks remain applicable. Capture the final outcome of the incomplete approval 501 branch. Padded-reason storage remains exploratory. Use distinct fresh records for the successful ASCII and Unicode boundaries. |
| ADD-04 | Repeated decisions still expect 409. Two competing APPROVE/REJECT decisions on a dedicated, unwithdrawn SUBMITTED request expect one winner, one 409 and one terminal event. For the existing UAT-01/UAT-04 record, retain the approved result and the original comparison evidence. The external outcome does not establish exact transaction interleaving or rollback. |
| ADD-05 | The original assignment/access and role denials remain applicable. Unsupported PUT should leave stored fields and history unchanged. Record the actual error status under the agreed contract. The presence of Withdraw on an eligible owner request is permitted by the current Lab 7 release. |
| ADD-06 | Keep the agreed 1366×768 and 390×844 keyboard/mobile checks and original create, review, decision and retrieval outcomes. The additional Withdraw action may appear in the requester interface. Same-release restart and proven new-instance retrieval remain separate setup-dependent branches. Fresh-session retrieval records ordinary persistence. |

## Coordination before execution

Propose 26 November 2026, 21:00–22:00 Bangkok, subject to both teams confirming the slot and a no-deploy window in #61. If timing differs, agree on the next available slot there. Reconfirm exact source, revision, digest and traffic at the start, post the actual start and pause on any version change. Confirm private synthetic access through the normal login before case execution. The release diff shows no credential provisioning changes. Preserve prior A/B requests and use dedicated new records for new writes. Keep assignment-unavailable/self-assignment, forced rollback and restart/new-instance branches pending separate setup agreement. WF-BUG-001 retains its scoped closure. A/B’s Workflow whole-product decision remains pending. [Coordination Issue #61](https://github.com/osizk/WorkflowAndApprovalSystem/issues/61)
