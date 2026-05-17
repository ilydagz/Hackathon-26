# AI-SPEC — Phase 1: Agentic Listing MVP

> AI design contract for quick-sell flow. Consumed by planning and eval work before implementation starts.
> Locks framework choice, implementation guidance, and eval strategy for photo upload -> draft -> price -> user-confirm flow.

---

## 1. System Classification

**System Type:** Autonomous Agent

**Description:**
Seller uploads item photo from phone, AI analyzes image, drafts title and description, suggests quick-sale and market prices, and returns editable draft for explicit user approval. Good output feels trustworthy, fast, and low-effort. Bad output wastes seller time, misprices item, or auto-publishes without control.

**Critical Failure Modes:**
1. AI invents item details, brand, condition, or accessories from weak visual evidence.
2. Price suggestions are wildly off and push seller toward bad sale decisions.
3. Draft cannot be edited cleanly before publish, or publish happens without explicit user confirmation.
4. Upload/analysis failure leaves user stuck with no retry or fallback state.
5. Low-confidence item analysis is presented with false certainty instead of asking for another photo or showing uncertainty.

---

## 1b. Domain Context

**Industry Vertical:** E-commerce / second-hand marketplace

**User Population:** Casual second-hand sellers using mobile camera capture, often impatient with forms, pricing research, and listing copy.

**Stakes Level:** Medium

**Output Consequence:** AI output directly affects whether item gets sold, how fast it sells, and seller trust in product. Wrong condition or price can cause slower sale, bad negotiation, or churn. It is not life-critical, but trust failure is product-critical.

### What Domain Experts Evaluate Against

| Dimension | Good | Bad | Stakes | Source |
|-----------|------|-----|--------|--------|
| Item recognition | Model names likely item correctly or says uncertain | Confidently mislabels item type or brand | Seller trust, publish quality | Marketplace seller workflow |
| Condition inference | Uses visible wear only, flags uncertainty when hidden | Claims “like new” from one blurry image | Pricing and trust | Second-hand listing norms |
| Pricing advice | Gives fast-sale and market-sale tiers with rationale | Single arbitrary number, no explanation | Sale speed and margin | Seller decision support |
| Copy generation | Short, concrete, editable, truth-aligned | Fluffy marketing text or fabricated claims | Listing quality | Marketplace listing norms |
| Confirmation flow | User can review, edit, and confirm before publish | Any auto-publish or hidden finalization | Trust and control | Product principle |

### Known Failure Modes in this Domain

- Overstating condition on lightly damaged goods.
- Understating brand/model because image is partial or dark.
- Pricing too high for “quick sale” path, which breaks the promise of speed.
- Listing copy that sounds polished but omits key visible details.
- Asking for too much input up front, which kills conversion.

### Regulatory / Compliance Context

- No special industry regulation identified for phase 1.
- Must avoid deceptive claims about condition, brand, or included accessories.
- Must keep seller in control of final publish decision.

### Domain Expert Roles for Evaluation

| Role | Responsibility |
|------|----------------|
| Second-hand marketplace seller or power user | Judge realism of title, description, and price bands |
| Marketplace ops / trust reviewer | Flag misleading condition claims and risky copy |
| Product reviewer | Check seller flow stays fast, editable, and confidence-aware |

---

## 2. Framework Decision

**Selected Framework:** Google ADK

**Version:** Current stable ADK Python line used by repo at implementation time

**Rationale:**
Phase 1 needs fastest path from photo upload to structured draft output. Google ADK fits a single seller-facing assistant with Gemini-backed structured output, clear agent boundaries, and simple tool integration. Repo already has FastAPI backend and mocked `/api/analyze`, so phase 1 can wrap analysis behind a small backend adapter without introducing heavy workflow scaffolding. Gemini keeps multimodal analysis and structured response close together.

**Alternatives Considered:**

| Framework | Ruled Out Because |
|-----------|------------------|
| OpenAI Agents SDK | Good fit for agent apps, but not the chosen Google stack for this project |
| LangGraph | Best for stateful branching, but heavier than needed for linear phase 1 flow |
| LangChain | Broader than needed and adds abstraction cost for a focused sell workflow |

**Vendor Lock-In Accepted:** Partial

---

## 3. Framework Quick Reference

### Installation
```bash
pip install google-adk pydantic google-genai
```

### Core Imports
```python
from google.adk.agents.llm_agent import Agent
from pydantic import BaseModel, Field
```

### Entry Point Pattern
```python
from google.adk.agents.llm_agent import Agent
from pydantic import BaseModel, Field


class ListingDraft(BaseModel):
    title: str
    description: str
    quick_price: int
    market_price: int
    confidence: float = Field(ge=0, le=1)
    needs_more_photos: bool = False
    rationale: str


agent = Agent(
    model="gemini-2.5-flash",
    name="listing_analyst",
    description="Drafts a truthful second-hand listing from item photos.",
    instruction=(
        "Analyze item photo for second-hand listing draft. "
        "Return truthful structured draft. "
        "If evidence is weak, lower confidence and ask for more photos."
    ),
    tools=[],
)
```

### Key Abstractions

| Concept | What It Is | When You Use It |
|---------|-----------|-----------------|
| Agent | Prompt + model + optional tools + output contract | Core listing analyst |
| Structured outputs | JSON-schema-backed response format | Draft title, description, and price bands |
| Tools | Functions the model can call | Optional later for market lookup or moderation |
| Guardrails | Pre/post checks on behavior | Block unsafe or low-confidence output |

### Common Pitfalls
1. Returning prose instead of structured data.
2. Treating low-confidence vision guesses as certain facts.
3. Letting assistant see publish action before user confirmation.
4. Mixing analysis and persistence so retries become messy.

### Recommended Project Structure
```text
backend/
├── ai/
│   ├── agents.py
│   ├── schemas.py
│   ├── prompts.py
│   └── analysis_service.py
├── routes/
│   ├── analysis.py
│   ├── listings.py
│   └── auth.py
└── workers/
    └── analysis_jobs.py
```

---

## 4. Implementation Guidance

**Model Configuration:**
- Use one vision-capable Gemini model for analysis and draft generation.
- Temperature low, around 0.2-0.4, to reduce creative drift.
- Output must be schema-validated and retried on schema failure.
- Use separate model call or prompt branch for price rationale if needed.

**Core Pattern:**
- One seller-facing analysis agent.
- Input: image plus minimal seller context.
- Output: structured listing draft with title, description, price bands, confidence, and uncertainty flags.
- Backend owns state transitions: upload -> analyzing -> ready_for_review -> published.

**Tool Use:**
- Phase 1 can stay tool-light: image ingest plus database writes only.
- Use Gemini structured output for draft generation.
- Keep provider boundary behind backend service so mock mode and provider mode share same contract.

**State Management:**
- Persist analysis job row and draft row separately.
- Store uploaded file path in local storage for dev.
- Keep assistant output immutable until user edits.
- Publish only after explicit user action.

**Context Window Strategy:**
- Do not stuff full marketplace history into prompt.
- Use only uploaded image(s), minimal user text, and small policy/rubric instructions.
- Summarize prior analysis into compact draft state if retrying.

---

## 4b. AI Systems Best Practices

### Structured Outputs with Pydantic

```python
from pydantic import BaseModel, Field


class ListingDraft(BaseModel):
    title: str = Field(min_length=3, max_length=80)
    description: str = Field(min_length=20, max_length=500)
    quick_price: int = Field(ge=1)
    market_price: int = Field(ge=1)
    condition: str
    category: str
    confidence: float = Field(ge=0.0, le=1.0)
    needs_more_photos: bool = False
    rationale: str = Field(min_length=10)
```

- Parse model output into `ListingDraft`.
- Reject invalid output.
- Retry once with stricter formatting prompt.
- If still invalid, surface fallback state and keep user in control.

### Async-First Design

- Analysis should not block user flow longer than needed.
- Phase 1 can use async request path with mocked latency, then move to background job when real model latency lands.
- Show progress states: uploaded, analyzing, drafting, pricing, review ready.
- Stream only if product value beats added complexity. For phase 1, polling is enough.

### Prompt Engineering Discipline

- Separate system instructions from user input.
- System prompt enforces truthfulness, uncertainty, and editable output.
- User input is only item photo plus optional seller hints.
- Keep prompt short and specific. No marketing language.

### Context Window Management

- Feed only current item photo(s) and current draft state.
- Do not include unrelated feed data.
- If user retries, pass compact summary of previous failed analysis rather than full trace.

### Cost and Latency Budget

- Target first analysis response under 10 seconds in mock/dev.
- Target provider mode under 15 seconds for first useful draft.
- Cache or persist draft result so same image is not re-analyzed on minor UI retry.
- Use one analysis call per item unless user requests retake or revision.

---

## 5. Evaluation Strategy

### Dimensions

| Dimension | Rubric (Pass/Fail or 1-5) | Measurement Approach | Priority |
|-----------|--------------------------|---------------------|----------|
| Schema validity | Pass if output always parses into `ListingDraft` | Code | Critical |
| Title accuracy | 1-5 against visible item type and brand | Human + LLM judge | Critical |
| Description faithfulness | 1-5 for visible truthfulness and no fabrication | Human + LLM judge | Critical |
| Price band usefulness | Pass if quick price is lower and market price is plausible | Code + Human | Critical |
| Uncertainty handling | Pass if weak images lower confidence or request more photos | Code + Human | High |
| User control | Pass if edit and explicit publish remain required | Code | Critical |
| Latency | Pass if analysis returns within target budget | Code | High |

### Eval Tooling

**Primary Tool:** Promptfoo + Langfuse

**Override Note:** Not using Arize Phoenix default in this phase. Promptfoo fits CI regression checks; Langfuse fits trace review and prompt iteration.

**Setup:**
```bash
npm install -D promptfoo
pip install langfuse
```

**CI/CD Integration:**
```bash
promptfoo eval
```

### Reference Dataset

**Size:** 12-20 examples to start

**Composition:**
- Clear single-item photos
- Blurry / partial / low-light photos
- Common categories: furniture, electronics, clothing, decor
- Price-sensitive cases: high-value and low-value items
- Known tricky cases: missing accessories, wear, brand ambiguity

**Labeling:**
- Label by marketplace-savvy human reviewer.
- Use second reviewer for disagreement cases.
- Calibrate LLM judge against human scores before trusting it for regressions.

---

## 6. Guardrails

### Online (Real-Time)

| Guardrail | Trigger | Intervention |
|-----------|---------|--------------|
| Schema validation | Output not parseable | Block and retry |
| Low-confidence analysis | Confidence below threshold or weak photo | Ask for more photo / flag uncertainty |
| Publish confirmation | User has not approved final draft | Block |
| Misleading condition language | Output claims hidden condition as fact | Rewrite or flag for review |

### Offline (Flywheel)

| Metric | Sampling Strategy | Action on Degradation |
|--------|------------------|----------------------|
| Edit rate on AI drafts | Sample all failures + random happy path | Tighten prompt or schema |
| Retry rate on analysis | Sample upload attempts with retries | Improve image guidance and failure states |
| Price override rate | Sample by category | Recalibrate price guidance |
| Publish abandonment | Sample drafts not published | Improve draft quality or UX flow |

---

## 7. Production Monitoring

**Tracing Tool:** Langfuse

**Key Metrics to Track:**
- Analysis success rate
- Schema parse failure rate
- Median analysis latency
- Draft edit rate
- Publish conversion rate after AI draft

**Alert Thresholds:**
- Schema failures above 2% over rolling window
- Median latency above product budget
- Publish conversion drop vs baseline
- Sharp spike in user edits or analysis retries

**Smart Sampling Strategy:**
- Sample all failures.
- Sample all low-confidence outputs.
- Sample a small random slice of successful analyses.
- Bias toward items with heavy edits, retries, or abandoned publish.

---

## Checklist

- [x] System type classified
- [x] Critical failure modes identified
- [x] Domain context grounded in second-hand marketplace selling
- [x] Regulatory/compliance context noted
- [x] Domain expert roles defined
- [x] Framework selected with rationale documented
- [x] Alternatives considered and ruled out
- [x] Framework quick reference written
- [x] AI systems best practices written
- [x] Evaluation dimensions grounded in domain rubric ingredients
- [x] Each eval dimension has concrete rubric
- [x] Eval tooling selected
- [x] Reference dataset spec written
- [x] CI/CD eval integration specified
- [x] Online guardrails defined
- [x] Production monitoring configured
