from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: str

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

class ListingCreate(ListingBase):
    pass

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

# --- AI Schemas ---
class AIAnalysisResponse(BaseModel):
    title: str
    description: str
    quick_price: float
    ideal_price: float
