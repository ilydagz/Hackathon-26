from database import SessionLocal, engine, Base
import models
from main import hash_password
from datetime import datetime, timedelta
import random

def seed_db():
    # Drop all tables and recreate them to ensure schema matches models
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    print("Seeding Users...")
    users_data = [
        {"name": "Admin User", "email": "admin@ecovalue.com", "password": "password", "role": "admin", "location": "London, UK", "bio": "System administrator for EcoValue."},
        {"name": "Jane Doe", "email": "janedoe@example.com", "password": "password", "role": "user", "location": "Istanbul, TR", "bio": "Loves sustainable fashion."},
        {"name": "John Smith", "email": "johnsmith@example.com", "password": "password", "role": "user", "location": "New York, USA", "bio": "Gadget enthusiast."},
        {"name": "Suspended User", "email": "baduser@example.com", "password": "password", "role": "user", "status": "suspended", "location": "Unknown", "bio": "I was bad."}
    ]

    db_users = []
    for u in users_data:
        user = models.User(
            name=u['name'],
            email=u['email'],
            password_hash=hash_password(u['password']),
            role=u['role'],
            status=u.get('status', 'active'),
            location=u.get('location'),
            bio=u.get('bio')
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        db_users.append(user)

    print("Seeding Listings...")
    listings_data = [
        {
            "title": "Sony WH-1000XM4 Headphones",
            "description": "Like new condition, used for a few months. Comes with original case.",
            "selected_price": 4500.0,
            "image_url": "demo.jpg",
            "category": "electronics",
            "subcategory": "audio",
            "condition": "like-new",
            "status": "active",
            "attributes": {"brand": "Sony", "model": "XM4", "warranty": "Yes"},
            "author_id": db_users[1].id
        },
        {
            "title": "Vintage Typewriter",
            "description": "Beautiful 1960s typewriter in perfect working condition. Recently oiled.",
            "selected_price": 1450.0,
            "image_url": "demo.jpg",
            "category": "other",
            "subcategory": "decor",
            "condition": "good",
            "status": "active",
            "attributes": {"material": "Metal", "color": "Green"},
            "author_id": db_users[2].id
        },
        {
            "title": "Mid-century Modern Desk Chair",
            "description": "Solid wood with brass details. Has a few scratches on the legs.",
            "selected_price": 850.0,
            "image_url": "demo.jpg",
            "category": "furniture",
            "subcategory": "chairs",
            "condition": "good",
            "status": "active",
            "attributes": {"dimensions": "60x60x90", "color": "Oak"},
            "author_id": db_users[1].id
        },
        {
            "title": "Smartwatch Gen 5",
            "description": "Box opened but never worn. Unwanted gift.",
            "selected_price": 1500.0,
            "image_url": "demo.jpg",
            "category": "electronics",
            "subcategory": "phones",
            "condition": "new",
            "status": "active",
            "attributes": {"brand": "Fossil", "warranty": "Yes"},
            "author_id": db_users[2].id
        },
        {
            "title": "Cotton Summer Dress",
            "description": "Lightweight cotton dress, perfect for summer. Size M.",
            "selected_price": 350.0,
            "image_url": "demo.jpg",
            "category": "clothing",
            "subcategory": "dress",
            "condition": "good",
            "status": "active",
            "attributes": {"size": "M", "material": "Cotton"},
            "author_id": db_users[1].id
        },
        {
            "title": "Wall Art - Abstract",
            "description": "Modern abstract wall art, canvas. 60x90cm.",
            "selected_price": 200.0,
            "image_url": "demo.jpg",
            "category": "decor",
            "subcategory": "wall_art",
            "condition": "new",
            "status": "active",
            "attributes": {"dimensions": "60x90", "color": "Blue/Gold"},
            "author_id": db_users[2].id
        },
        {
            "title": "Draft Table",
            "description": "Unfinished draft listing.",
            "selected_price": 100.0,
            "image_url": "demo.jpg",
            "category": "furniture",
            "subcategory": "tables",
            "condition": "fair",
            "status": "draft",
            "author_id": db_users[1].id
        }
    ]

    db_listings = []
    for l in listings_data:
        listing = models.Listing(**l)
        listing.created_at = datetime.utcnow() - timedelta(days=random.randint(0, 7))
        db.add(listing)
        db.commit()
        db.refresh(listing)
        db_listings.append(listing)

    print("Seeding Messages...")
    messages_data = [
        {"sender_id": db_users[2].id, "receiver_id": db_users[1].id, "listing_id": db_listings[0].id, "content": "Hi, is this still available?"},
        {"sender_id": db_users[1].id, "receiver_id": db_users[2].id, "listing_id": db_listings[0].id, "content": "Yes, it is!"},
        {"sender_id": db_users[2].id, "receiver_id": db_users[1].id, "listing_id": db_listings[0].id, "content": "Can you do a small discount?"},
        {"sender_id": db_users[1].id, "receiver_id": db_users[2].id, "listing_id": db_listings[2].id, "content": "I like your chair!"}
    ]
    for m in messages_data:
        msg = models.Message(**m)
        db.add(msg)
    
    db.commit()

    print("Seeding Logs...")
    actions = ["LOGIN", "CREATE_POST", "LOGOUT"]
    for i in range(15):
        user = random.choice(db_users)
        log = models.Log(
            timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 5), hours=random.randint(0, 24)),
            user_id=user.id,
            role=user.role,
            action=random.choice(actions),
            result="SUCCESS" if random.random() > 0.1 else "FAILED",
            ip=f"192.168.1.{random.randint(1, 255)}"
        )
        db.add(log)
    
    db.commit()

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
