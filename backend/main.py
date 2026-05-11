import os
import shutil
import asyncio
from typing import List
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc

# Direct imports instead of relative
import models
import schemas
import database
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoValue Marketplace API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup file paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "images")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files to serve images
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

@app.get("/")
def home():
    return {"status": "EcoValue API is running", "docs": "/docs"}

@app.get("/api/listings", response_model=List[schemas.ListingResponse])
def get_listings(db: Session = Depends(get_db)):
    """Fetch all listings in descending order by creation date."""
    return db.query(models.Listing).order_by(desc(models.Listing.created_at)).all()

@app.post("/api/listings", response_model=schemas.ListingResponse)
def create_listing(listing: schemas.ListingCreate, db: Session = Depends(get_db)):
    """Save a new listing to the database."""
    db_listing = models.Listing(**listing.dict())
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

@app.post("/api/analyze", response_model=schemas.AIAnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    """
    Mock AI Analysis:
    1. Saves the uploaded image to static/images.
    2. Simulates processing time.
    3. Returns mock data.
    """
    # Save the file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Simulate AI processing
    await asyncio.sleep(2)
    
    # Mock Response
    return {
        "title": "Logitech MX Master 3S Mouse",
        "description": "Gently used, ideal ergonomic mouse for the office. Box and invoice are included.",
        "quick_price": 2500,
        "ideal_price": 3200
    }
