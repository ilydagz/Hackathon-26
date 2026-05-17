# Hackathon-26

AI-integrated second-hand marketplace. Shell like Letgo or Sahibinden, but listing flow is agent-assisted:
camera in, item draft out, price options ready, publish with one decision.

## Current Repo Shape

- `frontend/`: Vite + React app shell.
- `backend/`: FastAPI + SQLite API prototype.
- `ecovalue-architecture.md`: target platform architecture.
- `ecovalue-requirements.md`: product and infrastructure requirements.
- `implementation-roadmap.md`: phase-by-phase delivery plan.

## What This Repo Is For

- Marketplace discovery UI.
- Agentic listing workflow.
- Listing storage, image handling, and AI analysis pipeline.
- MVP rollout plan for backend, frontend, data, and AI layers.

## Working Assumptions

- Local dev can run with SQLite and mocked AI.
- Production target should move to Postgres, object storage, queue/workers, and observability.
- Frontend stays mobile-first and route-driven.

## Gemini Setup

Set the backend env vars before starting the API:

- `GOOGLE_API_KEY` or `GEMINI_API_KEY`
- optional `GEMINI_MODEL=gemma-4-31b-it` and `GEMINI_FALLBACK_MODEL=gemma-4-26b-a4b-it`

If no key is present, the app falls back to mock analysis.

## Test Data

Populate the database with realistic marketplace inventory:

```bash
cd backend
python seed.py
```

This seeds 100 listings across electronics, furniture, clothing, decor, and other categories, plus feed events that bias one demo user toward phones.
