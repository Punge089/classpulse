"""Rebuild the Lab 7 draft offline from pinned project evidence.

Use --capture to re-read the historical 25 November sources at their pinned cutoff. No application, database,
cloud or submission operation is performed. Default execution verifies stored
input hashes and assembles Markdown; PDF layout/final acceptance are separate.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
from datetime import datetime, timedelta, timezone

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "evidence/lab-07/report"
INPUTS = EVIDENCE / "inputs"
DOCS = ROOT / "docs/labs/lab-07"
HEAD = "45f48cdcd0999e2dbbb5cb4e70638999ff25e3e8"
CONTRACT = "8017c9183302e4e0c5ff04cd997704255420b8fb"
PRIMARY = "3f8918ceefd5eb55cdebd970710fd0789bd38c98"
METRICS = "e8832b664429e9895df75222984a5240f1cbcf05"
RUN = 45613368930
BG = timezone(timedelta(hours=7))


def command(*args: str) -> bytes:
    return subprocess.check_output(args, cwd=ROOT)


def blob(ref: str, path: str) -> bytes:
    return command("git", "show", f"{ref}:{path}")


def api(path: str):
    return json.loads(command("gh", "api", path))


def capture() -> None:
    INPUTS.mkdir(parents=True, exist_ok=True)
    records = []

    def save(name: str, data: bytes, source: dict) -> None:
        original = data
        if not name.endswith(".png"):
            data = ("\n".join(line.rstrip() for line in data.decode("utf-8").splitlines()).rstrip() + "\n").encode("utf-8")
        if data != original:
            source = {**source, "originalSha256": hashlib.sha256(original).hexdigest(), "normalization": "LF, line-end whitespace and extra EOF blank lines only; content/assertions not changed"}
            if source.get("derivation") == "exact Git blob":
                source["derivation"] = "Git blob with declared formatting normalization; original byte hash retained"
        destination = EVIDENCE / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
        records.append({"file": name, "sha256": hashlib.sha256(data).hexdigest(), **source})

    def saved_json(name: str, value, source: dict) -> None:
        save("inputs/" + name, (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode(), source)

    copies = [
        (CONTRACT, "docs/labs/lab-07/maintenance-contract.md", "contract-before-code.md"),
        ("c99748c", "docs/srs.md", "srs-before.md"),
        (CONTRACT, "docs/srs.md", "srs-revised.md"),
        (PRIMARY, "server/tests/api/surveyReopen.test.ts", "primary-tests.ts"),
        (HEAD, "server/tests/api/surveyReopen.test.ts", "candidate-api-tests.ts"),
        (HEAD, "server/src/routes/ownerSurveys.ts", "candidate-owner-routes.ts"),
        (HEAD, "server/prisma/migrations/20261125110000_survey_lifecycle_audit/migration.sql", "migration.sql"),
        (HEAD, "evidence/lab-07/maintenance/red-ci-server.txt", "primary-red-log.txt"),
        (HEAD, "evidence/lab-07/maintenance/red-ci-run.json", "primary-red-run.json"),
        (HEAD, "evidence/lab-07/maintenance/red-followup-runs.json", "red-followup-runs.json"),
        (HEAD, "evidence/lab-07/maintenance/migration-results.txt", "migration-results.txt"),
        (HEAD, "evidence/lab-07/maintenance/ui-red.json", "ui-red.json"),
        (HEAD, "evidence/lab-07/maintenance/core-green-run.json", "core-green-run.json"),
        (HEAD, "evidence/lab-07/maintenance/browser-green-ci-run.json", "browser-green-ci-run.json"),
        (METRICS, "docs/labs/lab-07/metrics.md", "b-metrics.md"),
        (METRICS, "docs/labs/lab-07/readiness.md", "b-readiness.md"),
        (METRICS, "docs/labs/lab-07/retrospective.md", "b-retrospective.md"),
        (METRICS, "evidence/lab-07/metrics/2026-11-25-snapshot.md", "b-source-snapshot.md"),
        (HEAD, "playwright.config.ts", "playwright-config.ts"),
        (HEAD, "client/vite.config.ts", "vite-config.ts"),
        ("292a698", "docs/labs/lab-07/assignment-changes.md", "assignment-changes.md"),
    ]
    for ref, path, name in copies:
        full = command("git", "rev-parse", f"{ref}^{{commit}}").decode().strip()
        save("inputs/" + name, blob(full, path), {"commit": full, "path": path, "derivation": "exact Git blob"})
    for name in ["reopened-owner-history.png", "stale-tab-explicit-reload.png", "eligible-student-confirmation.png"]:
        path = "evidence/lab-07/maintenance/browser-screenshots/" + name
        save("screenshots/" + name, blob(HEAD, path), {"commit": HEAD, "path": path, "derivation": "exact Git blob; screenshot from CI run 45610750485 on24eed7a"})
    for label, paths in [
        ("spec-revision.diff", ["docs/srs.md", "docs/features.md", "docs/system-sds.md", "docs/sprints/sprint-1/F-03-survey-authoring.md", "docs/traceability.md"]),
        ("lifecycle-implementation.diff", ["server/src/lib/surveyLifecycle.ts"]),
    ]:
        end = CONTRACT if label.startswith("spec") else "3203c3a"
        save("inputs/" + label, command("git", "diff", "c99748c", end, "--", *paths), {"from": "c99748c", "to": end, "paths": paths, "derivation": "actual git diff"})
    c3 = api("repos/Punge089/classpulse/issues/comments/7159676041")
    assert c3["user"]["login"] == "book6349"
    saved_json("b-c3.json", {k: c3[k] for k in ["id", "body", "created_at", "html_url"]}, {"endpoint": "issues/comments/7159676041", "author": "book6349"})
    prior_manifest = json.loads((EVIDENCE / "source-manifest.json").read_text(encoding="utf-8"))
    for name in ("implementation-review.json", "nov27-baseline-and-staging.json", "nov28-metrics-integration.json", "nov28-main-release.json", "nov28-live-readback.json", "nov28-live-reopen.json", "b-final-metrics.md", "b-final-readiness.md", "b-final-retrospective.md", "b-final-production-refresh.md", "nov28-final-metrics-review.json"):
        relative = "inputs/" + name
        record = next(item for item in prior_manifest["records"] if item["file"] == relative)
        assert hashlib.sha256((EVIDENCE / relative).read_bytes()).hexdigest() == record["sha256"], relative
        records.append(record)
    historical_end = prior_manifest["observedAtUTC"]
    historical_bangkok = prior_manifest["observedAtBangkok"]
    run = json.loads(command("gh", "run", "view", str(RUN), "--json", "headSha,status,conclusion,url,createdAt,updatedAt,jobs"))
    assert run["headSha"] == HEAD and run["conclusion"] == "success"
    saved_json("candidate-ci.json", run, {"run": RUN, "head": HEAD})
    raw = command("gh", "run", "view", str(RUN), "--log").decode("utf-8-sig")
    raw = re.sub(r"(?:\x1b|\^\[)\[[0-?]*[ -/]*[@-~]", "", raw)
    for step, name, pattern in [
        ("Test server", "server", r"Tests\s+219 passed \(219\)"),
        ("Test client", "client", r"Tests\s+10 passed \(10\)"),
        ("Test complete browser suite", "browser", r"10 passed"),
    ]:
        lines = [line.split("\t", 2)[2].rstrip() for line in raw.splitlines() if len(line.split("\t", 2)) == 3 and line.split("\t", 2)[1] == step]
        text = re.sub(r"(DATABASE_URL:|SEED_PASSWORD:).*", r"\1 [omitted]", "\n".join(lines)).strip() + "\n"
        assert re.search(pattern, text)
        save(f"inputs/candidate-{name}-log.txt", text.encode(), {"run": RUN, "step": step, "derivation": "complete step output, ANSI/trailing space normalized; environment values omitted"})
    observed = historical_end
    runs = []
    for page in range(1, 101):
        result = api(f"repos/Punge089/classpulse/actions/runs?branch=feature%2F87-lab7-survey-reopening&per_page=100&page={page}")
        for item in result["workflow_runs"]:
            if item["name"] == "CI and Docker" and "2026-11-25T00:00:00Z" <= item["created_at"] <= observed:
                runs.append({k: item[k] for k in ["id", "head_sha", "status", "conclusion", "created_at", "html_url"]})
        if len(result["workflow_runs"]) < 100:
            break
    else:
        raise RuntimeError("CI pagination cap reached; do not publish an incomplete count")
    saved_json("branch-ci-window.json", {"start": "2026-11-25T00:00:00Z", "end": observed, "workflow": "CI and Docker", "branch": "feature/87-lab7-survey-reopening", "runs": sorted(runs, key=lambda x: x["created_at"])}, {"pagination": "100/page until short page", "scope": "only the named branch/workflow/window"})
    timeline = []
    for ref, role in [(CONTRACT, "reviewed contract"), (PRIMARY, "primary test-only"), ("d137db0", "primary RED retained before code"), ("a9cdbce", "expanded test-only"), ("79459c8", "expanded RED retained before code"), ("3203c3a", "backend implementation"), ("ff5e299", "UI test-only"), ("7e84f6f", "UI RED retained before UI code"), ("7c4818c", "UI implementation"), ("d7251f6", "migration regression"), ("24eed7a", "real-browser regression"), ("d96059b", "complete boundary regression"), (HEAD, "current review head")]:
        sha, timestamp = command("git", "show", "-s", "--format=%H%n%cI", ref).decode().strip().splitlines()
        timeline.append({"commit": sha, "committedAt": timestamp, "bangkok": datetime.fromisoformat(timestamp).astimezone(BG).isoformat(), "role": role})
    saved_json("timeline.json", timeline, {"derivation": "actual Git commit metadata, not inferred approval times"})
    old = (INPUTS / "primary-tests.ts").read_text(encoding="utf-8")
    new = (INPUTS / "candidate-api-tests.ts").read_text(encoding="utf-8")
    block = old[old.index('describe("Lab 7 controlled reopening'):].strip()
    assert block in new
    saved_json("same-test-proof.json", {"oldCommit": PRIMARY, "candidate": HEAD, "originalDescribeBlockUnchanged": True, "blockSha256": hashlib.sha256(block.encode()).hexdigest()}, {"derivation": "exact original describe block is present in current test file"})
    provenance = json.loads(blob("292a698", "evidence/lab-07/sources/manifest.json"))
    saved_json("assignment-provenance.json", {"sourceCommit": "292a698", "announcementPublisher": provenance["announcementPublisher"], "announcementPublicationDate": provenance["announcementPublicationDate"], "sources": [x for x in provenance["sources"] if x["name"] in ["Lab_7_Sprint_1_Maintenance.pdf", "highlighted-original-approval.png"]]}, {"derivation": "Lab 7 entries selected from original supplied-source manifest"})
    manifest = {"sourceSnapshotVersion": "1", "observedAtUTC": observed, "observedAtBangkok": historical_bangkok, "candidate": HEAD, "candidateRun": RUN, "status": "NOT READY / pinned source snapshot", "records": records}
    (EVIDENCE / "source-manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")


def assemble() -> None:
    manifest = json.loads((EVIDENCE / "source-manifest.json").read_text(encoding="utf-8"))
    for record in manifest["records"]:
        assert hashlib.sha256((EVIDENCE / record["file"]).read_bytes()).hexdigest() == record["sha256"], record["file"]

    def read(name: str) -> str:
        return (INPUTS / name).read_text(encoding="utf-8")

    def data(name: str):
        return json.loads(read(name))

    def display_log(text: str) -> str:
        return re.sub(r"(?m)^\d{4}-\d{2}-\d{2}T[\d:.]+Z ?", "", text).strip()

    def log_tail(name: str, lines: int) -> str:
        return "\n".join(display_log(read(name)).splitlines()[-lines:])

    contract = read("contract-before-code.md")
    assessed = contract[contract.index("## 3."):contract.index("## 11.")].strip().replace("\n## ", "\n### ")
    assessed = re.sub(r"^## ", "### ", assessed)
    c3 = data("b-c3.json")
    timeline = "\n".join(f'| {x["role"].replace("current review head", "historical CI head")} | `{x["commit"]}` | {x["bangkok"]} |' for x in data("timeline.json"))
    old_row = next(x for x in read("srs-before.md").splitlines() if x.startswith("| BR-03 |"))
    new_rows = "\n".join(x for x in read("srs-revised.md").splitlines() if re.match(r"\| (BR-03|FR-19|BR-15) \|", x))
    red = display_log(read("primary-red-log.txt"))
    red = red[red.index("Failed Tests 2"):]
    owner = read("candidate-owner-routes.ts")
    transition = owner[owner.index("function transition("):owner.index('/** Mounted at /api/owner')].strip()
    historical = read("b-source-snapshot.md")
    historical = historical[historical.index("## Issue completion source rows"):historical.index("## Test-first and readiness sources")].strip()
    window = data("branch-ci-window.json")
    successes = sum(x["conclusion"] == "success" for x in window["runs"])
    failures = sum(x["conclusion"] == "failure" for x in window["runs"])
    cancelled = sum(x["conclusion"] == "cancelled" for x in window["runs"])
    other = len(window["runs"]) - successes - failures - cancelled
    ci_rows = "\n".join(f'| {x["id"]} | `{x["head_sha"]}` | {x["status"]} / {x["conclusion"] or "pending"} | {x["created_at"]} |' for x in window["runs"])
    readback = data("nov27-baseline-and-staging.json")
    baseline = readback["baseline"]
    integration = readback["integration"]
    metrics_pr = data("nov28-metrics-integration.json")
    release = data("nov28-main-release.json")
    cloud = data("nov28-live-readback.json")
    legacy = cloud["retentionSample"]
    live = data("nov28-live-reopen.json")
    observed = {step["id"]: step["actual"] for step in live["checks"]}
    def bangkok(time: str) -> str:
        return datetime.fromisoformat(time.replace("Z", "+00:00")).astimezone(BG).strftime("%d %b %Y %H:%M:%S ICT")

    staging_state = integration["merge"]
    review_time = bangkok(integration["reviewedAt"])
    merge_time = bangkok(integration["mergedAt"])
    ci_time = bangkok(integration["completedAt"])
    ci_steps = ", ".join(step["name"] for step in integration["jobSteps"] if step["conclusion"] in {"failure", "skipped", "cancelled"}) or "none"
    final_metrics = data("nov28-final-metrics-review.json")
    final_readiness = read("b-final-readiness.md")
    final_retro = read("b-final-retrospective.md").split("## Post-deployment retrospective", 1)[1]
    retro_answers = "\n".join(line for line in final_retro.splitlines() if line.startswith("- **"))
    assert len(retro_answers.splitlines()) == 3 and "PENDING independent UAT disposition" in final_readiness
    interpretation = re.search(r"^Interpretation at this refresh \(75 words\): (.+)$", read("b-final-metrics.md"), re.M).group(1)
    assert len(interpretation.split()) <= 100
    report = f'''# ClassPulse - Lab 7 maintenance report

**Version 1.0 - Lab 7 maintenance report**

Historical test and metrics snapshot: {manifest["observedAtBangkok"]}. Baseline and PR #92 readback: {readback["observedBangkok"]}. Lab 7 merged into main and automated deployment passed. Cloud Run and a pre-existing response were verified. The live API check passed. The report includes B’s reviewed metrics. This PDF covers Lab 7.

| Student | ID | GitHub | Actual role at this snapshot |
|---|---|---|---|
| Bannasorn Thongkorn | 67070503420 | Punge089 | Contract, implementation, live checks and report; reviewed and merged B’s final metrics PR #148 |
| Papangkorn Jitvoottikrai | 67070503421 | book6349 | Reviewed the contract; authored metrics, readiness and retrospective; approved and merged #92 and release #143 |

Theme 10: university course feedback. Repository: https://github.com/Punge089/classpulse. Due 29 November 2026, 23:59 Asia/Bangkok. PDF review is tracked in PR #104. The LEB2 receipt records submission.

## Navigation and version map

| Part | Points | Sections / evidence IDs | Final PDF pages |
|---|---:|---|---|
| A - change and reviewed contract | 25 | A1-A4; L7-A01..A04 | Draft page range calculated at render |
| B - implementation and regression-safe delivery | 50 | B1-B6; L7-B01..B12 | Draft page range calculated at render |
| C - objective metrics | 15 | C1-C3; L7-C01..C03 | Draft page range calculated at render |
| D - readiness and retrospective | 10 | D1-D4; L7-D01..D03 | Draft page range calculated at render |

| Reference | Exact value / status | Meaning |
|---|---|---|
| Original submitted Sprint 1 tag | v1.0.0-sprint1, d4bad74211729032697164f378638efb834a67b6 | Immutable historical release; not substituted for Lab 6 acceptance |
| Lab 6 CP-V01 source | 1fe3e3b82dfb0537be30223c9b598b3479b4affe | Attributed from Lab 6 records; not freshly cloud-verified by this report |
| Accepted Sprint 1 release from Lab 6 | CP-FIX-001 / {baseline["source"]}; Cloud Run {baseline["revision"]} | D accepted identified scope 27 Nov 01:35:39 ICT; C acknowledged 02:01:21 |
| Actual pre-change implementation | {CONTRACT} | Contract-only commit on staging c99748c; old server/client behavior unchanged |
| Primary test head | {PRIMARY} | Existing app plus two new missing-behavior assertions |
| Primary CI tested merge | d34d22018affa62c75009fa4e8be01b7ab728799 | Test merge of c99748c and3f8918c, not a different implementation |
| Historical feature test snapshot | {HEAD} | Run {RUN}; retained step logs and figures below |
| B-approved PR #92 head | {integration["head"]} | B C7 {review_time}; required CI run {integration["runId"]} |
| Feature staging integration | {staging_state} | B merged {merge_time}; same parents and tree as required CI checkout |
| GitHub staging at readback | {readback["staging"]} | Descendant of the Lab 7 feature merge |
| GitHub main before Lab 7 release | {readback["main"]} | Prior Lab 6 release from PR #121 |
| Reviewed Lab 7 main merge | {release["main"]} | PR #143; automated deploy run {release["deployRun"]} passed. No release tag is claimed |
| Lab 7 service URL | {release["url"]} | {cloud["servingRevision"]} received {cloud["trafficPercent"]}% of traffic at readback. See B6 for image digests. |

Intervening work includes Lab 5 deployment/CI and Lab 6 test tooling and UAT evidence. The Lab 6 title-validation correction reached main in PR #121. Sprint 2 staging has since absorbed later-sprint work, including F-09 response history (PR #119). The two old lifecycle implementation files match across the accepted release and the RED source. See A1 for the source comparison.

# Part A - Change impact and updated contract (25)

## A1 - Precise change and announcement (L7-A01)

Issue #87 changes previously correct terminal-CLOSED behavior. Proposed scenario: interrupted class collection needs to resume without cloning the survey, losing answers or letting previous respondents submit twice. Owner-only explicit reopening requires a trimmed 10-300 UTF-16-unit reason and current lifecycle version, writes one durable event atomically, preserves first publication/previous answers and never returns to DRAFT.

The supplied later announcement states: "You need not get Instructor or TA Approval for your change request to Sprint 1." The team must choose a nontrivial change. This supersedes the individual approval requirement in the original PDF; it does not remove teammate contract review. The announcement's original publisher/publication date were not independently supplied/verified; A supplied its text on25 Nov. The supplied highlighted image shows the older paragraph, not a screenshot of the later announcement. Source PDF SHA256:13a82d2ec507a84aecd56811bf21f532439e5bb89c34002863d28098cf8b24cb.

Old SRS row, actual pre-change rule:

| ID | Assessed requirement | Sprint |
|---|---|---|
{old_row}

D records **Accepted** for CP-FIX-001, Sprint 1 identified surveys, on 27 November at 01:35:39 ICT. C later acknowledged D's decision and confirmed D's isolated evidence on 27 November at 02:01:21 ICT. The earlier 26 November 19:05:26 decision was Not Accepted. The current decision record and C's acknowledgment are pinned in L7-A01. Historical live M01 remains **BLOCKED**: identity returned HTTP 200 before logout and logout returned 204, while the former-session result was unobserved. The isolated exact-source auth suite passed 8/8, including TEST-04, with 0 failures or skips. Its serving revision is N/A. An earlier isolated invocation stopped all 8 tests at fixture setup because the seed setting was absent. See Part D for the verified defect retest.

The first reopening implementation was committed on 25 November at 18:05:22 ICT; B merged the feature on 26 November at 10:43:38 ICT. D's baseline acceptance followed both events. The two old-code files below have identical Git blob hashes on CP-FIX-001, contract-only 8017c91 and primary RED test head 3f8918c.

| Old implementation path | Shared Git blob |
|---|---|
| server/src/routes/ownerSurveys.ts | {baseline["oldFiles"]["server/src/routes/ownerSurveys.ts"]} |
| server/src/lib/surveyLifecycle.ts | {baseline["oldFiles"]["server/src/lib/surveyLifecycle.ts"]} |

The old owner router exposed publish and close. The shared lifecycle body implements BR-03:

```ts
{baseline["oldLifecycleCode"]}
```

Revised relevant rows committed before tests in8017c91:

| ID | Assessed requirement | Sprint |
|---|---|---|
{new_rows}

## A2 - Relevant SRS/feature/system SDS revision (L7-A02)

The following is the actual changed-specification diff c99748c to8017c91. It includes only revised assessed sections, not the unchanged SRS. Its prospective/C3-pending wording is historical: the review below occurred later, before tests/code.

```diff
{read("spec-revision.diff").strip()}
```

## A3 - Reviewed engineering contract and impact map (L7-A03)

The following complete relevant state/UI/API/data/impact/AC/STS excerpts are from the pre-code contract 8017c91. They are design/expected outcomes; actual execution is reported separately in Part B. The original contract's local-copy migration plan was executed on a guarded disposable CI schema, as disclosed in B4. There is no monetary/rounding rule change (not applicable); existing summary precision remains protected by regression.

{assessed}

## A4 - Genuine teammate review before tests/code (L7-A04)

B/book6349, {c3["created_at"]}, Issue #87 comment{c3["id"]}, reviewed contract 8017c91:

> {c3["body"]}

Git timestamps below are actual committed times converted to Bangkok; the C3 comment time above is separately recorded server metadata. Later unit/fault/migration/browser additions are regression increments, not falsely presented as preceding the original backend code.

| Event | Full commit | Committed at Bangkok |
|---|---|---|
{timeline}

# Part B - Implementation and regression-safe delivery (50)

## B1 - Real old-code RED, setup and unchanged assertion (L7-B01)

CI run 45597034491 ran `npm test` from server against the old application, normal migrated PostgreSQL16 fixture and generated old Prisma schema. Server result:139 passed/2 failed/0 skipped,total141. Both new10/300-character boundary cases expected200 but received404 because POST reopen did not exist. Compilation/login/fixtures succeeded; this is missing behavior, not setup RED. The following is the complete original test file, with only declared whitespace/EOF formatting normalized in the report copy; the manifest retains its original byte hash when normalization changes bytes:

```typescript
{read("primary-tests.ts").strip()}
```

Selected actual failing output, with UTC log timestamps omitted for display only (complete timestamped source retained):

```text
{red}
```

The exact original describe block is present unchanged in candidate 45f48cd (`same-test-proof.json` records its SHA256). Expanded test-onlya9cdbce later produced144passed/32 failed/0 skipped(total176) on old code;5 new access checks already passed. The primary RED's Test client, Build server, Build client, Build Docker and cache post-step were skipped after server failure:5 pipeline steps, not skipped application tests. Evidence-only RED reruns45597483396/45597550300 each remained139/2/0. Runs are not added together as unique tests.

## B2 - Bounded actual implementation (L7-B02)

The actual lifecycle-function diff adds the explicit reopen transition, retaining old publish/close outcomes:

```diff
{read("lifecycle-implementation.diff").strip()}
```

The complete transition transaction below is the implemented module excerpt from45f48cd. It locks only the caller-owned row, validates in the specified order, guards the conditional update, appends one trusted event and returns the DTO within the transaction; storage failure rolls back both writes. It is an implementation excerpt, not the whole application source.

```typescript
{transition}
```

## B3 - Same-test GREEN and relevant existing regression (L7-B03)

Core 3203c3a/CI run 45601152925 passed176server/1 client checks,0 failed/0 skipped, plus builds/Docker, using unchanged expanded API assertions. UI test-onlyff5e299 had actual2passed/6 failed/0 skipped before UI7c4818c; the same7 UI cases plus original RatingDots then passed8/8. Initial unsupported RTL source option/typecheck and evidence whitespace/parser errors were corrected and disclosed; none is counted as product RED.

The retained regression output below comes from historical candidate 45f48cd and run 45613368930. Run {integration["runId"]} passed the same suites on the later GitHub test merge; see B6. These include original create/publish/close, response/summary/eligibility/uniqueness/access, DB constraints and lifecycle regression, plus new validation/concurrency/fault/migration/UI/browser coverage. Existing139server checks and original client1 remain enabled;8 original Playwright journeys are unchanged.

| Actual command / working directory | Passed | Failed | Skipped | Tested head / run |
|---|---:|---:|---:|---|
| npm test / server | 219 | 0 | 0 | 45f48cd /45613368930 |
| npm test / client | 10 | 0 | 0 | 45f48cd /45613368930 |
| npm run test:e2e -- --reporter=line / root | 10 | 0 | 0 | 45f48cd /45613368930 |
| npm run build / server and client; docker build | PASS | 0 | 0 | Same current CI |

The acceptance coverage below distinguishes executed checks from release obligations. IDs refer to the complete reviewed STS in Part A; results are from the named candidate suites, not an inferred deployed run.

| Acceptance | Executed test IDs / level | Current outcome |
|---|---|---|
| AC-100 | TEST-100/101 API; TEST-113 browser | PASS valid reopening and reason boundaries |
| AC-101 | TEST-103 unit; TEST-104/114 API | PASS state/action matrix and preserved old controls |
| AC-102 | TEST-101/102 API/unit | PASS malformed/reason/version boundaries without mutation |
| AC-103 | TEST-105/114 API | PASS stale ABA, one winning reopen and bodyless transition races |
| AC-104 | TEST-106/109/114 API/DB | PASS real audit-failure rollback and exact event/version counts |
| AC-105 | TEST-107 API | PASS session/role/foreign/malformed ownership and validation ordering |
| AC-106 | TEST-108 API | PASS private empty/paginated history and query rejection |
| AC-107 | TEST-109 API; TEST-113 browser | PASS repeated durable versioned history and escaped reason |
| AC-108 | TEST-110 API; TEST-113 browser | PASS original answers/summary/uniqueness/eligibility preserved |
| AC-109 | TEST-111 SQL/API | PASS old-data preservation, version0/no fake audit and null legacy closure |
| AC-110 | TEST-112 client; TEST-113 browser | PASS confirmation/cancel/validation/conflict/reload/history states |
| AC-111 | TEST-114 regression plus peer/release/deployed process | PASS in scoped checks: regression, review, main, deployment and live API verification |

Actual retained 45f48cd suite summaries (UTC timestamps removed for display):

```text
{log_tail("candidate-server-log.txt", 10)}
{log_tail("candidate-client-log.txt", 10)}
{display_log(read("candidate-browser-log.txt"))}
```

CI uses Node24 and PostgreSQL16 in a disposable runner; framework versions are pinned by repository locks. This is not the local PostgreSQL18 instance or the historical Node22 plan. No local/Lab 6 database/server was used. Router future warnings and upload-artifact v4's Node20/forced-Node24 warning remain disclosed; upload/builds succeeded and no current test was skipped.

## B4 - Data preservation, fault injection and privacy (L7-B04)

{read("migration-results.txt").strip()}

The additive migration itself is assessed data-contract implementation:

```sql
{read("migration.sql").strip()}
```

TEST-106 installs a temporary synthetic BEFORE INSERT audit trigger in guarded classpulse_test, tests publish/close/reopen sanitized500 and compares full before/after survey/version/timestamps/questions/responses/events; cleanup occurs in finally. TEST-105 concurrent same-version reopens have one winner/event; TEST-114 bodyless publish/close races have one transition/event and integer ceilings reject without writes. TEST-107/108 enforce session/role/ownership before route validation and return only scoped history fields; no actor email/respondent/answer data is exposed. Historic null closure is retained as null. These are actual isolated test outcomes, not production migration approval.

## B5 - Real browser evidence (L7-B05..B07)

All3 images were captured by automated Chromium in CI run 45610750485 on code head 24eed7a/test-merge d68793462dab87cfa402cf0495df472f9c52e5ec; the unchanged journeys pass again on 45f48cd and in run {integration["runId"]}. Displayed timestamps are runner UTC. A downloaded and visually inspected these exact files; their hashes/source commit are in the report manifest. They are not deployed or independent human UAT screenshots.

L7-B05: owner reopens with literal-markup reason; expected/actual PUBLISHED version 3 with complete publish/close/reopen history and prior closure retained,25 Nov12:09:04UTC. The UI reloads the real server state; markup stays text.

![L7-B05 - owner history after reopen](../../../evidence/lab-07/report/screenshots/reopened-owner-history.png)

L7-B06: second tab's version 2 is stale after another tab reopens/closes to version 4; expected/actual 409 warning, original reason retained, Confirm disabled and explicit Reload required,25 Nov12:09:06UTC. The test then deliberately reloads/retries and proves persistent version 5 history.

![L7-B06 - stale intent requires explicit reload](../../../evidence/lab-07/report/screenshots/stale-tab-explicit-reload.png)

L7-B07: another eligible student submits once through the actual browser after reopening and reloads saved confirmation,25 Nov12:09:05UTC. The same journey verifies old answer/summary unchanged, original respondent duplicate 409 and foreign owner 404.

![L7-B07 - later eligible response persisted](../../../evidence/lab-07/report/screenshots/eligible-student-confirmation.png)

## B6 - Review, staging, main and deployed chain (L7-B08)

B/book6349 approved PR #92 (C7) at {review_time} on `{integration["head"]}`. B's review records a scope check of all 64 paths, whitespace confirmation and the required CI results. B traced the locking, update, rollback, access/migration and stale-reload behavior. The inline finding at {integration["inlinePath"]}:{integration["inlineLine"]} states:

> {integration["inlineBody"]}

Verbatim C7 review:

> {integration["reviewBody"]}

Review and inline records: {integration["reviewUrl"]} and {integration["inlineUrl"]}.

Run {integration["runId"]} completed {ci_time}. The runner checked out `{integration["testedMerge"]}`; B merged `{staging_state}` on {merge_time}. The GitHub CI test merge and actual staging merge have the same two parents (base `{integration["base"]}` and the approved head) and the same tree `{integration["tree"]}`. The latest staging readback descends from that merge. The exact integrated results were:

| Step / command | Passed | Failed | Skipped |
|---|---:|---:|---:|
| server / npm test | {integration["counts"]["server"]["passed"]} | 0 | 0 |
| client / npm test | {integration["counts"]["client"]["passed"]} | 0 | 0 |
| root / npm run test:e2e -- --reporter=line | {integration["counts"]["browser"]["passed"]} | 0 | 0 |
| server and client builds; Docker | PASS | 0 | 0 |

Failed, cancelled or skipped job steps: {ci_steps}. CI evidence: {integration["runUrl"]}. This staging run predates the main release below.

### Main release and deployed evidence (L7-B09 to L7-B12)

B/book6349 approved release PR #{release["pr"]} at {release["approvedHead"]} and merged it into main as {release["main"]} on {bangkok(release["mergedAt"])}. Required pre-merge CI {release["preMergeCI"]} and main deploy run {release["deployRun"]} passed 272 server, 23 client and 12 browser tests, 0 failures or skips, both builds and Docker.

Deploy run {release["deployRun"]} completed at {bangkok(release["deployCompletedAt"])}. The production migrate/update step and smoke passed. Smoke checked /api/health, /api/ready, / and /api/auth/me. Service: {release["url"]}. Workflow image digest: {release["digest"]}. The Cloud Run console showed {cloud["servingRevision"]} serving {cloud["trafficPercent"]}% of traffic after rollout at {bangkok(cloud["deployedBangkok"])}. The revision uses {cloud["platformManifestDigest"]}, the image manifest from the same build as the workflow's published manifest list digest above.

Production job {cloud["migrationExecution"]} succeeded (1/1 task, exit 0). The log shows {cloud["migrationName"]} applied at {bangkok(cloud["migrationAppliedBangkok"])}. At {bangkok(legacy["startedAtUtc"])}, the synthetic respondent read response 15 on survey 26 via its normal authenticated response API (HTTP 200). Both saved answers, rating 5 and Online, matched Lab 6 CD-07 and predate the migration. This is one retained response sample. On {bangkok(live["finishedAtUtc"])}, A's API check passed all 14 observations on dedicated synthetic survey {live["fixture"]["surveyId"]}: 3 sign-ins, 5 setup checks and 6 live checks. Failures and skips: 0. Cloud Run showed the same revision and 100% traffic before and after. Authentication was via three separate synthetic sessions; each logout returned 204.

| Gate | Expected result and evidence | Owner / state |
|---|---|---|
| L7-B09 reviewed release | PR from agreed staging candidate into main, teammate review at exact head, required CI, main merge SHA and deployment workflow | Verified: B approved and merged #143; main deploy run passed |
| L7-B10 GCP readback and migration | Record deploy run, time, public URL, image digest, serving revision and traffic allocation; verify additive migration applied and representative pre-existing survey/response counts retained using approved redacted readback | Verified revision, migration and one pre-migration response; broader retention not inferred |
| L7-B11 manual changed path | On one mapped deployed revision, use a synthetic course owner's CLOSED survey with a saved response. Reopen with a reason and current version. Expect PUBLISHED, original publishedAt, cleared closedAt and exactly one reasoned audit event with the prior closure. Read it again in a fresh session. | HTTP 200. CLOSED version 2 reopened to PUBLISHED version 3. Same publishedAt; closedAt cleared. Fresh HTTP reads showed one REOPEN event with the input reason and prior closure, plus CLOSE and PUBLISH. |
| L7-B12 manual preserved path | Original eligible synthetic respondent sees the same saved confirmation and cannot submit a second response; owner summary retains the saved count and answer. A different course owner cannot read or reopen the survey. | Response 17 retained rating 4; summary count/average stayed 1/4. Duplicate was HTTP 409 ALREADY_RESPONDED. Other lecturer read/reopen both 404. Final summary and history unchanged. |

Survey {live["fixture"]["surveyId"]}, question {live["fixture"]["questionId"]}; original publication {bangkok(observed["L7-B11a"]["publishedAt"])}; closed {bangkok(observed["fixture-close"]["closedAt"])}; reopened {bangkok(observed["L7-B11b"]["reopen"][0]["occurredAt"])}. Audit reason: {observed["L7-B11b"]["reopen"][0]["reason"]}. Expected and actual API results are above. A used new HTTP reads in the owner session. This is developer verification, separate from independent UAT or browser checks.

# Part C - Objective engineering metrics (15)

## C1 - Five dated definitions and values (L7-C01)

Scope: ClassPulse only. B’s 28 November 02:11 ICT metrics refresh is from Issue #89, PR #{final_metrics["pr"]}, reviewed by A and merged as {final_metrics["merge"]}. M1 and M2 remain dated Sprint 1 counts. A verified their 26 source rows and both live evidence hashes.

| Metric | Definition / window | Value / evidence |
|---|---|---|
| M1 completed original parent Issues | Issues1-11 closed by8 NovBangkok /11 explicitly selected parent Issues | 11/11 (100%); embedded11 ID/date rows in C2; B snapshot |
| M2 original Sprint 1 staging integration | Selected PR #12-26 merged into sprint-1-staging during5-8 NovBangkok /15 selected PRs; excludes main releases | 15/15 (100%); embedded15 ID/base/date rows in C2 |
| M3 named suites on the release | Main {release["main"]}; deploy run {release["deployRun"]}, 28 Nov ICT | 307/307 passed: server 272, client 23, browser 12. 0 failed/skipped; both builds and Docker. See B6 |
| M4 independent UAT defect disposition | Lab 7 disposition remains PENDING at the 28 Nov readback. Historical Lab 6 comparator: 27 Nov 01:35:39 ICT | 1/1 recorded exercise defects resolved in Lab 6: CP-EX-F01, Minor, independently verified (5/5 Cloud subcases). Lab 7 developer API checks 14/14 are separate; no Lab 7 UAT defect count claimed |
| M5 outcome of the release workflow | The two jobs in main deploy run {release["deployRun"]} for SHA {release["main"]} | 2/2 jobs succeeded: test-and-docker and deploy. Production migration/update and automated read-only smoke passed. Earlier branch CI stays in C2 |

## C2 - Embedded underlying sources (L7-C02)

The following exact compact lists are B's dated source rows; A's independent readback matched all26. They support M1 and M2 offline. Dates are Bangkok, unlike the UTC CI rows below.

{historical}

Historical feature-branch CI, {window["start"]} through {window["end"]}, paginated: {successes} success / {failures} failure / {cancelled} cancelled / {other} other ({len(window["runs"])} total). Intentional RED is retained.

| Run ID | Full head | Actual state / outcome | Created at UTC |
|---|---|---|---|
{ci_rows}

M4 source: Lab 6 CP-EX-F01 closure and D retest record. The counted population is the single numbered exercise defect. A records B's metric definitions and this readback in the report. B's interim PR #114 merged into staging as {metrics_pr["stagingMerge"]} on {bangkok(metrics_pr["mergedAt"])}. CI {metrics_pr["run"]} attempt 1 timed out on TEST-179 and skipped Docker and Node cleanup. Attempt 2 passed 239 server, 16 client and 11 browser tests with 0 failures or skips on the same tree. This is staging evidence. The reviewed final metrics are in PR #148; see C1.

## C3 - Interpretation and concrete next action (L7-C03)

{interpretation}

Actual word count: {len(interpretation.split())}, maximum 100. No issue/PR/test-count target is invented to improve the metric.

# Part D - Release readiness and retrospective (10)

## D1 - Maintained-scope readiness (L7-D01)

**NOT READY at the 28 November readiness review.** The maintained Sprint 1 scope, including controlled reopening and preserved behavior, has verified deployment checks. Independent Lab 7 UAT defect disposition is unrecorded. The exact PDF review and LEB2 receipt are tracked separately.

| Readiness item | Evidence / status | Owner / next action |
|---|---|---|
| Accepted baseline and submitted/deployed mapping | Lab 6 CP-FIX-001 accepted by D; C acknowledged. Lab 7 main, serving revision, traffic and scoped live API checks verified | A verified Cloud Run revision and image; B reviews the evidence |
| Automated rule/access/data/UI/browser results | PR #92 integrated tree: 219 server, 10 client, 10 browser passed, 0 failed, 0 skipped. Primary, expanded and UI RED retained | See B6 for the separate 307-test release CI |
| Defects by severity/status | CP-EX-F01 Minor, fixed and independently verified on Lab 6 CP-FIX-001; Independent Lab 7 UAT disposition PENDING | Keep A’s developer checks separate from independent UAT |
| Technical debt | Two observed engineering risks listed below, distinct from defects and incomplete release work | A scopes later reviewed fixes/measurement |
| Configuration/secrets | Sanitized report inputs; CI uses disposable synthetic identities; Deploy configuration validation and Workload Identity sign-in passed | Human manages credentials/IAM; no separate secrets audit claimed |
| Setup and documentation | Source/commands/versions/excerpts embedded; no fresh local instance/setup acceptance claimed | B checks report/source; final README/release setup verification remains open |
| Review/integration/deployment/smoke | B approved and merged #92 into staging as {staging_state}; main, automated smoke and deployed changed/preserved API checks verified | B independently reviews A’s scoped deployed evidence |
| PDF and LEB2 | Final PDF review and upload receipt tracked separately | A assembles/renders; B reviews exact final PDF; human submits separately |

## D2 - Debt, observed failures and limitations (L7-D02)

| Technical debt item | Observed basis / future cost | Priority / disposition |
|---|---|---|
| Default browser/local server configuration assumes3000/5173 and can reuse a local server outsideCI | Current Playwright/Vite source; parallel local work requires manual instance/port isolation. This report used disposable CI with reuse disabled | Medium; A to scope configurable isolated local runner before using shared-machine browser tests; current local DB remains untouched |
| Pinned upload-artifact v4 runtime warning | Actual CI annotates Node20 target forced onto Node24; upload succeeded, so this is maintenance risk rather than an observed functional failure | Medium; A to review a supported pinned action revision in a separate scoped change; rerun required CI |

Lab 6 independent retest on 26 November at 18:30:40–49 ICT (CP-FIX-001, classpulse-00007-6t9) passed five Cloud subcases: empty and whitespace titles returned 400; valid and 120-character titles returned 201 and survived reload; a 121-character title returned 400. Local readback retained three drafts. Historical M01 remains BLOCKED. Isolated TEST-04 and this retest support the Lab 6 decision. Part B retains the intended old-code RED results and skipped pipeline steps separately from tooling errors. Lab 7 production migration and scoped persistence passed.

## D3 - Three brief retrospective answers (L7-D03)

{retro_answers}

## D4 - Contributions, AI use and final gaps

| Person | Completed, evidenced work | Not claimed |
|---|---|---|
| A / Punge089 | Issue #87 contracts/specs; primary/expanded RED; backend/UI/atomic audit; unit/fault/migration/browser regressions; CI/artifacts; reviewed and merged B’s metrics including #148; production API and report assembly | Own PR approval/merge, final Lab 6 acceptance, production migration/deployment, final PDF acceptance/submission |
| B / book6349 | C3 on 8017c91; authored metrics/readiness/retrospective; exact-head PR #92 review, approval and staging merge | A performed the deployed API check; PDF approval is recorded separately |

A used Codex GPT-6 for initial contract preparation and Codex GPT-6.1 Sol for the subsequent recorded test/implementation/review/report work; historical declarations remain attributed. B's supplied declaration names Codex GPT-6 for B's metrics work. Commits/reviews disclose actual assistance; this table does not invent pair programming or equal commit counts. A used Codex GPT-6 for the 27 November baseline/CI readback and PDF draft refresh. B reviewed implementation, approved the release, and supplied the final metrics. PDF review and submission are tracked separately.

Submission record: PR #104 tracks code review, CI and B’s review of the exact PDF hash. The human owner uploads those reviewed bytes in LEB2 and retains the receipt.

## Reproducibility and provenance

`tools/lab7-report/build_source.py` rebuilds this source offline after verifying every stored input SHA256 against `evidence/lab-07/report/source-manifest.json`. `--capture` re-reads the historical Git/GitHub sources at the pinned cutoff. The later acceptance and staging readback uses its own retained record. Original complete sanitized logs and selected code/spec inputs accompany this source. No application source/test or B-owned metric file is changed by this report. The final PDF must embed assessed text/images and internal references rather than asking the grader to open these source links.

Revision history: v0.1 assembled the pinned 25 November source. v0.2 added the working PDF and page navigation. v0.3 adds the accepted baseline, exact PR #92 review/CI/staging, scoped CP-EX-F01 metrics and deployed verification plan. v0.4 records the reviewed #114 staging integration and both CI attempts. v0.5 records the reviewed main merge and deploy receipt. v0.6 adds Cloud Run and retained-response evidence. v0.7 adds the tested live reopen and preservation outcomes. v1.0 incorporates B’s reviewed final metrics, readiness and retrospective.
'''
    DOCS.mkdir(parents=True, exist_ok=True)
    (DOCS / "report.md").write_text(report, encoding="utf-8", newline="\n")
    index = """# Lab 7 report evidence index - v1.0 PDF review candidate

Issue #101. Pages below refer to the v1.0 PDF. Submission review is tracked in #104.

| Assignment requirement | Status | Evidence and source | Draft PDF pages | Owner / next action |
|---|---|---|---|---|
| pp. 1-2, Part A: precise old/new rule and accepted/actual pre-change versions | Verified | L7-A01; scope and acceptance recorded by D, C acknowledgment, CP-FIX-001, and identical old router/lifecycle blobs on CP-FIX-001, 8017c91 and 3f8918c | 2-4 | A recorded versions and chronology |
| p. 2, Part A: trace impact and review the versioned contract before code | Verified | L7-A02..A04; 8017c91 contract, 12 ACs, 15 STS cases, B C3 and dated commit order | 4-13 | B reviewed before tests; A preserved review |
| p. 3, Part B: meaningful old-code RED, same-test GREEN and actual diff | Verified | L7-B01..B02; 3f8918c and run 45597034491, unchanged primary assertions, retained backend/GUI GREEN and implementation | 14-17 | A pinned and reproduced the evidence |
| p. 3, Part B: regression, preservation and authorization | Verified in disposable CI | L7-B03..B07; historical logs, TEST-111 data check, owner/response tests and three browser figures | 17-23 | A retains expected RED and every recorded failure/skip |
| p. 3, Part B: peer review, CI and staging | Verified | L7-B08; B review 6061752216 on 698b1e9, CI 45645429150, actual merge e6043a9 | 24-25 | B approved and merged; A compared tested and merged trees |
| pp. 3 and 6, Part B: main, GCP and deployed changed/preserved checks | Verified: main, Cloud Run, migration, sampled legacy retention and live reopen | L7-B09..B12; #143, 8316f27 and deploy run 46050688714 | 2, 24-25 | B reviews the live evidence |
| p. 4, Part C: five dated metrics, sources and action | Final metrics source verified | L7-C01..C03; #148, 26 historical issue/PR rows, release suite and two deploy jobs, independent UAT pending | 26-28 | B authored metrics; A verified source evidence |
| p. 5, Part D: readiness, defects/debt, three answers and contributions | Readiness assessment and retrospective included | L7-D01..D03 and D4; defect/debt, observed failures/skips, and independent UAT boundary | 29-30 | B checks PDF against reviewed source |
| pp. 6-7: self-contained PDF, reviewed version and handoff | Candidate verified; B exact-hash review pending | Version map, internal navigation, checked draft hash and evidence above | 1-2, 30 | A renders; B reviews exact hash; human hands off private test accounts and uploads to LEB2 |

Pinned input paths and hashes are in `evidence/lab-07/report/source-manifest.json`. The report is scoped to Lab 7. Release and deployment results are embedded; independent Lab 7 UAT remains unrecorded.
"""
    (DOCS / "report-evidence-index.md").write_text(index, encoding="utf-8", newline="\n")
    print(json.dumps({"report": "docs/labs/lab-07/report.md", "inputHashesVerified": len(manifest["records"]), "interpretationWords": len(interpretation.split()), "ciRunsInScope": len(window["runs"]), "status": "v1.0 candidate for exact PDF review"}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--capture", action="store_true", help="re-read pinned historical sources before assembling")
    args = parser.parse_args()
    if args.capture:
        capture()
    assemble()
