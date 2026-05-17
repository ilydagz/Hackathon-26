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
    category: Literal["furniture", "electronics", "clothing", "decor", "other"]
    condition: Literal["new", "like-new", "good", "fair"]
    confidence: float = Field(ge=0.0, le=1.0)
    needs_more_photos: bool = False
    rationale: str = Field(min_length=10)
    suggested_attributes: SuggestedAttributes = Field(default_factory=SuggestedAttributes)


DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def _mock_analysis(filename: str) -> ListingAnalysis:
    name = (filename or "").lower()
    if any(token in name for token in ["chair", "table", "desk", "sofa"]):
        return ListingAnalysis(
            title="Wooden Desk Chair",
            description="Sturdy second-hand desk chair with clean lines and practical everyday use.",
            quick_price=850,
            market_price=1100,
            category="furniture",
            condition="good",
            confidence=0.72,
            rationale="Chair shape and furniture cues are visible, but condition still needs a closer look.",
            suggested_attributes=SuggestedAttributes(material="Wood", color="Brown"),
        )

    if any(token in name for token in ["phone", "watch", "headphone", "laptop", "camera", "mouse"]):
        return ListingAnalysis(
            title="Used Electronics Item",
            description="Clean used electronics item with visible signs of normal wear and ready for a new owner.",
            quick_price=1500,
            market_price=1900,
            category="electronics",
            condition="good",
            confidence=0.68,
            rationale="Filename suggests electronics, but exact model and condition need seller confirmation.",
            suggested_attributes=SuggestedAttributes(brand="Unknown", warranty="Unknown"),
        )

    return ListingAnalysis(
        title="Second-Hand Item",
        description="Practical second-hand item with straightforward listing copy and room for seller edits.",
        quick_price=500,
        market_price=650,
        category="other",
        condition="good",
        confidence=0.55,
        needs_more_photos=True,
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
        "- category\n"
        "- condition\n"
        "- confidence from 0 to 1\n"
        "- needs_more_photos\n"
        "- rationale\n"
        "- suggested_attributes\n"
        "Never invent brand/model/condition. If evidence is weak, lower confidence and ask for more photos.\n"
        "Keep copy short, practical, and editable."
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
