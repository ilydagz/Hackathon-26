from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: str
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- Listing Schemas ---
class ListingBase(BaseModel):
    title: str
    description: str
    selected_price: float
    image_url: str
    category: Optional[str] = "furniture"
    subcategory: Optional[str] = None
    condition: Optional[str] = "good"
    attributes: Optional[dict] = None
    price_strategy: Optional[str] = None
    price_floor: Optional[float] = None
    price_ceiling: Optional[float] = None
    price_rationale: Optional[str] = None

class ListingCreate(ListingBase):
    status: Optional[str] = "active"
    is_safe: Optional[bool] = True
    moderation_reason: Optional[str] = None

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    selected_price: Optional[float] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    condition: Optional[str] = None
    status: Optional[str] = None
    attributes: Optional[dict] = None
    price_strategy: Optional[str] = None
    price_floor: Optional[float] = None
    price_ceiling: Optional[float] = None
    price_rationale: Optional[str] = None

class ListingResponse(ListingBase):
    id: int
    status: str
    flags: int
    created_at: datetime
    author_id: Optional[int]
    author: Optional[UserResponse]

    class Config:
        from_attributes = True

# --- Log Schemas ---
class LogResponse(BaseModel):
    id: int
    timestamp: datetime
    user_id: Optional[int]
    role: Optional[str]
    action: str
    target: Optional[str]
    result: str
    ip: Optional[str]

    class Config:
        from_attributes = True

# --- Message Schemas ---
class MessageBase(BaseModel):
    content: str
    image_url: Optional[str] = None
    emoji: Optional[str] = None

class MessageCreate(MessageBase):
    receiver_id: int
    listing_id: Optional[int] = None

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    receiver_id: int
    listing_id: Optional[int]
    timestamp: datetime
    sender: Optional[UserResponse] = None
    receiver: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class ChatAssistRequest(BaseModel):
    other_user_id: int


class ChatAssistSuggestion(BaseModel):
    text: str
    label: str


class ChatAssistResponse(BaseModel):
    tone_label: str
    summary: str
    suggestions: List[ChatAssistSuggestion]

class FeedEventCreate(BaseModel):
    event_type: str
    listing_id: Optional[int] = None
    category: Optional[str] = None
    query: Optional[str] = None
    metadata: Optional[dict] = None


class FeedListingResponse(ListingResponse):
    feed_score: float
    feed_reason: str
    feed_badge: Optional[str] = None
    feed_signals: Optional[List[str]] = None


class FeedInsightsResponse(BaseModel):
    top_categories: List[dict] = Field(default_factory=list)
    preferred_price_range: Optional[dict] = None
    summary: str


class FeedResponse(BaseModel):
    items: List[FeedListingResponse]
    insights: FeedInsightsResponse

# --- AI Schemas ---
class AIAnalysisResponse(BaseModel):
    job_id: int
    status: str
    title: str
    description: str
    quick_price: float
    market_price: float
    price_strategy: str
    price_floor: float
    price_ceiling: float
    price_rationale: str
    category: str
    condition: str
    confidence: float
    needs_more_photos: bool = False
    retake_recommended: bool = False
    image_quality: str = "good"
    quality_note: Optional[str] = None
    rationale: str
    suggested_attributes: Optional[dict] = None

class AnalysisJobResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    status: str
    image_url: str
    image_name: Optional[str] = None
    model: Optional[str] = None
    result_json: Optional[dict] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Offer Schemas ---
class OfferBase(BaseModel):
    amount: float

class OfferCreate(OfferBase):
    pass

class OfferResponse(OfferBase):
    id: int
    listing_id: int
    buyer_id: int
    seller_id: int
    status: str
    created_at: datetime
    buyer: Optional[UserResponse] = None
    seller: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

class OfferDecisionRequest(BaseModel):
    status: str
    counter_amount: Optional[float] = None
