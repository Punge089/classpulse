"""Build docs/sprints/sprint-1/test-results.md from real test runs.

    python tools/test_results.py              # runs server, client and Playwright tests, then writes the table
    python tools/test_results.py --skip-run   # re-use the JSON files and exit codes from the last run (in tools/.results/)

What it does
  1. Runs `npm --prefix server run test`, `npm --prefix client run test` and `npx playwright test` with JSON reporters
     (all three always run, so one failure does not hide another) and records every runner's exit code.
  2. Reads the planned tests from the Sprint 1 contracts (`| TEST-nn | AC-yy ... |` rows of every STS table).
  3. Finds every executed test whose title starts with the same TEST id (TEST-21a and TEST-21b count for TEST-21).
  4. Writes an AC -> planned TEST -> actual file::title -> result table, plus totals, the commit that was tested
     and the exact commands. An AC with no executed test says so; a failed or skipped test is shown, never hidden.

Exit status: 0 only when everything below holds, otherwise 1 and the first lines of the table say FAILED and why.
  - every runner exited 0 and wrote a report that parses and lists at least one test
  - no test failed, no suite failed to load or run (Vitest lists those with an empty assertionResults), no Playwright error
  - no test was skipped, every planned TEST-nn ran, and every acceptance criterion has an executed test
The table is overwritten (or removed if the script crashes) on every run, so an old green table is never left behind.

Run it from PowerShell (the Playwright run starts the API and the Vite client and needs the seeded development
database, see the README). Needs Python 3.10+ only (standard library).
"""
import argparse
import json
import re
import subprocess
import sys
from collections import OrderedDict, defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACTS = ROOT / "docs" / "sprints" / "sprint-1"
RESULTS = ROOT / "tools" / ".results"
OUT = CONTRACTS / "test-results.md"
EXIT_CODES = RESULTS / "exit-codes.json"
SUITES = ("server", "client", "e2e")

COMMANDS = {
    "server": ("npm --prefix server run test -- --reporter=json --outputFile=" + str(RESULTS / "server.json"), None),
    "client": ("npm --prefix client run test -- --reporter=json --outputFile=" + str(RESULTS / "client.json"), None),
    "e2e": ("npx playwright test --reporter=json", RESULTS / "e2e.json"),
}
TEST_ID = re.compile(r"\bTEST-(\d+)([a-z]?)\b")
AC_ID = re.compile(r"\bAC-\d+\b")
MANUAL = [
    ("NFR-05", "restart the server, then reload a saved response (DEMO-1)", "manual check in Part F"),
    ("NFR-09", "secret scan (`git grep`) and the PR template checklist on the release PR", "manual check in the release PR"),
    ("NFR-07", "loading, empty and error states of the three lists", "manual checklist in Part F, supplements TEST-08, 21, 32"),
]


def report_path(name: str) -> Path:
    return RESULTS / f"{name}.json"


def run(name: str) -> int:
    """Run one suite and return the runner's own exit code."""
    command, stdout_file = COMMANDS[name]
    report_path(name).unlink(missing_ok=True)  # a report left over from an earlier run must never be read as this run's
    print(f"== {command}")
    completed = subprocess.run(command, shell=True, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if stdout_file is not None:  # Playwright prints its JSON report on stdout
        stdout_file.write_text(completed.stdout, encoding="utf-8")
    log = completed.stderr if stdout_file is not None else completed.stdout + completed.stderr
    (RESULTS / f"{name}.log").write_text(log, encoding="utf-8")
    print(f"   exit code {completed.returncode}")
    if completed.returncode != 0:
        print("   last output lines:")
        for line in log.strip().splitlines()[-12:]:
            print("   | " + line)
    return completed.returncode


def read_exit_codes(problems: list) -> dict:
    try:
        data = json.loads(EXIT_CODES.read_text(encoding="utf-8"))
        return {s: int(data[s]) for s in SUITES}
    except (OSError, ValueError, KeyError, TypeError):
        problems.append("no recorded runner exit codes (tools/.results/exit-codes.json is missing or unreadable): "
                        "run without --skip-run so every runner's exit code is known")
        return {}


def planned_tests() -> "OrderedDict[str, dict]":
    """TEST-nn -> {acs: [...], level: str, file: str, source: str} read from every contract."""
    planned: "OrderedDict[str, dict]" = OrderedDict()
    for path in sorted(CONTRACTS.glob("*.md")):
        for line in path.read_text(encoding="utf-8").splitlines():
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) >= 3 and re.fullmatch(r"TEST-\d+[a-z]?", cells[0]) and line.startswith("|"):
                acs = AC_ID.findall(cells[1])
                last = cells[-1].strip("` ")
                planned[cells[0]] = {"acs": acs, "level": cells[2], "file": last, "source": path.name}
    return planned


def acceptance_criteria() -> "OrderedDict[str, str]":
    criteria: "OrderedDict[str, str]" = OrderedDict()
    for path in sorted(CONTRACTS.glob("*.md")):
        for line in path.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^\|\s*(AC-\d+)\s*\|\s*(.+?)\s*\|\s*$", line) or re.match(r"^- \*\*(AC-\d+):\*\*\s*(.+)$", line) or re.match(r"^- (AC-\d+):\s*(.+)$", line)
            if m and m.group(1) not in criteria:
                criteria[m.group(1)] = re.sub(r"\s+", " ", m.group(2)).replace("`", "")
    return criteria


def first_line(text: object) -> str:
    for line in str(text or "").splitlines():
        if line.strip():
            return line.strip()[:160]
    return ""


def read_report(path: Path, suite: str, problems: list):
    """Parsed JSON of a runner's report, or None after recording why it cannot be used."""
    if not path.exists():
        problems.append(f"{suite}: report {path.name} is missing, so no result can be trusted")
        return None
    text = path.read_text(encoding="utf-8", errors="replace")
    if not text.strip():
        problems.append(f"{suite}: report {path.name} is empty (the runner wrote no JSON; see {suite}.log)")
        return None
    start = text.find("{")  # Playwright may print other lines before its JSON on stdout
    try:
        if start < 0:
            raise ValueError("no JSON object found")
        return json.loads(text[start:])
    except ValueError as err:
        problems.append(f"{suite}: report {path.name} is not valid JSON ({err}); first line: {first_line(text)!r}")
        return None


def load_vitest(path: Path, label: str):
    """(tests, problems). A suite that failed to load or run has an empty assertionResults: it becomes a failed entry."""
    problems: list = []
    data = read_report(path, label, problems)
    if data is None:
        return [], problems
    files = data.get("testResults")
    if not isinstance(files, list):
        problems.append(f"{label}: report {path.name} has no testResults list")
        return [], problems
    found = []
    listed = 0
    for file in files:
        name = file.get("name", "")
        try:
            rel = Path(name).resolve().relative_to(ROOT).as_posix() if Path(name).is_absolute() else name
        except ValueError:
            rel = name
        assertions = file.get("assertionResults") or []
        listed += len(assertions)
        for t in assertions:
            found.append({"file": rel, "title": t.get("fullName") or t.get("title", ""), "status": t.get("status", "unknown"), "suite": label})
        if file.get("status") == "failed" and not any(t.get("status") == "failed" for t in assertions):
            found.append({"file": rel, "title": f"(suite failed to run) {first_line(file.get('message')) or 'no message'}",
                          "status": "failed", "suite": label})
    if listed == 0:
        problems.append(f"{label}: no tests were executed (the report lists 0 tests)")
    total = data.get("numTotalTests")
    if isinstance(total, int) and total != listed:
        problems.append(f"{label}: the report says {total} tests but lists {listed}")
    if data.get("success") is False and not any(t["status"] == "failed" for t in found):
        problems.append(f"{label}: the report says success=false but names no failed test")
    return found, problems


def load_playwright(path: Path):
    """(tests, problems) from the JSON report Playwright printed on stdout."""
    problems: list = []
    data = read_report(path, "e2e", problems)
    if data is None:
        return [], problems
    found = []

    def spec_status(spec):
        tests = spec.get("tests", [])
        statuses = []
        for t in tests:
            s = t.get("status")
            if s is None:  # no per-test status: derive it from the attempts
                attempts = [r.get("status") for r in t.get("results", [])]
                s = "expected" if attempts and all(a == "passed" for a in attempts) else "unexpected"
            statuses.append(s)
        if not statuses:
            return "failed"
        if any(s not in ("expected", "skipped") for s in statuses):
            return "failed"
        return "skipped" if "skipped" in statuses else "passed"

    def walk(suite):
        for spec in suite.get("specs", []):
            found.append({"file": "e2e/" + Path(spec.get("file", suite.get("file", ""))).name, "title": spec["title"],
                          "status": spec_status(spec), "suite": "e2e"})
        for child in suite.get("suites", []):
            walk(child)

    for suite in data.get("suites", []):
        walk(suite)
    for err in data.get("errors") or []:
        problems.append(f"e2e: Playwright reported an error: {first_line(err.get('message') if isinstance(err, dict) else err)}")
    if not found:
        problems.append("e2e: no tests were executed (the report lists 0 specs)")
    stats = data.get("stats") or {}
    if stats.get("unexpected", 0) and not any(t["status"] == "failed" for t in found):
        problems.append(f"e2e: the report counts {stats['unexpected']} unexpected results but names no failed spec")
    return found, problems


def git(*args: str) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True).stdout.strip()


def verdict(rows) -> str:
    if not rows:
        return "NO TEST EXECUTED"
    statuses = [r["status"] for r in rows]
    passed = statuses.count("passed")
    if any(s == "failed" for s in statuses):
        return f"FAIL ({passed}/{len(rows)} passed)"
    if any(s in ("skipped", "pending", "todo") for s in statuses):
        return f"SKIPPED ({passed}/{len(rows)} passed)"
    return f"PASS ({passed}/{len(rows)})"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-run", action="store_true", help="re-use tools/.results/*.json and exit-codes.json instead of running the tests")
    ap.add_argument("--out", default=str(OUT))
    args = ap.parse_args()

    out = Path(args.out)
    out.unlink(missing_ok=True)  # if anything below crashes, no earlier (possibly green) table stays behind
    RESULTS.mkdir(parents=True, exist_ok=True)
    problems: list = []

    if args.skip_run:
        exit_codes = read_exit_codes(problems)
    else:
        exit_codes = {name: run(name) for name in SUITES}
        EXIT_CODES.write_text(json.dumps(exit_codes), encoding="utf-8")
    for suite, code in exit_codes.items():
        if code != 0:
            problems.append(f"{suite}: the test runner exited with exit code {code}")

    executed = []
    report_state = {}
    for suite in SUITES:
        tests, found_problems = load_playwright(report_path("e2e")) if suite == "e2e" else load_vitest(report_path(suite), suite)
        executed += tests
        problems += found_problems
        report_state[suite] = "ok" if not found_problems else "PROBLEM"

    totals = defaultdict(lambda: defaultdict(int))
    for t in executed:
        totals[t["suite"]][t["status"]] += 1
    for suite in SUITES:
        s = totals[suite]
        if s["failed"]:
            problems.append(f"{suite}: {s['failed']} failed test(s) or suite(s)")
            names = [f"`{t['file']}` :: {t['title']}" for t in executed if t["suite"] == suite and t["status"] == "failed"]
            problems += [f"{suite}: FAILED {n}" for n in names[:20]]
            if len(names) > 20:
                problems.append(f"{suite}: ... and {len(names) - 20} more failed")
        if s["skipped"] + s["pending"] + s["todo"]:
            problems.append(f"{suite}: {s['skipped'] + s['pending'] + s['todo']} skipped test(s) (a skipped test is not a pass)")

    by_id = defaultdict(list)
    for t in executed:
        for m in TEST_ID.finditer(t["title"]):
            by_id["TEST-" + m.group(1)].append(t)
            break  # the first TEST id in a title is its id

    planned = planned_tests()
    criteria = acceptance_criteria()
    if not planned:
        problems.append(f"no planned tests found in {CONTRACTS}")
    tests_of_ac: "OrderedDict[str, list]" = OrderedDict((ac, []) for ac in criteria)
    for tid, info in planned.items():
        base = re.sub(r"[a-z]$", "", tid)
        for ac in info["acs"]:
            tests_of_ac.setdefault(ac, [])
            if base not in tests_of_ac[ac]:
                tests_of_ac[ac].append(base)

    planned_bases = {re.sub(r"[a-z]$", "", p) for p in planned}
    never = sorted(planned_bases - set(by_id), key=lambda x: int(x.split("-")[1]))
    if never:
        problems.append("planned tests that were not executed: " + ", ".join(never))
    def ac_key(a): return int(a.split("-")[1])
    for ac in sorted(tests_of_ac, key=ac_key):
        if not tests_of_ac[ac]:
            problems.append(f"{ac} has no planned test in any contract")
        elif not any(by_id.get(tid) for tid in tests_of_ac[ac]):
            problems.append(f"{ac} has no executed test (planned: {', '.join(tests_of_ac[ac])})")

    lines = []
    lines.append("# Sprint 1 test results: acceptance criteria to executed tests\n")
    lines.append(f"Generated by `tools/test_results.py` on {datetime.now().strftime('%Y-%m-%d %H:%M')} from real test runs. "
                 "Nothing in the Result column is typed by hand.\n")
    if problems:
        lines.append("**Overall result: FAILED** (the generator exited 1). This table is incomplete or red and is not Sprint 1 evidence until every point below is fixed:\n")
        lines += [f"- {p}" for p in problems]
    else:
        counts = ", ".join(f"{s} {totals[s]['passed']}" for s in SUITES)
        lines.append(f"**Overall result: PASSED**: {counts} passed; 0 failed, 0 skipped; every runner exited 0; "
                     "every planned test and every acceptance criterion has an executed test.")
    lines.append("")
    lines.append(f"- Tested commit: `{git('rev-parse', 'HEAD')}` on branch `{git('branch', '--show-current')}`"
                 + ("" if not git("status", "--porcelain") else " **(working tree has uncommitted changes)**"))
    lines.append("- Commands: `" + "`, `".join(c for c, _ in COMMANDS.values()).replace(str(RESULTS) + "\\", "").replace(str(RESULTS) + "/", "") + "`")
    lines.append("")
    lines.append("| Suite | Runner exit | Report | Passed | Failed | Skipped |")
    lines.append("|---|---|---|---|---|---|")
    for suite in SUITES:
        s = totals[suite]
        code = exit_codes.get(suite, "unknown")
        lines.append(f"| {suite} | {code} | {report_state[suite]} | {s['passed']} | {s['failed']} | {s['skipped'] + s['pending'] + s['todo']} |")
    lines.append("")
    lines.append("## Automated tests per acceptance criterion\n")
    lines.append("| AC | Criterion (from the contract) | Planned test | Executed (file :: title) | Result |")
    lines.append("|---|---|---|---|---|")
    for ac in sorted(tests_of_ac, key=ac_key):
        text = criteria.get(ac, "")
        text = (text[:95] + "…") if len(text) > 96 else text
        tids = tests_of_ac[ac] or ["(none planned)"]
        rows = [r for tid in tests_of_ac[ac] for r in by_id.get(tid, [])]
        # One line per (file, TEST id): "file :: TEST-07 (8 tests)"; TEST-21a/b are shown by their own id.
        groups: "OrderedDict[tuple, int]" = OrderedDict()
        for r in rows:
            m = TEST_ID.search(r["title"])
            key = (r["file"], "TEST-" + m.group(1) + m.group(2))
            groups[key] = groups.get(key, 0) + 1
        titles = "<br>".join(f"`{f}` :: {tid} ({n} test{'s' if n != 1 else ''})" for (f, tid), n in sorted(groups.items())) or "—"
        lines.append(f"| {ac} | {text} | {', '.join(tids)} | {titles} | {verdict(rows)} |")
    unplanned = sorted(t for t in by_id if t not in planned_bases)
    lines.append("")
    if unplanned:
        lines.append("Executed tests whose id is in no contract: " + ", ".join(unplanned) + ".\n")
    lines.append("Planned tests that were not executed: " + (", ".join(never) if never else "none") + ".\n")
    lines.append("## Manual checks (not automated)\n")
    lines.append("| Requirement | Check | Where the evidence is |")
    lines.append("|---|---|---|")
    for req, what, where in MANUAL:
        lines.append(f"| {req} | {what} | {where} |")
    lines.append("")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")

    failed = sum(1 for t in executed if t["status"] == "failed")
    print(f"wrote {out}: {len(executed)} executed tests, {failed} failed, {len(never)} planned tests not executed")
    if problems:
        print(f"FAILED: {len(problems)} problem(s)")
        for p in problems:
            print("  - " + p)
        sys.exit(1)
    print("PASSED")
    sys.exit(0)


if __name__ == "__main__":
    main()
