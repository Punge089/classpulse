# TEST-32 logout/login timing investigation

The existing browser test failed in CI run 45834540385 attempt 1 and 45866152291 attempt 1 while waiting for the Email control after clicking Logout. Both runs continued the browser suite; the Docker step was skipped after failure. Each full same-head rerun passed. Passing reruns do not establish a root cause.

Inspection of the retained private Playwright trace for run 45866152291 showed the logout click returning while the page remained on the owner survey. The subsequent explicit navigation reached `/login`, but the page was on `/owner` when the Email fill timed out. Source inspection shows logout awaits a POST before clearing client user state and navigating to login. This sequence is consistent with a race between logout completion and forcing the login route; the trace does not by itself prove every internal event or exclude an application defect.

The proposed test-only change explicitly waits for the actual logout POST to return 204 and for navigation to `/login` before beginning the next sign-in. It preserves all existing product assertions and does not skip, weaken, retry or extend the test. Exact-head CI and independent peer review are pending. Raw trace remains local because it may contain session material; no cookies or credentials are included in this summary.
