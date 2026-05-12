# Agentic Second-Hand Marketplace Architecture

## 1. Product Shape

Marketplace shell: browse, search, save, message, profile.
Differentiator: seller does not hand-write full listing. Agent turns image + sparse input into publish-ready draft.

Core user loop:

1. Capture or upload item photo.
2. AI extracts item type, condition, brand, and listing copy.
3. System returns 2 price paths: fast sale and market sale.
4. User confirms or edits draft.
5. Listing publishes to feed and becomes available for chat/offers.

## 2. Runtime Architecture

```text
Browser
  -> React shell
  -> FastAPI API
      -> Postgres / SQLite
      -> Object storage for images
      -> Worker queue for AI jobs
      -> AI adapter / model gateway
      -> Realtime or polling feed updates
```

### 2.1 Frontend

- Vite + React app.
- Route shell for landing, feed, sell flow, messages, profile, auth.
- Mobile-first UI, because primary path is camera-driven listing on phone.
- UI state owns optimistic draft states; server owns canonical listing state.

### 2.2 Backend API

- FastAPI serves app API and image upload pipeline.
- API boundary validates all user input at route edge.
- Listing workflow split into:
  - intake
  - analysis
  - draft creation
  - publish
  - retrieval/feed
  - messaging later

### 2.3 Data Layer

- Local dev: SQLite for fast iteration.
- Production target: Postgres.
- Images never stored in DB row itself.
- Store image metadata in DB, binaries in object storage or local filesystem for dev.
- Event-style tables for AI job status and audit trail.

### 2.4 AI Layer

AI is not one monolith. It is a pipeline:

- Vision extraction: detect item category, condition, visual attributes.
- Listing generation: title, bullet points, long description.
- Pricing: quick-sell vs market price.
- Moderation: reject unsafe or policy-breaching content.
- Assistant follow-up: help seller refine text or answer buyer questions later.

AI execution modes:

- Mock mode for hackathon and local dev.
- Provider mode for real model calls.
- Worker mode for async jobs so upload path stays fast.

## 3. Domain Model

Minimum entities:

- `User`
- `ItemDraft`
- `Listing`
- `ListingImage`
- `AnalysisJob`
- `Conversation`
- `Message`
- `Offer`
- `Notification`

Lifecycle:

`ItemDraft` -> `Listing` -> `Offer` / `Message` activity -> archived or sold.

## 4. Service Boundaries

| Boundary | Responsibility | Notes |
|---|---|---|
| Browser -> API | untrusted input enters system | validate, sanitize, rate limit |
| API -> storage | image/file persistence | use signed URLs or controlled writes |
| API -> AI provider | content generation and pricing | isolate provider specifics behind adapter |
| API -> DB | canonical marketplace state | transactions on publish path |
| Worker -> API/DB | async analysis completion | idempotent job updates only |

## 5. Deployment Topology

### Local

- Frontend dev server.
- FastAPI backend.
- SQLite.
- Local image directory.
- Mock AI responses.

### Production Target

- Frontend on static hosting or edge runtime.
- FastAPI on container or VM runtime.
- Postgres.
- S3-compatible object storage.
- Redis or queue for AI jobs.
- Metrics and logs from day one.

## 6. Environment Contract

Required config should be documented and centralized:

- `API_BASE_URL`
- `DATABASE_URL`
- `STORAGE_BUCKET`
- `STORAGE_REGION`
- `AI_PROVIDER`
- `AI_API_KEY`
- `CORS_ORIGINS`
- `SECRET_KEY`

## 7. Architecture Principles

- Agent never publishes without user confirmation.
- Fast path stays fast; AI work moves off request thread when possible.
- Feed and listing state remain source-of-truth driven, not client-only.
- Storage abstraction stays provider-neutral.
- Mobile first, but desktop feed and chat still work well.
