# 🚕 Kos Taxi – Modern Ride-Hailing Platform

Kos Taxi is a full-stack reference implementation for a boutique ride-hailing service operating on Kos Island, Greece. The project couples a React + Vite frontend with a Flask backend, integrates Stripe for payments, and now ships with production-focused observability, comprehensive automated testing, and GitHub Actions CI/CD pipelines.

> **Status:** This repository is ready for local development and deployment to your own infrastructure. There is no hosted demo environment bundled with the codebase.

## ✨ Highlights

- **Rider experience** – animated marketing site, fare estimation, booking flow, and Stripe payment intent support.
- **Driver portal** – authentication, ride management dashboard, live ride lists, and status transitions.
- **Robust backend** – Flask + SQLAlchemy API with JWT auth, notifications, deterministic fare estimation, and placeholder payments when Stripe secrets are absent.
- **Operational readiness** – centralised logging, Sentry error tracking hooks, Prometheus-compatible metrics (`/metrics`), and deployment scripts for staging & production.
- **Quality gates** – Pytest suites, Vitest + React Testing Library specs, Cypress smoke journey, and automated linting in CI.

## 🗂️ Repository layout

```
backend/               Flask application, models, routes, tests, deploy helpers
frontend/              React application (Vite), unit tests, Cypress specs
.github/workflows/     GitHub Actions CI/CD definitions
scripts/               Deployment automation entry points
.env.example           Sample configuration for both frontend and backend
```

## 🚀 Getting started

### Prerequisites

- Python 3.11+
- Node.js 20+ (Corepack will supply pnpm)
- A Stripe account (test keys are sufficient for local development)

### 1. Clone & bootstrap

```bash
git clone https://github.com/ErnestHysa/kos-taxi-app.git
cd kos-taxi-app
cp .env.example .env
```

Update `.env` with your secrets. Both the backend and frontend read from this file via `python-dotenv`/Vite.

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

The Flask server runs on `http://127.0.0.1:5000`. It auto-creates the SQLite database inside `backend/src/database/` and exposes Prometheus metrics at `/metrics`.

### 3. Frontend setup

```bash
cd frontend
corepack enable
pnpm install
pnpm dev
```

Visit `http://127.0.0.1:5173` for the Vite dev server. Telemetry hooks read from the Vite-prefixed variables in `.env` (e.g. `VITE_SENTRY_DSN`, `VITE_METRICS_ENDPOINT`).

## 🧪 Testing & quality

| Target          | Command                           | Notes |
|-----------------|------------------------------------|-------|
| Backend unit tests | `cd backend && pytest` | Uses an isolated SQLite database and covers critical ride flows plus observability endpoints. |
| Backend linting | `cd backend && ruff check src` | Enforced in CI. |
| Frontend unit tests | `cd frontend && pnpm test` | Vitest + React Testing Library with jsdom environment and coverage reports. |
| Cypress smoke journey | `cd frontend && pnpm test:e2e` | Starts a preview server, navigates from the landing page to the booking form. |
| Frontend linting | `cd frontend && pnpm lint` | ESLint 9 configuration aligned with the project styles. |

## 🔭 Observability

- **Logging:** Structured root logger configured via `LOG_LEVEL`. Missing Sentry DSN falls back gracefully with informational logging.
- **Metrics:** Automatic request counters and latency histograms are exposed at `/metrics` using `prometheus_client`. The namespace can be customised with `METRICS_NAMESPACE`.
- **Error tracking:** Sentry initialises automatically when `SENTRY_DSN`/`VITE_SENTRY_DSN` are supplied, with tunable trace/profile sample rates. Frontend breadcrumbs record notable lifecycle events to aid triage.

## 🔁 CI/CD pipeline

The workflow defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every pull request and push to `main`:

1. **Backend job** – installs dependencies, runs `ruff` and `pytest`.
2. **Frontend job** – installs pnpm packages, runs ESLint, Vitest, and builds the production bundle.
3. **E2E job** – reuses the frontend workspace to execute Cypress smoke tests against a preview build.
4. **Deploy matrix** – on `main`, both `scripts/deploy_staging.sh` and `scripts/deploy_production.sh` are invoked to generate artefacts and rollout checklists.

The deployment scripts create reproducible bundles under `.deploy/<environment>/`, document post-build steps, and validate migrations.

## 📦 Deployment overview

- **Staging:** `scripts/deploy_staging.sh` builds the frontend, packages the backend, and emits a markdown runbook with environment variable requirements.
- **Production:** `scripts/deploy_production.sh` installs backend dependencies, dry-runs migrations, and produces a release checklist emphasising environment hardening.

Use these scripts as entry points in your own CD solution (e.g. Docker build jobs, Terraform apply steps, or SSH orchestrations).

## 📚 Additional documentation

- [PRODUCTION_READY_GUIDE.md](PRODUCTION_READY_GUIDE.md) – infrastructure requirements, environment variable catalogue, deployment & rollback playbooks.
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) – condensed setup instructions for new contributors.
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) – API endpoints, test commands, and observability cheat sheet.
- [KOS_TAXI_DOCUMENTATION.md](KOS_TAXI_DOCUMENTATION.md) – deep dive into architecture, data models, and operational flows.
- [STRIPE_SETUP_INSTRUCTIONS.md](STRIPE_SETUP_INSTRUCTIONS.md) – end-to-end payment configuration guidance.

## 🙌 Contributing

1. Fork & clone the repository.
2. Create a feature branch (`git checkout -b feature/my-improvement`).
3. Make changes and add tests.
4. Run the full test matrix (backend + frontend + Cypress).
5. Submit a pull request against `main`.

The CI pipeline will validate linting, tests, and produce deployment artefacts automatically.

---

Built with ❤️ by the Kos Taxi team & open-source contributors. Questions or ideas? File an issue in the repository!
