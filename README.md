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
- optional `GEMINI_MODEL=gemini-2.5-flash-lite`

If no key is present, the app falls back to mock analysis.
