#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENVIRONMENT="${DEPLOY_ENV:-staging}"
ARTIFACT_ROOT="${PROJECT_ROOT}/.deploy/${ENVIRONMENT}"

echo "Preparing Kos Taxi deployment for ${ENVIRONMENT} (commit ${GITHUB_SHA:-local})"
rm -rf "${ARTIFACT_ROOT}"
mkdir -p "${ARTIFACT_ROOT}"

echo "Ensuring pnpm is available"
if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable
fi

echo "Building frontend bundle"
pnpm --dir "${PROJECT_ROOT}/frontend" install --frozen-lockfile
pnpm --dir "${PROJECT_ROOT}/frontend" build

tar -czf "${ARTIFACT_ROOT}/frontend-dist.tar.gz" -C "${PROJECT_ROOT}/frontend" dist

echo "Packaging backend source"
python -m pip install --upgrade pip >/dev/null
pip install -r "${PROJECT_ROOT}/backend/requirements.txt" >/dev/null

tar -czf "${ARTIFACT_ROOT}/backend-src.tar.gz" -C "${PROJECT_ROOT}/backend" src requirements.txt

cat >"${ARTIFACT_ROOT}/DEPLOY_NOTES.md" <<NOTES
# Kos Taxi staging deployment
- Upload \`frontend-dist.tar.gz\` to the staging CDN bucket.
- Deploy the backend from \`backend-src.tar.gz\` and run 'flask db upgrade'.
- Required environment variables:
  - LOG_LEVEL=INFO
  - SENTRY_DSN (staging project DSN)
  - METRICS_NAMESPACE=kos_taxi_staging
  - STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY test credentials
- Verify `/metrics` and Sentry event ingestion after the rollout.
NOTES

echo "Staging artefacts created at ${ARTIFACT_ROOT}"
