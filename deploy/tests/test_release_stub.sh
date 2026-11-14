#!/usr/bin/env bash
# Offline release test. A temporary fake gcloud records calls; this never contacts GCP.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$ROOT/deploy/release.sh"
if [[ ! -f "$SCRIPT" ]]; then
  echo 'FAIL release behavior: deploy/release.sh is missing' >&2
  exit 1
fi

TASK_TMP="$(mktemp -d)"
trap 'rm -rf "$TASK_TMP"' EXIT
export PROJECT_ID=release-test REGION=asia-southeast1
export IMAGE_TAG=1111111111111111111111111111111111111111
export SERVICE_NAME=classpulse MIGRATE_JOB_NAME=classpulse-migrate
export CALL_LOG="$TASK_TMP/calls" GITHUB_ENV="$TASK_TMP/env"
export PATH="$TASK_TMP:$PATH"
export DATABASE_URL=postgresql://synthetic:do-not-print@localhost/classpulse_test
export RELEASE_SECRET_SENTINEL=do-not-print-this-value

cat > "$TASK_TMP/gcloud" <<'STUB'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$CALL_LOG"
case "$*" in
  'artifacts docker images describe '*)
    [[ "${FAIL_AT:-}" != image ]] || exit 1
    if [[ "${FAIL_AT:-}" == digest ]]; then
      echo 'not-a-digest'
    else
      printf '%s-docker.pkg.dev/%s/classpulse/classpulse@sha256:%064d\n' "$REGION" "$PROJECT_ID" 0
    fi
    ;;
  'run jobs execute '*) [[ "${FAIL_AT:-}" != migration ]] || exit 1 ;;
  'run services describe '*) echo 'https://demo.example.test' ;;
esac
STUB
chmod +x "$TASK_TMP/gcloud"

DIGEST="$REGION-docker.pkg.dev/$PROJECT_ID/classpulse/classpulse@sha256:$(printf '%064d' 0)"
export ROLLBACK=false
normal_output="$(bash "$SCRIPT")"
if [[ "$normal_output" == *"$DATABASE_URL"* || "$normal_output" == *"$RELEASE_SECRET_SENTINEL"* ]]; then
  echo 'FAIL release printed a database value or secret' >&2
  exit 1
fi
grep -q "run jobs update .*${DIGEST}" "$CALL_LOG"
grep -q "run jobs execute .*--wait" "$CALL_LOG"
grep -q "run services update .*${DIGEST}" "$CALL_LOG"
grep -q 'run services update-traffic classpulse --to-latest' "$CALL_LOG"
[[ "$(grep -n 'run jobs update ' "$CALL_LOG" | head -n1 | cut -d: -f1)" -lt "$(grep -n 'run jobs execute ' "$CALL_LOG" | head -n1 | cut -d: -f1)" ]]
[[ "$(grep -n 'run jobs execute ' "$CALL_LOG" | head -n1 | cut -d: -f1)" -lt "$(grep -n 'run services update ' "$CALL_LOG" | head -n1 | cut -d: -f1)" ]]
grep -q "DEPLOYED_IMAGE=$DIGEST" "$GITHUB_ENV"
grep -q 'SERVICE_URL=https://demo.example.test' "$GITHUB_ENV"
echo 'PASS normal release resolves one digest, waits for migration, then updates service'

: > "$CALL_LOG"
export ROLLBACK=true
rollback_output="$(bash "$SCRIPT")"
if [[ "$rollback_output" == *"$DATABASE_URL"* || "$rollback_output" == *"$RELEASE_SECRET_SENTINEL"* ]]; then
  echo 'FAIL rollback printed a database value or secret' >&2
  exit 1
fi
if grep -q 'run jobs' "$CALL_LOG"; then echo 'FAIL rollback touched migration job' >&2; exit 1; fi
grep -q "run services update .*${DIGEST}" "$CALL_LOG"
grep -q 'run services update-traffic classpulse --to-latest' "$CALL_LOG"
echo 'PASS rollback updates by digest without migration'

for failure in image digest migration; do
  : > "$CALL_LOG"
  if ROLLBACK=false FAIL_AT="$failure" bash "$SCRIPT"; then
    echo "FAIL $failure failure was accepted" >&2
    exit 1
  fi
  if grep -q 'run services update ' "$CALL_LOG"; then
    echo "FAIL service updated after $failure failure" >&2
    exit 1
  fi
  echo "PASS $failure failure prevents service update"
done

: > "$CALL_LOG"
if IMAGE_TAG=invalid bash "$SCRIPT"; then echo 'FAIL invalid SHA was accepted' >&2; exit 1; fi
test ! -s "$CALL_LOG"
echo 'PASS invalid SHA is rejected before gcloud'
