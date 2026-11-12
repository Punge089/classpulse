#!/usr/bin/env python3
"""Read-only ClassPulse deployment checks. No credentials or response bodies are printed."""
import json
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

ATTEMPTS = 5
RETRY_DELAY_SECONDS = 3
MAX_BODY_BYTES = 1_000_000


def request(base_url, path):
    """Issue one unauthenticated GET and return its status and bounded body."""
    headers = {"Accept": "text/html"} if path == "/" else {"Accept": "application/json"}
    req = Request(base_url.rstrip("/") + path, headers=headers, method="GET")
    try:
        with urlopen(req, timeout=10) as response:
            return response.status, response.read(MAX_BODY_BYTES)
    except HTTPError as error:
        return error.code, error.read(MAX_BODY_BYTES)


def _matches(path, status, body):
    if path == "/":
        if status != 200:
            return False
        page = body.decode("utf-8", errors="replace")
        return re.search(r"<title\b[^>]*>\s*ClassPulse\s*</title\s*>", page, re.IGNORECASE) is not None

    expected_status = 401 if path == "/api/auth/me" else 200
    if status != expected_status:
        return False
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError, TypeError):
        return False

    if path == "/api/health":
        return isinstance(payload, dict) and payload.get("status") == "ok"
    if path == "/api/ready":
        return isinstance(payload, dict) and payload.get("db") == "connected"
    if path == "/api/auth/me":
        error = payload.get("error") if isinstance(payload, dict) else None
        return isinstance(error, dict) and error.get("code") == "UNAUTHENTICATED"
    return False


def _check_path(base_url, path):
    for attempt in range(ATTEMPTS):
        try:
            status, body = request(base_url, path)
            if _matches(path, status, body):
                return
        except (OSError, URLError, TimeoutError):
            pass

        if attempt + 1 < ATTEMPTS:
            time.sleep(RETRY_DELAY_SECONDS)

    raise RuntimeError("Smoke check failed at " + path)


def check(base_url):
    parsed = urlsplit(base_url)
    if (parsed.scheme != "https" or not parsed.hostname or parsed.username
            or parsed.password or parsed.query or parsed.fragment
            or parsed.path not in ("", "/")):
        raise RuntimeError("Service URL must be an HTTPS origin")

    for path in ("/api/health", "/api/ready", "/", "/api/auth/me"):
        _check_path(base_url, path)


def main(argv=None):
    args = sys.argv[1:] if argv is None else argv
    if len(args) != 1:
        print("Usage: smoke_test.py <service-url>", file=sys.stderr)
        return 2
    try:
        check(args[0])
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        return 1
    print("ClassPulse smoke checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
