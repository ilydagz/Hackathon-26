# Feed Scout / Shopper Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Help buyers discover relevant items faster with smarter search, recommendations, and saved alert loops.

**Architecture:** Start from current feed search and category filters, then add behavior-aware suggestions and semantic grouping. Later use events and embeddings, but keep first slice simple and explainable.

**Tech Stack:** React, FastAPI, SQLAlchemy, current feed and favorites UI, optional vector search later.

---

### Task 1: Add feed event tracking

**Files:**
- Modify: `backend/models.py`
- Modify: `backend/main.py`

- [ ] Track impressions, clicks, favorites, and chat starts.
- [ ] Record which listing and category each event belongs to.
- [ ] Keep writes async-friendly and lightweight.

### Task 2: Add “for you” feed block

**Files:**
- Modify: `frontend/src/pages/Feed.jsx`
- Modify: `backend/main.py`
- Modify: `frontend/src/api.js`

- [ ] Rank listings from recent behavior and favorites.
- [ ] Show a small “for you” strip above main feed.
- [ ] Explain why item was surfaced.

### Task 3: Add similar-items and saved search hints

**Files:**
- Modify: `frontend/src/components/ListingDetailModal.jsx`
- Modify: `frontend/src/pages/Feed.jsx`
- Modify: `backend/main.py`

- [ ] Show similar items beneath listing detail.
- [ ] Let user save a search query or category.
- [ ] Trigger soft alerts when matching items appear.

### Task 4: Add semantic search later

**Files:**
- Modify: `backend/main.py`
- Modify: `frontend/src/pages/Feed.jsx`

- [ ] Replace brittle keyword-only search with richer item matching.
- [ ] Keep classic search fallback for exact terms.
- [ ] Preserve current category filter behavior.

### Task 5: Verify behavior

**Files:**
- Test: `backend/tests/test_feed_assistant.py`
- Test: `frontend/src/pages/__tests__/Feed.test.jsx`

- [ ] Test “for you” block appears after events exist.
- [ ] Test similar-items query returns same-category results.
- [ ] Test saved search notification state is visible.

### Task 6: Commit slice

```bash
git add frontend/src/pages/Feed.jsx frontend/src/components/ListingDetailModal.jsx frontend/src/api.js backend/main.py backend/models.py
git commit -m "feat: add feed scout assistant"
```

