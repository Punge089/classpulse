const SAMPLE_COUNT = 20;
const PERCENTILE = 0.95;
const LIMIT_MS = 500;
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "[::1]"]);

export function analyzeSummarySamples(measurements, verifySummary) {
  if (!Array.isArray(measurements) || measurements.length !== SAMPLE_COUNT) {
    throw new Error(`Exactly ${SAMPLE_COUNT} samples are required`);
  }

  return summarizeSampleTimes(Array.from(measurements, (measurement, index) =>
    validateMeasurement(measurement, verifySummary, `Sample ${index + 1}`)));
}

function validateMeasurement(measurement, verifySummary, label) {
  if (!Number.isFinite(measurement?.elapsedMs) || measurement.elapsedMs < 0) {
    throw new Error(`${label} has an invalid duration`);
  }
  if (measurement.status !== 200) {
    throw new Error(`${label} did not return HTTP 200`);
  }

  let matches = false;
  try {
    matches = verifySummary(measurement.body) === true;
  } catch {
    // A malformed response may contain private data. Report the sample label only.
  }
  if (!matches) throw new Error(`${label} summary did not match`);
  return measurement.elapsedMs;
}

function summarizeSampleTimes(samplesMs) {
  const sortedSamplesMs = [...samplesMs].sort((left, right) => left - right);
  const rank = Math.ceil(PERCENTILE * SAMPLE_COUNT);
  const p95Ms = sortedSamplesMs[rank - 1];
  return { samplesMs, sortedSamplesMs, rank, p95Ms, passed: p95Ms <= LIMIT_MS };
}

function parseUrl(value) {
  if (typeof value !== "string") return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function validateBenchmarkTarget({ baseUrl, databaseUrl, approvedDatabasePort } = {}) {
  const app = parseUrl(baseUrl);
  if (!app || !LOOPBACK_HOSTS.has(app.hostname) ||
      (app.protocol !== "http:" && app.protocol !== "https:") ||
      app.username || app.password || app.pathname !== "/" || app.search || app.hash) {
    throw new Error("Benchmark app must use a loopback origin");
  }

  const database = parseUrl(databaseUrl);
  const validPort = Number.isInteger(approvedDatabasePort) &&
    approvedDatabasePort >= 1 && approvedDatabasePort <= 65535;
  const validDatabase = database && LOOPBACK_HOSTS.has(database.hostname) &&
    (database.protocol === "postgresql:" || database.protocol === "postgres:") &&
    database.pathname === "/classpulse_test" && database.port === String(approvedDatabasePort) &&
    !database.hash && (database.searchParams.size === 0 ||
      (database.searchParams.size === 1 && database.searchParams.get("schema") === "public"));
  if (!validPort || !validDatabase) {
    throw new Error("Benchmark database must be the approved loopback classpulse_test instance");
  }

  return app.origin;
}

export async function runSummaryRequests({
  target,
  surveyId,
  cookie,
  verifySummary,
  request = fetch,
  now = () => performance.now()
}) {
  const origin = validateBenchmarkTarget(target);
  if (!Number.isSafeInteger(surveyId) || surveyId < 1 || surveyId > 2147483647) {
    throw new Error("Benchmark requires a valid survey ID");
  }
  if (typeof cookie !== "string" || !/^cp_session=[A-Za-z0-9_-]+$/.test(cookie)) {
    throw new Error("Benchmark requires one valid session cookie");
  }
  const url = `${origin}/api/owner/surveys/${surveyId}/summary`;
  const warmupCount = 5;
  const samplesMs = [];
  for (let index = 0; index < warmupCount + SAMPLE_COUNT; index += 1) {
    const warmup = index < warmupCount;
    const label = warmup ? `Warmup ${index + 1}` : `Sample ${index - warmupCount + 1}`;
    const started = now();
    let response;
    let rawBody;
    try {
      response = await request(url, {
        headers: { cookie, accept: "application/json" },
        redirect: "manual",
        signal: AbortSignal.timeout(10000)
      });
      rawBody = await response.text();
    } catch {
      throw new Error(`${label} request or body read failed`);
    }
    const elapsedMs = now() - started;
    if (response.status !== 200) throw new Error(`${label} did not return HTTP 200`);
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      throw new Error(`${label} summary did not match`);
    }
    const validated = validateMeasurement({ elapsedMs, status: response.status, body }, verifySummary, label);
    if (!warmup) samplesMs.push(validated);
  }
  return summarizeSampleTimes(samplesMs);
}
