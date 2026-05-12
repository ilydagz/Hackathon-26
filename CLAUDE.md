# Project Guidance

## Design Context

### Users
Primary users are casual second-hand sellers using a phone, often with low patience for forms, pricing research, and writing listing copy. Their job is to turn an item photo into a trustworthy listing with minimal manual effort. Buyers still need a familiar marketplace shell for browsing, search, listing detail, chat, and offers, but the design advantage should center on the seller's agentic workflow.

### Brand Personality
Brand personality: trusted, effortless, practical.

The interface should feel calm and capable, like a helpful sales assistant that knows the market and reduces effort without taking control away from the user. AI should feel useful through outcomes: better photos-to-draft flow, clear price choices, editable copy, and confident publish steps. Avoid making AI feel like a spectacle.

### Aesthetic Direction
Product register: app UI. Design serves repeated marketplace tasks, not a marketing page.

Current project direction uses a warm marketplace palette: soft cream background, terracotta accent, deep brown secondary, slate text, and generous mobile-first spacing. Keep warmth and approachability, but refine toward a more trusted product surface: cleaner listing density, stronger information hierarchy, and fewer oversized decorative moments inside core workflows.

Reference feel: familiar marketplace usability from Letgo and Sahibinden, paired with a smoother AI-assisted selling flow.

Anti-reference: generic AI SaaS. Avoid purple/blue gradients, glassmorphism, glowing dark dashboards, vague sparkle branding, and feature-copy that explains AI instead of helping users complete a sale.

### Design Principles
1. Camera-first selling: optimize every sell screen for fast mobile capture, clear analysis progress, and quick confirmation.
2. User remains in control: AI can draft, price, and suggest, but publish requires explicit user confirmation and editable fields.
3. Marketplace familiarity: feed, listing cards, chat, profile, and offers should behave predictably, so agentic features feel like a shortcut rather than a new system to learn.
4. Trust before flash: show clear price rationale, item condition, seller identity, and confirmation states before decorative AI effects.
5. Design for empty and waiting states: AI latency, failed uploads, no listings, no messages, and first-run selling should all feel handled, not broken.

### Existing Stack And UI Notes
- Frontend: Vite, React, React Router, Tailwind CSS, Framer Motion, Lucide icons.
- Backend: FastAPI, SQLite prototype, local image storage, mocked AI analysis endpoint.
- Current design tokens live in `frontend/src/index.css`.
- Existing UI has strong visual personality but some core routes are still placeholders in `frontend/src/App.jsx`.
- Future design work should favor product UI clarity over landing-page scale once inside feed, listing, chat, and sell flows.
