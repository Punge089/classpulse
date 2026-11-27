# A independent Workflow UAT continuation - 26 November 2026

Actual operator: Codex GPT-6 under Student A/Punge089. This is A's work only, not B's participation or C/D's ClassPulse testing. The user relayed C/D's explicit go-ahead and freeze through the team finish notice, with a serving readback at20:57:26 Bangkok.

## Exact release and chronology

- Source41a8fefa7a5d93b6531dff88daae39574d72dcb7, marker41a8fefa7a5d, revisionscd928edd-00009-fsg,100%, digestsha256:06e187cc4d1a9dc809925d4b68873014092a1c0cd6e83e440ec9a9e9bb60193d. Cloud mapping is C/D supplied, not an A Cloud readback.
- A session/start log20:58:05 Bangkok: https://github.com/Punge089/classpulse/issues/120#issuecomment-7194129216 . The preceding external readiness notice was student-attested. Codex did not send a private message or claim a #61 post.
- UI observations21:02:59.720-21:12:45.815 Bangkok:28 records, not28cases. ChatGPT in-app browser; exact engine/version and a literal private-window flag were not exposed. Explicit signout between roles and a separate standard cookie client were used.
- Initial HTTP pass21:15:25.756-21:15:29.429:25requests/30assertionsPASS. Its privacy logger over-redacted an already value-free attributes container. Initial files are preserved.
- Corrected evidence capture21:18:09.679-21:18:13.040:25requests/30assertionsPASS,0FAIL. This repeat captures parsed cookie flags without values; do not sum the passes into60distinctcases. UI outcomes remain separate from measured HTTP statuses.
- Public visible marker matched before and after the run. HTTP health/readiness200 and static-asset continuity are supporting signals, not independent Cloud/source mapping proof.

## Actual case disposition

| Case/subcase | Actual observation | Scope/disposition |
|---|---|---|
| ADD01 wrong/unknown login | Both UI messages Invalid credentials; actual POST401 INVALID_CREDENTIALS, identical message; identity401 AUTH_REQUIRED afterward, no client cookie | Observed core branch PASS; no production Session-table inspection claimed |
| ADD01 normal roles/reload | Both accounts log in200, GETidentity200 with exactly id/role, REQUESTER or REVIEWER; UI role survives reload | Observed core branch PASS |
| ADD01 logout/protected access | DELETE204; clearing directive and client cookie removal; subsequent identity/list/new-own-detail401 AUTH_REQUIRED with only error, repeated signed-out DELETE204 | Observed core branch PASS; post-logout requests used NO cookie, not a revoked-token replay |
| ADD01 cookie metadata | Both role logins: HttpOnly=true, Secure=true, SameSite=Lax,Path=/,Max-Age28800; values never recorded | PASS at metadata scope; not eight elapsed live hours |
| ADD06 keyboard/error | Tab/Enter navigation, visible3px solid focus, required blank-title message Enter3to120characters with aria-invalid=true and aria-describedby=title-error | Observed keyboard/form-feedback branch PASS |
| ADD06 rejected create readback | Authorised owner-list IDs21before/21after, identical; no new draft/request | PASS at owner-visible state scope, not a full DB snapshot |
| ADD06 normal keyboard journey | One new125.50 request; assigned reviewer1 approved with reason, requester retrieved exact title/amount/APPROVED/twoevents/reason; both API readbacks identical | Observed keyboard/create/review/decision/retrieval PASS |
| ADD06 layouts | Actual1366x768desktop and390x844mobile. Login/create/detail/decision labels/actions reachable; mobile horizontalOverflow=false. Reviewer queue and final readbacks also observed without horizontal overflow | PASS for these observed screens; no general accessibility certification |
| ADD06 restart/new instance | No infrastructure restart, new instance or deployment performed | NOT RUN/setup-dependent; fresh login/reload and existing-record visibility do not establish restart |
| Other controlled session branches | No old-credential replay, clock/DB expiry mutation, elapsed8hwait, assignment changes or forced transaction failure | Pending separately agreed setup/coverage disposition; no invented PASS |

## Preserved data

New A request5deda680-a443-4268-becb-8816bfebacaf, title UAT-ADD06-A-210719 Keyboard mobile, amount125.50, finalAPPROVED. Its two history events are SUBMITTED14:07:21.714Z and APPROVED14:09:59.476Z, reason Independent A keyboard approval20261126. Original spacing is in JSON. Retain the record.

All21 prior requester-visible IDs remain visible; the only added ID in that comparison is the new A record. A changed no pre-existing request. This supports the visible inventory, not a complete production database snapshot. The UI and HTTP clients ended signed out; viewport override was reset. No Lab7withdrawal, Cloud/admin/database operation or seed/reset occurred.

## Method and evidence limits

UI snapshots do not supply HTTP status; those fields are marked unobserved until the separate HTTP run. The HTTP run used the normal documented endpoints, HTTPS and same-origin Origin header with fresh standard cookie jars; it was not browser network-panel capture. Credentials were loaded privately from the user's earlier supplied synthetic access and never included in this package. Private input-loader helpers are excluded. Reproduction follows the agreed A2 requests using privately supplied access in an independently coordinated window.

An intermediate UI capture shows Signing in; the completed generic error is captured separately. A cleanup-only reference error occurred AFTER UI evidence/summary were saved and signout/reset completed; the persisted28record summary and cleared access map were verified. No duplicate business submission or application failure resulted. The HTTP logger correction and repeat are disclosed above; original records are retained.

No genuine Workflow defect was observed in these executed A branches. B's additional cases and special setups are separate. This is not Workflow whole-product acceptance, ClassPulse acceptance or completion of the team's UAT window. CP-EX-F01/WF-BUG-001 scoped closures are unchanged; ClassPulse M01 remains C/D's independent human task.
