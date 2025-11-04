# 🚀 Kos Taxi – Production Readiness Guide

This guide documents the steps required to launch and operate the Kos Taxi platform in your own infrastructure. It supersedes any previous claims of a pre-hosted environment.

## 1. Infrastructure overview

| Component | Recommendation | Notes |
|-----------|----------------|-------|
| Frontend hosting | CDN + object storage (e.g. CloudFront + S3, Azure CDN, Netlify) | Serve `frontend/dist/` as static assets with HTTPS. |
| Backend runtime | Container orchestration (ECS, Kubernetes, Fly.io, etc.) | Build an image from `backend/` and supply environment variables listed below. |
| Database | Managed PostgreSQL or MySQL | Update `DATABASE_URL` accordingly; SQLite is suitable only for local development. |
| Caching / queues | Optional | Add Redis/worker tier if you introduce background jobs. |
| Observability | Prometheus + Grafana, Sentry | `/metrics` endpoint exposes scrapeable metrics; Sentry DSNs wire into both backend and frontend. |

## 2. Environment variables

### Backend (`backend/src/config.py`)

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Flask secret key. |
| `DATABASE_URL` | SQLAlchemy database URI (e.g. `postgresql+psycopg://user:pass@host/db`). |
| `LOG_LEVEL` | Logging level (`INFO`, `DEBUG`, etc.). |
| `SENTRY_DSN` | Backend Sentry project DSN (optional). |
| `SENTRY_TRACES_SAMPLE_RATE` | Float between 0 and 1 for trace sampling. |
| `SENTRY_PROFILES_SAMPLE_RATE` | Float between 0 and 1 for profiling sampling. |
| `METRICS_NAMESPACE` | Prefix for Prometheus metrics (`kos_taxi`, `kos_taxi_staging`, etc.). |
| `JWT_SECRET_KEY` | Override for JWT token signing (defaults to `SECRET_KEY`). |
| `STRIPE_SECRET_KEY` | Stripe secret key. |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (returned to the frontend). |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification secret. |
| Notification variables | `NOTIFICATIONS_*` keys configure email/SMS providers. |

### Frontend (Vite env file)

| Variable | Description |
|----------|-------------|
| `VITE_APP_ENV` | Arbitrary environment name shown in telemetry breadcrumbs. |
| `VITE_SENTRY_DSN` | Frontend Sentry DSN. |
| `VITE_SENTRY_TRACES_SAMPLE_RATE` | Frontend tracing sample rate. |
| `VITE_SENTRY_PROFILES_SAMPLE_RATE` | Frontend profiling sample rate. |
| `VITE_METRICS_ENDPOINT` | Optional endpoint receiving web-vitals payloads. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key exposed to the browser. |

## 3. Build & deployment pipeline

1. **CI validation** – The GitHub Actions workflow (`Kos Taxi CI/CD`) executes linting, unit tests, build steps, and Cypress smoke tests for each change.
2. **Artefact creation** – On pushes to `main`, the workflow runs:
   - `scripts/deploy_staging.sh` – builds frontend, packages backend sources, and writes `DEPLOY_NOTES.md` with staging configuration reminders under `.deploy/staging/`.
   - `scripts/deploy_production.sh` – validates migrations, installs backend dependencies, and writes `CHECKLIST.md` under `.deploy/production/`.
3. **Container/image build** – Use the generated artefacts (or source tree) to build container images tagged with the Git SHA.
4. **Static asset upload** – Upload `frontend-dist.tar.gz` contents to your CDN bucket. Invalidate caches after publishing.
5. **Backend rollout** – Deploy the container to your runtime platform. Provide environment variables and secrets via your orchestrator’s secret manager.
6. **Database migrations** – Run `flask db upgrade` with production configuration before routing traffic to the new release.
7. **Post-deploy checks** – Execute the Cypress smoke suite against the deployed URL, ensure `/metrics` is scrapeable, and monitor Sentry for new release events.

## 4. Rollback strategy

1. **Identify release** – Note the Git SHA and container tag deployed.
2. **Redeploy previous artefacts** – Use your platform’s deployment history to redeploy the last known-good release or re-run the deployment scripts with the previous SHA.
3. **Database** – If a migration introduced issues, revert by running `flask db downgrade <revision>` using the previous revision identifier. Always test downgrades in staging before applying to production.
4. **Frontend** – Restore the previous static asset bundle by re-uploading the prior `frontend-dist.tar.gz` contents.
5. **Verification** – Re-run smoke tests, confirm Sentry error volume returns to baseline, and verify metrics for elevated error rates.

## 5. Monitoring & alerting

- **Prometheus:** Scrape `/metrics` on each backend instance. Suggested alerts include high request latency (`http_request_duration_seconds`) and elevated error rates (`http_requests_total{http_status=~"5.."}`).
- **Sentry:** Configure release tracking and alerts for unhandled exceptions in both frontend and backend. Sample rates are configurable via environment variables.
- **Stripe:** Set up webhook endpoints (`/api/payments/webhook` if implemented) and monitor the Stripe dashboard for payment failures.

## 6. Security checklist

- Serve all endpoints over HTTPS.
- Rotate `SECRET_KEY`, `JWT_SECRET_KEY`, and Stripe secrets regularly.
- Restrict database and cache network access to application subnets.
- Configure CORS allowed origins explicitly in production.
- Enable Sentry’s PII scrubbing if you transmit personal data.

## 7. Operational runbook

1. **Pre-deploy:**
   - Confirm all tests pass locally (`pytest`, `pnpm test`, `pnpm test:e2e`).
   - Review `DEPLOY_NOTES.md` or `CHECKLIST.md` for outstanding tasks.
   - Ensure Stripe keys correspond to the target environment (test vs live).
2. **Deploy:**
   - Execute the appropriate deployment script or trigger your CI/CD stage that consumes it.
   - Monitor rollout dashboards for anomalies.
3. **Post-deploy:**
   - Run the Cypress smoke suite against the live URL.
   - Validate payments using Stripe test cards in staging.
   - Review Sentry, Prometheus, and application logs for warnings or errors.
4. **Incident response:**
   - Capture context with `reportError` (frontend) or logging (backend) for any user-facing issue.
   - Use the rollback procedure if uptime or data integrity is at risk.

---

With the above practices and automation in place, Kos Taxi can be confidently operated in staging and production environments managed by your team.
