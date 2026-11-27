# F-08 and Lab 7 reopening integration

Issue #130 · proposed v0.2 · 27 November 2026 · author Bannasorn Thongkorn (A/Punge089) · reviewer Papangkorn Jitvoottikrai (B/book6349)

Lab 7 PR #92 on staging `5fe00fd` allows the owner to reopen a CLOSED survey using a valid reason and current lifecycle version. The transaction increments the version, writes one REOPEN event and preserves previously submitted answers. The F-08 deadline adds a condition to that transition. B's original F-08 C3 covers the standalone cutoff design. The cross-feature change awaits B's C3 on this proposal and the paired canonical revisions.

## Availability and rejected transitions

- A null deadline permits publication and reopening when the existing lifecycle checks allow them. A set deadline must be strictly later than server time sampled after acquiring the owned survey row lock. At or after the deadline, publish or reopen returns HTTP 409 `CLOSING_TIME_PASSED`.
- At or after the deadline a stored PUBLISHED survey becomes unavailable for new responses. Its stored status, version and audit stay unchanged until an explicit lifecycle action. The owner can manually close, change or clear the deadline while CLOSED, then reopen using a valid reason and current lifecycle version.
- Within the locked transaction, reopen checks run in this order: stored ownership; reopen payload validation; expected lifecycle version; legal transition and original publication time; remaining version capacity; deadline. Existing global JSON parsing, authentication, role and ID handling stay in their existing positions. Foreign or missing owner records get 404 before reopen body details. A valid JSON request with an invalid reason and an expired deadline yields HTTP 400 `VALIDATION_ERROR` with a `reason` field error. A valid payload with a stale lifecycle version yields HTTP 409 `STALE_SURVEY`. A rejected transition writes no timestamps, status, version, deadline, audit, response or answer.
- Under the shared lock, response submission rechecks current status, eligibility and deadline. A request that starts before cutoff and acquires the lock at or after cutoff is rejected with the existing HTTP 409 `SURVEY_NOT_OPEN`. An accepted submission's admission point is the locked time check. Saved responses and summaries remain readable under their existing permissions.

## Tokens and lock ordering

A successful publish, close or reopen advances `updatedAt` to `max(sampledServerTime, previousUpdatedAt + 1ms)` in the same transaction as its status, version and audit change. Capture physical event time from the server sample. The audit event's version preserves ordering even when operations share a millisecond. A successful schedule edit advances `updatedAt` by the same rule while leaving `statusVersion` and lifecycle events intact. An unsuccessful write rolls back all of these values.

- Schedule edit gets the lock first on a CLOSED survey: it changes the deadline and leaves the lifecycle version current. Reopen with that version then uses the committed deadline. A null or future value permits reopen. An expired value produces `CLOSING_TIME_PASSED`.
- Reopen gets the lock first and succeeds: the schedule form's prior token yields `STALE_SURVEY`, including when the current status is PUBLISHED. A schedule request with a deliberately fresh token on PUBLISHED yields `INVALID_TRANSITION`.
- Close remains available for stored PUBLISHED surveys whose deadline expired. A successful close advances both tokens and records the existing CLOSE audit event. Owner-visible status/history and saved answers follow the existing contracts.

## Stable acceptance and test mapping

| Existing AC | Stable test and level | Precondition/action and required result |
|---|---|---|
| F-08 AC-183, AC-187 and Lab 7 AC-100, AC-107 | TEST-184 and TEST-190 · API/DB | Reopen CLOSED with elapsed time at t-1ms, t and t+1ms and with null deadline. Successful reopen preserves responses and records one versioned event with the reason and previous close time. Rejections have no writes. Verify manual close/reschedule or clear/reopen and duplicate protection. |
| F-08 AC-182, AC-183 and Lab 7 AC-102, AC-103, AC-105 | TEST-195 · API/DB | For an owned CLOSED expired survey, combine invalid reason with expiry, then stale version with expiry, then valid request with expiry. Expect 400 reason detail, 409 STALE_SURVEY and 409 CLOSING_TIME_PASSED respectively. Wrong role and foreign ownership retain 403/404. Compare the complete before/after state on all rejections. |
| F-08 AC-181, AC-186 and Lab 7 AC-103, AC-104 | TEST-196 · API/DB | Fix server time within one millisecond. Check strictly increasing updatedAt across publish/close/reopen, physical event times, one lifecycle version increment per transition, and rejection of the schedule token from before the transition. |
| F-08 AC-181, AC-183, AC-186 and Lab 7 AC-103, AC-107 | TEST-197 · API/DB | Exercise both held-row-lock orderings for a CLOSED schedule change versus reopen. Assert the deadline-driven result after schedule-first and the old-token/fresh-token outcomes after reopen-first. Read back only committed version, schedule and event state. |
| F-08 AC-183, AC-187 and Lab 7 AC-104, AC-108 | TEST-198 · API/DB | With existing answers, reject at the deadline and induce an isolated audit insert failure after a permitted reopen attempt. Check that timestamps, versions, deadline, answer rows and events equal the original snapshot. |
| F-08 AC-184, AC-185, AC-186 and Lab 7 AC-108 | TEST-186–189 · API/DB | Preserve ownership/eligibility/duplicate behavior, check post-lock time across the boundary, verify no partial response and read back existing history/summary. |
| F-08 AC-188, AC-189 and Lab 7 AC-110, AC-111 | TEST-192–194 and Lab 7 TEST-112–114 · client, E2E, regression | Keep confirmation/history/stale behavior. Observe deadline recovery in the owner UI and retained answers, then record full-suite commands, tested commit and counts. |

The F-08 API/DB cases above belong in `server/tests/api/scheduledClosing.test.ts` at the agreed implementation slot. Lab 7's standalone suites remain as regression. The [F-08 canonical proposal v1.2](https://github.com/Punge089/classpulse/pull/97) and [Lab 7 v1.7 addendum](../../labs/lab-07/maintenance-contract.md) carry the same rules. Issue #96 owns the already listed implementation paths, including schedule validation, owner lifecycle, response submission, schedule API tests and the deadline UI. Shared lifecycle and response work follows F-06 then F-07. Dependent tests require B C3 on both proposed revisions before any feature implementation.

## Version history

- v0.1, 27 November 2026. Proposed the post-lock deadline condition and compared it with the Lab 7 standalone lifecycle.
- v0.2, 27 November 2026. Responded to B's proposal review by specifying the validation precedence, both lock orderings, monotonic schedule token and separately versioned canonical AC/STS mappings. Review and affected test execution remain pending.
