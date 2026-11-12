#!/usr/bin/env bash
# Resolve and deploy one existing immutable image digest. Never provisions cloud resources.
set -euo pipefail

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

for required in PROJECT_ID REGION IMAGE_TAG ROLLBACK; do
  if [[ -z "${!required:-}" ]]; then
    fail "required release input is missing"
  fi
done

if [[ ! "$IMAGE_TAG" =~ ^[0-9a-f]{40}$ ]]; then
  fail "image tag must be a lowercase 40-character commit SHA"
fi
if [[ "$ROLLBACK" != "true" && "$ROLLBACK" != "false" ]]; then
  fail "rollback mode must be true or false"
fi

SERVICE_NAME="${SERVICE_NAME:-classpulse}"
MIGRATE_JOB_NAME="${MIGRATE_JOB_NAME:-classpulse-migrate}"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/classpulse/classpulse:${IMAGE_TAG}"

if ! DIGEST_IMAGE="$(gcloud artifacts docker images describe "$IMAGE_URI" \
  --project "$PROJECT_ID" \
  --format='value(image_summary.fully_qualified_digest)' 2>/dev/null)"; then
  fail "image tag could not be resolved"
fi

EXPECTED_PREFIX="${REGION}-docker.pkg.dev/${PROJECT_ID}/classpulse/classpulse@sha256:"
if [[ "$DIGEST_IMAGE" != "$EXPECTED_PREFIX"* ]]; then
  fail "resolved image is outside the expected Artifact Registry image"
fi
DIGEST="${DIGEST_IMAGE#"$EXPECTED_PREFIX"}"
if [[ ! "$DIGEST" =~ ^[0-9a-f]{64}$ ]]; then
  fail "resolved image digest is malformed"
fi

run_gcloud() {
  local failure_message="$1"
  shift
  if ! "$@" >/dev/null 2>&1; then
    fail "$failure_message"
  fi
}

if [[ "$ROLLBACK" == "false" ]]; then
  run_gcloud "migration job update failed" \
    gcloud run jobs update "$MIGRATE_JOB_NAME" \
      --image "$DIGEST_IMAGE" --region "$REGION" --project "$PROJECT_ID" --quiet
  run_gcloud "migration job execution failed" \
    gcloud run jobs execute "$MIGRATE_JOB_NAME" \
      --region "$REGION" --project "$PROJECT_ID" --wait --quiet
fi

run_gcloud "Cloud Run service update failed" \
  gcloud run services update "$SERVICE_NAME" \
    --image "$DIGEST_IMAGE" --region "$REGION" --project "$PROJECT_ID" --quiet
run_gcloud "Cloud Run traffic update failed" \
  gcloud run services update-traffic "$SERVICE_NAME" \
    --to-latest --region "$REGION" --project "$PROJECT_ID" --quiet

if ! SERVICE_URL="$(gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" --project "$PROJECT_ID" \
  --format='value(status.url)' 2>/dev/null)"; then
  fail "Cloud Run service URL could not be read"
fi
if [[ ! "$SERVICE_URL" =~ ^https://[A-Za-z0-9.-]+/?$ ]]; then
  fail "Cloud Run returned an invalid HTTPS service URL"
fi

if [[ -n "${GITHUB_ENV:-}" ]]; then
  printf 'SERVICE_URL=%s\nDEPLOYED_IMAGE=%s\n' "$SERVICE_URL" "$DIGEST_IMAGE" >> "$GITHUB_ENV"
fi
