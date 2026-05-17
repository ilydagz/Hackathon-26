# Chat Copilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn chat into a negotiation assistant that drafts replies, tones messages, and helps seller respond faster.

**Architecture:** Keep message transport unchanged. Add a lightweight assist endpoint that reads current thread context and returns suggested replies plus one-tap actions. Frontend renders suggestions above composer and lets seller edit before sending.

**Tech Stack:** React, FastAPI, current message endpoints, SQLAlchemy, optional LLM or rules-based suggestion engine.

---

### Task 1: Add reply suggestions API

**Files:**
- Modify: `backend/main.py`
- Modify: `backend/schemas.py`

- [ ] Add `/api/messages/{listing_id}/suggest` or `/api/chats/{chat_id}/assist`.
- [ ] Return 3 to 5 suggested replies, a tone label, and a short negotiation summary.
- [ ] Base suggestions on last buyer message and listing context.

### Task 2: Add chat assist UI

**Files:**
- Modify: `frontend/src/pages/Chat.jsx`
- Modify: `frontend/src/api.js`

- [ ] Render suggestion chips above composer.
- [ ] Insert suggestion into composer on tap, not send automatically.
- [ ] Add quick actions for availability, pickup time, and price counter.

### Task 3: Add conversation summary state

**Files:**
- Modify: `backend/models.py`
- Modify: `backend/main.py`

- [ ] Store a short thread summary or last assist state per chat.
- [ ] Update summary after each send or assist request.
- [ ] Keep summary optional so existing chats still load.

### Task 4: Add negotiation safety

**Files:**
- Modify: `backend/main.py`
- Modify: `frontend/src/pages/Chat.jsx`

- [ ] Avoid suggestive language that commits seller to a promise.
- [ ] Keep all suggestions editable before send.
- [ ] Never send counteroffer or acceptance automatically.

### Task 5: Verify behavior

**Files:**
- Test: `backend/tests/test_chat_assist.py`
- Test: `frontend/src/pages/__tests__/Chat.test.jsx`

- [ ] Test suggestions render for known buyer asks.
- [ ] Test click inserts text only.
- [ ] Test composer still sends only on submit.

### Task 6: Commit slice

```bash
git add frontend/src/pages/Chat.jsx frontend/src/api.js backend/main.py backend/models.py backend/schemas.py
git commit -m "feat: add chat copilot"
```

