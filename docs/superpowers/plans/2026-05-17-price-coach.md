# Price Coach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give sellers a price strategy they can trust, with explainable price bands and a fast-vs-fair tradeoff.

**Architecture:** Reuse current quick price and market price outputs, but make them into a decision model with rationale and strategy labels. Price coach should live inside the existing sell flow, with backend returning structured price guidance and frontend showing user-facing explanations.

**Tech Stack:** React, FastAPI, Pydantic, current analysis pipeline, existing listing draft UI.

---

### Task 1: Extend analysis result with pricing strategy

**Files:**
- Modify: `backend/schemas.py`
- Modify: `backend/analysis_service.py`

- [ ] Add `price_strategy`, `price_floor`, `price_ceiling`, and `price_rationale` to analysis schema.
- [ ] Keep `quick_price` and `market_price` for backward compatibility.
- [ ] Ensure mock analysis returns deterministic strategy values.

### Task 2: Build pricing UI in sell flow

**Files:**
- Modify: `frontend/src/components/AISellModal.jsx`
- Modify: `frontend/src/pages/Create.jsx`

- [ ] Replace plain quick/market/custom choice with three strategy cards.
- [ ] Show price band and “why this price” copy next to each card.
- [ ] Warn when custom price sits outside suggested range.
- [ ] Keep manual override available.

### Task 3: Add pricing explanation copy

**Files:**
- Modify: `frontend/src/translations/index.js`

- [ ] Add strings for sell-fast, balanced, maximize, and off-range warning states.
- [ ] Keep English and Turkish copy aligned.

### Task 4: Persist selected strategy

**Files:**
- Modify: `backend/models.py`
- Modify: `backend/main.py`
- Modify: `backend/schemas.py`

- [ ] Store chosen price strategy on listing record.
- [ ] Save selected final price and strategy rationale together.
- [ ] Preserve editability after draft save.

### Task 5: Verify behavior

**Files:**
- Test: `backend/tests/test_price_strategy.py`
- Test: `frontend/src/components/__tests__/AISellModal.price.test.jsx`

- [ ] Test price band renders from analysis response.
- [ ] Test custom price warning triggers outside band.
- [ ] Test selected strategy persists on save.

### Task 6: Commit slice

```bash
git add frontend/src/components/AISellModal.jsx frontend/src/pages/Create.jsx frontend/src/translations/index.js backend/main.py backend/models.py backend/schemas.py backend/analysis_service.py
git commit -m "feat: add price coach"
```

