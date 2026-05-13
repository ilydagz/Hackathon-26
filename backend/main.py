import os
import shutil
import asyncio
import hashlib
import secrets
from typing import List, Optional
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc

import models
import schemas
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoValue Marketplace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "images")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# Very simple in-memory session store for Hackathon purposes
active_sessions = {} # token -> user_id

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def log_action(db: Session, action: str, result: str, user_id: Optional[int] = None, role: Optional[str] = None, target: Optional[str] = None, ip: Optional[str] = None):
    new_log = models.Log(
        user_id=user_id,
        role=role,
        action=action,
        target=target,
        result=result,
        ip=ip
    )
    db.add(new_log)
    db.commit()

async def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    
    token = authorization.split(" ")[1]
    user_id = active_sessions.get(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.status == "suspended":
        raise HTTPException(status_code=403, detail="Account suspended or deleted")
        
    return user

async def get_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register", response_model=schemas.TokenResponse)
def register(user: schemas.UserCreate, request: Request, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        log_action(db, "REGISTER", "FAILED", target=user.email, ip=request.client.host)
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # First user is admin
    is_first_user = db.query(models.User).count() == 0
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        role="admin" if is_first_user or user.email == "admin@ecovalue.com" else "user"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    token = secrets.token_urlsafe(32)
    active_sessions[token] = db_user.id
    
    log_action(db, "REGISTER", "SUCCESS", user_id=db_user.id, role=db_user.role, ip=request.client.host)
    
    return {"access_token": token, "token_type": "bearer", "user": db_user}

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(user: schemas.UserLogin, request: Request, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if not db_user or db_user.password_hash != hash_password(user.password):
        log_action(db, "LOGIN", "FAILED", target=user.email, ip=request.client.host)
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if db_user.status == "suspended":
        log_action(db, "LOGIN", "FAILED", target=user.email, result="ACCOUNT_SUSPENDED", ip=request.client.host)
        raise HTTPException(status_code=403, detail="Account suspended")

    token = secrets.token_urlsafe(32)
    active_sessions[token] = db_user.id
    
    log_action(db, "LOGIN", "SUCCESS", user_id=db_user.id, role=db_user.role, ip=request.client.host)
    
    return {"access_token": token, "token_type": "bearer", "user": db_user}

@app.post("/api/auth/logout")
def logout(authorization: Optional[str] = Header(None), db: Session = Depends(get_db), request: Request = None):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user_id = active_sessions.get(token)
        if user_id:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            log_action(db, "LOGOUT", "SUCCESS", user_id=user_id, role=user.role if user else None, ip=request.client.host)
            del active_sessions[token]
    return {"message": "Logged out"}


# --- USER ENDPOINTS ---

@app.get("/api/users/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/api/users/me", response_model=schemas.UserResponse)
def update_current_user_profile(user_update: schemas.UserBase, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.name = user_update.name
    # Email updates might require more logic, but for hackathon we'll allow it:
    current_user.email = user_update.email
    db.commit()
    db.refresh(current_user)
    return current_user

@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(admin: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.put("/api/users/{user_id}/status", response_model=schemas.UserResponse)
def toggle_user_status(user_id: int, request: Request, admin: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.status = "suspended" if user.status == "active" else "active"
    db.commit()
    db.refresh(user)
    
    log_action(db, "SUSPEND_USER" if user.status == "suspended" else "REACTIVATE_USER", "SUCCESS", user_id=admin.id, role=admin.role, target=f"U{user.id}", ip=request.client.host)
    return user

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, request: Request, admin: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    log_action(db, "DELETE_USER", "SUCCESS", user_id=admin.id, role=admin.role, target=f"U{user.id}", ip=request.client.host)
    return {"message": "User deleted"}


# --- LISTING ENDPOINTS ---

@app.get("/api/listings", response_model=List[schemas.ListingResponse])
def get_listings(db: Session = Depends(get_db)):
    # Only return active listings, sorted by newest
    return db.query(models.Listing).filter(models.Listing.status == "active").order_by(desc(models.Listing.created_at)).all()

@app.get("/api/admin/listings", response_model=List[schemas.ListingResponse])
def get_admin_listings(admin: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(models.Listing).order_by(desc(models.Listing.created_at)).all()

@app.post("/api/listings", response_model=schemas.ListingResponse)
def create_listing(listing: schemas.ListingCreate, request: Request, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_listing = models.Listing(**listing.dict(), author_id=current_user.id)
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    
    log_action(db, "CREATE_POST", "SUCCESS", user_id=current_user.id, role=current_user.role, target=f"P{db_listing.id}", ip=request.client.host)
    return db_listing

@app.delete("/api/listings/{listing_id}")
def delete_listing(listing_id: int, request: Request, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if current_user.role != "admin" and listing.author_id != current_user.id:
        log_action(db, "DELETE_POST", "FAILED", user_id=current_user.id, role=current_user.role, target=f"P{listing.id}", ip=request.client.host)
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
        
    db.delete(listing)
    db.commit()
    
    log_action(db, "DELETE_POST", "SUCCESS", user_id=current_user.id, role=current_user.role, target=f"P{listing.id}", ip=request.client.host)
    return {"message": "Listing deleted"}


# --- LOG ENDPOINTS ---

@app.get("/api/logs", response_model=List[schemas.LogResponse])
def get_logs(admin: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(models.Log).order_by(desc(models.Log.timestamp)).all()


# --- AI ENDPOINT (MOCKED) ---

@app.post("/api/analyze", response_model=schemas.AIAnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    await asyncio.sleep(2)
    
    return {
        "title": "Logitech MX Master 3S Mouse",
        "description": "Gently used, ideal ergonomic mouse for the office. Box and invoice are included.",
        "quick_price": 2500,
        "ideal_price": 3200
    }
