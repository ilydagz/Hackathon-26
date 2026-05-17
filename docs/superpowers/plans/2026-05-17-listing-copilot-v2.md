# Listing Copilot v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn one or more photos into a high-confidence editable draft that asks for missing proof instead of guessing.

**Architecture:** Extend current sell flow in `frontend/src/components/AISellModal.jsx` so AI analysis becomes a guided draft review, not just a title-and-price fill. Store richer analysis in backend job JSON, preserve draft state, and make low-confidence outputs explicit. Use backend async job path already in `backend/main.py` and `backend/analysis_service.py`.

**Tech Stack:** React, Framer Motion, FastAPI, SQLAlchemy, Pydantic, existing Gemini/mock analysis adapter.

---

### Task 1: Expose analysis quality in UI

**Files:**
- Modify: `frontend/src/components/AISellModal.jsx`
- Modify: `backend/schemas.py`
- Modify: `backend/analysis_service.py`

- [ ] Add `confidence`, `rationale`, and `needs_more_photos` to draft review panel.
- [ ] Show a visible “need more photos” state when confidence is low.
- [ ] Keep title, description, and attributes editable after analysis.
- [ ] Ensure backend analysis schema already returned by `ListingAnalysis` is passed through unchanged.

### Task 2: Support multi-photo draft intake

**Files:**
- Modify: `frontend/src/components/AISellModal.jsx`
- Modify: `frontend/src/api.js`
- Modify: `backend/main.py`
- Modify: `backend/models.py`

- [ ] Add multiple image selection and gallery preview before analysis.
- [ ] Submit primary photo plus optional support photos to analysis endpoint.
- [ ] Store draft photo set on listing or draft record, not just single filename.
- [ ] Keep current single-photo fallback working.

### Task 3: Add missing-field checklist

**Files:**
- Modify: `frontend/src/components/AISellModal.jsx`
- Modify: `backend/schemas.py`

- [ ] Render a checklist for brand, model, size, color, material, and notes.
- [ ] Auto-fill checklist values from `suggested_attributes`.
- [ ] Highlight blank required fields before publish.
- [ ] Prevent silent publish when confidence is low and key fields are empty.

### Task 4: Add seller clarification loop

**Files:**
- Modify: `frontend/src/components/AISellModal.jsx`
- Modify: `backend/main.py`

- [ ] Add a “ask me one more question” step for weak analysis.
- [ ] Let agent ask a single clarifying question before draft completion.
- [ ] Store question and answer in draft metadata for review traceability.

### Task 5: Add publish guardrails and audit trail

**Files:**
- Modify: `backend/main.py`
- Modify: `backend/models.py`

- [ ] Log analysis job id on draft creation and publish.
- [ ] Reject publish when analysis failed unless user explicitly overrides.
- [ ] Keep current human-confirmed publish flow intact.

### Task 6: Verify behavior

**Files:**
- Test: `backend/tests/test_analysis_flow.py`
- Test: `frontend/src/components/__tests__/AISellModal.test.jsx`

- [ ] Test low-confidence result shows “need more photos”.
- [ ] Test suggested attributes prefill draft fields.
- [ ] Test publish still requires explicit click.

### Task 7: Commit slice

```bash
git add frontend/src/components/AISellModal.jsx backend/main.py backend/schemas.py backend/analysis_service.py backend/models.py
git commit -m "feat: improve listing copilot"
```

