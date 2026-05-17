from pydantic import BaseModel
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

class ListingCreate(ListingBase):
    status: Optional[str] = "active"

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    selected_price: Optional[float] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    condition: Optional[str] = None
    status: Optional[str] = None
    attributes: Optional[dict] = None

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

# --- AI Schemas ---
class AIAnalysisResponse(BaseModel):
    job_id: int
    status: str
    title: str
    description: str
    quick_price: float
    market_price: float
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
