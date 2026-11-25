"""Check the report's provenance, chronology, figures, counts and draft boundary."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from datetime import datetime

ROOT = Path(__file__).resolve().parents[2]
EV = ROOT / "evidence/lab-07/report"
REPORT = ROOT / "docs/labs/lab-07/report.md"
checks = []


def check(condition, name):
    if not condition:
        raise AssertionError(name)
    checks.append(name)


manifest = json.loads((EV / "source-manifest.json").read_text(encoding="utf-8"))
for item in manifest["records"]:
    check(hashlib.sha256((EV / item["file"]).read_bytes()).hexdigest() == item["sha256"], "input SHA256: " + item["file"])
report = REPORT.read_text(encoding="utf-8")
check("SOURCE DRAFT - NOT READY FOR SUBMISSION" in report, "unambiguous source-draft state")
check(all(f"# Part {part} -" in report for part in "ABCD"), "all four separate assessed parts")
check(set(map(int, re.findall(r"^\| AC-(\d+) \|", report, re.M))) == set(range(100, 112)), "all12 stable acceptance IDs")
check(set(map(int, re.findall(r"^\| TEST-(\d+) \|", report, re.M))) == set(range(100, 115)), "all15 complete reviewed STS designs")
check("PARTIAL: named suites/CI pass; peer/main/deployed acceptance PENDING" in report, "release AC not claimed complete")
timeline = json.loads((EV / "inputs/timeline.json").read_text())
times = {x["role"]: datetime.fromisoformat(x["committedAt"]) for x in timeline}
c3 = json.loads((EV / "inputs/b-c3.json").read_text())
c3_time = datetime.fromisoformat(c3["created_at"].replace("Z", "+00:00"))
check(times["reviewed contract"] < c3_time < times["primary test-only"] < times["primary RED retained before code"] < times["backend implementation"], "contract/C3/test/retained RED before backend code")
check(times["expanded test-only"] < times["expanded RED retained before code"] < times["backend implementation"], "expanded RED retained before backend code")
check(times["UI test-only"] < times["UI RED retained before UI code"] < times["UI implementation"], "UI RED retained before UI code")
same = json.loads((EV / "inputs/same-test-proof.json").read_text())
check(same["originalDescribeBlockUnchanged"], "unchanged original primary assertions present")
original = (EV / "inputs/primary-tests.ts").read_text(encoding="utf-8")
block = original[original.index('describe("Lab 7 controlled reopening'):].strip()
check(block in (EV / "inputs/candidate-api-tests.ts").read_text(encoding="utf-8") and hashlib.sha256(block.encode()).hexdigest() == same["blockSha256"], "recomputed same-test block matches recorded proof")
red = json.loads((EV / "inputs/primary-red-run.json").read_text())
check(red["testCounts"] == {"passed": 139, "failed": 2, "skipped": 0, "total": 141}, "primary actual139/2/0")
check(sum(x["conclusion"] == "skipped" for x in red["steps"]) == 5, "five skipped pipeline steps disclosed separately")
for name, expected in [("server", 219), ("client", 10)]:
    text = (EV / f"inputs/candidate-{name}-log.txt").read_text()
    check(bool(re.search(rf"Tests\s+{expected} passed \({expected}\)", text)), f"actual current {name} complete passed count")
check("10 passed" in (EV / "inputs/candidate-browser-log.txt").read_text(), "complete10 browser passed count")
window = json.loads((EV / "inputs/branch-ci-window.json").read_text())
check(len({x["id"] for x in window["runs"]}) == len(window["runs"]), "CI runs unique within fully paginated scope")
check(all(str(x["id"]) in report for x in window["runs"]), "every scoped CI outcome embedded")
source = (EV / "inputs/b-source-snapshot.md").read_text()
check(len(re.findall(r"^\| #\d+ \| closed \|", source, re.M)) == 11, "M1 all11 underlying ID/date rows")
check(len(re.findall(r"^\| #\d+ \| sprint-1-staging \|", source, re.M)) == 15, "M2 all15 underlying ID/base/date rows")
interpretation = report.split("## C3 - Interpretation and concrete next action", 1)[1].split("# Part D", 1)[0]
paragraph = interpretation.split("\n\n", 1)[1].split("\n\n", 1)[0]
check(len(paragraph.split()) <= 100, "action/owner interpretation<=100words")
figures = re.findall(r"!\[[^\]]+\]\(([^)]+)\)", report)
check(len(figures) == 3 and all((REPORT.parent / x).resolve().is_file() for x in figures), "all3 self-contained figure links resolve")
check("M4 independent UAT defect disposition" in report and "PENDING; source checkpoint" in report, "no invented zero-defect disposition")
check(not (ROOT / "output/pdf/ClassPulse-Lab7.pdf").exists(), "no falsely finalized PDF")
before = hashlib.sha256(REPORT.read_text(encoding="utf-8").encode("utf-8")).hexdigest()
subprocess.run([sys.executable, str(ROOT / "tools/lab7-report/build_source.py")], cwd=ROOT, check=True, stdout=subprocess.PIPE)
check(hashlib.sha256(REPORT.read_text(encoding="utf-8").encode("utf-8")).hexdigest() == before, "offline source rebuild deterministic in canonical UTF8/LF")
subprocess.run(["git", "diff", "--check"], cwd=ROOT, check=True)
checks.append("git diff whitespace")
print(json.dumps({"passed": len(checks), "failed": 0, "skipped": 0, "reportSha256": before, "reportHashEncoding": "UTF8/LF canonical source, not a final PDF hash", "checks": checks, "status": "source-draft check only; final PDF/release not verified"}, indent=2))
