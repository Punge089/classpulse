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
check("WORKING DRAFT - NOT READY FOR SUBMISSION" in report, "unambiguous working-draft state")
check(all(f"# Part {part} -" in report for part in "ABCD"), "all four separate assessed parts")
check(set(map(int, re.findall(r"^\| AC-(\d+) \|", report, re.M))) == set(range(100, 112)), "all12 stable acceptance IDs")
check(set(map(int, re.findall(r"^\| TEST-(\d+) \|", report, re.M))) == set(range(100, 115)), "all15 complete reviewed STS designs")
check("PASS in scoped checks: regression, review, main, deployment and live API verification" in report, "scoped AC-111 checks recorded without claiming final report approval")
timeline = json.loads((EV / "inputs/timeline.json").read_text(encoding="utf-8"))
times = {x["role"]: datetime.fromisoformat(x["committedAt"]) for x in timeline}
c3 = json.loads((EV / "inputs/b-c3.json").read_text(encoding="utf-8"))
c3_time = datetime.fromisoformat(c3["created_at"].replace("Z", "+00:00"))
check(times["reviewed contract"] < c3_time < times["primary test-only"] < times["primary RED retained before code"] < times["backend implementation"], "contract/C3/test/retained RED before backend code")
check(times["expanded test-only"] < times["expanded RED retained before code"] < times["backend implementation"], "expanded RED retained before backend code")
check(times["UI test-only"] < times["UI RED retained before UI code"] < times["UI implementation"], "UI RED retained before UI code")
same = json.loads((EV / "inputs/same-test-proof.json").read_text(encoding="utf-8"))
check(same["originalDescribeBlockUnchanged"], "unchanged original primary assertions present")
original = (EV / "inputs/primary-tests.ts").read_text(encoding="utf-8")
block = original[original.index('describe("Lab 7 controlled reopening'):].strip()
check(block in (EV / "inputs/candidate-api-tests.ts").read_text(encoding="utf-8") and hashlib.sha256(block.encode()).hexdigest() == same["blockSha256"], "recomputed same-test block matches recorded proof")
red = json.loads((EV / "inputs/primary-red-run.json").read_text(encoding="utf-8"))
check(red["testCounts"] == {"passed": 139, "failed": 2, "skipped": 0, "total": 141}, "primary actual139/2/0")
check(sum(x["conclusion"] == "skipped" for x in red["steps"]) == 5, "five skipped pipeline steps disclosed separately")
for name, expected in [("server", 219), ("client", 10)]:
    text = (EV / f"inputs/candidate-{name}-log.txt").read_text(encoding="utf-8")
    check(bool(re.search(rf"Tests\s+{expected} passed \({expected}\)", text)), f"retained historical {name} complete passed count")
check("10 passed" in (EV / "inputs/candidate-browser-log.txt").read_text(encoding="utf-8"), "complete10 browser passed count")
window = json.loads((EV / "inputs/branch-ci-window.json").read_text(encoding="utf-8"))
check(len({x["id"] for x in window["runs"]}) == len(window["runs"]), "CI runs unique within fully paginated scope")
check(all(str(x["id"]) in report for x in window["runs"]), "every scoped CI outcome embedded")
source = (EV / "inputs/b-source-snapshot.md").read_text(encoding="utf-8")
check(len(re.findall(r"^\| #\d+ \| closed \|", source, re.M)) == 11, "M1 all11 underlying ID/date rows")
check(len(re.findall(r"^\| #\d+ \| sprint-1-staging \|", source, re.M)) == 15, "M2 all15 underlying ID/base/date rows")
interpretation = report.split("## C3 - Interpretation and concrete next action", 1)[1].split("# Part D", 1)[0]
paragraph = interpretation.split("\n\n", 1)[1].split("\n\n", 1)[0]
check(len(paragraph.split()) <= 100, "action/owner interpretation<=100words")
figures = re.findall(r"!\[[^\]]+\]\(([^)]+)\)", report)
check(len(figures) == 3 and all((REPORT.parent / x).resolve().is_file() for x in figures), "all3 self-contained figure links resolve")
readback = json.loads((EV / "inputs/nov27-baseline-and-staging.json").read_bytes())
baseline = readback["baseline"]
integration = readback["integration"]
decision_time = datetime.fromisoformat("2026-11-27T01:35:39+07:00")
check(times["backend implementation"] < datetime.fromisoformat(integration["mergedAt"]) < decision_time, "baseline acceptance chronology follows feature implementation and staging merge")
for path, expected in baseline["oldFiles"].items():
    revisions = [baseline["source"], timeline[0]["commit"], same["oldCommit"]]
    check(all(subprocess.check_output(["git", "rev-parse", f"{ref}:{path}"], cwd=ROOT, text=True).strip() == expected for ref in revisions), f"identical old-code blob on baseline and RED sources: {path}")
check(baseline["source"] in report and baseline["revision"] in report and "Historical live M01 remains **BLOCKED**" in report and "isolated exact-source auth suite passed 8/8" in report, "accepted baseline and isolated/live limits embedded")
check(integration["reviewBody"] in report and integration["inlineBody"] in report and integration["head"] in report, "review and precise inline finding embedded")
merge_info = subprocess.check_output(["git", "show", "-s", "--format=%P %T", integration["merge"]], cwd=ROOT, text=True).split()
check(merge_info == [integration["base"], integration["head"], integration["tree"]], "staging merge pins both parents and tested tree")
check(integration["testedMerge"] in report and str(integration["runId"]) in report and all(step["conclusion"] == "success" for step in integration["jobSteps"]), "exact PR CI checkout, run and all job step outcomes")
check(integration["counts"] == {area: {"passed": passed, "failed": 0, "skipped": 0} for area, passed in (("server", 219), ("client", 10), ("browser", 10))}, "latest PR CI counts by suite")
check("1/1 recorded exercise defects resolved" in report and "CP-EX-F01 Minor" in report and "Lab 7 deployed product disposition pending" in report, "M4 records only the independently verified exercise defect")
check(all(x in report for x in ("L7-B09", "L7-B10", "L7-B11", "L7-B12")), "all four release and manual readback obligations embedded")
release = json.loads((EV / "inputs/nov28-main-release.json").read_bytes())
release_git = subprocess.check_output(["git", "show", "-s", "--format=%P %T", release["main"]], cwd=ROOT, text=True).split()
check(release_git == [release["base"], release["approvedHead"], release["tree"]], "actual main merge parents and tree match release evidence")
check(all(str(release[key]) in report for key in ("main", "approvedHead", "deployRun", "digest", "url")), "main and automated deploy details embedded")
cloud = json.loads((EV / "inputs/nov28-live-readback.json").read_bytes())
check(cloud["sourceCommit"] == release["main"] and cloud["publishedIndexDigest"] == release["digest"], "live revision mapped to the exact deployed release")
check(cloud["trafficPercent"] == 100 and cloud["migrationTaskExitCode"] == 0 and all(cloud[k] in report for k in ("servingRevision", "platformManifestDigest", "migrationExecution", "migrationName")), "Cloud Run traffic, platform digest and named successful migration embedded")
legacy = cloud["retentionSample"]
check(legacy["result"] == "PASS" and legacy["responseStatus"] == 200 and legacy["actual"]["ratingMatched"] and legacy["actual"]["choiceMatched"] and "This is one retained response sample." in report, "pre-migration sample readback is embedded with its limit")
live = json.loads((EV / "inputs/nov28-live-reopen.json").read_bytes())
check(live["source"] == cloud["sourceCommit"] and live["postRunConsole"]["revision"] == cloud["servingRevision"] and live["postRunConsole"]["trafficPercent"] == 100, "before and after revision match the live run")
check(live["result"] == "PASS" and len(live["checks"]) == 14 and all(c["outcome"] == "PASS" for c in live["checks"]), "14 actual live observations all passed")
check(all(x in report for x in ("HTTP 409 ALREADY_RESPONDED", "both 404", "Response 17 retained rating 4", "CLOSED version 2 reopened")), "changed and preserved results embedded")
check(len(live["logouts"]) == 3 and all(c["status"] == 204 for c in live["logouts"]), "three synthetic sessions logged out")
check(not (ROOT / "output/pdf/ClassPulse-Lab7.pdf").exists(), "no falsely finalized PDF")
before = hashlib.sha256(REPORT.read_text(encoding="utf-8").encode("utf-8")).hexdigest()
subprocess.run([sys.executable, str(ROOT / "tools/lab7-report/build_source.py")], cwd=ROOT, check=True, stdout=subprocess.PIPE)
check(hashlib.sha256(REPORT.read_text(encoding="utf-8").encode("utf-8")).hexdigest() == before, "offline source rebuild deterministic in canonical UTF8/LF")
subprocess.run(["git", "diff", "--check"], cwd=ROOT, check=True)
checks.append("git diff whitespace")
print(json.dumps({"passed": len(checks), "failed": 0, "skipped": 0, "reportSha256": before, "reportHashEncoding": "UTF8/LF canonical source, not a final PDF hash", "checks": checks, "status": "source-draft check only; final PDF/release not verified"}, indent=2))
