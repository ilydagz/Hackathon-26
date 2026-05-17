# Agentic Feature Roadmap Index

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sequence every agentic feature for EcoValue into a build order that ships value fast and keeps seller trust high.

**Architecture:** Start with seller-facing assists that fit existing photo analysis, draft editing, and chat. Then add marketplace workflow agents that need new data models, event tracking, and state machines. Finish with growth and retention agents that depend on richer telemetry.

**Tech Stack:** React, React Router, Tailwind CSS, Framer Motion, FastAPI, SQLite/Postgres-ready SQLAlchemy, existing AI analysis pipeline.

---

## Feature Order

1. Listing copilot v2
2. Price coach
3. Chat copilot
4. Offer agent
5. Listing health agent
6. Trust and moderation agent
7. Feed scout / shopper assistant

## Shared Platform Work

- Add structured AI output fields to backend schemas.
- Add audit logging for every assist, suggestion, and user approval.
- Keep user approval as hard gate for publish, send, and offer actions.
- Build event tracking so later agents can reason from actual marketplace behavior.

## Delivery Rule

Ship each feature as its own vertical slice. No bundling unrelated agents in same release.

