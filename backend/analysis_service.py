import os
from typing import Optional, Literal
from pydantic import BaseModel, Field


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


DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


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


def analyze_listing_image(file_path: str, mime_type: Optional[str], filename: str) -> ListingAnalysis:
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _mock_analysis(filename)

    try:
        from google import genai
    except ImportError:
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

    client = genai.Client()
    uploaded_file = client.files.upload(
        file=file_path,
        config={"mimeType": mime_type or "image/jpeg"},
    )
    response = client.models.generate_content(
        model=DEFAULT_MODEL,
        contents=[uploaded_file, prompt],
        config={
            "response_format": {
                "text": {
                    "mime_type": "application/json",
                    "schema": ListingAnalysis.model_json_schema(),
                }
            }
        },
    )

    if not getattr(response, "text", None):
        return _mock_analysis(filename)

    return ListingAnalysis.model_validate_json(response.text)
