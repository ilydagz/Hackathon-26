from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ListingBase(BaseModel):
    title: str
    description: str
    selected_price: float
    image_url: str

class ListingCreate(ListingBase):
    pass

class ListingResponse(ListingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AIAnalysisResponse(BaseModel):
    title: str
    description: str
    quick_price: float
    ideal_price: float
