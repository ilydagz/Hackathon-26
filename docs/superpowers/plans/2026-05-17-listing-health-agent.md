# Listing Health Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Help sellers rescue stale listings and finish weak drafts with next-best actions.

**Architecture:** Add listing performance signals, then rank simple interventions like reprice, retake photo, relist, or finish draft. Present recommendations inside seller views already used for inventory management.

**Tech Stack:** React, FastAPI, SQLAlchemy, current listing cards and admin logs.

---

### Task 1: Track listing health signals

**Files:**
- Modify: `backend/models.py`
- Modify: `backend/main.py`

- [ ] Add listing metrics for age, view count, favorite count, message count, and sell-through.
- [ ] Update counters when listing is fetched, favorited, messaged, or sold.
- [ ] Keep metric writes lightweight.

### Task 2: Add health score computation

**Files:**
- Modify: `backend/main.py`
- Modify: `backend/schemas.py`

- [ ] Compute health score from age, engagement, and status.
- [ ] Return recommended action list with each listing.
- [ ] Include reason text and urgency label.

### Task 3: Surface health in My Listings

**Files:**
- Modify: `frontend/src/pages/MyListings.jsx`
- Modify: `frontend/src/api.js`

- [ ] Show “stale” badge for weak listings.
- [ ] Show one-tap actions for reprice, retake photo, relist, and finish draft.
- [ ] Add empty-state coaching for sellers with no active inventory.

### Task 4: Add re-engagement actions

**Files:**
- Modify: `backend/main.py`
- Modify: `frontend/src/pages/MyListings.jsx`

- [ ] Add endpoints or update flow for relist and reprice.
- [ ] Keep user in control when applying suggested action.
- [ ] Record action in logs.

### Task 5: Verify behavior

**Files:**
- Test: `backend/tests/test_listing_health.py`
- Test: `frontend/src/pages/__tests__/MyListings.test.jsx`

- [ ] Test score changes when listing ages or gets activity.
- [ ] Test stale badge appears on old inactive listing.
- [ ] Test relist or reprice action dispatches only after click.

### Task 6: Commit slice

```bash
git add frontend/src/pages/MyListings.jsx frontend/src/api.js backend/main.py backend/models.py backend/schemas.py
git commit -m "feat: add listing health agent"
```

