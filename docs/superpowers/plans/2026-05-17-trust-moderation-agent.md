# Trust and Moderation Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Catch risky or low-quality listings before publish while keeping seller trust and edit control.

**Architecture:** Insert a moderation pass between analysis and publish. The pass should produce structured risk reasons, not opaque blocks. Seller sees fixable issues, then chooses to continue or edit.

**Tech Stack:** React, FastAPI, SQLAlchemy, Pydantic, existing logs and listing status flow.

---

### Task 1: Define moderation result schema

**Files:**
- Modify: `backend/schemas.py`
- Modify: `backend/models.py`

- [ ] Add moderation score, reasons, and suggested fixes.
- [ ] Add listing flag or moderation status fields.
- [ ] Keep field names reusable for future manual review.

### Task 2: Add moderation pass in publish flow

**Files:**
- Modify: `backend/main.py`
- Modify: `backend/analysis_service.py`

- [ ] Run moderation after analysis and before publish.
- [ ] Flag wrong category, spammy copy, suspicious pricing, and weak photo evidence.
- [ ] Return fix list instead of hard-blocking when issue is minor.

### Task 3: Add pre-publish warning UI

**Files:**
- Modify: `frontend/src/components/AISellModal.jsx`
- Modify: `frontend/src/pages/Create.jsx`

- [ ] Show risk card before publish.
- [ ] Highlight specific fixable issues.
- [ ] Require explicit user confirmation to override warnings.

### Task 4: Add admin and audit visibility

**Files:**
- Modify: `backend/main.py`
- Modify: `frontend/src/pages/admin/AdminPosts.jsx`
- Modify: `frontend/src/pages/admin/AdminLogs.jsx`

- [ ] Surface moderation status in admin listing view.
- [ ] Keep moderation decisions in logs.
- [ ] Let admin review or restore moderated listings.

### Task 5: Verify behavior

**Files:**
- Test: `backend/tests/test_moderation.py`
- Test: `frontend/src/components/__tests__/AISellModal.moderation.test.jsx`

- [ ] Test risky listing shows warning.
- [ ] Test publish override still requires explicit click.
- [ ] Test admin can see moderation state.

### Task 6: Commit slice

```bash
git add frontend/src/components/AISellModal.jsx frontend/src/pages/Create.jsx frontend/src/pages/admin/AdminPosts.jsx frontend/src/pages/admin/AdminLogs.jsx backend/main.py backend/models.py backend/schemas.py backend/analysis_service.py
git commit -m "feat: add moderation guardrails"
```

