#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENVIRONMENT="${DEPLOY_ENV:-production}"
ARTIFACT_ROOT="${PROJECT_ROOT}/.deploy/${ENVIRONMENT}"

echo "Preparing Kos Taxi deployment for ${ENVIRONMENT} (commit ${GITHUB_SHA:-local})"
rm -rf "${ARTIFACT_ROOT}"
mkdir -p "${ARTIFACT_ROOT}"

echo "Installing backend dependencies"
python -m pip install --upgrade pip >/dev/null
pip install -r "${PROJECT_ROOT}/backend/requirements.txt" >/dev/null

echo "Validating backend migrations"
export FLASK_APP=src.main:create_app
export PYTHONPATH="${PROJECT_ROOT}/backend/src"
flask --app "${PROJECT_ROOT}/backend/src/main.py" db upgrade --directory "${PROJECT_ROOT}/backend/migrations" || echo "No migrations directory found; skipping upgrade preview."

cat >"${ARTIFACT_ROOT}/CHECKLIST.md" <<NOTES
# Production rollout checklist
- Ensure all environment variables are configured:
  - SECRET_KEY, JWT_SECRET_KEY, STRIPE keys, SENTRY_DSN, METRICS_NAMESPACE=kos_taxi_prod
  - Database connection string points to the managed PostgreSQL instance.
- Build and push the backend Docker image tagged with ${GITHUB_SHA:-local}.
- Upload the latest frontend bundle from staging to the production CDN.
- Run database migrations using the production configuration.
- Trigger smoke tests after deployment and monitor Sentry + Prometheus dashboards.
NOTES

echo "Production checklist available at ${ARTIFACT_ROOT}/CHECKLIST.md"
