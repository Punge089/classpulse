# Workflow special setup case status

**Status checked** 2026-11-27 02:01:21 ICT (UTC+7). This is EN-037_P5's Product Team record for the cases ClassPulse A/B test on Workflow. It is separate from the ClassPulse acceptance decision.

The latest A/B run reviewed for these rows used Workflow source `41a8fefa7a5d93b6531dff88daae39574d72dcb7`, Cloud Run revision `scd928edd-00009-fsg` and marker `41a8fefa7a5d`. The record covers original Sprint 1 behavior. A's core authentication and keyboard/mobile/fresh-session retrieval checks passed within their observed scope. [A's run and scope](https://github.com/Punge089/classpulse/issues/120#issuecomment-7194866418)

| Workflow case | Recorded state | Evidence or setup remaining |
| --- | --- | --- |
| ADD-01 controlled expiry (AC-03) | **OPEN** for independent live observation | No elapsed eight-hour check in A's run. The local controlled-expiry test provides developer support. Agree a controlled observation or record the coverage disposition. |
| ADD-01 previous-session rejection (AC-03) | **NOT RUN** in the reviewed independent Workflow run | A observed logout 204 and then signed-out 401 without a session cookie. That does not establish rejection of the former session. Record an agreed, private method and actual result or a coverage disposition. |
| Missing or wrong-role reviewer mapping (AC-06) | **NOT RUN independently**. Pending isolated fixture | Developer tests cover 409 `REVIEWER_UNAVAILABLE`. Provide an approved isolated fixture and unchanged-state evidence. Keep existing live assignments intact. |
| Self-assignment refusal (AC-06 / BR-01) | **NOT RUN independently**. Pending isolated fixture | The developer SQL assertion covers database refusal of self-mapping. Keep existing live assignments intact. |
| Forced event-insertion rollback (AC-13) | **NOT RUN independently**. Pending isolated failure fixture | Developer TEST-13 covers rollback. The observed competing-decision outcome covers a separate path. |
| ADD-06c-R actual application restart (AC-14 / NFR-01) | **NOT RUN** in the reviewed A/B round | Requires a coordinated Product Team restart on the same release and database, with operator and timing evidence and independent readback of the retained request. Fresh browser-session retrieval already passed at its own scope. |
| ADD-06c-N new-instance retrieval (AC-14 / NFR-01) | **NOT RUN**. Alternative pending explicit agreement | If selected, record evidence that a new instance handled the retained-record readback on the same release. Keep it separate from an actual restart. |

Historical local and Lab 5 durability evidence remain separately attributed. The A/B records contain no completed independent result for the special setup rows above. No new test or infrastructure action was performed to prepare this status. [A2 scope and setup requirements](https://github.com/osizk/WorkflowAndApprovalSystem/blob/f964d714522ae9fb91baeef32998cbd19219fa90/docs/labs/lab-06/handoff/WORKFLOW-ADDITIONAL-CASES-A2.md) · [Historical developer traceability](https://github.com/osizk/WorkflowAndApprovalSystem/blob/41a8fefa7a5d93b6531dff88daae39574d72dcb7/docs/traceability.md)
