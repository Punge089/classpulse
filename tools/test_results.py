"""Build docs/sprints/sprint-1/test-results.md from real test runs.

    python tools/test_results.py              # runs server, client and Playwright tests, then writes the table
    python tools/test_results.py --skip-run   # re-use the JSON files from the last run (in tools/.results/)

What it does
  1. Runs `npm --prefix server run test`, `npm --prefix client run test` and `npx playwright test` with JSON reporters.
  2. Reads the planned tests from the Sprint 1 contracts (`| TEST-nn | AC-yy ... |` rows of every STS table).
  3. Finds every executed test whose title starts with the same TEST id (TEST-21a and TEST-21b count for TEST-21).
  4. Writes an AC -> planned TEST -> actual file::title -> result table, plus totals, the commit that was tested
     and the exact commands. An AC with no executed test says so; a failed or skipped test is shown, never hidden.

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


def run(name: str) -> None:
    command, stdout_file = COMMANDS[name]
    print(f"== {command}")
    completed = subprocess.run(command, shell=True, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if stdout_file is not None:  # Playwright prints its JSON report on stdout
        stdout_file.write_text(completed.stdout, encoding="utf-8")
    print(f"   exit code {completed.returncode}")


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


def load_vitest(path: Path, label: str):
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    found = []
    for file in data.get("testResults", []):
        rel = Path(file["name"]).resolve().relative_to(ROOT).as_posix() if Path(file["name"]).is_absolute() else file["name"]
        for t in file.get("assertionResults", []):
            found.append({"file": rel, "title": t.get("fullName") or t.get("title", ""), "status": t.get("status", "unknown"), "suite": label})
    return found


def load_playwright(path: Path):
    if not path.exists() or not path.read_text(encoding="utf-8").strip():
        return []
    text = path.read_text(encoding="utf-8")
    data = json.loads(text[text.index("{"):])
    found = []

    def walk(suite, trail):
        for spec in suite.get("specs", []):
            results = [r.get("status") for t in spec.get("tests", []) for r in t.get("results", [])]
            expected = [t.get("status") for t in spec.get("tests", [])]
            if "skipped" in expected:
                status = "skipped"
            elif results and all(s == "passed" for s in results):
                status = "passed"
            else:
                status = "failed"
            found.append({"file": "e2e/" + Path(spec.get("file", suite.get("file", ""))).name, "title": spec["title"], "status": status, "suite": "e2e"})
        for child in suite.get("suites", []):
            walk(child, trail + [child.get("title", "")])

    for suite in data.get("suites", []):
        walk(suite, [suite.get("title", "")])
    return found


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
    ap.add_argument("--skip-run", action="store_true", help="re-use tools/.results/*.json instead of running the tests")
    ap.add_argument("--out", default=str(OUT))
    args = ap.parse_args()

    RESULTS.mkdir(parents=True, exist_ok=True)
    if not args.skip_run:
        for name in ("server", "client", "e2e"):
            run(name)

    executed = load_vitest(RESULTS / "server.json", "server") + load_vitest(RESULTS / "client.json", "client") + load_playwright(RESULTS / "e2e.json")
    by_id = defaultdict(list)
    for t in executed:
        for m in TEST_ID.finditer(t["title"]):
            by_id["TEST-" + m.group(1)].append(t)
            break  # the first TEST id in a title is its id

    planned = planned_tests()
    criteria = acceptance_criteria()
    tests_of_ac: "OrderedDict[str, list]" = OrderedDict((ac, []) for ac in criteria)
    for tid, info in planned.items():
        base = re.sub(r"[a-z]$", "", tid)
        for ac in info["acs"]:
            tests_of_ac.setdefault(ac, [])
            if base not in tests_of_ac[ac]:
                tests_of_ac[ac].append(base)

    def ac_key(a): return int(a.split("-")[1])
    lines = []
    lines.append("# Sprint 1 test results: acceptance criteria to executed tests\n")
    lines.append(f"Generated by `tools/test_results.py` on {datetime.now().strftime('%Y-%m-%d %H:%M')} from real test runs. "
                 "Nothing in the Result column is typed by hand.\n")
    lines.append(f"- Tested commit: `{git('rev-parse', 'HEAD')}` on branch `{git('branch', '--show-current')}`"
                 + ("" if not git("status", "--porcelain") else " **(working tree has uncommitted changes)**"))
    lines.append("- Commands: `" + "`, `".join(c for c, _ in COMMANDS.values()).replace(str(RESULTS) + "\\", "").replace(str(RESULTS) + "/", "") + "`")
    totals = defaultdict(lambda: defaultdict(int))
    for t in executed:
        totals[t["suite"]][t["status"]] += 1
    lines.append("")
    lines.append("| Suite | Passed | Failed | Skipped |")
    lines.append("|---|---|---|---|")
    for suite in ("server", "client", "e2e"):
        s = totals[suite]
        lines.append(f"| {suite} | {s['passed']} | {s['failed']} | {s['skipped'] + s['pending'] + s['todo']} |")
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
    unplanned = sorted(t for t in by_id if t not in {re.sub(r'[a-z]$', '', p) for p in planned})
    lines.append("")
    if unplanned:
        lines.append("Executed tests whose id is in no contract: " + ", ".join(unplanned) + ".\n")
    never = sorted({re.sub(r'[a-z]$', '', p) for p in planned} - set(by_id), key=lambda x: int(x.split("-")[1]))
    lines.append("Planned tests that were not executed: " + (", ".join(never) if never else "none") + ".\n")
    lines.append("## Manual checks (not automated)\n")
    lines.append("| Requirement | Check | Where the evidence is |")
    lines.append("|---|---|---|")
    for req, what, where in MANUAL:
        lines.append(f"| {req} | {what} | {where} |")
    lines.append("")
    Path(args.out).write_text("\n".join(lines) + "\n", encoding="utf-8")
    failed = sum(1 for t in executed if t["status"] == "failed")
    print(f"wrote {args.out}: {len(executed)} executed tests, {failed} failed, {len(never)} planned tests not executed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
