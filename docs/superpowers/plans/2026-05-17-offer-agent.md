# Offer Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add structured offer, counteroffer, and acceptance flow with agent-assisted suggestions.

**Architecture:** Introduce an `offers` model and state machine, then expose offer controls in listing detail and chat. Agent suggestions should sit on top of deterministic offer states, not replace them.

**Tech Stack:** React, FastAPI, SQLAlchemy, Pydantic, existing chat/listing UI.

---

### Task 1: Design offer data model

**Files:**
- Modify: `backend/models.py`
- Modify: `backend/schemas.py`

- [ ] Add `Offer` table with buyer, seller, listing, amount, status, expiry, timestamps.
- [ ] Define statuses: `pending`, `countered`, `accepted`, `rejected`, `expired`.
- [ ] Add response schemas for offer cards.

### Task 2: Add offer endpoints

**Files:**
- Modify: `backend/main.py`

- [ ] Create offer.
- [ ] Counter offer.
- [ ] Accept offer.
- [ ] Reject offer.
- [ ] Expire old offers on read or by background cleanup.

### Task 3: Add offer UI in chat and listing detail

**Files:**
- Modify: `frontend/src/components/ListingDetailModal.jsx`
- Modify: `frontend/src/pages/Chat.jsx`
- Modify: `frontend/src/api.js`

- [ ] Show offer CTA from listing detail.
- [ ] Render offer cards in chat thread.
- [ ] Let seller accept, reject, or counter.

### Task 4: Add agent suggestions on top of offers

**Files:**
- Modify: `backend/main.py`
- Modify: `frontend/src/pages/Chat.jsx`

- [ ] Suggest a counter amount based on listing price and prior offers.
- [ ] Suggest a message template for the counter.
- [ ] Show confidence and rationale for suggestion.

### Task 5: Add audit and safety rules

**Files:**
- Modify: `backend/main.py`
- Modify: `backend/models.py`

- [ ] Log every state transition.
- [ ] Block duplicate acceptance and stale counters.
- [ ] Require user confirmation for acceptance and counter send.

### Task 6: Verify behavior

**Files:**
- Test: `backend/tests/test_offers.py`
- Test: `frontend/src/pages/__tests__/Chat.offers.test.jsx`

- [ ] Test offer lifecycle transitions.
- [ ] Test expired offer cannot be accepted.
- [ ] Test UI only sends after explicit click.

### Task 7: Commit slice

```bash
git add frontend/src/components/ListingDetailModal.jsx frontend/src/pages/Chat.jsx frontend/src/api.js backend/main.py backend/models.py backend/schemas.py
git commit -m "feat: add offer flow"
```

