"""Offline receipt audit. Does not connect to the app, cloud or database."""
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = "bee0d122bf23410e3d2db69649ad5e44959b6cd8"
REVISION = "classpulse-00007-6t9"
checks = 0

def check(condition, label):
    global checks
    if not condition:
        raise AssertionError(label)
    checks += 1

def read(name):
    return json.loads((HERE / name).read_text(encoding="utf-8-sig"))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

manifest = read("SHA256SUMS.json")
actual_files = {p.relative_to(HERE).as_posix() for p in HERE.rglob("*")
                if p.is_file() and p.name != "SHA256SUMS.json" and "__pycache__" not in p.parts}
check(set(manifest) == actual_files, "complete current public manifest")
for name, expected in manifest.items():
    target = (HERE / name).resolve()
    check(target.is_relative_to(HERE), "safe manifest path: " + name)
    check(sha(target) == expected, "public hash: " + name)

receipt = read("source-archive-receipt.json")
check(receipt["sourceArchiveSha256"] == "1f4c502d1cab678ce3eb662e93fcd7120d698930a59c72d90c0b3619fb659e3a", "original ZIP identity")
check(receipt["originalPayloadHashesVerified"] == len(receipt["originalPayloadHashes"]) == 9, "original payload count")
unchanged = 0
for name, expected in receipt["originalPayloadHashes"].items():
    if name == "D-RETEST-REPORT.md":
        check(expected == receipt["originalReportHash"], "original narrative hash provenance")
        continue
    check(sha(HERE / "received-d" / name) == expected, "unchanged D payload: " + name)
    unchanged += 1
check(unchanged == receipt["unchangedPublishedPayloads"] == 8, "eight original public payloads")
check(sha(HERE / receipt["publicNarrative"]) == receipt["publicReportHash"], "public derivative hash")
check(receipt["publicReportHash"] != receipt["originalReportHash"], "redaction has distinct provenance")
check(not (HERE / "received-d" / "D-RETEST-REPORT.md").exists(), "private original not published")

run = read("received-d/retest-results.json")
check(run["source"] == SOURCE and REVISION in run["servingRevision"], "exact retest version")
check(run["runId"] == "CP-FIX-001-D-20261126" and run["operator"] == "Codex (GPT-6) under Thira/D", "actual operator and run")
check(run["startUtc"] == "2026-11-26T11:30:40.777Z" and run["endUtc"] == "2026-11-26T11:30:49.443Z", "actual Cloud interval")
rows = {row["id"]: row for row in run["rows"]}
check(set(rows) == {"CP-RT-01", "CP-RT-02", "CP-RT-03", "CP-RT-04a", "CP-RT-04b"}, "five Cloud subcases")
for name, row in rows.items():
    value = row["actual"]
    check(row["status"] == "PASS", name + " reported outcome")
    check(value["questionOnWire"] == {"prompt": value["prompt"], "type": "RATING", "required": True}, name + " valid companion question")
    check(value["titleLength"] == len(value["titleAsEntered"]), name + " actual title length")
    if row["expected"]["apiStatus"] == 400:
        check(value["apiStatus"] == 400 and value["apiCode"] == "VALIDATION_ERROR", name + " rejection")
        check(any(x["field"] == "title" for x in value["apiDetails"]), name + " title detail")
        check("Title must be 1 to 120 characters" in value["visibleMessage"] and value["titleFeedback"]["describedBy"] == "survey-title-error", name + " inline feedback")
        check(value["beforeOwnerIds"] == value["afterOwnerIds"] and value["newIds"] == [], name + " no new owner-visible draft")
    else:
        check(value["apiStatus"] == 201 and value["readbackStatus"] == 200 and value["status"] == "DRAFT", name + " creation/readback")
        check(value["storedTitle"] == row["expected"]["persistedTitle"] == value["titleOnWire"], name + " stored title")
        check(value["storedQuestion"] == row["expected"]["persistedRequiredRating"], name + " stored prompt")
        check(set(value["afterOwnerIds"]) - set(value["beforeOwnerIds"]) == {value["surveyId"]} and value["newIds"] == [value["surveyId"]], name + " sole added owner-list ID")
check(rows["CP-RT-01"]["actual"]["titleAsEntered"] == "", "empty input")
check(rows["CP-RT-02"]["actual"]["titleAsEntered"] == "   ", "three-space input")
check(len(rows["CP-RT-04a"]["actual"]["storedTitle"]) == 120 and rows["CP-RT-04b"]["actual"]["titleLength"] == 121, "120/121 boundaries")
check(run["newCloudIds"] == [28, 29], "retained Cloud namespace")
check(run["prePublic"]["health"] == run["postPublic"]["health"] == 200 and run["prePublic"]["origin"] == run["postPublic"]["origin"] and run["prePublic"]["assets"] == run["postPublic"]["assets"], "public continuity only")

local = read("received-d/local-retention.json")
check(local["identity"]["db"] == "classpulse_uat6_exercise" and local["identity"]["ip"] == "127.0.0.1" and local["identity"]["readOnly"] == "on" and local["ownedDataDirectoryVerified"], "owned isolated read-only local scope")
check(local["localRecords"] == [{"id": i, "title": "", "status": "DRAFT"} for i in [3, 6, 9]], "retained original LOCAL records")
check(datetime.fromisoformat(local["atUtc"]) < datetime.fromisoformat(run["startUtc"].replace("Z", "+00:00")), "local read preceded Cloud run")
release = read("CP-FIX-001-verified-release.json")
registry = read("registry-index-membership.json")
check(release["verifiedSourceCommit"] == registry["sourceTag"] == SOURCE and release["servingRevision"] == registry["cloudRevision"] == REVISION, "release/source mapping")
check(release["trafficPercent"] == registry["cloudTrafficPercent"] == 100, "recorded serving traffic")
check(release["imageIndexDigest"] == registry["indexDigest"] and release["servingRuntimeManifestDigest"] == registry["platformManifest"]["digest"] == registry["cloudImageDigest"], "index and runtime member mapping")
check(release["imageIndexDigest"] != release["servingRuntimeManifestDigest"], "distinct digest roles")
c_review = read("c-retest-review.json")
check(c_review["id"] == 7190900011 and c_review["reviewer"] == "osizk" and "No cases were rerun as C" in c_review["body"], "actual separate C review, not rerun")
audit = read("a-artifact-review.json")
check(audit["cloudSubcasesPassed"] == 5 and audit["localRetentionPassed"] == 1 and audit["AApplicationRerun"] is False, "artifact versus app-run attribution")

# Scan this new public receipt and current documentation, not unrelated historical files.
docs = [ROOT / "docs/labs/lab-06" / name for name in ["cp-ex-f01-closure.md", "final-acceptance-readiness.md", "report.md", "versions.md", "contributions.md"]]
text_files = [p for p in HERE.rglob("*") if p.suffix in {".md", ".json"}] + docs
for path in text_files:
    content = path.read_text(encoding="utf-8-sig")
    check(re.search(r"https?://(?:www\.)?(?:discord\.com/channels/@me|discordapp\.com/channels/@me)/", content, re.I) is None, "no private DM URL: " + path.name)
    check(re.search(r"postgres(?:ql)?://[^\s/]+:[^\s@]+@|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN .*PRIVATE KEY-----", content) is None, "no credential pattern: " + path.name)

# Validate the links authored in this change. Historical checkpoints remain unmodified.
new_docs = docs[:2] + [HERE / "README.md", HERE / "received-d/D-RETEST-REPORT.redacted.md"]
for path in new_docs:
    for link in re.findall(r"\]\(([^)]+)\)", path.read_text(encoding="utf-8")):
        if link.startswith(("https://", "http://", "#")):
            continue
        target = (path.parent / link.split("#", 1)[0]).resolve()
        check(target.is_relative_to(ROOT) and target.exists(), "local link: " + link)

print(f"PASS: {checks} offline artifact checks; 5 Cloud subcases and 1 separate local observation verified; no application run.")
