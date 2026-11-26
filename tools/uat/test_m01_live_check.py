"""Offline utility verification only: no app, Cloud, credentials or database."""
import contextlib
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

import m01_live_check as m

SECRET = "OFFLINE_SENTINEL_PASSWORD"
TOKEN = "s" * 43
PAIR = "cp_session=" + TOKEN
OPERATOR = {"tester": "Offline fixture", "kind": "ai", "model": "test fixture"}


def mapping():
    return {"sourceCommit": m.SOURCE, "revision": m.REVISION,
            "runtimeManifestDigest": m.DIGEST, "trafficPercent": 100,
            "serviceOrigin": m.ORIGIN, "releaseHoldThroughFinish": True,
            "verifiedAtBangkok": m.now()}


class FakeTransport:
    def __init__(self):
        self.calls = []
        self.user = {"id": 4, "email": m.EMAIL, "role": "RESPONDENT", "fullName": "Synthetic fixture"}
        self.login_status = 200
        self.login_headers = [PAIR + "; Path=/; HttpOnly; SameSite=Lax; Secure"]
        self.login_body = {"user": self.user}
        self.before_status = 200
        self.before_body = {"user": self.user}
        self.logout_status = 204
        self.logout_headers = ["cp_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"]
        self.replay_status = 401
        self.replay_body = {"error": {"code": "UNAUTHENTICATED", "message": "Please sign in to continue"}}
        self.health_status = 200
        self.raise_login = False
        self.me_calls = 0

    def call(self, method, path, payload=None, cookie=None):
        self.calls.append((method, path, payload, cookie))
        if path == "/api/health":
            return self.health_status, [], {"status": "ok"}
        if path == "/api/auth/login":
            if self.raise_login:
                raise RuntimeError(SECRET + TOKEN)
            return self.login_status, self.login_headers, self.login_body
        if path == "/api/auth/logout":
            return self.logout_status, self.logout_headers, {}
        self.me_calls += 1
        if self.me_calls == 1:
            return self.before_status, [], self.before_body
        return self.replay_status, [], self.replay_body


class M01Tests(unittest.TestCase):
    def run_fake(self, fake=None):
        return m.verify_m01(fake or FakeTransport(), SECRET, mapping(), OPERATOR)

    def assert_private(self, report):
        text = json.dumps(report)
        self.assertNotIn(SECRET, text)
        self.assertNotIn(TOKEN, text)
        self.assertNotIn(m.EMAIL, text)
        self.assertNotIn("Synthetic fixture", text)

    def test_pass_uses_exact_original_cookie_once_after_logout(self):
        fake = FakeTransport();report = self.run_fake(fake)
        self.assertEqual(report["outcome"], "PASS")
        self.assertEqual([(x[0], x[1]) for x in fake.calls], [
            ("GET", "/api/health"), ("POST", "/api/auth/login"),
            ("GET", "/api/auth/me"), ("POST", "/api/auth/logout"),
            ("GET", "/api/auth/me"), ("GET", "/api/health")])
        self.assertEqual([x[3] for x in fake.calls[2:5]], [PAIR, PAIR, PAIR])
        self.assertEqual(fake.me_calls, 2)
        self.assert_private(report)

    def test_cookie_clearing_is_observed_without_header_values(self):
        report = self.run_fake()
        self.assertTrue(report["observations"][3]["cookieClearingDirectiveObserved"])
        self.assertTrue(report["observations"][4]["samePreLogoutCookieSent"])
        self.assertNotIn("Set-Cookie", json.dumps(report))

    def test_missing_clearing_fails_even_when_replay_is_401(self):
        fake = FakeTransport();fake.logout_headers = []
        self.assertEqual(self.run_fake(fake)["outcome"], "FAIL")

    def test_replay_still_authenticated_fails_without_user_data_output(self):
        fake = FakeTransport();fake.replay_status = 200;fake.replay_body = fake.login_body
        report = self.run_fake(fake)
        self.assertEqual(report["outcome"], "FAIL");self.assert_private(report)

    def test_wrong_error_code_fails(self):
        fake = FakeTransport();fake.replay_body = {"error": {"code": SECRET, "message": TOKEN}}
        report = self.run_fake(fake)
        self.assertEqual(report["outcome"], "FAIL");self.assert_private(report)

    def test_extra_user_in_replay_response_fails(self):
        fake = FakeTransport();fake.replay_body["user"] = fake.user
        report = self.run_fake(fake)
        self.assertEqual(report["outcome"], "FAIL");self.assert_private(report)

    def test_nested_user_data_in_error_fails(self):
        fake = FakeTransport();fake.replay_body["error"]["details"] = fake.user
        self.assertEqual(self.run_fake(fake)["outcome"], "FAIL")

    def test_invalid_credentials_are_precondition_not_product_pass(self):
        fake = FakeTransport();fake.login_status = 401
        report = self.run_fake(fake)
        self.assertEqual(report["outcome"], "BLOCKED")
        self.assertEqual(len(fake.calls), 2)

    def test_public_failure_stops_before_login(self):
        fake = FakeTransport();fake.health_status = 503
        self.assertEqual(self.run_fake(fake)["outcome"], "BLOCKED")
        self.assertEqual(len(fake.calls), 1)

    def test_identity_mismatch_fails_and_attempts_cleanup(self):
        fake = FakeTransport();fake.before_body = {"user": {**fake.user, "id": 99}}
        report = self.run_fake(fake)
        self.assertEqual(report["outcome"], "FAIL")
        self.assertEqual(fake.calls[-1][1], "/api/auth/logout")
        self.assertEqual(report["cleanupLogoutStatus"], 204)

    def test_wrong_role_stops_and_cleans_up(self):
        fake = FakeTransport();fake.login_body = {"user": {**fake.user, "role": "OWNER"}}
        report = self.run_fake(fake)
        self.assertEqual(report["outcome"], "BLOCKED")
        self.assertEqual(fake.calls[-1][1], "/api/auth/logout")

    def test_malformed_login_body_still_cleans_up_created_session(self):
        fake = FakeTransport();fake.login_body = None
        report = self.run_fake(fake)
        self.assertEqual(report["outcome"], "BLOCKED")
        self.assertEqual(report["cleanupLogoutStatus"], 204)

    def test_transport_exception_never_emits_error_text(self):
        fake = FakeTransport();fake.raise_login = True
        report = self.run_fake(fake)
        self.assertEqual(report["outcome"], "BLOCKED");self.assert_private(report)

    def test_cookie_header_injection_and_duplicate_are_rejected(self):
        for headers in [["cp_session=short"], [PAIR, PAIR], ["other=" + TOKEN], ["cp_session=bad token"]]:
            with self.subTest(kind=len(headers)):
                with self.assertRaises(m.PrerequisiteError):m.token_pair(headers)

    def test_expired_cookie_directive_also_counts_as_clearing(self):
        self.assertTrue(m.clearing_observed(["cp_session=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/"]))
        self.assertFalse(m.clearing_observed([PAIR + "; Max-Age=0"]))
        self.assertFalse(m.clearing_observed(["other=; Max-Age=0"]))

    def test_mapping_mismatch_cannot_start_network(self):
        for key, value in [("sourceCommit", "0" * 40), ("revision", "other"), ("serviceOrigin", "https://example.com"), ("runtimeManifestDigest", "wrong"), ("trafficPercent", 50), ("releaseHoldThroughFinish", False), ("verifiedAtBangkok", "not-a-time")]:
            with self.subTest(field=key):
                fake = FakeTransport();record = mapping();record[key] = value
                with self.assertRaises(m.PrerequisiteError):m.verify_m01(fake, SECRET, record, OPERATOR)
                self.assertEqual(fake.calls, [])

    def test_real_transport_rejects_other_endpoints_before_io(self):
        transport = m.Transport()
        with patch.object(transport.opener, "open") as io_call:
            for method,path in [("GET", "https://example.com"), ("GET", "/api/owner/surveys"), ("DELETE", "/api/auth/logout")]:
                with self.assertRaises(m.PrerequisiteError):transport.call(method,path)
            io_call.assert_not_called()

    def test_redirect_is_not_followed(self):
        self.assertIsNone(m.NoRedirect().redirect_request(None,None,302,"",{},"https://example.com"))

    def test_report_does_not_claim_cloud_or_database_inspection(self):
        report = self.run_fake()
        self.assertFalse(report["productionSessionRowsInspected"])
        self.assertEqual(report["finalAcceptance"], "NOT_MADE")
        self.assertIn("Requires A readback", report["postRunCloudMapping"])

    def test_private_credentials_file_and_env_are_not_echoed(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory)/"private.json"
            file.write_text(json.dumps({"email":m.EMAIL,"password":SECRET}))
            self.assertEqual(m.credentials(file), SECRET)
            file.write_text(json.dumps({"email":"ann.lee@classpulse.test","password":SECRET}))
            with self.assertRaises(m.PrerequisiteError):m.credentials(file)
        with patch.dict(os.environ,{"CLASSPULSE_UAT_PASSWORD":SECRET}):self.assertEqual(m.credentials(None), SECRET)

    def test_existing_output_is_never_overwritten_or_used_for_auth(self):
        with tempfile.TemporaryDirectory() as directory:
            folder=Path(directory);record=folder/"release.json";record.write_text(json.dumps(mapping()))
            out=folder/"existing.json";out.write_text("historical")
            argv=["m01_live_check.py","--release-record",str(record),"--operator","Offline","--operator-kind","ai","--model","fixture","--output",str(out)]
            with patch.object(sys,"argv",argv),patch.object(m,"credentials") as read_private,contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(m.main(),2);read_private.assert_not_called()
            self.assertEqual(out.read_text(),"historical")

    def test_missing_private_access_still_writes_sanitized_blocked_result(self):
        with tempfile.TemporaryDirectory() as directory:
            folder=Path(directory);record=folder/"release.json";record.write_text(json.dumps(mapping()));out=folder/"result.json"
            argv=["m01_live_check.py","--release-record",str(record),"--operator","Offline","--operator-kind","ai","--model","fixture","--output",str(out)]
            with patch.object(sys,"argv",argv),patch.object(m,"credentials",side_effect=RuntimeError(SECRET)),contextlib.redirect_stdout(io.StringIO()) as captured:
                self.assertEqual(m.main(),2)
            result=json.loads(out.read_text());self.assertEqual(result["outcome"],"BLOCKED");self.assert_private(result)
            self.assertNotIn(SECRET,captured.getvalue())

    def test_unknown_password_argument_is_rejected_without_echo(self):
        with patch.object(sys,"argv",["m01_live_check.py","--password",SECRET]),contextlib.redirect_stderr(io.StringIO()) as captured:
            with self.assertRaises(SystemExit) as result:m.main()
        self.assertEqual(result.exception.code,2)
        self.assertNotIn(SECRET,captured.getvalue())

    def test_login_without_real_identity_id_stops_and_cleans_up(self):
        fake=FakeTransport();fake.login_body={"user":{k:v for k,v in fake.user.items() if k!="id"}}
        result=self.run_fake(fake)
        self.assertEqual(result["outcome"],"BLOCKED")
        self.assertEqual(result["cleanupLogoutStatus"],204)

    def test_accidental_private_value_in_operator_cannot_be_projected(self):
        for value in [SECRET,TOKEN,PAIR]:
            with self.subTest(kind=len(value)):
                with self.assertRaises(m.PrerequisiteError):m.verify_m01(FakeTransport(),SECRET,mapping(),{"tester":value})


if __name__ == "__main__":
    unittest.main()
