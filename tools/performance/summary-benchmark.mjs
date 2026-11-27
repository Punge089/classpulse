const SAMPLE_COUNT = 20;
const PERCENTILE = 0.95;
const LIMIT_MS = 500;
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "[::1]"]);

export function analyzeSummarySamples(measurements, verifySummary) {
  if (!Array.isArray(measurements) || measurements.length !== SAMPLE_COUNT) {
    throw new Error(`Exactly ${SAMPLE_COUNT} samples are required`);
  }

  const samplesMs = Array.from(measurements, (measurement, index) => {
    const sample = index + 1;
    if (!Number.isFinite(measurement?.elapsedMs) || measurement.elapsedMs < 0) {
      throw new Error(`Sample ${sample} has an invalid duration`);
    }
    if (measurement.status !== 200) {
      throw new Error(`Sample ${sample} did not return HTTP 200`);
    }

    let matches = false;
    try {
      matches = verifySummary(measurement.body) === true;
    } catch {
      // A malformed response may contain private data. Report the sample number only.
    }
    if (!matches) {
      throw new Error(`Sample ${sample} summary did not match`);
    }
    return measurement.elapsedMs;
  });

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

export async function runSummaryRequests() {
  throw new Error("Summary request sequence has not been implemented");
}
