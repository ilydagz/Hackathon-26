# Agentic Second-Hand Marketplace Requirements

## 1. Product Goal

Build marketplace shell for second-hand goods with AI-assisted listing creation.
User should be able to turn one photo and minimal input into a publishable listing in one flow.

## 2. Functional Requirements

### 2.1 Listing Intake

- User can start sell flow from prominent CTA.
- User can upload from camera or gallery.
- System accepts one or more images.
- System creates analysis job immediately.

### 2.2 Agentic Draft

- AI returns draft title.
- AI returns draft description.
- AI returns quick-sell price.
- AI returns market price.
- UI lets user edit draft before publish.
- System blocks publish until user confirms final version.

### 2.3 Publish Flow

- User can publish approved draft.
- Published listing appears in feed without manual refresh.
- Listing keeps original images and final selected price.

### 2.4 Marketplace Feed

- Feed shows newest and promoted listings.
- Feed supports image-first card layout.
- Search and category filtering are part of marketplace shell.

### 2.5 Messaging

- Buyer can start conversation from listing.
- Seller can reply in chat.
- Messages persist in backend.
- Conversation is tied to listing and user identities.

### 2.6 Account

- User can sign up and log in.
- User can manage profile.
- User can see own listings and drafts.

## 3. Non-Functional Requirements

- Mobile first UI.
- Fast first response for upload and draft generation.
- AI flow tolerant of model latency.
- Clear loading, error, and retry states.
- Safe storage for images and user content.
- Ready for later scale-up from SQLite to Postgres.

## 4. Infrastructure Requirements

### 4.1 Frontend

- React route shell.
- Auth screens.
- Feed screen.
- Sell flow screen.
- Messages screen.
- Profile screen.

### 4.2 Backend

- FastAPI REST API.
- Separate upload and analysis endpoints.
- Listing CRUD.
- Message CRUD.
- Health endpoint.
- CORS config for frontend host.

### 4.3 Data

- Local development DB.
- Production relational DB.
- File/object storage for images.
- Tables for drafts, listings, conversations, and AI jobs.

### 4.4 AI

- Vision analysis pipeline.
- Pricing suggestion pipeline.
- Copy generation pipeline.
- Moderation pipeline.
- Mock mode for dev and demo.

## 5. MVP Phase Gates

### Phase 0

Repo baseline, app shell, config, docs, and local dev boot.

### Phase 1

Upload image, analyze draft, show price options, and create draft state.

### Phase 2

Publish listings, show feed, persist image metadata, and refresh listing list.

### Phase 3

Messaging, offers, trust signals, and profile management.

### Phase 4

Search ranking, moderation, observability, and production hardening.

## 6. Acceptance Rules

- No listing can publish without explicit user confirmation.
- AI output must be editable before publish.
- Published data must survive app reload.
- Image upload path must not block feed browsing.
- Docs must describe current stack and target stack separately.
