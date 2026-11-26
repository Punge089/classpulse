# Proposed F-08 / Lab 7 reopening integration

Issue #130 · version 0.1 · 27 November 2026 · author A/Punge089 · reviewer B/book6349

This is a proposal, not an approved change or implemented behavior. B's C3 on the independent F-08 contract does not approve this cross-feature revision. It compares the accepted Lab 7 maintenance feature in staging a3a0424 with F-08 contract v1.1 on `feature/96-scheduled-closing`; that F-08 branch is not merged. No tests or application code are authorized by this proposal alone.

## Old and proposed rules

| Condition | Accepted Lab 7 baseline | F-08 integration proposal |
|---|---|---|
| Owner reopens CLOSED survey | Valid reason and current lifecycle version permit CLOSED → PUBLISHED; transaction adds exactly one audit event and preserves prior answers. No deadline exists. | The same checks apply, and a configured deadline must be strictly later than server time observed while holding the survey lock. A null deadline is allowed. |
| Deadline reached while PUBLISHED | No scheduled deadline exists; only a manual close changes availability. | Persisted status remains PUBLISHED; `acceptingResponses` becomes false at or after deadline. No synthetic CLOSE event or automatic status/version change is created. |
| Owner extends expired survey | Not applicable. | Explicitly close the published survey, adjust or clear the deadline while CLOSED, then explicitly reopen with reason/current lifecycle version. |
| Submission overlaps deadline or lifecycle action | Existing owner/response authorization and response uniqueness rules apply. | Recheck server time after the shared lock and before creating response/answer rows; if at or after deadline, reject without partial writes. |

This narrows a formerly valid reopen when a newly configured deadline has expired. It must be versioned and approved as an actual Lab 7 contract change before code changes; do not treat this document itself as B approval or silently rewrite the original evidence.

## Boundaries and errors proposed for review

For a deadline `t`, `now < t` is future; `now == t` and `now > t` are expired. Server time is authoritative. Owner authentication, role and ownership checks precede disclosure of a deadline. Reopen retains existing validation of reason and `expectedVersion`; after acquiring the row lock, verify the current lifecycle version/status and then the deadline using one server-time observation. A valid CLOSED survey with null or future deadline may reopen; expired deadline returns 409 `CLOSING_TIME_PASSED`. Any rejected operation leaves survey status, `statusVersion`, `closedAt`, deadline, answers and audit events unchanged. Exact error precedence for an invalid reason combined with an expired deadline must be agreed by B against the existing implementation before final contract acceptance.

Use the accepted Lab 7 lifecycle row-lock transaction and preserve one `REOPEN` audit event, reason, actor, version increment and previous close timestamp on success. Deadline adjustment follows F-08's own optimistic `updatedAt` token; lifecycle transitions follow `statusVersion`. A concurrent adjustment/reopen, reopen/close or submission/deadline boundary must serialize into a complete permitted outcome, never an event without its status or a response after the locked server-time check. F-08 must specify whether deadline adjustment and lifecycle transitions update the same token; no token behavior may be inferred without code/contract review.

## Proposed acceptance and verification

Stable AC/STS IDs must be allocated after checking the registry and agreed by B; the cases below are proposed additions, not a claim of passing tests.

| Scenario | Expected observation |
|---|---|
| Reopen with null deadline or `t-1ms` | 200; PUBLISHED, version +1, one truthful REOPEN event, preexisting answers unchanged. |
| Reopen at `t` or after | 409 `CLOSING_TIME_PASSED`; no status/version/audit/answer change. |
| Expired PUBLISHED survey | No automatic persisted CLOSE event or status mutation; new response rejected and saved response remains visible. |
| Manual recovery | Owner closes, adjusts/clears deadline, then reopens explicitly; each accepted lifecycle action creates its own correct audit event. |
| Unauthorized, foreign and invalid inputs | Existing 401/403/404 boundaries and agreed validation precedence remain intact; no deadline or history leak. |
| Concurrent changes | Locked outcomes match a serial ordering, with no partial writes or duplicate lifecycle events; tests state which scheduling orders were observed. |
| UI and regression | Owner sees deadline and conflict guidance, stale edits are not silently applied, and existing Lab7 reason/history, F-06 editing, submission and saved answers remain covered. |

## Open integration work

B must review the deadline and error-precedence decisions, any token interaction and impact on Lab 7 SRS/SDS/STS excerpts. Update and version the relevant canonical contracts and test specification before tests, then record an actual C3. List exact shared files and serialize after F-06/F-07 as agreed; prepare a meaningful old-code assertion RED before implementation. Regression and final evidence must distinguish the separate Lab 7 PDF from Deliverable 2 and include actual exact-head results. Final Lab6 acceptance and the currently served version remain separate release dependencies.

Version 0.1 records a proposed interaction only, based on the cited contracts and current staging; no new tests, production code, peer approval or release occurred.
