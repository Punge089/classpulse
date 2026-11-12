"""Offline tests for the public smoke checks. The HTTP helper is always mocked."""
import importlib.util
import os
from pathlib import Path
import unittest
from unittest.mock import patch


class SmokeTests(unittest.TestCase):
    def load_smoke(self):
        path = Path(__file__).parents[1] / "smoke_test.py"
        self.assertTrue(path.is_file(), "deploy/smoke_test.py is missing")
        spec = importlib.util.spec_from_file_location("classpulse_smoke", path)
        self.assertIsNotNone(spec)
        smoke = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(smoke)
        return smoke

    def test_public_checks_pass_without_credentials(self):
        smoke = self.load_smoke()
        replies = {
            "/api/health": (200, b'{"status":"ok"}'),
            "/api/ready": (200, b'{"db":"connected"}'),
            "/": (200, b"<html><title>ClassPulse</title></html>"),
            "/api/auth/me": (401, b'{"error":{"code":"UNAUTHENTICATED"}}'),
        }
        paths = []

        def mocked_request(base, path):
            paths.append(path)
            return replies[path]

        with patch.dict(os.environ, {}, clear=True), patch.object(smoke, "request", side_effect=mocked_request), patch.object(smoke.time, "sleep"):
            smoke.check("https://demo.example.test")
        self.assertEqual(paths, ["/api/health", "/api/ready", "/", "/api/auth/me"])

    def test_database_readiness_failure_fails_smoke_check(self):
        smoke = self.load_smoke()

        def disconnected(_base, path):
            return (503, b'{"db":"disconnected"}') if path == "/api/ready" else (200, b'{"status":"ok"}')

        with patch.dict(os.environ, {}, clear=True), patch.object(smoke, "request", side_effect=disconnected), patch.object(smoke.time, "sleep"):
            with self.assertRaisesRegex(RuntimeError, "/api/ready"):
                smoke.check("https://demo.example.test")

    def test_authenticated_auth_me_fails_the_access_boundary_check(self):
        smoke = self.load_smoke()
        replies = {
            "/api/health": (200, b'{"status":"ok"}'),
            "/api/ready": (200, b'{"db":"connected"}'),
            "/": (200, b"<html><title>ClassPulse</title></html>"),
            "/api/auth/me": (200, b'{"user":{"id":1}}'),
        }

        with patch.dict(os.environ, {}, clear=True), patch.object(smoke, "request", side_effect=lambda _base, path: replies[path]), patch.object(smoke.time, "sleep"):
            with self.assertRaisesRegex(RuntimeError, "/api/auth/me"):
                smoke.check("https://demo.example.test")


if __name__ == "__main__":
    unittest.main()
