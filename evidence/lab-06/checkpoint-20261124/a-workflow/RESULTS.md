# A's observed Workflow UAT results — 24 November 2026

Actual operator: Codex GPT-6 under Student A/Punge089. No B or C/D execution is attributed to this run. Run `UAT6-20261124-A-210340`, from21:03:40 to21:09:45 Asia/Bangkok (UTC timestamps in raw records). This was an actual independent technical run, not a previously booked appointment.

## Release and setup

URL https://scd928edd-4d7hbszvwq-as.a.run.app; source `82a4806b5291b57ad7e76a28fb7d40e1e947b9a6`; footer marker `82a4806b5291`; serving revision `scd928edd-00007-477`,100% traffic; digest `sha256:6554d7f8cccdf1b4ded95f3f7d1a2560a786b0ecf7613cab62d59d942613a4fb`.

Full source-to-serving mapping is C/D's read-only gcloud evidence at20:51:51–58 Bangkok, not an A cloud readback. A observed the matching browser footer through the run. This is the original release with WF-BUG-001, not corrected branch84a62c7.

Browser was ChatGPT's temporary in-app browser. Exact browser engine/version and a literal private/Incognito-window flag were not exposed. We explicitly logged out between role changes; for04 we closed the previous temporary tab, opened a replacement tab, observed the signed-out redirect and logged in anew. That verifies signed-out/new-login persistence but does not establish creation of a new private window. **C/D setup disposition is pending across this run; whole-case/final acceptance is not claimed.** If a literal fresh private window is required, repeat the affected steps and preserve both runs.

## Expected and observed behavior

| Case | Expected behavior | Actual behavior and retained evidence | Disposition |
|---|---|---|---|
| UAT-01 | Requester submits125.50; assigned reviewer may approve with no reason; requester sees saved final status/history. | New request `e1cc8f10-ccb4-49b1-a391-3d44fd4e3f67`, title `UAT-01-A-210340 Desk supplies`, purpose `Purchase stationery for the team`. Submitted21:04:18; reviewer1 approved21:05:02 with blank reason. Requester1 reopened sameID:125.50,APPROVED,exactly SUBMITTED→APPROVED. Evidence02–07. | Expected behavior observed; run setup qualification pending. |
| UAT-04 | Preserve01ID; later authenticated retrieval/reload retains amount,status and original history; terminal decision controls absent. | Explicit logout/closed tab/replacement tab initially redirected to/login with no request data. New requester login retrieved same125.50/APPROVED/two original events. Reviewer1 reopened and reloaded the sameID; Approve count0,Reject count0. Evidence08–10 and control-count JSON. | Expected behavior observed; fresh-private-window substitution awaits C/D disposition. Optional process restart NOT RUN. |
| UAT-05 | Blank rejection reason is rejected without changing saved state; valid reason produces one rejection and persists for requester. | Separate request `b1f4b385-04b4-4e7a-905f-7f9091e65db2`, title `UAT-05-A-210340 Reject reason`, purpose `Synthetic request to verify rejection reason`,300.00. Submitted21:07:42. Blank reason showed `A rejection reason is required.` Explicit reload retained SUBMITTED/one event. Reason `Budget unavailable for this purchase` saved REJECTED21:08:41. Requester1 readback showed300.00,the exact reason and exactly SUBMITTED→REJECTED. Evidence11–17. | Expected behavior observed; run setup qualification pending. UI validation only; no HTTP status was inferred. |

There are three observed case paths,15 timestamped observation entries and26 evidence files. Screenshots06,10,13,15,17 show key outcomes. Screenshot17 was visually inspected during report preparation. Raw run metadata/observations and snapshots are retained without editing.

Only the two new synthetic records above were created/decided; both remain for independent readback. Existing records were not altered, and no cloud/DB admin operation or restart was performed. Final explicit logout was observed. A stale closed-tab evidence helper was rebound before04 credential entry; this was a tooling issue, not an application defect or duplicate submission.

UAT-02/03/06 are still B's actual execution responsibility; A did not perform them for B. PARTNER-ADD-01/06 and other unexecuted subcases remain NOT RUN. The optional restart and controlled durability/session branches require separately agreed setup. No additional application finding emerged from these three observed paths. This is not a full no-defect conclusion, final acceptance, or proof of completed Lab6 PartD.
