# EcoValue Design System

## 1. Design North Star

EcoValue is a familiar second-hand marketplace with one sharp advantage: selling is easier because an agent turns item photos into a market-ready draft.

The app should feel like a trusted local marketplace, not an AI demo. AI should appear through useful moments: faster listing, clearer prices, better copy, safer publishing.

## 2. Design Register

Register: product UI.

Design serves repeated tasks:

- Browse listings.
- Search and filter items.
- Start a camera-first sell flow.
- Review AI-generated draft details.
- Pick a price path.
- Publish with confidence.
- Message and negotiate.
- Manage profile, listings, and drafts.

Marketing pages can be expressive. Core app screens should be direct, scannable, and useful.

## 3. Users

### Primary User

Casual sellers using mobile phones. They want to sell something quickly without researching price, writing description, or filling long forms.

### Secondary User

Buyers browsing listings, checking trust cues, messaging sellers, and making offers.

### User Context

- Often on mobile.
- Often impatient.
- Often unsure about price.
- May not know how to describe condition well.
- Needs clear confirmation before publishing.

## 4. Brand Personality

Three words: trusted, effortless, practical.

The interface should feel:

- Calm enough for trust.
- Fast enough for casual selling.
- Familiar enough for marketplace users.
- Smart enough to make AI value visible without spectacle.

Avoid:

- Generic AI SaaS visuals.
- Purple/blue gradients.
- Glassmorphism.
- Dark glowing dashboards.
- Overuse of sparkle icons.
- Long copy explaining AI.

## 5. Core Principles

1. Camera-first selling: sell flow starts from photo capture or upload.
2. User control: AI drafts and suggests, user confirms before publish.
3. Marketplace familiarity: feed, cards, search, chat, and profile should feel predictable.
4. Trust before flash: price, condition, identity, and confirmation matter more than decoration.
5. States are product: empty, loading, error, and retry states must feel designed.

## 6. Information Architecture

### Routes

| Route | Screen | Purpose |
|---|---|---|
| `/` | Landing or feed entry | Explain value for first-time users, then move quickly to marketplace. |
| `/feed` | Marketplace feed | Browse, search, filter, and open listings. |
| `/sell` or modal | Agentic sell flow | Upload photos, analyze, review draft, publish. |
| `/listing/:id` | Listing detail | View photos, price, seller, description, and trust cues. |
| `/messages` | Chat | Buyer/seller negotiation. |
| `/profile` | Profile | User info, own listings, drafts, saved items. |
| `/login` | Login | Access account. |
| `/register` | Register | Create account. |

### Main Navigation

Desktop:

- Logo
- Feed
- Messages
- Profile
- Primary sell button

Mobile:

- Bottom nav preferred for core app: Feed, Sell, Messages, Profile.
- Sell action should be visually central.
- Keep menu overlay only for secondary links.

## 7. Screen Specs

### Feed

Goal: image-first browsing with fast search.

Required elements:

- Search field.
- Category chips.
- Sort/filter action.
- Listing grid.
- Price visible on card.
- Location or seller trust cue.
- Empty state with sell CTA.

Card content:

- Image.
- Price.
- Title.
- Location or seller label.
- Save button.

Avoid:

- Huge marketing hero inside feed.
- Repeated explanatory AI copy.
- Cards with too much text.

### Agentic Sell Flow

Goal: photo to publishable listing with minimum typing.

Steps:

1. Upload photos.
2. Analysis progress.
3. Draft review.
4. Price selection.
5. Publish confirmation.

Upload state:

- Large camera action.
- Gallery upload secondary action.
- Multi-photo support later.
- Clear accepted image types.

Analysis state:

- Show step labels: identifying item, reading condition, checking market, drafting listing.
- Use progress language, not fake precision.
- Keep user in flow if analysis takes time.

Draft review:

- Editable title.
- Editable description.
- Condition selector.
- Category suggestion.
- Price options.
- Image preview.

Price options:

- Quick sale: lower price, faster buyer response.
- Market price: higher price, may take longer.
- Custom price: user override.

Publish:

- Primary action: publish listing.
- Secondary action: save draft.
- Confirm user-selected price and final description.

### Listing Detail

Goal: buyer trusts item enough to message or offer.

Required elements:

- Photo gallery.
- Price.
- Title.
- Description.
- Condition.
- Seller info.
- Location.
- Message button.
- Offer button.
- Report/save actions.

### Messages

Goal: quick negotiation tied to listing.

Required elements:

- Conversation list.
- Listing preview in chat header.
- Message history.
- Offer shortcut.
- Safety/report action.

Mobile:

- Conversation list and thread should be separate views.

Desktop:

- Two-column layout: list and thread.

### Profile

Goal: manage identity and sales.

Required elements:

- Profile info.
- Own listings.
- Drafts.
- Sold/archive section.
- Settings.
- Delete account path.

## 8. Visual System

### Current Tokens

These tokens exist in `frontend/src/index.css`.

| Role | Value | Usage |
|---|---|---|
| Background | `#FAF9F6` | App base. |
| Foreground | `#3D405B` | Main text. |
| Primary | `#E07A5F` | Sell CTA, selected states, key actions. |
| Secondary | `#3E2723` | Logo, strong text, deep surfaces. |
| Muted | Warm off-white | Subtle surfaces. |
| Border | Soft slate tint | Inputs, separators, card outlines. |

### Palette Guidance

Keep warm marketplace identity, but reduce brown/orange dominance in dense product screens.

Use:

- Cream for app background.
- White or near-white for listing cards and inputs.
- Terracotta for primary actions only.
- Deep brown for brand and high-emphasis text.
- Sage or green only for success and sustainability cues.
- Slate for body copy and secondary text.

Avoid:

- Purple AI accents.
- Saturated gradients.
- Large dark sections in core app.
- Decorative glows.

### Typography

Current stack is browser/default via Tailwind. Recommended direction:

- Display: `Outfit` or `Satoshi` for brand and section headings.
- Body: `Manrope` or `DM Sans` for product UI.

Hierarchy:

- Page title: 32-40px mobile, 40-48px desktop.
- Section title: 20-28px.
- Card title: 15-18px.
- Body: 14-16px.
- Metadata: 12-13px.

Rules:

- No negative letter spacing in compact UI.
- Uppercase labels only for small metadata, not core actions.
- Keep body line length below 75 characters.

### Shape And Radius

Current UI uses very large rounded corners. Keep expressive radius for brand moments, reduce radius in repeated product surfaces.

Recommended:

- Listing cards: 12-16px.
- Inputs: 12-16px.
- Buttons: 14-18px.
- Modals/sheets: 24-32px.
- Hero imagery: 32-48px.

### Elevation

Use elevation sparingly.

- Listing cards: border plus subtle shadow on hover.
- Sticky nav: border and slight background tint.
- Modal/sheet: strong shadow acceptable.
- Avoid heavy shadows on every repeated card.

## 9. Component Inventory

### Foundation

- App shell.
- Top nav.
- Mobile bottom nav.
- Button variants.
- Input.
- Search field.
- Category chip.
- Segmented price selector.
- Sheet/modal.
- Toast.
- Empty state.
- Loading state.
- Error state.

### Marketplace

- Listing card.
- Listing grid.
- Listing detail gallery.
- Seller badge.
- Price badge.
- Save button.
- Offer button.

### Agentic Workflow

- Photo uploader.
- Analysis progress.
- Draft editor.
- Price recommendation card.
- Confidence/rationale row.
- Publish confirmation.
- Draft saved state.

### Messaging

- Conversation list item.
- Chat header.
- Message bubble.
- Offer card.
- Safety action.

## 10. Interaction Rules

- Primary sell action should always be reachable in app shell.
- Do not publish without explicit confirmation.
- AI-generated fields must be editable.
- Selecting price should feel decisive and reversible.
- Upload failures need retry and keep user-selected file context when possible.
- Feed should update after publish without full page reload when implementation allows.
- Long AI tasks should show progress steps and allow user to leave draft in progress later.

## 11. Motion

Use motion for state changes, not decoration.

Good motion moments:

- Sell flow step transition.
- Upload to analysis transition.
- Analysis progress step changes.
- Price option selection.
- Listing appears in feed after publish.
- Mobile sheet open/close.

Rules:

- Prefer transform and opacity.
- Avoid bounce/elastic easing.
- Respect reduced motion.
- Keep repeated feed animations subtle.

## 12. Accessibility

Baseline target: WCAG 2.1 AA.

Required:

- Visible focus states.
- Keyboard reachable buttons and forms.
- Text contrast AA for all core UI.
- Non-color indicator for selected price.
- Alt text for listing images where possible.
- Reduced motion handling.
- Labels for upload, search, price, and publish controls.
- Error text tied to invalid fields.

## 13. Copy Voice

Voice: concise, concrete, reassuring.

Use:

- "Upload photos"
- "Review draft"
- "Quick sale"
- "Market price"
- "Save draft"
- "Publish listing"

Avoid:

- "AI magic"
- "Revolutionary"
- "Unlock your selling journey"
- Repeating visible UI state in long paragraphs.

Turkish product copy can stay where it matches current app direction, but labels should be short and consistent.

## 14. Mockup Checklist

Create low-fidelity mockups first:

1. Mobile feed.
2. Mobile sell upload.
3. Mobile analysis progress.
4. Mobile draft review with price selection.
5. Listing detail.
6. Messages list and chat thread.
7. Profile with listings and drafts.
8. Desktop feed.
9. Desktop messages.

Then create high-fidelity mockups:

1. Feed with real-looking item photos.
2. Agentic sell flow end-to-end.
3. Listing detail with trust cues.
4. Chat with offer card.

## 15. MVP Design Decisions

For first implementation pass:

- Wire real page components into app routes.
- Prefer mobile-first sell flow over landing page polish.
- Replace placeholder pages with product screens.
- Keep current warm palette but reduce oversized decorative cards in core app.
- Add empty/loading/error states before adding advanced filters.
- Keep AI mock believable: item name, condition, title, description, quick price, market price, and rationale.

## 16. Open Design Questions

- Should primary market be Turkish only or bilingual?
- Should feed default to local listings, categories, or latest listings?
- Should sell flow be modal, page, or mobile sheet?
- Should price rationale show sources, comparable listings, or a simple confidence note?
- Should homepage become feed-first after login?
