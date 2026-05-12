# Implementation Roadmap

## Phase 0: Infrastructure Baseline

Goal: stable repo and runtime shell.

Deliverables:

- Frontend app shell with route map.
- Backend health endpoint and CORS setup.
- Config contract for environment variables.
- Local storage strategy for images.
- Docs that define product, architecture, and phase order.

Exit criteria:

- Frontend boots.
- Backend boots.
- Docs tell next phase without guessing.

## Phase 1: Agentic Listing MVP

Goal: seller can create draft from image and minimal input.

Deliverables:

- Upload from camera or file picker.
- Async or mocked AI analysis.
- Draft title, description, and two prices.
- Editable confirmation screen.
- Draft persistence.

Exit criteria:

- User can go from photo to confirmed draft.
- No manual typing required beyond edits.

## Phase 2: Publish and Feed

Goal: draft becomes marketplace listing.

Deliverables:

- Publish endpoint.
- Listing table and image metadata.
- Public feed.
- Optimistic UI refresh after publish.
- Search and category shell.

Exit criteria:

- Listing shows up after publish and stays after reload.

## Phase 3: Chat, Offers, Trust

Goal: buyers and sellers can negotiate safely.

Deliverables:

- Conversation and message model.
- Chat UI.
- Offer flow.
- Basic moderation and abuse controls.
- Profile ownership and seller view.

Exit criteria:

- Buyer can message seller from listing.
- Conversation history persists.

## Phase 4: Production Hardening

Goal: move from hackathon shell to usable product base.

Deliverables:

- Postgres migration path.
- Object storage integration.
- Queue or worker for AI jobs.
- Observability hooks.
- Error tracking and rate limiting.

Exit criteria:

- System can run with real infra instead of local-only defaults.

## Workstream Split

### Frontend

- Shell, routing, mobile-first design, listing flow, feed, chat, profile.

### Backend

- API, validation, persistence, file handling, auth, message endpoints.

### Data

- Drafts, listings, users, conversations, messages, offers, AI jobs.

### AI

- Vision analysis, copy generation, pricing, moderation, mock/provider adapters.

## Delivery Order

1. Infrastructure baseline.
2. Agentic listing MVP.
3. Publish/feed.
4. Chat/offers/trust.
5. Production hardening.

## Notes

- Current repo already has FastAPI, SQLite, Vite, and React. Roadmap assumes those as starting point.
- Production architecture should not keep AI work on request path once queue exists.
