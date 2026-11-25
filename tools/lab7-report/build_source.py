"""Capture pinned, public project evidence once; rebuild the Lab 7 draft offline.

Run with --capture only for an intentional new snapshot. No application, database,
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
    pr = api("repos/Punge089/classpulse/pulls/92")
    assert pr["head"]["sha"] == HEAD, "Refresh the pinned source deliberately if the PR head changes"
    reviews = api("repos/Punge089/classpulse/pulls/92/reviews")
    saved_json("implementation-review.json", {
        "number": 92, "html_url": pr["html_url"], "head": HEAD, "state": pr["state"],
        "draft": pr["draft"], "merged": pr["merged"], "merged_at": pr["merged_at"], "merge_commit_sha": pr["merge_commit_sha"] if pr["merged"] else None,
        "reviews": [{"id": x["id"], "author": x["user"]["login"], "state": x["state"], "commit": x["commit_id"], "body": x["body"], "submitted_at": x["submitted_at"]} for x in reviews],
    }, {"endpoints": ["pulls/92", "pulls/92/reviews"]})
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
    observed = datetime.now(timezone.utc).isoformat()
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
    manifest = {"reportVersion": "0.1-source-draft", "observedAtUTC": observed, "observedAtBangkok": datetime.fromisoformat(observed).astimezone(BG).isoformat(), "candidate": HEAD, "candidateRun": RUN, "status": "NOT READY / source-only draft", "records": records}
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
    timeline = "\n".join(f'| {x["role"]} | `{x["commit"]}` | {x["bangkok"]} |' for x in data("timeline.json"))
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
    review = data("implementation-review.json")
    review_state = "PENDING" if not review["reviews"] else "; ".join(f'{x["author"]}: {x["state"]} on {x["commit"]}' for x in review["reviews"])
    staging_state = str(review["merge_commit_sha"]) if review["merged"] else "PENDING - PR #92 unmerged at snapshot"
    interpretation = "The candidate passes its automated suites, but those counts do not establish release readiness. Independent UAT disposition and accepted-baseline mapping remain open, and the proposed change is not yet verified in the deployed release. A will finish the reviewed release and changed/preserved deployment checks after B's exact-head review; B will refresh final metrics against that accepted version."
    assert len(interpretation.split()) <= 100
    report = f'''# ClassPulse - Lab 7 maintenance report

**Version 0.1 - SOURCE DRAFT - NOT READY FOR SUBMISSION**

Prepared from pinned evidence at {manifest["observedAtBangkok"]}. The accepted Lab 6 baseline, final implementation peer review/release/deployment and final PDF review are unresolved. This is the separate Lab 7 assessment; Deliverable 2 is submitted separately.

| Student | ID | GitHub | Actual role at this snapshot |
|---|---|---|---|
| Bannasorn Thongkorn | 67070503420 | Punge089 | Contract/test/implementation/report driver; reviewed and merged B's interim metrics PR #100 |
| Papangkorn Jitvoottikrai | 67070503421 | book6349 | Reviewed the contract before tests; authored metrics/readiness/retrospective; implementation/PDF review pending |

Theme 10: university course feedback. Repository: https://github.com/Punge089/classpulse. Due 29 November 2026, 23:59 Asia/Bangkok. No report or deployment submission is claimed.

## Navigation and version map

| Part | Points | Sections / evidence IDs | Final PDF pages |
|---|---:|---|---|
| A - change and reviewed contract | 25 | A1-A4; L7-A01..A04 | PENDING final PDF layout |
| B - implementation and regression-safe delivery | 50 | B1-B6; L7-B01..B08 | PENDING final PDF layout |
| C - objective metrics | 15 | C1-C3; L7-C01..C03 | PENDING final PDF layout |
| D - readiness and retrospective | 10 | D1-D4; L7-D01..D03 | PENDING final PDF layout |

| Reference | Exact value / status | Meaning |
|---|---|---|
| Original submitted Sprint 1 tag | v1.0.0-sprint1, d4bad74211729032697164f378638efb834a67b6 | Immutable historical release; not substituted for Lab 6 acceptance |
| Lab 6 CP-V01 source | 1fe3e3b82dfb0537be30223c9b598b3479b4affe | Attributed from Lab 6 records; not freshly cloud-verified by this report |
| Accepted Sprint 1 release from Lab 6 | PENDING authoritative accepted-version/decision | Required before finalizing maintained-version evidence |
| Actual pre-change implementation | {CONTRACT} | Contract-only commit on staging c99748c; old server/client behavior unchanged |
| Primary test head | {PRIMARY} | Existing app plus two new missing-behavior assertions |
| Primary CI tested merge | d34d22018affa62c75009fa4e8be01b7ab728799 | Test merge of c99748c and3f8918c, not a different implementation |
| Current feature-review candidate | {HEAD} | Candidate branch only; isolated CI is not deployment |
| Feature staging integration | {staging_state} | Separate from interim metrics PR #100 mergea49cbe7 |
| Accepted main tag/commit | PENDING reviewed release | No new release tag is claimed |
| Maintained deployed URL/revision/image/traffic | PENDING coordinated release and readback | Current Lab 6 deployment remains under that lane's control |

Intervening development includes Lab 5 deployment/CI and Lab 6 test-tool/evidence work through staging a49cbe7. The relevant lifecycle still rejected CLOSED reopening before this change. No unchanged Sprint 2 backlog feature is offered as the Lab 7 change.

# Part A - Change impact and updated contract (25)

## A1 - Precise change and announcement (L7-A01)

Issue #87 changes previously correct terminal-CLOSED behavior. Proposed scenario: interrupted class collection needs to resume without cloning the survey, losing answers or letting previous respondents submit twice. Owner-only explicit reopening requires a trimmed 10-300 UTF-16-unit reason and current lifecycle version, writes one durable event atomically, preserves first publication/previous answers and never returns to DRAFT.

The supplied later announcement states: "You need not get Instructor or TA Approval for your change request to Sprint 1." The team must choose a nontrivial change. This supersedes the individual approval requirement in the original PDF; it does not remove teammate contract review. The announcement's original publisher/publication date were not independently supplied/verified; A supplied its text on25 Nov. The supplied highlighted image shows the older paragraph, not a screenshot of the later announcement. Source PDF SHA256:13a82d2ec507a84aecd56811bf21f532439e5bb89c34002863d28098cf8b24cb.

Old SRS row, actual pre-change rule:

| ID | Assessed requirement | Sprint |
|---|---|---|
{old_row}

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

Current exact candidate 45f48cd/CI run 45613368930 independently reruns all relevant suites. These include original create/publish/close, response/summary/eligibility/uniqueness/access, DB constraints and lifecycle regression, plus new validation/concurrency/fault/migration/UI/browser coverage. Existing139server checks and original client1 remain enabled;8 original Playwright journeys are unchanged.

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
| AC-111 | TEST-114 regression plus peer/release/deployed process | PARTIAL: named suites/CI pass; peer/main/deployed acceptance PENDING |

Actual retained current suite summaries (UTC timestamps removed for display):

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

All3 images were captured by automated Chromium in CI run 45610750485 on code head 24eed7a/test-merge d68793462dab87cfa402cf0495df472f9c52e5ec; the unchanged journeys pass again on 45f48cd. Displayed timestamps are runner UTC. A downloaded and visually inspected these exact files; their hashes/source commit are in the report manifest. They are not deployed or independent human UAT screenshots.

L7-B05: owner reopens with literal-markup reason; expected/actual PUBLISHED version 3 with complete publish/close/reopen history and prior closure retained,25 Nov12:09:04UTC. The UI reloads the real server state; markup stays text.

![L7-B05 - owner history after reopen](../../../evidence/lab-07/report/screenshots/reopened-owner-history.png)

L7-B06: second tab's version 2 is stale after another tab reopens/closes to version 4; expected/actual 409 warning, original reason retained, Confirm disabled and explicit Reload required,25 Nov12:09:06UTC. The test then deliberately reloads/retries and proves persistent version 5 history.

![L7-B06 - stale intent requires explicit reload](../../../evidence/lab-07/report/screenshots/stale-tab-explicit-reload.png)

L7-B07: another eligible student submits once through the actual browser after reopening and reloads saved confirmation,25 Nov12:09:05UTC. The same journey verifies old answer/summary unchanged, original respondent duplicate 409 and foreign owner 404.

![L7-B07 - later eligible response persisted](../../../evidence/lab-07/report/screenshots/eligible-student-confirmation.png)

## B6 - Review, staging, main and deployed chain (L7-B08)

Implementation peer-review state at snapshot: {review_state}. Feature staging merge: {staging_state}. B's metrics PR #100 was independently reviewed by A (review 6057525038 on e8832b6;26/26 source rows, scope/ancestry/disclosure/diff checks and CI run 45612865983) and merged a49cbe7; that documentation review is not approval of A's own feature. The report/PDF also needs B review.

Accepted Lab 6 baseline, reviewed main release/tag, human-run production migration/cloud actions, image digest/serving revision/traffic mapping, changed reopen/audit/persistence checks and preserved access/duplicate/summary checks are PENDING. No deployed PASS or release acceptance is inferred from CI. The final report must embed actual reviewer text, main CI/release and deployed expected/actual records here before corresponding claims can become complete.

# Part C - Objective engineering metrics (15)

## C1 - Five dated definitions and values (L7-C01)

Scope: ClassPulse only. B authored the definitions/historical snapshot in Issue #89/PR #100, captured18:06:58 and refreshed18:41:29Bangkok25 Nov. A independently reconciled26/26 underlying rows and assembled this report; current M3/M5 below are A readbacks from captured candidate CI, not an edit to B's owned files or an invented B execution. B's final report refresh/review remains required.

| Metric | Definition / window | Value / evidence |
|---|---|---|
| M1 completed original parent Issues | Issues1-11 closed by8 NovBangkok /11 explicitly selected parent Issues | 11/11 (100%); embedded11 ID/date rows in C2; B snapshot |
| M2 original Sprint 1 staging integration | Selected PR #12-26 merged into sprint-1-staging during5-8 NovBangkok /15 selected PRs; excludes main releases | 15/15 (100%); embedded15 ID/base/date rows in C2 |
| M3 current named automated suite | server npm test on 45f48cd, CI run 45613368930 | 219/219 passed,0 failed/0 skipped; Part B actual output. Client10/0/0 and browser10/0/0 are separate suites, not inflated server totals |
| M4 independent UAT defect disposition | ClassPulse maintained-scope severity/status at final acceptance, based on independent Lab 6 disposition | PENDING; source checkpoint explicitly withholds final acceptance/no-defect conclusion. No zero-defect count is reported |
| M5 branch CI run outcomes | CI and Docker; only feature/87-lab7-survey-reopening; {window["start"]} through {window["end"]}; paginated to completion | {successes} success / {failures} failure / {cancelled} cancelled / {other} other; {len(window["runs"])} total selected runs. Every ID/head/outcome embedded in C2; intentional RED failures remain counted |

## C2 - Embedded underlying sources (L7-C02)

The following exact compact lists are B's dated source rows; A's independent readback matched all26. They support M1 and M2 offline. Dates are Bangkok, unlike the UTC CI rows below.

{historical}

M5 complete scoped source list, captured{manifest["observedAtUTC"]}:

| Run ID | Full head | Actual state / outcome | Created at UTC |
|---|---|---|---|
{ci_rows}

M4 source: Lab 6 checkpoint in staging a49cbe7 reports independent C/D scoped observations with evidence-completeness/controlled-expiry limits; final accepted-version/disposition remains pending. This report does not amend Lab 6 records or recategorize an expected new-feature RED as an existing UAT defect.

## C3 - Interpretation and concrete next action (L7-C03)

{interpretation}

Actual word count: {len(interpretation.split())}, maximum 100. No issue/PR/test-count target is invented to improve the metric.

# Part D - Release readiness and retrospective (10)

## D1 - Maintained-scope readiness (L7-D01)

**NOT READY.** The scope is maintained Sprint 1 including controlled reopening and preserved previously accepted behavior, not the entire three-sprint product.

| Readiness item | Evidence / status | Owner / next action |
|---|---|---|
| Accepted baseline and submitted/deployed mapping | Final accepted Lab 6 baseline and maintained main/revision/digest/traffic PENDING | A obtains authoritative handoff; preserve old tag and exact pre-change mapping |
| Automated rule/access/data/UI/browser results | Candidate45f48cd:219 server/10 client/10 browser passed,0 failed/0 skipped; primary/expanded/UI RED retained | A preserves outputs; B reviews the exact proposed head |
| Defects by severity/status | Independent maintained-scope final disposition PENDING; no zero-defect or broad UAT acceptance claimed | A/B obtain actual assessed independent disposition and retests |
| Technical debt | Two observed engineering risks listed below, distinct from defects and incomplete release work | A scopes later reviewed fixes/measurement |
| Configuration/secrets | Sanitized report inputs; CI uses disposable synthetic identities; candidate production configuration/credential review PENDING | A/B inspect exact release; human manages credentials/IAM |
| Setup and documentation | Source/commands/versions/excerpts embedded; no fresh local instance/setup acceptance claimed | B checks report/source; final README/release setup verification remains open |
| Review/integration/deployment/smoke | PR #92 peer:{review_state}; staging:{staging_state}; main/deployed changed/preserved checks PENDING | B review; named release driver coordinates Lab 6 freeze; human cloud steps |
| PDF and LEB2 | Source-only draft; final pagination/render/page review/hash and upload receipt PENDING | A assembles/renders; B reviews exact PDF; human submits separately |

## D2 - Debt, observed failures and limitations (L7-D02)

| Technical debt item | Observed basis / future cost | Priority / disposition |
|---|---|---|
| Default browser/local server configuration assumes3000/5173 and can reuse a local server outsideCI | Current Playwright/Vite source; parallel local work requires manual instance/port isolation. This report used disposable CI with reuse disabled | Medium; A to scope configurable isolated local runner before using shared-machine browser tests; current local DB remains untouched |
| Pinned upload-artifact v4 runtime warning | Actual CI annotates Node20 target forced onto Node24; upload succeeded, so this is maintenance risk rather than an observed functional failure | Medium; A to review a supported pinned action revision in a separate scoped change; rerun required CI |

Incomplete peer/release/deployment/PDF work is a delivery gate, not relabelled technical debt. No functional failure was observed in the named current suites; independent UAT defect classification remains PENDING. Expected old-code primary/expanded/UI RED and skipped downstream pipeline steps are retained in Part B. Source typecheck/parser/whitespace fixes were tooling errors, not fabricated product RED. Local setup, cloud mutation, full production migration-engine upgrade bookkeeping and deployed persistence are not claimed.

## D3 - Three brief retrospective answers (L7-D03)

- **Helped:** The committed old/new contract and B's actual C3 preceded tests. Asserting HTTP200 before future DTO access made the old404 a meaningful RED and kept setup errors separate.
- **Hurt:** Shared append-only AI declarations produced real staging conflicts, and the first titled staging merge on B's metrics branch had only one parent. Actual ancestry checks exposed the unresolved integration; a later real two-parent merge preserved history and restored CI.
- **Change for final release:** A will integrate reviewed shared documentation before requesting the final code-head review, record runner UTC versus Bangkok explicitly, and pin final main/deployed/PDF hashes. B will recheck the actual accepted candidate and refresh metrics instead of carrying an old green snapshot forward.

## D4 - Contributions, AI use and final gaps

| Person | Completed, evidenced work | Not claimed |
|---|---|---|
| A / Punge089 | Issue #87 contracts/specs; primary/expanded RED; backend/UI/atomic audit; unit/fault/migration/browser regressions; CI/artifacts; reviewed/merged B100; this separate source draft | Own PR approval/merge, final Lab 6 acceptance, production migration/deployment, final PDF acceptance/submission |
| B / book6349 | Genuine C3 on8017c91; authored dated metrics/readiness/retrospective; corrected snapshot/provenance and staging ancestry | Implementation or report/PDF approval until actual evidence exists; unrun application/UAT/cloud checks |

A used Codex GPT-6 for initial contract preparation and Codex GPT-6.1 Sol for the subsequent recorded test/implementation/review/report work; historical declarations remain attributed. B's supplied declaration names Codex GPT-6 for B's metrics work. Commits/reviews disclose actual assistance; this table does not invent pair programming or equal commit counts. B contributed genuine contract review and separate metric authorship; final implementation/report reviews are outstanding.

Final gaps: accepted Lab 6 baseline/decision, B exact-current-head implementation review/staging merge, reviewed coordinated main release, human cloud/migration and actual serving-version readback, deployed changed/preserved/persistence checks, final M4/metrics/readiness refresh, final PDF internal page ranges/render inspection/B hash review, human Lab 7 LEB2 upload/receipt. A separate Deliverable 2 report is still required; it is not embedded here.

## Reproducibility and provenance

`tools/lab7-report/build_source.py` rebuilds this source offline after verifying every stored input SHA256 against `evidence/lab-07/report/source-manifest.json`. `--capture` intentionally refreshes pinned Git/GitHub sources; it does not test/deploy the application. Original complete sanitized logs and selected code/spec inputs accompany this source. No application source/test or B-owned metric file is changed by this report. The final PDF must embed assessed text/images and internal references rather than asking the grader to open these source links.
'''
    DOCS.mkdir(parents=True, exist_ok=True)
    (DOCS / "report.md").write_text(report, encoding="utf-8", newline="\n")
    index = """# Lab 7 report evidence index - source draft

Issue #101. Parts A25/B50/C15/D10 only. NOT READY; no final PDF/submission.

| ID | Embedded report material | Primary retained input / status |
|---|---|---|
| L7-A01 | old/new request, announcement and baseline map | srs-before/revised, assignment-provenance; accepted Lab 6 baseline PENDING |
| L7-A02 | actual revised specification excerpts | spec-revision.diff at8017c91 before tests |
| L7-A03 | complete relevant reviewed contract/impact/AC/STS | contract-before-code.md, sections 3-10 |
| L7-A04 | genuine B C3 text and dated history | b-c3.json, timeline.json |
| L7-B01 | complete primary test setup/assertions and actual RED | primary-tests.ts, primary-red-log/run, same-test-proof |
| L7-B02 | actual bounded code diff/transaction | lifecycle-implementation.diff, candidate-owner-routes.ts |
| L7-B03 | actual current suite commands/counts/output | candidate-ci.json and complete server/client/browser logs |
| L7-B04 | migration/fault/data preservation | migration-results.txt, migration.sql; current API suite |
| L7-B05..07 | three real CI screenshots with expected/actual/time/source | screenshots/; CI run 45610750485, repeated current journey GREEN |
| L7-B08 | peer/staging/main/deployed chain | implementation-review.json; incomplete gates explicitly PENDING |
| L7-C01 | five dated definitions/current or pending values | B definitions attributed; current CI readback by A; M4 PENDING |
| L7-C02 | 26 historical underlying rows plus scoped CI list | b-source-snapshot.md, branch-ci-window.json |
| L7-C03 | <=100 word action/owner interpretation | report.md C3; word count verified |
| L7-D01 | maintained-scope readiness and owner/actions | NOT READY; final acceptance/deployment/PDF PENDING |
| L7-D02 | failures/skips, two observed debt risks and limits | retained logs/config sources; no zero-defect inference |
| L7-D03 | three brief actual-work retrospective answers | report.md D3; B's separate dated source remains unchanged |

All paths above are under evidence/lab-07/report/inputs unless marked screenshots. The manifest records full hashes, source commits/paths or API/run provenance. These sources are preparation; final pagination, peer acceptance, release/deployed evidence and PDF review remain open.
"""
    (DOCS / "report-evidence-index.md").write_text(index, encoding="utf-8", newline="\n")
    print(json.dumps({"report": "docs/labs/lab-07/report.md", "inputHashesVerified": len(manifest["records"]), "interpretationWords": len(interpretation.split()), "ciRunsInScope": len(window["runs"]), "status": "source draft / NOT READY"}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--capture", action="store_true", help="intentionally capture pinned public sources before assembling")
    args = parser.parse_args()
    if args.capture:
        capture()
    assemble()
