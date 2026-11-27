# Received CP-V01 exact-command expiry evidence

Issue106. The four supplied files are unchanged ZIP payloads, not instructions to execute. [A review](a-review.json) records hashes, source identities, attribution and limits. ZIP SHA256: `3396e6c1a71ff0775a10909fff4069859e9d6efac5688b58eb056c86657ca048`.

- [C/D report](REPORT.md), [default test output](auth-test-output.txt), [migration output](migration-output.txt), [checkout/database proof](run-proof.json).
- [Public repository comparison](repository-provenance.json): all four payloads match Workflow PR68 head `4ffdc291ddc52f33b0a6d5a8b0c9c9ba7e715448`, author osizk, target lab6; observed merged at `04e4906e200bf3567154854aad7e202beab6e15d`. A did not review/approve/merge that partner PR.
- C/D Codex GPT-6.2 Sol under Thira/D ran the full eight-test auth file at exact CP-V01 locally, 25Nov2026 20:30:14-20:30:18 Bangkok. Result 8 passed, zero failed/skipped, exit0. Local revision N/A.
- TEST-05 is supporting PASS for stored-session expiry rejection, based on the unchanged assertions and whole-file PASS. The default reporter does not list its name or an HTTP transcript; the report's earlier verbose run is not part of this received ZIP.
- No eight-hour wait, live TTL/configuration, live controlled expiry, whole-CD01 completion, final acceptance or ClassPulse PartD completion is established. Existing proposal-only records retain their historical state; this later receipt supersedes their pending-execution status.

Prior [source snapshots and accepted method](../r2-companion-review-20261125/README.md) remain unchanged. Safe localhost identity is reported evidence, not A inspection of C/D's running machine. No connection string or credential value is included. Original UTF-8 punctuation and standard JSON unicode escaping are preserved. A terminal encoding limitation is not an artifact or product defect.
