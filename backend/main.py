import os
import shutil
import asyncio
import hashlib
import secrets
import uuid
from typing import List, Optional
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Header, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc, inspect, text

import models
import schemas
from analysis_service import analyze_listing_image
from database import engine, get_db, SessionLocal

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
AVATAR_DIR = os.path.join(BASE_DIR, "static", "avatars")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AVATAR_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# Very simple in-memory session store for Hackathon purposes
active_sessions = {} # token -> user_id


def resolve_session_user_id(authorization: Optional[str]) -> Optional[int]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    return active_sessions.get(token)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def build_avatar_url(filename: str) -> str:
    return f"avatars/{filename}"

def save_avatar_upload(file: UploadFile, user_id: int) -> str:
    original_name = file.filename or "avatar"
    _, ext = os.path.splitext(original_name)
    ext = ext.lower() if ext else ".jpg"
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        ext = ".jpg"

    filename = f"avatar-{user_id}-{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(AVATAR_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return build_avatar_url(filename)

def delete_static_asset(asset_url: Optional[str]):
    if not asset_url:
        return

    file_path = os.path.join(BASE_DIR, "static", asset_url)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass


def analyze_job_worker(job_id: int, file_path: str, mime_type: Optional[str], filename: str):
    db = SessionLocal()
    try:
        job = db.query(models.AnalysisJob).filter(models.AnalysisJob.id == job_id).first()
        if not job:
            return

        job.status = "processing"
        db.commit()

        analysis = analyze_listing_image(file_path, mime_type, filename)
        job.status = "completed"
        job.result_json = {
            **analysis.model_dump(),
            "image_url": job.image_url,
            "image_name": job.image_name,
        }
        db.commit()
    except Exception as exc:
        job = db.query(models.AnalysisJob).filter(models.AnalysisJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.error_message = str(exc)
            db.commit()
    finally:
        db.close()

def ensure_user_avatar_column():
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("users")}
    if "avatar_url" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR"))

ensure_user_avatar_column()

def ensure_listing_price_columns():
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("listings")}
    statements = []
    if "price_strategy" not in columns:
        statements.append("ALTER TABLE listings ADD COLUMN price_strategy VARCHAR")
    if "price_floor" not in columns:
        statements.append("ALTER TABLE listings ADD COLUMN price_floor FLOAT")
    if "price_ceiling" not in columns:
        statements.append("ALTER TABLE listings ADD COLUMN price_ceiling FLOAT")
    if "price_rationale" not in columns:
        statements.append("ALTER TABLE listings ADD COLUMN price_rationale VARCHAR")
    if statements:
        with engine.begin() as conn:
            for statement in statements:
                conn.execute(text(statement))

ensure_listing_price_columns()

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

def build_chat_assist(listing: models.Listing, messages: List[models.Message], current_user: models.User, other_user: models.User) -> dict:
    last_buyer_message = next(
        (
            msg.content
            for msg in reversed(messages)
            if msg.sender_id == other_user.id
        ),
        "",
    )
    listing_price = listing.selected_price or 0
    tone_label = "Friendly"
    summary = f"Item: {listing.title}. Asking ₺{int(listing_price)}."

    lowered = (last_buyer_message or "").lower()
    if any(word in lowered for word in ["lowest", "best price", "discount", "cheaper", "less"]):
        tone_label = "Price push"
        summary = "Buyer asks for lower price. Keep room for negotiation."
        suggestions = [
            {"label": "Counter", "text": f"I can do ₺{int(max(listing_price * 0.95, listing_price - 50))} if you can pick up today."},
            {"label": "Firm", "text": f"Price is already fair at ₺{int(listing_price)}. Happy to keep it available for you."},
            {"label": "Close", "text": "If that works for you, I can hold it until pickup time."},
        ]
    elif any(word in lowered for word in ["pickup", "pick up", "meet", "available", "today", "when"]):
        tone_label = "Availability"
        summary = "Buyer wants timing or pickup details."
        suggestions = [
            {"label": "Availability", "text": "Yes, I am available today after 6 PM."},
            {"label": "Pickup", "text": "Pickup works best in a public place near me."},
            {"label": "Confirm", "text": "Tell me what time works for you and I will confirm."},
        ]
    elif any(word in lowered for word in ["condition", "wear", "damage", "scratch", "photo"]):
        tone_label = "Trust check"
        summary = "Buyer wants more detail on condition."
        suggestions = [
            {"label": "Condition", "text": "Condition is as shown in photos, with normal second-hand wear."},
            {"label": "Detail", "text": "I can share one more photo if you want a closer look."},
            {"label": "Assure", "text": "Happy to answer anything else before you decide."},
        ]
    else:
        tone_label = "Friendly"
        summary = "Keep reply warm, short, and open-ended."
        suggestions = [
            {"label": "Warm reply", "text": f"Hi, thanks for your message about {listing.title}. How can I help?"},
            {"label": "Ready", "text": "I am happy to answer questions or arrange pickup."},
            {"label": "Next step", "text": "Let me know what works best for you."},
        ]

    if current_user.id != listing.author_id:
        summary = "You are in buyer role. Keep reply simple and direct."
        suggestions = [
            {"label": "Ask", "text": f"Hi, is {listing.title} still available?"},
            {"label": "Pickup", "text": "When could we meet for pickup?"},
            {"label": "Offer", "text": f"Would you consider ₺{int(max(listing_price * 0.9, listing_price - 100))}?"},
        ]

    return {
        "tone_label": tone_label,
        "summary": summary,
        "suggestions": suggestions[:3],
    }

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
        log_action(db, "LOGIN", "ACCOUNT_SUSPENDED", target=user.email, ip=request.client.host)
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
def update_current_user_profile(user_update: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/api/users/me/avatar", response_model=schemas.UserResponse)
async def update_current_user_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Avatar must be an image")

    previous_avatar = current_user.avatar_url
    current_user.avatar_url = save_avatar_upload(file, current_user.id)
    db.commit()
    db.refresh(current_user)
    delete_static_asset(previous_avatar)
    return current_user

@app.delete("/api/users/me/avatar", response_model=schemas.UserResponse)
def delete_current_user_avatar(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    previous_avatar = current_user.avatar_url
    current_user.avatar_url = None
    db.commit()
    db.refresh(current_user)
    delete_static_asset(previous_avatar)
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

    delete_static_asset(user.avatar_url)
    db.delete(user)
    db.commit()
    log_action(db, "DELETE_USER", "SUCCESS", user_id=admin.id, role=admin.role, target=f"U{user.id}", ip=request.client.host)
    return {"message": "User deleted"}


# --- LISTING ENDPOINTS ---

@app.get("/api/listings", response_model=List[schemas.ListingResponse])
def get_listings(category: Optional[str] = None, subcategory: Optional[str] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Listing).filter(models.Listing.status == "active")
    
    if category and category != "all":
        # Check if matches category OR subcategory
        query = query.filter((models.Listing.category == category) | (models.Listing.subcategory == category))
    
    if subcategory:
        query = query.filter(models.Listing.subcategory == subcategory)
    
    if search:
        query = query.filter(
            (models.Listing.title.ilike(f"%{search}%")) | 
            (models.Listing.description.ilike(f"%{search}%")) |
            (models.Listing.category.ilike(f"%{search}%")) |
            (models.Listing.subcategory.ilike(f"%{search}%"))
        )
        
    return query.order_by(desc(models.Listing.created_at)).all()

@app.get("/api/listings/drafts", response_model=List[schemas.ListingResponse])
def get_drafts(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Listing).filter(
        models.Listing.author_id == current_user.id,
        models.Listing.status == "draft"
    ).all()

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

@app.put("/api/listings/{listing_id}", response_model=schemas.ListingResponse)
def update_listing(listing_id: int, listing_update: schemas.ListingUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if db_listing.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = listing_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_listing, key, value)
    
    db.commit()
    db.refresh(db_listing)
    return db_listing

@app.post("/api/listings/{listing_id}/sold", response_model=schemas.ListingResponse)
def mark_as_sold(listing_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if db_listing.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_listing.status = "sold"
    db.commit()
    db.refresh(db_listing)
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

# --- MESSAGE ENDPOINTS ---

@app.get("/api/messages/{listing_id}", response_model=List[schemas.MessageResponse])
def get_messages(listing_id: int, other_user_id: Optional[int] = None, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(models.Message).filter(models.Message.listing_id == listing_id)
    
    if other_user_id:
        query = query.filter(
            ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == other_user_id)) |
            ((models.Message.sender_id == other_user_id) & (models.Message.receiver_id == current_user.id))
        )
    else:
        query = query.filter(
            (models.Message.sender_id == current_user.id) | (models.Message.receiver_id == current_user.id)
        )
        
    return query.order_by(models.Message.timestamp).all()

@app.post("/api/messages", response_model=schemas.MessageResponse)
def send_message(message: schemas.MessageCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_message = models.Message(**message.dict(), sender_id=current_user.id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@app.get("/api/chats", response_model=List[schemas.MessageResponse])
def get_chats(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Very simple: get last message for each unique (listing_id, sender/receiver pair)
    # In a real app, this would be more complex
    all_msgs = db.query(models.Message).filter(
        (models.Message.sender_id == current_user.id) | (models.Message.receiver_id == current_user.id)
    ).order_by(desc(models.Message.timestamp)).all()
    
    seen_pairs = set()
    latest_msgs = []
    for m in all_msgs:
        pair = tuple(sorted([m.sender_id, m.receiver_id])) + (m.listing_id,)
        if pair not in seen_pairs:
            seen_pairs.add(pair)
            latest_msgs.append(m)
    return latest_msgs


@app.get("/api/chats/{listing_id}/assist", response_model=schemas.ChatAssistResponse)
def get_chat_assist(
    listing_id: int,
    other_user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    other_user = db.query(models.User).filter(models.User.id == other_user_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="Chat user not found")

    messages = db.query(models.Message).filter(
        models.Message.listing_id == listing_id,
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == other_user_id)) |
        ((models.Message.sender_id == other_user_id) & (models.Message.receiver_id == current_user.id))
    ).order_by(models.Message.timestamp).all()

    return build_chat_assist(listing, messages, current_user, other_user)


# --- LOG ENDPOINTS ---

@app.get("/api/logs", response_model=List[schemas.LogResponse])
def get_logs(admin: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(models.Log).order_by(desc(models.Log.timestamp)).all()


# --- AI ENDPOINT (MOCKED) ---

@app.post("/api/analyze", response_model=schemas.AnalysisJobResponse)
async def analyze_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    original_name = file.filename or "upload.jpg"
    safe_name = f"{uuid.uuid4().hex}-{os.path.basename(original_name)}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    job = models.AnalysisJob(
        user_id=resolve_session_user_id(authorization),
        status="queued",
        image_url=safe_name,
        image_name=original_name,
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(
        analyze_job_worker,
        job.id,
        file_path,
        file.content_type,
        original_name,
    )
    return job


@app.get("/api/analyze/jobs/{job_id}", response_model=schemas.AnalysisJobResponse)
def get_analysis_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.AnalysisJob).filter(models.AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    return job
