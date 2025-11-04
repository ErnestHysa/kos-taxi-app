# Kos Taxi – Quick Start Guide

Welcome! This guide walks new contributors through setting up the project locally, running tests, and understanding the key tooling introduced in the latest update. The application is not hosted for you—follow the deployment guides to ship it to your own infrastructure.

## 1. Clone & configure

```bash
git clone https://github.com/ErnestHysa/kos-taxi-app.git
cd kos-taxi-app
cp .env.example .env
```

Update `.env` with local secrets. At minimum provide:

- `SECRET_KEY` (backend)
- `DATABASE_URL` (optional; defaults to SQLite)
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` (test keys)
- `LOG_LEVEL=DEBUG` for verbose local logging
- `VITE_STRIPE_PUBLISHABLE_KEY` for the frontend

## 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

The API is now available at `http://127.0.0.1:5000`. Prometheus metrics are exposed at `http://127.0.0.1:5000/metrics` and static assets will be served from `backend/src/static/` in production.

## 3. Frontend setup

```bash
cd frontend
corepack enable
pnpm install
pnpm dev
```

Open `http://127.0.0.1:5173` in your browser. Authentication, driver dashboards, and ride booking flows communicate with the Flask API running on port 5000.

## 4. Run automated tests

```bash
# Backend
cd backend
pytest
ruff check src

# Frontend
cd frontend
pnpm test           # Vitest + React Testing Library
pnpm lint           # ESLint
pnpm build          # Production bundle (required before Cypress)
pnpm test:e2e       # Cypress smoke journey (uses pnpm preview under the hood)
```

All of the above checks run automatically in GitHub Actions (`Kos Taxi CI/CD`) on every pull request.

## 5. Configure observability

- **Sentry:** Set `SENTRY_DSN` (backend) and `VITE_SENTRY_DSN` (frontend). Adjust trace/profile sampling via the corresponding environment variables.
- **Metrics namespace:** Use `METRICS_NAMESPACE=kos_taxi_<env>` to avoid metric collisions across environments.
- **Frontend telemetry:** The helper in `frontend/src/lib/telemetry.ts` sends web-vitals to `VITE_METRICS_ENDPOINT` when configured; otherwise metrics are logged to the console for debugging.

## 6. Stripe integration (test mode)

1. Create a Stripe account and retrieve test keys (`pk_test_...`, `sk_test_...`).
2. Update `.env` and rebuild the frontend (`pnpm build`).
3. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry and CVC.

The backend will fall back to placeholder PaymentIntents when `STRIPE_SECRET_KEY` is unset, enabling development without hitting Stripe.

## 7. Deploying your build

- Review `PRODUCTION_READY_GUIDE.md` for infrastructure recommendations and rollout steps.
- Generate artefacts via `scripts/deploy_staging.sh` or `scripts/deploy_production.sh`. These scripts build bundles and write runbooks in `.deploy/<env>/`.
- Upload the `frontend-dist.tar.gz` contents to your CDN and deploy the backend container image.
- Run `flask db upgrade` in the target environment and execute the Cypress smoke test against the live URL.

## 8. Need more detail?

Consult these references:

- [KOS_TAXI_DOCUMENTATION.md](KOS_TAXI_DOCUMENTATION.md) – architecture and data model deep dive.
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) – command cheat sheet.
- [STRIPE_SETUP_INSTRUCTIONS.md](STRIPE_SETUP_INSTRUCTIONS.md) – step-by-step payment configuration.
- [APPLICATION_SUMMARY.txt](APPLICATION_SUMMARY.txt) – executive overview of the latest release.

Happy hacking! Reach out via repository issues for questions or enhancements.
