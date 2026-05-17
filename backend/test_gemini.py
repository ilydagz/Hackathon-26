import os
import urllib.request
import json
from env_loader import load_local_env
from analysis_service import analyze_listing_image

load_local_env()

try:
    # Just passing a tiny dummy file to see if the API rejects it or auth works
    with open("dummy.jpg", "wb") as f:
        f.write(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\xff\xd9")
    
    print("Testing analyze_listing_image with gemini-3.1-flash-lite...")
    res = analyze_listing_image("dummy.jpg", "image/jpeg", "dummy.jpg")
    print("SUCCESS")
    print(res)
except Exception as e:
    print(f"FAILED: {e}")
