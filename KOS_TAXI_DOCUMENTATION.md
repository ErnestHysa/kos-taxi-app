# Kos Taxi – Technical Documentation

Kos Taxi is a modern ride-hailing stack composed of a React (Vite) frontend and a Flask backend. This document summarises the architecture, data flows, and operational tooling introduced in the February 2025 refresh. No public live instance is bundled with the repository; deploy to your own infrastructure using the supplied guides.

## 1. System architecture

```
┌─────────────┐      HTTPS       ┌───────────────────────┐
│ React App   │ ───────────────▶ │ Flask API             │
│ (Vite build)│ ◀─────────────── │ /api/* JSON endpoints  │
└─────────────┘   Stripe.js      └────────────┬──────────┘
      │                                      │
      │ Web Vitals / logging                 │ SQLAlchemy ORM
      ▼                                      ▼
┌─────────────┐                       ┌────────────────────┐
│ Sentry      │                       │ SQLite / PostgreSQL│
└─────────────┘                       └────────────────────┘
```

- **Frontend** – SPA served via CDN or Vite dev server. Uses React Router, TanStack Query, Tailwind CSS, and a Leaflet-based map experience. Telemetry hooks capture Sentry errors and optional web-vital metrics.
- **Backend** – Flask application factory (`src/app.py`) initialises SQLAlchemy models, registers blueprints, sets up logging, Sentry, and Prometheus metrics, and serves the frontend build from `static/` in production.
- **Payments** – Stripe PaymentIntents flow with placeholder responses when secrets are absent (useful for demos & testing).
- **Notifications** – Console, SMTP, or webhook-based email/SMS providers configurable through `NOTIFICATIONS_*` environment variables.

## 2. Code layout

### Frontend

```
frontend/
├── src/
│   ├── App.tsx                 # Router & protected route handling
│   ├── main.tsx                # Telemetry bootstrap + React Query provider
│   ├── pages/                  # Landing, RideBooking, Driver portal pages
│   ├── components/             # Reusable UI modules
│   ├── state/                  # React Query hooks for auth & rides
│   ├── lib/telemetry.ts        # Logging, Sentry, web-vitals helpers
│   └── __tests__/              # Vitest + RTL suites
├── cypress/                    # Cypress e2e smoke tests
└── vite.config.js              # Vite & Vitest configuration
```

### Backend

```
backend/
├── src/
│   ├── app.py                  # Application factory, observability setup
│   ├── config.py               # Environment-driven configuration
│   ├── models/                 # SQLAlchemy models (Ride, Driver, Payment, etc.)
│   ├── routes/                 # Blueprint modules (ride, drivers, admin, payments)
│   ├── services/               # Supporting services (estimators, notifications)
│   └── auth/                   # JWT helpers and decorators
├── tests/                      # Pytest suites & fixtures
└── scripts/                    # Utility scripts & deployment helpers
```

## 3. Data model snapshot

- **Ride** – Core booking entity containing rider contact info, pickup/destination, scheduling, pricing, status, and relationships to driver & payment.
- **Driver** – Registered driver accounts with vehicle metadata and availability flags.
- **Payment** – Stripe PaymentIntent representation storing status, client secret, metadata, and contact details.
- **PricingConfig** – Stores configurable base fare and per-km pricing used by deterministic estimator.

All models reside in `backend/src/models/` and are managed through Flask-Migrate (Alembic). The application bootstraps the database automatically when first run.

## 4. API highlights

Base path: `/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rides/estimate` | Validate input and return deterministic fare/duration estimations. |
| POST | `/rides` | Create ride request, calculate fare, persist record, and initiate payment intent. |
| GET | `/rides/pending` | List rides awaiting driver action. |
| POST | `/rides/<id>/accept` | Assign driver and mark ride as accepted. |
| POST | `/rides/<id>/complete` | Mark ride as completed. |
| POST | `/rides/<id>/cancel` | Cancel ride. |
| GET | `/drivers/me` | Fetch authenticated driver profile (JWT protected). |
| POST | `/auth/login` | Driver authentication (JWT). |

See `backend/src/routes/` for full endpoints including admin utilities and payment helpers.

## 5. Observability & telemetry

- **Logging** – Configured via `LOG_LEVEL`; logs are emitted to stdout with timestamps & module names.
- **Metrics** – `/metrics` exposes Prometheus histograms (`http_request_duration_seconds`) and counters (`http_requests_total`) labelled by method, endpoint, and status.
- **Sentry** – `SENTRY_DSN` (backend) and `VITE_SENTRY_DSN` (frontend) enable error capture. Sample rates are adjustable through environment variables.
- **Frontend telemetry** – `src/lib/telemetry.ts` provides `logEvent` and `reportError` helpers plus optional beacon delivery of web-vitals to an external endpoint.

## 6. Automated testing

- **Pytest (backend)** – Located under `backend/tests/`. Fixtures spin up an isolated SQLite database. Tests cover ride validation, placeholder payments, and the `/metrics` endpoint.
- **Vitest (frontend)** – Configured via `vite.config.js`. Tests live under `frontend/src/__tests__/` and mock React Query hooks to validate routing logic.
- **Cypress** – Smoke journey (`frontend/cypress/e2e/smoke.cy.ts`) exercises the landing page CTA and booking screen against `pnpm preview`.
- **GitHub Actions** – `.github/workflows/ci.yml` orchestrates linting, unit tests, build, and Cypress runs on every PR/push to `main`.

## 7. Deployment workflow

1. Populate `.env` (backend & frontend) with real secrets.
2. Run `pnpm build` (frontend) and `python backend/scripts/build_static.py` if serving static files locally.
3. Use `scripts/deploy_staging.sh`/`scripts/deploy_production.sh` to package artefacts and generate rollout notes.
4. Upload the frontend dist bundle to your CDN and deploy the backend container.
5. Execute database migrations (`flask db upgrade`) and run smoke tests post-deploy.

## 8. Stripe configuration

Follow `STRIPE_SETUP_INSTRUCTIONS.md` to retrieve API keys, configure webhook secrets, and test payment flows using Stripe’s sandbox cards. Remember to update both backend (`STRIPE_SECRET_KEY`) and frontend (`VITE_STRIPE_PUBLISHABLE_KEY`).

## 9. Further reading

- [PRODUCTION_READY_GUIDE.md](PRODUCTION_READY_GUIDE.md) – Infrastructure & operations playbook.
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) – Developer onboarding steps.
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) – Command cheatsheet.
- [APPLICATION_SUMMARY.txt](APPLICATION_SUMMARY.txt) – Executive summary of features & status.

---

For maintenance or contributions, review the CI workflow expectations and ensure new features ship with matching tests and documentation updates.
