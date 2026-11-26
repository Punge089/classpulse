"""Existing AC-04/M01 protocol; ordinary synthetic auth, no database access."""
from __future__ import annotations

import argparse
import getpass
import hashlib
import json
import os
import re
import sys
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from http.cookies import SimpleCookie
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, build_opener, HTTPRedirectHandler

ORIGIN = "https://classpulse-zdwglar6eq-as.a.run.app"
SOURCE = "bee0d122bf23410e3d2db69649ad5e44959b6cd8"
REVISION = "classpulse-00007-6t9"
DIGEST = "sha256:e00257d3b1c9cfdaabbe9b3f1d238c1d26fb342665f80122dcddc4550bc4388d"
EMAIL = "student1@classpulse.test"
COOKIE = "cp_session"
ALLOWED = {("GET", "/api/health"), ("POST", "/api/auth/login"),
           ("GET", "/api/auth/me"), ("POST", "/api/auth/logout")}


def now() -> str:
    return datetime.now(timezone(timedelta(hours=7))).isoformat()


class PrerequisiteError(Exception):
    pass


class ObservationError(Exception):
    pass


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class PrivateArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        # argparse normally echoes unknown values (including accidental passwords).
        self.exit(2, '{"outcome":"BLOCKED","reason":"Invalid command options; values suppressed"}\n')


class Transport:
    """Never follows redirects or emits raw responses/headers/errors."""
    def __init__(self):
        self.opener = build_opener(NoRedirect())

    def call(self, method, path, payload=None, cookie=None):
        if (method, path) not in ALLOWED:
            raise PrerequisiteError("Endpoint outside M01")
        headers = {"Accept": "application/json", "Origin": ORIGIN}
        if cookie:
            headers["Cookie"] = cookie
        data = None
        if payload is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(payload).encode()
        request = Request(ORIGIN + path, data=data, headers=headers, method=method)
        try:
            response = self.opener.open(request, timeout=20)
        except HTTPError as error:
            response = error
        with response:
            raw = response.read(65537)
            if len(raw) > 65536:
                raise ObservationError("Response size exceeds M01 limit")
            try:
                body = json.loads(raw) if raw else {}
            except (ValueError, UnicodeDecodeError):
                body = None
            return response.code, response.headers.get_all("Set-Cookie", []), body


def token_pair(headers):
    found = []
    for header in headers:
        parsed = SimpleCookie()
        parsed.load(header)
        if COOKIE in parsed:
            token = parsed[COOKIE].value
            if re.fullmatch(r"[A-Za-z0-9_-]{32,256}", token):
                found.append(COOKIE + "=" + token)
    if len(found) != 1:
        raise PrerequisiteError("One valid synthetic session required")
    return found[0]


def clearing_observed(headers):
    for header in headers:
        parsed = SimpleCookie()
        parsed.load(header)
        if COOKIE not in parsed or parsed[COOKIE].value:
            continue
        item = parsed[COOKIE]
        if item["max-age"] == "0":
            return True
        try:
            expiry = parsedate_to_datetime(item["expires"])
            if expiry.tzinfo is not None and expiry <= datetime.now(timezone.utc):
                return True
        except (TypeError, ValueError, OverflowError):
            pass
    return False


def release_record(value):
    expected = {"sourceCommit": SOURCE, "revision": REVISION,
                "runtimeManifestDigest": DIGEST, "trafficPercent": 100,
                "serviceOrigin": ORIGIN, "releaseHoldThroughFinish": True}
    if not isinstance(value, dict) or any(value.get(k) != v for k, v in expected.items()):
        raise PrerequisiteError("Release record does not match pinned M01 target")
    stamp = value.get("verifiedAtBangkok", "")
    try:
        verified = datetime.fromisoformat(stamp)
        if verified.utcoffset() != timedelta(hours=7) or verified > datetime.now(timezone.utc) + timedelta(minutes=5):
            raise ValueError()
    except (ValueError, TypeError):
        raise PrerequisiteError("Invalid supplied release verification time") from None
    return {**expected, "verifiedAtBangkok": stamp,
            "mappingAttribution": "A-supplied Cloud mapping; not inferred from HTTP health"}


def verify_m01(transport, password, mapping, operator):
    """Public report uses a fixed projection, never arbitrary server strings."""
    report = {"runId": "M01-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ"),
              "clientSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              "pythonVersion": sys.version.split()[0],
              "startedAtBangkok": now(), "operator": operator,
              "release": release_record(mapping), "scope": "Live AC04 API observations only",
              "observations": [], "outcome": "BLOCKED", "reason": "Prerequisite unavailable",
              "postRunCloudMapping": "Requires A readback; HTTP client does not observe revision/traffic",
              "productionSessionRowsInspected": False, "finalAcceptance": "NOT_MADE"}
    saved = None
    private_values = [password]
    logged_in = False
    logged_out = False
    phase = "health-before"
    def record(name, status, **fields):
        report["observations"].append({"phase": name, "atBangkok": now(), "status": status, **fields})
    try:
        status, _, _ = transport.call("GET", "/api/health")
        record(phase, status)
        if status != 200:
            raise PrerequisiteError()
        phase = "normal-login"
        status, headers, body = transport.call("POST", "/api/auth/login", {"email": EMAIL, "password": password})
        record(phase, status)
        if status != 200:
            raise PrerequisiteError()
        saved = token_pair(headers)
        private_values.extend([saved, saved.split("=", 1)[1]])
        logged_in = True
        user = body.get("user") if isinstance(body, dict) else None
        if (not isinstance(user, dict) or user.get("email") != EMAIL or user.get("role") != "RESPONDENT"
                or type(user.get("id")) is not int or user["id"] < 1):
            raise PrerequisiteError()
        phase = "identity-before-logout"
        status, _, body = transport.call("GET", "/api/auth/me", cookie=saved)
        matches = isinstance(body, dict) and isinstance(body.get("user"), dict) and all(
            body["user"].get(k) == user.get(k) for k in ["id", "email", "role"])
        record(phase, status, identityMatchesSyntheticLogin=matches)
        if status != 200 or not matches:
            raise ObservationError()
        phase = "normal-logout"
        status, headers, _ = transport.call("POST", "/api/auth/logout", cookie=saved)
        clears = clearing_observed(headers)
        record(phase, status, cookieClearingDirectiveObserved=clears)
        if status != 204:
            raise ObservationError()
        logged_out = True
        phase = "same-old-cookie-after-logout"
        # The exact same in-memory string used above is deliberately set once.
        status, _, body = transport.call("GET", "/api/auth/me", cookie=saved)
        error_only = (isinstance(body, dict) and set(body) == {"error"}
                      and isinstance(body["error"], dict)
                      and set(body["error"]) == {"code", "message"})
        unauth = (error_only and body["error"].get("code") == "UNAUTHENTICATED"
                  and body["error"].get("message") == "Please sign in to continue")
        record(phase, status, samePreLogoutCookieSent=True, responseContainsOnlyError=error_only,
               expectedErrorCodeObserved=unauth, errorCode="UNAUTHENTICATED" if unauth else "OTHER_OR_ABSENT")
        if status != 401 or not unauth or not clears:
            raise ObservationError()
        phase = "health-after"
        status, _, _ = transport.call("GET", "/api/health")
        record(phase, status)
        if status != 200:
            raise ObservationError()
        report.update(outcome="PASS", reason="Observed protocol assertions passed")
    except PrerequisiteError:
        report.update(outcome="BLOCKED", reason="Normal login or public prerequisite unavailable", stoppedAt=phase)
    except ObservationError:
        report.update(outcome="FAIL", reason="Observed M01 requirement did not match", stoppedAt=phase)
    except Exception:
        report.update(outcome="BLOCKED", reason="Transport or response-processing unavailable", stoppedAt=phase)
    finally:
        if logged_in and not logged_out and saved:
            try:
                status, _, _ = transport.call("POST", "/api/auth/logout", cookie=saved)
                report["cleanupLogoutStatus"] = status
            except Exception:
                report["cleanupLogoutStatus"] = "UNOBSERVED"
        saved = None
        report["finishedAtBangkok"] = now()
    encoded = json.dumps(report)
    if any(value and value in encoded for value in private_values):
        raise PrerequisiteError("Evidence projection failed")
    return report


def credentials(private_file):
    if private_file:
        value = json.loads(Path(private_file).read_text(encoding="utf-8-sig"))
        if not isinstance(value, dict) or value.get("email") != EMAIL:
            raise PrerequisiteError("Expected authorized synthetic Student1 credential record")
        password = value.get("password")
    else:
        password = os.environ.get("CLASSPULSE_UAT_PASSWORD")
        if not password and sys.stdin.isatty():
            password = getpass.getpass("Existing synthetic Student1 password (hidden): ")
    if not isinstance(password, str) or not password:
        raise PrerequisiteError("Authorized private synthetic access unavailable")
    return password


def main():
    parser = PrivateArgumentParser(description=__doc__)
    parser.add_argument("--release-record", required=True)
    parser.add_argument("--operator", required=True, help="Actual tester/team/account")
    parser.add_argument("--operator-kind", choices=["ai", "human"], required=True)
    parser.add_argument("--model", default="", help="Required for AI operation")
    parser.add_argument("--credentials-file", help="Existing private JSON; never pass a password argument")
    parser.add_argument("--output", required=True, help="New sanitized JSON file; existing file is never overwritten")
    args = parser.parse_args()
    try:
        if not args.operator.strip() or "\n" in args.operator or (args.operator_kind == "ai" and not args.model.strip()):
            raise PrerequisiteError()
        operator = {"tester": args.operator[:200], "kind": args.operator_kind, "model": args.model[:100]}
        mapping = release_record(json.loads(Path(args.release_record).read_text(encoding="utf-8-sig")))
        # Reserve the output before any auth operation, preventing unrecorded runs.
        with Path(args.output).open("x", encoding="utf-8") as output:
            try:
                password = credentials(args.credentials_file)
                result = verify_m01(Transport(), password, mapping, operator)
            except Exception:
                result = {"outcome": "BLOCKED", "reason": "Local private prerequisites unavailable; no values emitted",
                          "startedAtBangkok": now(), "release": mapping,
                          "finalAcceptance": "NOT_MADE"}
            output.write(json.dumps(result, indent=2) + "\n")
        print(json.dumps(result))
        return {"PASS": 0, "FAIL": 1, "BLOCKED": 2}[result["outcome"]]
    except Exception:
        print(json.dumps({"outcome": "BLOCKED", "reason": "Local prerequisites unavailable; no private values emitted"}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
