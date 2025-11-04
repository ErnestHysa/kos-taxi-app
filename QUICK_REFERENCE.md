# 🚕 Kos Taxi – Quick Reference

This cheat sheet replaces outdated live links and highlights the commands, endpoints, and credentials you need while developing or operating the Kos Taxi platform.

## 🔑 Environment checklist

- Copy `.env.example` to `.env` and populate:
  - Backend: `SECRET_KEY`, `DATABASE_URL`, `LOG_LEVEL`, `SENTRY_DSN`, Stripe keys.
  - Frontend: `VITE_APP_ENV`, `VITE_STRIPE_PUBLISHABLE_KEY`, optional Sentry & metrics variables.
- For production, set `METRICS_NAMESPACE` to a unique value per environment (e.g. `kos_taxi_staging`).

## ▶️ Core commands

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python src/main.py             # Run API server
pytest                         # Run backend tests
ruff check src                 # Lint backend code

# Frontend
cd frontend
corepack enable && pnpm install
pnpm dev                       # Run Vite dev server
pnpm test                      # Vitest + RTL suite
pnpm lint                      # ESLint
pnpm test:e2e                  # Cypress smoke journey (requires build)
```

## 🌐 Local URLs

| Service | URL |
|---------|-----|
| Frontend (dev) | `http://127.0.0.1:5173` |
| Backend API | `http://127.0.0.1:5000/api` |
| Metrics | `http://127.0.0.1:5000/metrics` |

## 🧪 Stripe sandbox data

| Scenario | Card number | Notes |
|----------|-------------|-------|
| Success | `4242 4242 4242 4242` | Any future expiry, any CVC |
| Declined | `4000 0000 0000 0002` | Simulates card declined error |

Stripe secrets must be supplied via environment variables before attempting live or test charges.

## 📡 API smoke checks

```bash
# Health check via ride estimate validation error
curl -s -X POST http://127.0.0.1:5000/api/rides/estimate -H 'Content-Type: application/json' -d '{}' | jq

# Prometheus metrics preview
curl -s http://127.0.0.1:5000/metrics | head
```

## 🛠️ Deployment helpers

- `scripts/deploy_staging.sh` – builds frontend, packages backend, writes `.deploy/staging/DEPLOY_NOTES.md`.
- `scripts/deploy_production.sh` – installs backend requirements, dry-runs migrations, writes `.deploy/production/CHECKLIST.md`.
- `.github/workflows/ci.yml` – automated lint/test/build/e2e pipeline triggered on PRs and pushes to `main`.

## 📈 Observability

- Configure `SENTRY_DSN` & `VITE_SENTRY_DSN` to enable error tracking.
- `/metrics` exposes `http_request_duration_seconds` histogram and `http_requests_total` counter for Prometheus.
- Frontend web-vital beacons can be forwarded by setting `VITE_METRICS_ENDPOINT`.

## 📚 Useful references

- [PRODUCTION_READY_GUIDE.md](PRODUCTION_READY_GUIDE.md) – detailed deployment & rollback procedures.
- [KOS_TAXI_DOCUMENTATION.md](KOS_TAXI_DOCUMENTATION.md) – architectural overview.
- [STRIPE_SETUP_INSTRUCTIONS.md](STRIPE_SETUP_INSTRUCTIONS.md) – payment configuration steps.
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) – onboarding walkthrough for new developers.

Keep this guide handy when running commands locally, preparing a deployment, or answering quick operational questions.
