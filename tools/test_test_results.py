"""Black-box checks for tools/test_results.py: a failed suite, a failed runner or a missing test must never exit 0.

    python -m unittest tools.test_test_results -v        (from the repository root, Python 3.10+, standard library only)

Each case builds a throw-away repository layout in a temporary directory (a copy of the generator, one small
contract, and fake Vitest / Playwright reports), runs the generator on it with --skip-run and reads its exit status
and the table it wrote. The two reporter formats are copied from real runs of this repository.
"""
import json
import os
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

GENERATOR = Path(__file__).resolve().parent / "test_results.py"

CONTRACT = """# F-99 fixture contract

| TEST | AC | Level | File |
|---|---|---|---|
| TEST-01 | AC-01 | API | `server/tests/a.test.ts` |
| TEST-02 | AC-02 | component | `client/tests/b.test.tsx` |
| TEST-03 | AC-03 | E2E | `e2e/c.spec.ts` |

| AC | Criterion |
|---|---|
| AC-01 | server behaviour |
| AC-02 | client behaviour |
| AC-03 | browser behaviour |
"""


def vitest_report(root: Path, rel: str, tests, extra_files=(), success=True):
    """tests: [(title, status)]; extra_files: [(rel, status, message)] suites with no assertionResults."""
    files = [{
        "name": str((root / rel).resolve()),
        "status": "failed" if any(s == "failed" for _, s in tests) else "passed",
        "message": "",
        "assertionResults": [{"fullName": t, "title": t, "status": s} for t, s in tests],
    }]
    for extra_rel, status, message in extra_files:
        files.append({"name": str((root / extra_rel).resolve()), "status": status, "message": message, "assertionResults": []})
    return {
        "numTotalTestSuites": len(files),
        "numFailedTestSuites": sum(1 for f in files if f["status"] == "failed"),
        "numTotalTests": len(tests),
        "numFailedTests": sum(1 for _, s in tests if s == "failed"),
        "success": success,
        "testResults": files,
    }


def playwright_report(specs, errors=()):
    return {
        "config": {},
        "suites": [{"title": "c.spec.ts", "file": "c.spec.ts", "specs": [
            {"title": title, "file": "c.spec.ts",
             "tests": [{"status": "expected" if status == "passed" else status, "results": [{"status": status}]}]}
            for title, status in specs], "suites": []}],
        "errors": list(errors),
        "stats": {"expected": sum(1 for _, s in specs if s == "passed"), "unexpected": sum(1 for _, s in specs if s == "failed")},
    }


class Case(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="cp-results-")).resolve()
        self.addCleanup(shutil.rmtree, self.tmp, True)
        (self.tmp / "tools").mkdir()
        shutil.copy(GENERATOR, self.tmp / "tools" / "test_results.py")
        contracts = self.tmp / "docs" / "sprints" / "sprint-1"
        contracts.mkdir(parents=True)
        (contracts / "F-99-fixture.md").write_text(CONTRACT, encoding="utf-8")
        self.results = self.tmp / "tools" / ".results"
        self.results.mkdir()
        self.out = self.tmp / "out.md"
        subprocess.run(["git", "init", "-q"], cwd=self.tmp, check=False)
        self.write_green()

    def write(self, name, payload):
        text = payload if isinstance(payload, str) else json.dumps(payload)
        (self.results / name).write_text(text, encoding="utf-8")

    def write_green(self):
        self.write("server.json", vitest_report(self.tmp, "server/tests/a.test.ts", [("TEST-01 works", "passed")]))
        self.write("client.json", vitest_report(self.tmp, "client/tests/b.test.tsx", [("TEST-02 works", "passed")]))
        self.write("e2e.json", playwright_report([("TEST-03 works", "passed")]))
        self.write("exit-codes.json", {"server": 0, "client": 0, "e2e": 0})

    def generate(self, *extra, env=None):
        done = subprocess.run([sys.executable, str(self.tmp / "tools" / "test_results.py"), "--skip-run", "--out", str(self.out), *extra],
                              cwd=self.tmp, capture_output=True, text=True, encoding="utf-8", env=env)
        table = self.out.read_text(encoding="utf-8") if self.out.exists() else ""
        return done.returncode, table, done.stdout + done.stderr

    def assertFailsLoudly(self, needle):
        code, table, console = self.generate()
        self.assertNotEqual(code, 0, f"expected a nonzero exit status\n{console}")
        self.assertIn("Overall result: FAILED", table)
        self.assertNotIn("Overall result: PASSED", table)
        self.assertIn(needle, table + console)
        return table


class ExitStatus(Case):
    def test_all_green_exits_zero_and_says_passed(self):
        code, table, console = self.generate()
        self.assertEqual(code, 0, console)
        self.assertIn("Overall result: PASSED", table)

    def test_vitest_suite_failure_with_no_assertion_results(self):
        self.write("server.json", vitest_report(
            self.tmp, "server/tests/a.test.ts", [("TEST-01 works", "passed")],
            extra_files=[("server/tests/broken.test.ts", "failed", "Error: Failed to load url ../src/missing")], success=False))
        table = self.assertFailsLoudly("server/tests/broken.test.ts")
        row = next(l for l in table.splitlines() if l.startswith("| server |"))
        cells = [c.strip() for c in row.strip("|").split("|")]  # Suite, Runner exit, Report, Passed, Failed, Skipped
        self.assertEqual(cells[4], "1", row)  # the suite that failed to run is counted in the Failed column

    def test_vitest_failed_suite_is_counted_even_if_success_flag_is_true(self):
        self.write("client.json", vitest_report(
            self.tmp, "client/tests/b.test.tsx", [("TEST-02 works", "passed")],
            extra_files=[("client/tests/broken.test.tsx", "failed", "SyntaxError")], success=True))
        self.assertFailsLoudly("client/tests/broken.test.tsx")

    def test_runner_exit_code_is_propagated_even_when_the_report_looks_green(self):
        self.write("exit-codes.json", {"server": 1, "client": 0, "e2e": 0})
        self.assertFailsLoudly("exit code 1")

    def test_missing_report_fails(self):
        (self.results / "server.json").unlink()
        self.assertFailsLoudly("server.json")

    def test_empty_or_invalid_report_fails(self):
        self.write("client.json", "")
        self.assertFailsLoudly("client")
        self.write_green()
        self.write("server.json", "not json at all")
        self.assertFailsLoudly("server")

    def test_a_suite_that_ran_zero_tests_fails(self):
        self.write("client.json", vitest_report(self.tmp, "client/tests/b.test.tsx", []))
        self.assertFailsLoudly("no tests")

    def test_planned_test_that_never_ran_fails(self):
        contract = self.tmp / "docs" / "sprints" / "sprint-1" / "F-99-fixture.md"
        contract.write_text(CONTRACT.replace("| TEST-03 | AC-03 | E2E | `e2e/c.spec.ts` |\n",
                                             "| TEST-03 | AC-03 | E2E | `e2e/c.spec.ts` |\n| TEST-04 | AC-03 | E2E | `e2e/d.spec.ts` |\n"), encoding="utf-8")
        self.assertFailsLoudly("TEST-04")

    def test_acceptance_criterion_without_any_executed_test_fails(self):
        self.write("e2e.json", playwright_report([("TEST-99 unrelated", "passed")]))
        self.assertFailsLoudly("TEST-03")

    def test_skipped_test_fails(self):
        self.write("server.json", vitest_report(self.tmp, "server/tests/a.test.ts", [("TEST-01 works", "skipped")]))
        self.assertFailsLoudly("skipped")

    def test_playwright_stdout_that_is_not_json_fails(self):
        self.write("e2e.json", "Error: browserType.launch: Executable doesn't exist")
        self.assertFailsLoudly("e2e")

    def test_playwright_top_level_errors_fail(self):
        self.write("e2e.json", playwright_report([("TEST-03 works", "passed")], errors=[{"message": "webServer timed out"}]))
        self.assertFailsLoudly("webServer timed out")

    def test_playwright_with_no_specs_fails(self):
        self.write("e2e.json", playwright_report([]))
        self.assertFailsLoudly("no tests")


class RunPath(Case):
    """Without --skip-run the generator starts npm/npx; a fake one that exits 3 must make the whole run fail."""

    def test_failing_runner_with_a_stale_green_report_still_fails(self):
        bin_dir = self.tmp / "fakebin"
        bin_dir.mkdir()
        for name in ("npm", "npx"):
            if os.name == "nt":
                (bin_dir / f"{name}.cmd").write_text("@echo off\r\nexit /b 3\r\n", encoding="utf-8")
            else:
                path = bin_dir / name
                path.write_text("#!/bin/sh\nexit 3\n", encoding="utf-8")
                path.chmod(path.stat().st_mode | stat.S_IEXEC)
        env = dict(os.environ, PATH=str(bin_dir) + os.pathsep + os.environ.get("PATH", ""))
        done = subprocess.run([sys.executable, str(self.tmp / "tools" / "test_results.py"), "--out", str(self.out)],
                              cwd=self.tmp, capture_output=True, text=True, encoding="utf-8", env=env)
        table = self.out.read_text(encoding="utf-8")
        self.assertNotEqual(done.returncode, 0, done.stdout + done.stderr)
        self.assertIn("Overall result: FAILED", table)
        self.assertIn("exit code 3", table)


if __name__ == "__main__":
    unittest.main()
