import { expect, test } from "vitest";
import { analyzeSummarySamples, runSummaryRequests, validateBenchmarkTarget } from "../../../tools/performance/summary-benchmark.mjs";

const expectedSummary = { responseCount: 500, average: 3 };

function measurement(elapsedMs: number) {
  return { elapsedMs, status: 200, body: expectedSummary };
}

function matchesExpectedSummary(body: unknown) {
  return JSON.stringify(body) === JSON.stringify(expectedSummary);
}

test("TEST-282 records every sample, uses nearest rank 19 and accepts 500ms", () => {
  const times = [900, 500, ...Array.from({ length: 18 }, (_, index) => 17 - index)];
  const result = analyzeSummarySamples(times.map(measurement), matchesExpectedSummary);

  expect(result).toEqual({
    samplesMs: times,
    sortedSamplesMs: [...times].sort((left, right) => left - right),
    rank: 19,
    p95Ms: 500,
    passed: true
  });
});

test("TEST-282 rejects a p95 of 500.001ms without rounding down", () => {
  const measurements = [800, 500.001, ...Array<number>(18).fill(100)].map(measurement);

  expect(analyzeSummarySamples(measurements, matchesExpectedSummary)).toMatchObject({
    p95Ms: 500.001,
    passed: false
  });
});

test("TEST-282 rejects wrong sample counts and invalid durations", () => {
  for (const length of [19, 21]) {
    const measurements = Array.from({ length }, () => measurement(10));
    expect(() => analyzeSummarySamples(measurements, matchesExpectedSummary)).toThrow("Exactly 20 samples are required");
  }
  for (const invalidDuration of [NaN, -1, Infinity]) {
    const measurements = Array.from({ length: 20 }, (_, index) => measurement(index === 3 ? invalidDuration : 10));
    expect(() => analyzeSummarySamples(measurements, matchesExpectedSummary)).toThrow("Sample 4 has an invalid duration");
  }
});

test("TEST-282 reports a failed response or wrong summary instead of dropping it", () => {
  const measurements = Array.from({ length: 20 }, () => measurement(10));
  measurements[4] = { ...measurement(10), status: 503 };
  expect(() => analyzeSummarySamples(measurements, matchesExpectedSummary)).toThrow("Sample 5 did not return HTTP 200");

  measurements[4] = { ...measurement(10), body: { responseCount: 499, average: 3 } };
  expect(() => analyzeSummarySamples(measurements, matchesExpectedSummary)).toThrow("Sample 5 summary did not match");
});

const isolatedTarget = {
  baseUrl: "http://127.0.0.1:3107",
  databaseUrl: "postgresql://127.0.0.1:5547/classpulse_test?schema=public",
  approvedDatabasePort: 5547
};

test("TEST-283 accepts explicitly approved loopback targets and test database name", () => {
  expect(() => validateBenchmarkTarget(isolatedTarget)).not.toThrow();
  expect(() => validateBenchmarkTarget({
    ...isolatedTarget,
    baseUrl: "http://[::1]:3107",
    databaseUrl: "postgresql://[::1]:5547/classpulse_test"
  })).not.toThrow();
});

test("TEST-283 rejects unsafe app targets, wrong database names or ports, and overrides", () => {
  for (const baseUrl of [
    "http://example.invalid:3107",
    "http://127.0.0.1.example.invalid:3107",
    "ftp://127.0.0.1:3107",
    "http://127.0.0.1:3107/api"
  ]) {
    expect(() => validateBenchmarkTarget({ ...isolatedTarget, baseUrl })).toThrow("Benchmark app must use a loopback origin");
  }

  for (const databaseUrl of [
    "postgresql://example.invalid:5547/classpulse_test",
    "postgresql://127.0.0.1:5432/classpulse_test",
    "postgresql://127.0.0.1:5547/classpulse",
    "postgresql://127.0.0.1:5547/classpulse_test?host=example.invalid"
  ]) {
    expect(() => validateBenchmarkTarget({ ...isolatedTarget, databaseUrl })).toThrow("Benchmark database must be the approved loopback classpulse_test instance");
  }
});

test("TEST-283 rejects invalid configuration without exposing the private URL", () => {
  const databaseUrl = "postgresql://fixture:synthetic-redaction-marker@example.invalid:5547/classpulse_test";
  expect(() => validateBenchmarkTarget({ ...isolatedTarget, databaseUrl })).toThrow(
    /^Benchmark database must be the approved loopback classpulse_test instance$/
  );
  expect(() => validateBenchmarkTarget({ ...isolatedTarget, approvedDatabasePort: 0 })).toThrow(
    /^Benchmark database must be the approved loopback classpulse_test instance$/
  );
});

test("TEST-281 request sequence validates five warmups and records twenty sequential body timings", async () => {
  let calls = 0;
  let validations = 0;
  let tick = 0;
  let pending = false;
  const result = await runSummaryRequests({
    target: isolatedTarget,
    surveyId: 42,
    cookie: "cp_session=synthetic-test-session",
    verifySummary: (body: unknown) => {
      expect(pending).toBe(false);
      validations += 1;
      tick += 1000;
      return matchesExpectedSummary(body);
    },
    now: () => tick,
    request: async (url: string, init: RequestInit) => {
      expect(pending).toBe(false);
      pending = true;
      calls += 1;
      expect(url).toBe("http://127.0.0.1:3107/api/owner/surveys/42/summary");
      expect(init.redirect).toBe("manual");
      expect(new Headers(init.headers).get("cookie")).toBe("cp_session=synthetic-test-session");
      tick += 2;
      return {
        status: 200,
        text: async () => {
          await Promise.resolve();
          tick += calls;
          pending = false;
          return JSON.stringify(expectedSummary);
        }
      };
    }
  });
  expect(calls).toBe(25);
  expect(validations).toBe(25);
  expect(result.samplesMs).toEqual(Array.from({ length: 20 }, (_, index) => index + 8));
  expect(result.p95Ms).toBe(26);
});

test("TEST-281 request sequence fails on a bad warmup or transport error without retry or private output", async () => {
  let calls = 0;
  const setup = {
    target: isolatedTarget,
    surveyId: 42,
    cookie: "cp_session=synthetic-test-session",
    verifySummary: matchesExpectedSummary
  };
  await expect(runSummaryRequests({
    ...setup,
    request: async () => {
      calls += 1;
      return { status: 302, text: async () => "" };
    }
  })).rejects.toThrow(/^Warmup 1 did not return HTTP 200$/);
  expect(calls).toBe(1);

  calls = 0;
  await expect(runSummaryRequests({
    ...setup,
    request: async () => {
      calls += 1;
      throw new Error("synthetic-test-session");
    }
  })).rejects.toThrow(/^Warmup 1 request or body read failed$/);
  expect(calls).toBe(1);
});

test("TEST-281 refuses a non-loopback target before any request", async () => {
  let calls = 0;
  await expect(runSummaryRequests({
    target: { ...isolatedTarget, baseUrl: "http://example.invalid" },
    surveyId: 42,
    cookie: "cp_session=synthetic-test-session",
    verifySummary: matchesExpectedSummary,
    request: async () => { calls += 1; }
  })).rejects.toThrow(/^Benchmark app must use a loopback origin$/);
  expect(calls).toBe(0);
});
