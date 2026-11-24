# EN037 technical response to partner review and Workflow cases A2

24 November 2026. Technical decisions prepared under Thira's delegation. Actual student contributions and peer review remain recorded separately. No external chat message has been sent by Codex.

## Progress acknowledgement

We received the partner acknowledgement of original ClassPulse UAT-01–12 observations and retained the setup deviations. The partner independently confirmed Workflow WF-BUG-001. Their confirmation is independent reproduction of the original finding. The received confirmation and original evidence remain preserved unchanged.

## ClassPulse inventory and clarified routes

The technical scope is original UAT-01–12 plus CD-01–08 as clarified in response A1, with the remaining fixture-dependent branches explicitly pending. The thirteen protected GET/POST routes return401 when signed out. For response edit/delete, the clarified expectations are anonymous 401 and authenticated respondent404. The existing authenticated PUT/DELETE404 observations are retained.

CD-08's guarded method was executed in an authenticated Respondent2 session. GET /api/auth/me returned200 with RESPONDENT. One POST to candidate 2147483647 with {answers:{}} returned 404 NOT_FOUND. The original {answers:[]} missing-ID case immediately afterward also returned 404 NOT_FOUND. Observation time2026-11-24T13:45:30Z, or20:45:30 Asia/Bangkok. This is the agreed external missing-resource evidence under CP-V01's lookup-before-validation contract. It is not a direct database inspection. Both earlier precedence branches have passing observations. See CD08-missing-ID-result.json.

CD-07's third enrolled respondent and CD-01's inactive account remain pending provisioning and private access. Controlled expiry/old-session checks remain separately attributed supporting/fixture-dependent coverage. Existing user accounts and enrollments were preserved.

## Workflow inventory disposition

Original Workflow UAT-01–06 remain in scope, with 01 before04 and the saved request ID preserved. The following technical dispositions apply to PARTNER-ADD-01–06 revision A2. Final peer/participant acknowledgements remain actual records.

| Case | Technical disposition | Required clarification or setup |
|---|---|---|
| PARTNER-ADD-01 | Accepted | Generic wrong/unknown credential checks, role/identity/reload/logout, idempotent logout and masked cookie attributes. Controlled expiry and old-session replay retain their separate setup requirements. |
| PARTNER-ADD-02 | Accepted including02g | ASCII and Unicode title/purpose code-point bounds match contract. Exact title tests may omit prefix and put the marker in purpose/record. Purpose tests keep marker in title. Unexpected identity/status keys remain422. |
| PARTNER-ADD-03 | Accepted including03u-501 and03u-500 | Use separate records for successful ASCII and Unicode boundaries. Record padded-reason storage as exploratory; validation-after-trimming remains required. |
| PARTNER-ADD-04 | Accepted | Exactly two competing decisions on dedicated submitted data, one losing retry, saved winner/history readbacks. Preserve original UAT-04 comparison before terminal-repeat probes. |
| PARTNER-ADD-05 | Accepted | The proposed PUT method/path may be tested for rejection and unchanged saved state. Record actual status without inventing a contract-specific404/405 promise. |
| PARTNER-ADD-06 | Accepted with durability setup pending | Selected1366x768 and390x844 keyboard/mobile checks.06c-R is actual same-release process/instance restart;06c-N is separately agreed new-instance retrieval and requires proof that instance handled the retrieval. Neither is replaced by fresh-session retrieval. |

An actual restart/new-instance experiment, assignment-unavailable/self-assignment and forced event-failure checks require agreed setup and evidence. The PR correction does not perform those live operations.

## WF-BUG-001 triage and correction

Disposition Accepted defect, Minor severity. A client request over the existing parser limit is incorrectly reported as server failure. No outage, data loss or credential disclosure was demonstrated. Express's oversized-body413 classification and the application's JSON error envelope justify correction. The original Sprint1 contract does not explicitly name413; this qualification is retained.

Issue https://github.com/osizk/WorkflowAndApprovalSystem/issues/62

Draft correction PR https://github.com/osizk/WorkflowAndApprovalSystem/pull/63

The normal createApp HTTP regression was committed before the correction.

- RED commit0e4897310d8382ec915b6a122ba9121cad22c919 built successfully. The intended status assertion failed500 versus 413; the other safety test passed.
- GREEN commit84a62c781c730ecf5779c80be0607df7ce0fe74f adds a specific entity.too.large response413/PAYLOAD_TOO_LARGE.
- Build and two safety tests pass. Seven focused safety/health/database-guard checks pass with zero failures/skips.
- GitHub full CI passed 17 tests with 0 failures and 0 skips on PostgreSQL 16/Chromium, and the Docker image build passed. Run https://github.com/osizk/WorkflowAndApprovalSystem/actions/runs/45407729755 completed successfully at 13:53:08Z. Deployment-checks also passed in run 45407729713. Correction is on a draft branch into lab5-staging. Actual teammate review, deployment and independent retest remain pending.

The regression also checks that invalid bodies stay outside database/authentication access, malformed JSON stays400 and the health endpoint stays available. Actual RED/GREEN files are attached in the next progress package.

## Currently serving Workflow release

Fresh read-only gcloud verification ran2026-11-24T13:51:51.954826Z through13:51:58.389033Z, or20:51:51–20:51:58 Asia/Bangkok.

- Full source82a4806b5291b57ad7e76a28fb7d40e1e947b9a6
- URL https://scd928edd-4d7hbszvwq-as.a.run.app
- Serving revision scd928edd-00007-477
- Traffic100 percent to that revision
- Serving digest sha256:6554d7f8cccdf1b4ded95f3f7d1a2560a786b0ecf7613cab62d59d942613a4fb
- The Artifact Registry full source-commit tag resolves to the same digest.

This is the original release with WF-BUG-001. The corrected draft branch is separate. Record a new serving version after reviewed deployment before independent retest.

## Remaining dependencies

Actual Ashira contribution/review, remaining ClassPulse fixtures, final peer-review evidence, appointment/channel discussion on 25 November, required correction integration and independent retest remain pending. Keep final acceptance pending until actual evidence supports the decision.
