from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: str
    location: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    status: str
    location: Optional[str] = None
    bio: Optional[str] = None
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
    title: str
    description: str
    quick_price: float
    ideal_price: float
