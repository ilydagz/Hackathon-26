from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user") # 'admin' or 'user'
    status = Column(String, default="active") # 'active' or 'suspended'
    avatar_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("Listing", back_populates="author")

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    selected_price = Column(Float)
    image_url = Column(String)
    category = Column(String, default="furniture") # furniture, electronics, clothing, decor, other
    subcategory = Column(String, nullable=True)
    condition = Column(String, default="good") # new, like-new, good, fair
    status = Column(String, default="active") # active, sold, draft, flagged
    attributes = Column(JSON, nullable=True) # For specific details like size, specs
    flags = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="listings")

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="queued") # queued, processing, completed, failed
    image_url = Column(String)
    image_name = Column(String, nullable=True)
    model = Column(String, nullable=True)
    result_json = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)
    content = Column(String)
    image_url = Column(String, nullable=True)
    emoji = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, nullable=True) # ID of user taking action
    role = Column(String, nullable=True)
    action = Column(String) # e.g. 'LOGIN', 'CREATE_POST', 'SUSPEND_USER'
    target = Column(String, nullable=True) # e.g. 'P101', 'U002'
    result = Column(String) # 'SUCCESS', 'FAILED'
    ip = Column(String, nullable=True)
