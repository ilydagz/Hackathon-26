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


DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
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


def _mock_analysis(filename: str) -> ListingAnalysis:
    name = (filename or "").lower()
    if any(token in name for token in ["chair", "table", "desk", "sofa"]):
        pricing = _pricing_profile(850, 1100, 0.72)
        return ListingAnalysis(
            title="Wooden Desk Chair",
            description="Sturdy second-hand desk chair with clean lines and practical everyday use.",
            quick_price=850,
            market_price=1100,
            **pricing,
            category="furniture",
            condition="good",
            confidence=0.72,
            retake_recommended=False,
            image_quality="good",
            quality_note="Shape and material are readable from filename cues, but seller should still confirm condition.",
            rationale="Chair shape and furniture cues are visible, but condition still needs a closer look.",
            suggested_attributes=SuggestedAttributes(material="Wood", color="Brown"),
        )

    if any(token in name for token in ["phone", "watch", "headphone", "laptop", "camera", "mouse"]):
        pricing = _pricing_profile(1500, 1900, 0.68)
        return ListingAnalysis(
            title="Used Electronics Item",
            description="Clean used electronics item with visible signs of normal wear and ready for a new owner.",
            quick_price=1500,
            market_price=1900,
            **pricing,
            category="electronics",
            condition="good",
            confidence=0.68,
            retake_recommended=False,
            image_quality="good",
            quality_note="Filename points to electronics, but model and wear level remain unverified.",
            rationale="Filename suggests electronics, but exact model and condition need seller confirmation.",
            suggested_attributes=SuggestedAttributes(brand="Unknown", warranty="Unknown"),
        )

    pricing = _pricing_profile(500, 650, 0.55)
    return ListingAnalysis(
        title="Second-Hand Item",
        description="Practical second-hand item with straightforward listing copy and room for seller edits.",
        quick_price=500,
        market_price=650,
        **pricing,
        category="other",
        condition="good",
        confidence=0.55,
        needs_more_photos=True,
        retake_recommended=True,
        image_quality="poor",
        quality_note="Image evidence is limited, so a clearer, brighter, closer photo would help.",
        rationale="Image evidence is limited, so analysis stays conservative and asks for a clearer photo.",
        suggested_attributes=SuggestedAttributes(notes="Add more photos for better draft quality."),
    )


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
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2,
        },
    }

    request = urllib.request.Request(
        f"{GEMINI_API_URL}/{DEFAULT_MODEL}:generateContent?key={api_key}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=90) as response:
        body = response.read().decode("utf-8")
    return json.loads(body)


def analyze_listing_image(file_path: str, mime_type: Optional[str], filename: str) -> ListingAnalysis:
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _mock_analysis(filename)

    prompt = (
        "You are a second-hand marketplace listing assistant.\n"
        "Analyze photo truthfully. Use only visible evidence.\n"
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
        "- suggested_attributes\n"
        "Never invent brand/model/condition.\n"
        "If image is blurry, dark, cropped, or partial, set image_quality to poor or unclear, lower confidence, and recommend retake.\n"
        "If evidence is weak, set needs_more_photos true and retake_recommended true.\n"
        "Keep copy short, practical, and editable.\n"
        "Use sell_fast, balanced, or maximize for price_strategy.\n"
        "Set price_floor below lowest recommended price and price_ceiling above highest recommended price.\n"
        "Price should be conservative when confidence is low."
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
        print(f"Gemini analysis failed, using mock fallback: {exc}")
        return _mock_analysis(filename)
    except Exception as exc:
        print(f"Gemini analysis failed, using mock fallback: {exc}")
        return _mock_analysis(filename)
