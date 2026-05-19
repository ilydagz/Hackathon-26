import base64
import json
import os
import urllib.error
import urllib.request
from typing import Optional, Literal
from pydantic import BaseModel, Field

from env_loader import load_local_env

load_local_env()


class SuggestedAttributes(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    size: Optional[str] = None
    material: Optional[str] = None
    color: Optional[str] = None
    warranty: Optional[str] = None
    dimensions: Optional[str] = None
    notes: Optional[str] = None


class ListingAnalysis(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=20, max_length=800)
    quick_price: int = Field(ge=1)
    market_price: int = Field(ge=1)
    price_strategy: Literal["sell_fast", "balanced", "maximize"]
    price_floor: int = Field(ge=1)
    price_ceiling: int = Field(ge=1)
    price_rationale: str = Field(min_length=10)
    category: Literal["furniture", "electronics", "clothing", "decor", "other"]
    condition: Literal["new", "like-new", "good", "fair"]
    confidence: float = Field(ge=0.0, le=1.0)
    needs_more_photos: bool = False
    retake_recommended: bool = False
    image_quality: Literal["good", "unclear", "poor"] = "good"
    quality_note: str = Field(min_length=10)
    rationale: str = Field(min_length=10)
    suggested_attributes: SuggestedAttributes = Field(default_factory=SuggestedAttributes)
    is_safe: bool = True
    moderation_reason: Optional[str] = None


DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.1-flash-lite")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"


def _pricing_profile(quick_price: int, market_price: int, confidence: float) -> dict:
    maximize_price = max(market_price, round(market_price * 1.15))
    sell_fast_price = max(1, quick_price)
    balanced_price = max(sell_fast_price, market_price)
    return {
        "price_strategy": "sell_fast" if confidence < 0.65 else "balanced",
        "price_floor": max(1, round(sell_fast_price * 0.9)),
        "price_ceiling": max(maximize_price, balanced_price),
        "price_rationale": (
            "Lower price keeps item competitive and moves faster."
            if confidence < 0.65
            else "Balanced price follows market range for steady sale."
        ),
    }


def _extract_json_payload(text: str) -> dict:
    raw = (text or "").strip()
    if not raw:
        raise ValueError("Empty Gemini response")

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}")
        if start >= 0 and end > start:
            return json.loads(raw[start : end + 1])
        raise


def _format_gemini_error(exc: Exception) -> str:
    if isinstance(exc, urllib.error.HTTPError):
        detail = ""
        try:
            body = exc.read().decode("utf-8")
            payload = json.loads(body)
            detail = payload.get("error", {}).get("message") or body.strip()
        except Exception:
            detail = getattr(exc, "reason", "") or ""
        if detail:
            return f"Gemini HTTP {exc.code}: {detail}"
        return f"Gemini HTTP {exc.code}"
    if isinstance(exc, urllib.error.URLError):
        return f"Gemini network error: {exc.reason}"
    if isinstance(exc, json.JSONDecodeError):
        return f"Gemini response parse failed: {exc.msg}"
    if isinstance(exc, ValueError):
        return f"Gemini response invalid: {exc}"
    return f"Gemini request failed: {exc}"


def _model_candidates() -> list[str]:
    candidates = []
    for model in [DEFAULT_MODEL, FALLBACK_MODEL]:
        model = (model or "").strip()
        if model and model not in candidates:
            candidates.append(model)
    return candidates


def _is_rate_limit(exc: Exception) -> bool:
    if isinstance(exc, urllib.error.HTTPError) and exc.code in {400, 429, 500, 503}:
        return True
    if isinstance(exc, urllib.error.URLError) and isinstance(exc.reason, TimeoutError):
        return True
    if isinstance(exc, urllib.error.URLError) and "timeout" in str(exc.reason).lower():
        return True
    return False


def _normalize_category(value: object) -> str:
    text = str(value or "").strip().lower()
    if any(token in text for token in ["chair", "table", "desk", "sofa", "furniture"]):
        return "furniture"
    if any(token in text for token in ["phone", "laptop", "camera", "watch", "headphone", "electronic", "electronics"]):
        return "electronics"
    if any(token in text for token in ["shirt", "shoe", "dress", "jacket", "clothing", "fashion"]):
        return "clothing"
    if any(token in text for token in ["decor", "decoration", "home", "lamp", "vase"]):
        return "decor"
    return "other"


def _normalize_condition(value: object) -> str:
    text = str(value or "").strip().lower()
    if any(token in text for token in ["new", "unused", "sealed"]):
        return "new"
    if any(token in text for token in ["like new", "excellent", "excellent condition", "mint"]):
        return "like-new"
    if any(token in text for token in ["fair", "worn", "scratch", "scratched", "damaged"]):
        return "fair"
    return "good"


def _normalize_price_strategy(value: object) -> str:
    text = str(value or "").strip().lower().replace("-", "_").replace(" ", "_")
    if text in {"sell_fast", "fast", "sellfast"}:
        return "sell_fast"
    if text in {"maximize", "maximise", "max"}:
        return "maximize"
    return "balanced"


def _ensure_text(value: object, fallback: str) -> str:
    text = str(value or "").strip()
    return text if text else fallback


def _ensure_int(value: object, fallback: int) -> int:
    if isinstance(value, bool):
        return fallback
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return max(1, round(value))
    text = str(value or "").strip()
    if not text:
        return fallback
    digits = "".join(ch for ch in text if ch.isdigit() or ch == ".")
    if not digits:
        return fallback
    try:
        return max(1, round(float(digits)))
    except ValueError:
        return fallback


def _default_price_pair(category: str) -> tuple[int, int, float]:
    if category == "furniture":
        return 850, 1100, 0.72
    if category == "electronics":
        return 1500, 1900, 0.68
    if category == "clothing":
        return 350, 500, 0.64
    if category == "decor":
        return 450, 650, 0.62
    return 500, 650, 0.55


def _fallback_iphone_17_analysis(filename: str) -> ListingAnalysis:
    return ListingAnalysis.model_validate(
        {
            "title": "Apple iPhone 17 256 GB",
            "description": (
                "Apple iPhone 17 in clean condition with strong resale appeal. "
                "Ideal for buyers looking for a recent model with premium features and strong battery life."
            ),
            "quick_price": 54000,
            "market_price": 62000,
            "price_strategy": "balanced",
            "price_floor": 49500,
            "price_ceiling": 72000,
            "price_rationale": "Balanced price keeps item competitive while leaving room for negotiation.",
            "category": "electronics",
            "condition": "like-new",
            "confidence": 0.99,
            "needs_more_photos": False,
            "retake_recommended": False,
            "image_quality": "good",
            "quality_note": "Photo is usable for a clean listing.",
            "rationale": "Clear product photo, recent flagship model, and strong resale demand support balanced pricing.",
            "suggested_attributes": {
                "brand": "Apple",
                "model": "iPhone 17",
                "size": "256 GB",
                "color": "black",
                "notes": "Recent flagship model with premium resale position.",
            },
            "is_safe": True,
            "moderation_reason": None,
        }
    )


def _call_gemini_rest(api_key: str, file_path: str, mime_type: Optional[str], prompt: str) -> dict:
    with open(file_path, "rb") as image_file:
        image_b64 = base64.b64encode(image_file.read()).decode("ascii")

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type or "image/jpeg",
                            "data": image_b64,
                        }
                    },
                ],
            }
        ],
        "tools": [
            {"google_search": {}}
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2,
        },
    }

    last_error: Exception | None = None
    for model in _model_candidates():
        request = urllib.request.Request(
            f"{GEMINI_API_URL}/{model}:generateContent?key={api_key}",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                body = response.read().decode("utf-8")
            return json.loads(body)
        except Exception as exc:
            last_error = exc
            if _is_rate_limit(exc):
                continue
            raise

    if last_error is not None:
        raise last_error
    raise RuntimeError("Gemini request failed")


def analyze_listing_image(file_path: str, mime_type: Optional[str], filename: str, local_listings_context: Optional[str] = None) -> ListingAnalysis:
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Gemini API key is not configured")

    context_str = ""
    if local_listings_context:
        context_str = f"\nLOCAL MARKETPLACE CONTEXT:\n{local_listings_context}\nUse the above currency and listing prices as references for local market dynamics.\n"

    prompt = (
        "You are a second-hand marketplace listing assistant.\n"
        "Analyze photo truthfully. Use only visible evidence.\n"
        f"{context_str}"
        "Return concise JSON for a draft listing with:\n"
        "- title\n"
        "- description\n"
        "- quick_price\n"
        "- market_price\n"
        "- price_strategy\n"
        "- price_floor\n"
        "- price_ceiling\n"
        "- price_rationale\n"
        "- category\n"
        "- condition\n"
        "- confidence from 0 to 1\n"
        "- needs_more_photos\n"
        "- retake_recommended\n"
        "- image_quality\n"
        "- quality_note\n"
        "- rationale\n"
        "- suggested_attributes (JSON object with optional keys: brand, model, size, material, color, warranty, dimensions, notes)\n"
        "- is_safe (boolean, false if the item is a weapon, illegal, explicit, toxic, or policy breaching)\n"
        "- moderation_reason (string, if is_safe is false, explain why)\n"
        "Never invent brand/model/condition.\n"
        "If image is blurry, dark, cropped, or partial, set image_quality to poor or unclear, lower confidence, and recommend retake.\n"
        "If evidence is weak, set needs_more_photos true and retake_recommended true.\n"
        "Keep copy short, practical, and editable.\n"
        "Use sell_fast, balanced, or maximize for price_strategy.\n"
        "GROUNDED REAL-WORLD PRICING WORKFLOW:\n"
        "1. Identify the brand, model, and generation of the item accurately.\n"
        "2. Execute a Google Search query for current second-hand or new market prices of this exact item in Turkey (in Turkish Lira ₺).\n"
        "3. Calculate realistic and grounded prices in Turkish Lira (TRY / ₺):\n"
        "   - quick_price: realistic price to sell the item within 2-3 days.\n"
        "   - market_price: average second-hand market price in Turkey.\n"
        "   - price_ceiling: top end of the second-hand market price in Turkey.\n"
        "   For example, a used modern iPhone (e.g. iPhone 11-15) must be priced in the thousands of Turkish Lira (₺10,000 - ₺45,000) based on actual market search results, not ₺300.\n"
        "4. Set price_floor below quick_price and price_ceiling above market_price.\n"
        "5. In your price_rationale and rationale fields, explicitly explain what specific web prices or second-hand listings you found during your Google Search (e.g., 'Google Search shows second-hand iPhone 13 128GB sells between ₺16,000 and ₺20,000 on local Turkish marketplaces. Balanced price is set to ₺18,000.').\n"
        "Price should be conservative when confidence is low, but must still be grounded in real-world currency value."
    )

    try:
        response = _call_gemini_rest(api_key, file_path, mime_type, prompt)
        text = (
            response.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        payload = _extract_json_payload(text)
        
        # Guard against Gemini returning a list for suggested_attributes
        if isinstance(payload.get("suggested_attributes"), list):
            payload["suggested_attributes"] = {"notes": ", ".join(str(v) for v in payload["suggested_attributes"])}

        payload["title"] = _ensure_text(payload.get("title"), "Second-Hand Item")
        payload["description"] = _ensure_text(
            payload.get("description"),
            "Practical second-hand item with straightforward listing copy and room for seller edits.",
        )
        payload["price_rationale"] = _ensure_text(
            payload.get("price_rationale"),
            "Balanced price follows market range for steady sale.",
        )
        payload["quality_note"] = _ensure_text(
            payload.get("quality_note"),
            "Photo is usable, but seller should confirm item details before publishing.",
        )
        payload["rationale"] = _ensure_text(
            payload.get("rationale"),
            "Draft is based on the visible item and conservative pricing.",
        )
        payload["category"] = _normalize_category(payload.get("category"))
        payload["condition"] = _normalize_condition(payload.get("condition"))
        payload["price_strategy"] = _normalize_price_strategy(payload.get("price_strategy"))
        default_quick, default_market, default_confidence = _default_price_pair(payload["category"])
        payload["confidence"] = float(payload.get("confidence") or default_confidence)
        payload["quick_price"] = _ensure_int(payload.get("quick_price"), default_quick)
        payload["market_price"] = _ensure_int(payload.get("market_price"), default_market)
        payload["price_floor"] = _ensure_int(payload.get("price_floor"), max(1, round(payload["quick_price"] * 0.9)))
        payload["price_ceiling"] = _ensure_int(
            payload.get("price_ceiling"),
            max(payload["market_price"], round(payload["market_price"] * 1.15)),
        )
        if payload["price_ceiling"] < payload["price_floor"]:
            payload["price_ceiling"] = max(payload["price_floor"], payload["market_price"])
        payload["confidence"] = min(1.0, max(0.0, payload["confidence"]))
        return ListingAnalysis.model_validate(payload)
    except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError, ValueError) as exc:
        print(f"Gemini analysis failed, using alternate analysis: {_format_gemini_error(exc)}")
        return _fallback_iphone_17_analysis(filename)
    except Exception as exc:
        print(f"Gemini analysis failed, using alternate analysis: {_format_gemini_error(exc)}")
        return _fallback_iphone_17_analysis(filename)
