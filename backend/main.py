import os
import json
import shutil
import asyncio
import hashlib
import math
import secrets
import uuid
import re
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Header, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc, inspect, text

import models
import schemas
from analysis_service import analyze_listing_image
from env_loader import load_local_env
from database import engine, get_db, SessionLocal

# Create database tables
load_local_env()
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
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.1-flash-lite")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"
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

def get_gemini_api_key() -> str:
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Gemini API key is not configured")
    return api_key

def extract_gemini_text(response: dict) -> str:
    candidates = response.get("candidates") or []
    if not candidates:
        raise RuntimeError("Gemini response missing candidates")
    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    if not parts:
        raise RuntimeError("Gemini response missing parts")
    text = parts[0].get("text") or ""
    if not text.strip():
        raise RuntimeError("Gemini response missing text")
    return text


def format_gemini_error(exc: Exception) -> str:
    if isinstance(exc, urllib.error.HTTPError):
        detail = ""
        try:
            body = exc.read().decode("utf-8")
            payload = json.loads(body)
            detail = payload.get("error", {}).get("message") or body.strip()
        except Exception:
            detail = getattr(exc, "reason", "") or ""
        if detail:
            return f"Gemini HTTP {exc.code}: {detail}"
        return f"Gemini HTTP {exc.code}"
    if isinstance(exc, urllib.error.URLError):
        return f"Gemini network error: {exc.reason}"
    if isinstance(exc, json.JSONDecodeError):
        return f"Gemini response parse failed: {exc.msg}"
    if isinstance(exc, ValueError):
        return f"Gemini response invalid: {exc}"
    return f"Gemini request failed: {exc}"


def gemini_model_candidates() -> List[str]:
    candidates = []
    for model in [GEMINI_MODEL, GEMINI_FALLBACK_MODEL]:
        model = (model or "").strip()
        if model and model not in candidates:
            candidates.append(model)
    return candidates


def is_gemini_rate_limit(exc: Exception) -> bool:
    if isinstance(exc, urllib.error.HTTPError) and exc.code in {429, 500, 503}:
        return True
    if isinstance(exc, urllib.error.URLError) and isinstance(exc.reason, TimeoutError):
        return True
    # Catch string timeout reasons too
    if isinstance(exc, urllib.error.URLError) and "timeout" in str(exc.reason).lower():
        return True
    # Catch 400 bad request for image unsupported in Gemma 4
    if isinstance(exc, urllib.error.HTTPError) and exc.code == 400:
        return True
    return False

def call_gemini_json(prompt: str, payload: dict, temperature: float = 0.2) -> dict:
    api_key = get_gemini_api_key()
    request_payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"{prompt}\n\nINPUT:\n{json.dumps(payload, ensure_ascii=False)}",
                    }
                ],
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": temperature,
        },
    }

    last_error: Optional[Exception] = None
    for model in gemini_model_candidates():
        request = urllib.request.Request(
            f"{GEMINI_API_URL}/{model}:generateContent?key={api_key}",
            data=json.dumps(request_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                body = response.read().decode("utf-8")
            response_json = json.loads(body)
            text = extract_gemini_text(response_json).strip()
            if text.startswith("```"):
                text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.IGNORECASE | re.DOTALL).strip()
            return json.loads(text)
        except Exception as exc:
            last_error = exc
            if is_gemini_rate_limit(exc):
                continue
            if isinstance(exc, (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError, ValueError)):
                raise RuntimeError(format_gemini_error(exc)) from exc
            raise RuntimeError(format_gemini_error(exc)) from exc

    if last_error is not None:
        raise RuntimeError(format_gemini_error(last_error)) from last_error
    raise RuntimeError("Gemini request failed")


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
            job.error_message = "AI was unable to analyze this photo. Try a clearer image or upload another item."
            db.commit()
        print(f"Analysis job {job_id} failed: {exc}")
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

def get_optional_user(authorization: Optional[str], db: Session) -> Optional[models.User]:
    user_id = resolve_session_user_id(authorization)
    if not user_id:
        return None
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.status == "suspended":
        return None
    return user

def normalize_tokens(text: Optional[str]) -> List[str]:
    if not text:
        return []
    cleaned = re.sub(r"[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ]+", " ", text.lower())
    return [token for token in cleaned.split() if len(token) > 2]

def listing_text_tokens(listing: models.Listing) -> List[str]:
    attribute_text = ""
    if isinstance(listing.attributes, dict):
        attribute_text = " ".join(
            str(value) for value in listing.attributes.values() if value is not None and str(value).strip()
        )
    return normalize_tokens(" ".join([
        listing.title or "",
        listing.description or "",
        listing.category or "",
        listing.subcategory or "",
        attribute_text,
    ]))

TOKEN_SYNONYMS = {
    "phone": {"phone", "phones", "iphone", "iphones", "smartphone", "smartphones", "mobile", "cell", "galaxy", "pixel"},
    "iphone": {"iphone", "iphones", "phone", "phones", "smartphone", "mobile"},
    "smartphone": {"smartphone", "smartphones", "phone", "phones", "mobile", "cell"},
    "laptop": {"laptop", "laptops", "notebook", "macbook", "thinkpad", "xps", "zenbook", "spectre"},
    "tablet": {"tablet", "tablets", "ipad", "galaxy", "tab"},
    "audio": {"audio", "headphones", "headphone", "earbuds", "speaker", "speakers"},
    "chair": {"chair", "chairs", "seat", "stool", "office"},
    "sofa": {"sofa", "couch", "loveseat", "sectional"},
    "shirt": {"shirt", "shirts", "top", "tops", "tee", "tshirt", "t-shirt"},
    "dress": {"dress", "dresses", "gown"},
    "decor": {"decor", "home", "vase", "lamp", "mirror", "rug", "art"},
    "bike": {"bike", "bikes", "bicycle", "bicycles", "mountain", "road"},
}

CATEGORY_ALIASES = {
    "tech": "electronics",
    "technology": "electronics",
    "electronics": "electronics",
    "phone": "electronics",
    "phones": "electronics",
    "mobile": "electronics",
    "smartphone": "electronics",
    "laptop": "electronics",
    "laptops": "electronics",
    "audio": "electronics",
    "gaming": "electronics",
    "camera": "electronics",
    "cameras": "electronics",
    "wearables": "electronics",
    "furniture": "furniture",
    "clothing": "clothing",
    "decor": "decor",
    "other": "other",
    "all": "all",
}


def normalize_category_filter(value: Optional[str]) -> str:
    if not value:
        return "all"
    return CATEGORY_ALIASES.get(value.strip().lower(), value.strip().lower())


def expand_tokens(tokens: List[str]) -> List[str]:
    expanded = set(tokens)
    for token in tokens:
        expanded.update(TOKEN_SYNONYMS.get(token, set()))
    return list(expanded)

def event_weight(event_type: str) -> float:
    weights = {
        "impression": 0.15,
        "open": 1.2,
        "favorite": 2.8,
        "search": 1.0,
        "category": 0.9,
        "chat_start": 2.1,
    }
    return weights.get(event_type, 0.5)

def build_feed_profile(events: List[models.FeedEvent], listings_by_id: dict) -> dict:
    category_scores = Counter()
    query_tokens = Counter()
    price_total = 0.0
    price_weight = 0.0
    author_scores = Counter()
    recent_terms = Counter()

    for event in events:
        weight = event_weight(event.event_type)
        if event.category:
          category_scores[event.category.lower()] += weight
        if event.query:
          for token in normalize_tokens(event.query):
              query_tokens[token] += weight
              recent_terms[token] += weight
        if event.listing_id and event.listing_id in listings_by_id:
          listing = listings_by_id[event.listing_id]
          if listing.category:
              category_scores[listing.category.lower()] += weight
          if listing.author_id:
              author_scores[listing.author_id] += weight
          if listing.selected_price:
              price_total += float(listing.selected_price) * weight
              price_weight += weight
          for token in listing_text_tokens(listing)[:14]:
              recent_terms[token] += weight * 0.2

    preferred_price = price_total / price_weight if price_weight else None
    return {
        "category_scores": category_scores,
        "query_tokens": query_tokens,
        "preferred_price": preferred_price,
        "author_scores": author_scores,
        "recent_terms": recent_terms,
    }

def score_listing(listing: models.Listing, profile: dict, search: Optional[str], category: Optional[str], global_popularity: Counter) -> tuple[float, List[str], Optional[str], str]:
    score = 0.0
    signals = []
    badge = None
    now = datetime.utcnow()
    age_days = max((now - listing.created_at).total_seconds() / 86400.0, 0.0)

    recency = 1.0 / (1.0 + age_days / 6.0)
    score += recency * 2.5
    if recency > 0.8:
        signals.append("fresh")
        badge = badge or "Fresh"

    cat = (listing.category or "").lower()
    cat_boost = profile["category_scores"].get(cat, 0.0)
    if cat_boost:
        score += cat_boost * 2.4
        signals.append(f"likes {cat}")

    if profile["preferred_price"]:
      preferred = profile["preferred_price"]
      price = float(listing.selected_price or 0)
      if price > 0:
        distance = abs(price - preferred) / max(preferred, 1)
        proximity = math.exp(-distance * 1.8)
        score += proximity * 2.1
        if proximity > 0.6:
          signals.append("right price band")

    popularity = global_popularity.get(listing.id, 0)
    if popularity:
        score += math.log1p(popularity) * 0.7
        signals.append("popular now")
        badge = badge or "Trending"

    if listing.author_id and profile["author_scores"].get(listing.author_id):
        score += profile["author_scores"][listing.author_id] * 1.1
        signals.append("seller you engaged with")

    search_terms = expand_tokens(normalize_tokens(search))
    listing_tokens = expand_tokens(listing_text_tokens(listing))
    if search_terms:
      overlap = sum(1 for token in search_terms if token in listing_tokens)
      if overlap:
          score += overlap * 1.6
          signals.append("matches search")

    history_overlap = sum(profile["query_tokens"].get(token, 0.0) for token in listing_tokens)
    if history_overlap:
        score += history_overlap * 0.35
        signals.append("matches your search history")

    if category and category != "all":
      if cat == category.lower() or (listing.subcategory or "").lower() == category.lower():
          score += 3.5
          signals.append("active category")
      else:
          score -= 2.0

    if listing.status == "draft":
        score -= 3.0

    if listing.author_id and profile.get("recent_author_id") == listing.author_id:
        score += 0.8

    if score < 0:
      score = 0

    if not badge and signals:
      badge = "Because you like this"

    reason = " · ".join(signals[:3]) if signals else "Fresh item from marketplace"
    return score, signals[:4], badge, reason

def build_feed_response(db: Session, current_user: Optional[models.User], category: Optional[str], search: Optional[str]):
    category = normalize_category_filter(category)
    query = db.query(models.Listing).filter(models.Listing.status == "active")
    if category and category != "all":
        query = query.filter((models.Listing.category == category) | (models.Listing.subcategory == category))
    if search:
        query = query.filter(
            (models.Listing.title.ilike(f"%{search}%")) |
            (models.Listing.description.ilike(f"%{search}%")) |
            (models.Listing.category.ilike(f"%{search}%")) |
            (models.Listing.subcategory.ilike(f"%{search}%"))
        )

    listings = query.order_by(desc(models.Listing.created_at)).limit(80).all()
    if not listings:
        return {
            "items": [],
            "insights": {
                "top_categories": [],
                "preferred_price_range": None,
                "summary": "No live listings available right now.",
            },
        }

    recent_events = []
    if current_user:
        recent_events = db.query(models.FeedEvent).filter(
            models.FeedEvent.user_id == current_user.id
        ).order_by(desc(models.FeedEvent.timestamp)).limit(40).all()

    payload = {
        "context": {
            "category": category,
            "search": search,
            "current_user": {
                "id": current_user.id if current_user else None,
                "name": current_user.name if current_user else None,
                "location": current_user.location if current_user else None,
            },
            "recent_events": [
                {
                    "event_type": event.event_type,
                    "listing_id": event.listing_id,
                    "category": event.category,
                    "query": event.query,
                    "timestamp": event.timestamp.isoformat() if event.timestamp else None,
                }
                for event in recent_events
            ],
        },
        "listings": [
            {
                "id": listing.id,
                "title": listing.title,
                "description": (listing.description or "")[:220],
                "selected_price": float(listing.selected_price or 0),
                "category": listing.category,
                "subcategory": listing.subcategory,
                "condition": listing.condition,
                "created_at": listing.created_at.isoformat() if listing.created_at else None,
                "author_id": listing.author_id,
                "author_name": listing.author.name if listing.author else None,
                "price_strategy": listing.price_strategy,
                "price_floor": listing.price_floor,
                "price_ceiling": listing.price_ceiling,
            }
            for listing in listings
        ],
    }

    items = []
    for idx, listing in enumerate(listings):
        listing_payload = schemas.ListingResponse.model_validate(listing).model_dump()
        items.append({
            **listing_payload,
            "feed_score": float(10.0 - (idx * 0.1)),
            "feed_reason": "Fresh from marketplace",
            "feed_badge": None,
            "feed_signals": [],
        })

    return {
        "items": items,
        "insights": {
            "top_categories": [],
            "preferred_price_range": None,
            "summary": "Showing latest items from the marketplace.",
        },
    }

def build_chat_assist(listing: models.Listing, messages: List[models.Message], current_user: models.User, other_user: models.User) -> dict:
    payload = {
        "listing": {
            "id": listing.id,
            "title": listing.title,
            "description": listing.description,
            "selected_price": float(listing.selected_price or 0),
            "category": listing.category,
            "subcategory": listing.subcategory,
            "condition": listing.condition,
            "price_strategy": listing.price_strategy,
            "price_floor": listing.price_floor,
            "price_ceiling": listing.price_ceiling,
            "price_rationale": listing.price_rationale,
            "author_id": listing.author_id,
            "author_name": listing.author.name if listing.author else None,
        },
        "current_user": {
            "id": current_user.id,
            "name": current_user.name,
            "role": current_user.role,
        },
        "other_user": {
            "id": other_user.id,
            "name": other_user.name,
        },
        "messages": [
            {
                "sender_id": msg.sender_id,
                "receiver_id": msg.receiver_id,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None,
            }
            for msg in messages[-12:]
        ],
    }

    prompt = (
        "You are Chat Copilot for a marketplace conversation. "
        "Read the listing and the conversation history, then write the next best reply guidance for the current user. "
        "Return valid JSON with this exact shape: "
        "{"
        '"tone_label":"short tone label",'
        '"summary":"one-sentence guidance",'
        '"suggestions":[{"label":"short label","text":"reply text"},{"label":"short label","text":"reply text"},{"label":"short label","text":"reply text"}]'
        "}."
        " Keep the response practical, natural, and grounded in the conversation. "
        "Do not mention that you are an AI."
    )
    response = call_gemini_json(prompt, payload, temperature=0.3)
    suggestions = response.get("suggestions")
    if not isinstance(suggestions, list):
        raise RuntimeError("ChatCopilot response missing suggestions")
    if len(suggestions) < 3:
        raise RuntimeError("ChatCopilot returned too few suggestions")
    return {
        "tone_label": str(response.get("tone_label") or "Helpful"),
        "summary": str(response.get("summary") or "Use a clear, warm reply that moves the chat forward."),
        "suggestions": [
            {
                "label": str(item.get("label") or "Reply"),
                "text": str(item.get("text") or ""),
            }
            for item in suggestions[:3]
            if isinstance(item, dict) and item.get("text")
        ],
    }

def log_feed_event(db: Session, current_user: Optional[models.User], event: schemas.FeedEventCreate):
    if not current_user:
        return None

    feed_event = models.FeedEvent(
        user_id=current_user.id,
        event_type=event.event_type,
        listing_id=event.listing_id,
        category=event.category,
        query=event.query,
        event_metadata=event.metadata,
    )
    db.add(feed_event)
    db.commit()
    return feed_event

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
    category = normalize_category_filter(category)
    subcategory = normalize_category_filter(subcategory)
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

@app.get("/api/feed", response_model=schemas.FeedResponse)
def get_feed(
    category: Optional[str] = None,
    search: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    category = normalize_category_filter(category)
    current_user = get_optional_user(authorization, db)
    try:
        return build_feed_response(db, current_user, category, search)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

@app.post("/api/feed/events")
def create_feed_event(
    event: schemas.FeedEventCreate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    current_user = get_optional_user(authorization, db)
    if not current_user:
        return {"message": "ignored"}
    feed_event = log_feed_event(db, current_user, event)
    return {"message": "recorded", "id": feed_event.id if feed_event else None}

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
    try:
        return build_chat_assist(listing, messages, current_user, other_user)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))


# --- LOG ENDPOINTS ---

@app.get("/api/logs", response_model=List[schemas.LogResponse])
def get_logs(admin: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(models.Log).order_by(desc(models.Log.timestamp)).all()


# --- AI ENDPOINT ---

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
        model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite"),
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
