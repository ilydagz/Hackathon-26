from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean
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
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("Listing", back_populates="author")

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    selected_price = Column(Float)
    image_url = Column(String)
    status = Column(String, default="active") # 'active', 'flagged'
    flags = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="listings")

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
