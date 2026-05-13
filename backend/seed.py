from database import SessionLocal
from models import User, Listing, Log
from main import hash_password
from datetime import datetime, timedelta
import random

def seed_db():
    db = SessionLocal()

    # Clear existing
    db.query(Log).delete()
    db.query(Listing).delete()
    db.query(User).delete()
    db.commit()

    print("Seeding Users...")
    users_data = [
        {"name": "Admin User", "email": "admin@ecovalue.com", "password": "password", "role": "admin"},
        {"name": "Jane Doe", "email": "janedoe@example.com", "password": "password", "role": "user"},
        {"name": "John Smith", "email": "johnsmith@example.com", "password": "password", "role": "user"},
        {"name": "Suspended User", "email": "baduser@example.com", "password": "password", "role": "user", "status": "suspended"}
    ]

    db_users = []
    for u in users_data:
        user = User(
            name=u['name'],
            email=u['email'],
            password_hash=hash_password(u['password']),
            role=u['role'],
            status=u.get('status', 'active')
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
            "selected_price": 120.0,
            "image_url": "demo.jpg",
            "status": "active",
            "flags": 0,
            "author_id": db_users[1].id
        },
        {
            "title": "Vintage Typewriter",
            "description": "Beautiful 1960s typewriter in perfect working condition. Recently oiled.",
            "selected_price": 145.0,
            "image_url": "demo.jpg",
            "status": "active",
            "flags": 0,
            "author_id": db_users[2].id
        },
        {
            "title": "Mid-century Modern Desk Chair",
            "description": "Solid wood with brass details. Has a few scratches on the legs.",
            "selected_price": 85.0,
            "image_url": "demo.jpg",
            "status": "active",
            "flags": 0,
            "author_id": db_users[1].id
        },
        {
            "title": "Smartwatch Gen 5",
            "description": "Box opened but never worn. Unwanted gift.",
            "selected_price": 150.0,
            "image_url": "demo.jpg",
            "status": "active",
            "flags": 0,
            "author_id": db_users[2].id
        },
        {
            "title": "Questionable Item (Fake Rolex)",
            "description": "Looks exactly like the real thing, trust me bro.",
            "selected_price": 50.0,
            "image_url": "demo.jpg",
            "status": "flagged",
            "flags": 3,
            "author_id": db_users[3].id
        }
    ]

    for l in listings_data:
        listing = Listing(**l)
        # Randomize creation date between now and 7 days ago
        listing.created_at = datetime.utcnow() - timedelta(days=random.randint(0, 7), hours=random.randint(0, 24))
        db.add(listing)
    
    db.commit()

    print("Seeding Logs...")
    actions = ["LOGIN", "CREATE_POST", "LOGOUT"]
    for i in range(15):
        user = random.choice(db_users)
        log = Log(
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
