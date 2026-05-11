from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime
from database import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    selected_price = Column(Float)
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
