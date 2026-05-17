import random
from collections import defaultdict
from datetime import datetime, timedelta

from database import SessionLocal, engine, Base
import models
from main import hash_password

RNG = random.Random(26)
TOTAL_LISTINGS = 100


def weighted_choice(rng, items):
    total = sum(weight for _, weight in items)
    pick = rng.uniform(0, total)
    current = 0.0
    for value, weight in items:
        current += weight
        if pick <= current:
            return value
    return items[-1][0]


def condition_roll(rng):
    return weighted_choice(
        rng,
        [
            ("new", 0.16),
            ("like-new", 0.27),
            ("good", 0.42),
            ("fair", 0.15),
        ],
    )


def status_roll(rng):
    return weighted_choice(
        rng,
        [
            ("active", 0.86),
            ("sold", 0.08),
            ("draft", 0.06),
        ],
    )


def condition_label(condition):
    return {
        "new": "brand new",
        "like-new": "like new",
        "good": "well-kept",
        "fair": "used with visible wear",
    }.get(condition, "well-kept")


def price_with_noise(rng, base, condition):
    multipliers = {
        "new": 1.12,
        "like-new": 0.98,
        "good": 0.84,
        "fair": 0.68,
    }
    jitter = rng.uniform(0.92, 1.08)
    return round(max(1, base * multipliers.get(condition, 0.85) * jitter), 2)


def random_age(rng, status):
    if status == "active":
        return timedelta(days=rng.randint(0, 60), hours=rng.randint(0, 23))
    if status == "sold":
        return timedelta(days=rng.randint(20, 180), hours=rng.randint(0, 23))
    return timedelta(days=rng.randint(1, 45), hours=rng.randint(0, 23))


def build_users(db):
    users_data = [
        {"name": "Admin User", "email": "admin@ecovalue.com", "password": "password", "role": "admin", "location": "London, UK", "bio": "System administrator for EcoValue."},
        {"name": "Phone Fan", "email": "phonefan@example.com", "password": "password", "role": "user", "location": "Istanbul, TR", "bio": "Always shopping for the next upgrade."},
        {"name": "Home Stylist", "email": "homestylist@example.com", "password": "password", "role": "user", "location": "Izmir, TR", "bio": "Loves furniture and home decor."},
        {"name": "Fashion Buyer", "email": "fashionbuyer@example.com", "password": "password", "role": "user", "location": "New York, USA", "bio": "Looks for clean fits and good brands."},
        {"name": "General Seller", "email": "sellersam@example.com", "password": "password", "role": "user", "location": "Berlin, DE", "bio": "Moves random household items quickly."},
        {"name": "Suspended User", "email": "baduser@example.com", "password": "password", "role": "user", "status": "suspended", "location": "Unknown", "bio": "I was bad."},
    ]

    users = {}
    for data in users_data:
        user = models.User(
            name=data["name"],
            email=data["email"],
            password_hash=hash_password(data["password"]),
            role=data["role"],
            status=data.get("status", "active"),
            location=data.get("location"),
            bio=data.get("bio"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        users[data["email"]] = user
    return users


PHONE_MODELS = [
    ("Apple", ["iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15"]),
    ("Samsung", ["Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S24"]),
    ("Google", ["Pixel 6", "Pixel 7", "Pixel 8"]),
    ("OnePlus", ["OnePlus 10", "OnePlus 11", "OnePlus 12"]),
    ("Xiaomi", ["Redmi Note 12", "Redmi Note 13", "Xiaomi 13T"]),
    ("Oppo", ["Reno 10", "Reno 11"]),
    ("Motorola", ["Edge 40", "Edge 50"]),
]

LAPTOP_MODELS = [
    ("Apple", ["MacBook Air M1", "MacBook Air M2", "MacBook Air M3", "MacBook Pro 14"]),
    ("Dell", ["XPS 13", "XPS 15", "Latitude 7440"]),
    ("Lenovo", ["ThinkPad X1 Carbon", "ThinkPad T14", "Yoga Slim 7"]),
    ("HP", ["Spectre x360", "Envy 13", "EliteBook 840"]),
    ("ASUS", ["ZenBook 14", "Vivobook S15", "ROG Zephyrus G14"]),
    ("Microsoft", ["Surface Laptop 5", "Surface Pro 9"]),
]

AUDIO_MODELS = [
    ("Sony", ["WH-1000XM4", "WH-1000XM5", "WF-1000XM5"]),
    ("Bose", ["QuietComfort 45", "QuietComfort Ultra"]),
    ("Apple", ["AirPods Pro 2", "AirPods 3"]),
    ("JBL", ["Tune 760NC", "Tune 510BT", "Flip 6 Speaker"]),
    ("Sennheiser", ["Momentum 4", "CX Plus"]),
]

GAMING_MODELS = [
    ("Sony", ["PlayStation 5 Slim", "DualSense Controller"]),
    ("Nintendo", ["Switch OLED", "Switch Lite"]),
    ("Microsoft", ["Xbox Series S", "Xbox Series X Controller"]),
    ("LG", ["27\" Gaming Monitor"]),
    ("ASUS", ["TUF Gaming Monitor"]),
]

CAMERA_MODELS = [
    ("Canon", ["EOS R50", "EOS M50 Mark II"]),
    ("Sony", ["Alpha a6400", "Alpha a7 III"]),
    ("Fujifilm", ["X-T30 II", "X-T5"]),
    ("Nikon", ["Z30", "Z50"]),
    ("GoPro", ["Hero 11 Black", "Hero 12 Black"]),
]

WEARABLE_MODELS = [
    ("Apple", ["Watch Series 8", "Watch Series 9"]),
    ("Samsung", ["Galaxy Watch 6", "Galaxy Watch 5"]),
    ("Garmin", ["Venu 3", "Vivoactive 5"]),
    ("Fitbit", ["Sense 2", "Versa 4"]),
]

FURNITURE_ITEMS = [
    ("IKEA", "MALM bed frame", 6800, "bed"),
    ("IKEA", "MARKUS office chair", 4200, "chairs"),
    ("IKEA", "KALLAX shelf", 3100, "storage"),
    ("Article", "Sven sofa", 18500, "sofas"),
    ("West Elm", "mid-century coffee table", 9200, "tables"),
    ("Muuto", "Outline lounge chair", 15800, "chairs"),
    ("JYSK", "dining table", 7600, "tables"),
    ("Bellona", "three-seater sofa", 14200, "sofas"),
    ("Doğtaş", "TV unit", 6500, "storage"),
    ("Tepe Home", "desk chair", 4800, "chairs"),
]

CLOTHING_ITEMS = [
    ("Nike", "Tech Fleece hoodie", 1800, "hoodies"),
    ("Adidas", "Adicolor track pants", 1400, "bottoms"),
    ("Zara", "linen blend shirt", 1100, "shirts"),
    ("Mango", "tailored blazer", 2400, "outerwear"),
    ("Levi's", "501 straight jeans", 1700, "jeans"),
    ("Uniqlo", "supima cotton tee", 650, "tops"),
    ("H&M", "oversized knit sweater", 900, "knitwear"),
    ("COS", "minimal wool coat", 3600, "outerwear"),
    ("Patagonia", "fleece jacket", 2800, "outerwear"),
    ("The North Face", "puffer jacket", 4200, "outerwear"),
    ("Massimo Dutti", "slim fit trousers", 2200, "bottoms"),
]

DECOR_ITEMS = [
    ("IKEA", "table lamp", 950, "lamps"),
    ("Zara Home", "ceramic vase", 880, "vases"),
    ("Ferm Living", "wall mirror", 3400, "mirrors"),
    ("H&M Home", "woven rug", 2100, "rugs"),
    ("Muji", "storage basket", 700, "storage"),
    ("West Elm", "abstract wall art", 2600, "wall_art"),
    ("Maison du Monde", "glass pendant light", 1900, "lamps"),
    ("Habitat", "accent mirror", 2400, "mirrors"),
]

OTHER_ITEMS = [
    ("Bosch", "cordless drill", 3100, "tools"),
    ("Trek", "Marlin 6 mountain bike", 15500, "bikes"),
    ("Giant", "hybrid bike", 12800, "bikes"),
    ("Nespresso", "coffee machine", 6800, "appliances"),
    ("Philips", "air fryer", 2600, "appliances"),
    ("Yamaha", "acoustic guitar", 7400, "music"),
    ("Canon", "office printer", 4200, "appliances"),
    ("BabyBjörn", "baby carrier", 2200, "baby"),
    ("Spalding", "basketball hoop", 3900, "sports"),
    ("Penguin", "used book bundle", 550, "books"),
]

PHONE_COLORS = ["Black", "Green", "Blue", "Silver", "Graphite", "Purple"]
LAPTOP_COLORS = ["Silver", "Space Gray", "Black", "Blue"]
AUDIO_COLORS = ["Black", "White", "Blue", "Silver"]
FURNITURE_COLORS = ["Oak", "Walnut", "White", "Black", "Beige", "Grey"]
CLOTHING_COLORS = ["Black", "White", "Navy", "Green", "Beige", "Pink", "Brown"]
DECOR_COLORS = ["Terracotta", "Cream", "Black", "Gold", "Blue", "Green"]
OTHER_COLORS = ["Black", "White", "Red", "Blue", "Green"]


def build_description(condition, brand, item, extra, accessories):
    prefix = condition_label(condition)
    tail = f"Includes {accessories}." if accessories else "Ready for pickup."
    return f"{prefix} {brand} {item}. {extra} {tail}"


def make_phone_listing(rng):
    brand, models = rng.choice(PHONE_MODELS)
    model = rng.choice(models)
    storage = rng.choice(["64GB", "128GB", "256GB", "512GB"])
    color = rng.choice(PHONE_COLORS)
    condition = condition_roll(rng)
    base = {
        "Apple": 42000,
        "Samsung": 32000,
        "Google": 28500,
        "OnePlus": 25500,
        "Xiaomi": 18000,
        "Oppo": 16500,
        "Motorola": 15000,
    }[brand]
    extra = rng.choice([
        "Battery health is strong and the screen is clean.",
        "Normal light wear only, no cracks visible.",
        "Unlocked and reset, with everything tested.",
        "Kept in a case and used mostly indoors.",
    ])
    accessories = rng.choice(["original box and charging cable", "a clear case", "charger and unused cable", "box only", "screen protector"])
    title = f"{brand} {model} {storage}"
    selected_price = price_with_noise(rng, base, condition)
    return {
        "title": title,
        "description": build_description(condition, brand, f"{model} {storage}", extra, accessories),
        "selected_price": selected_price,
        "image_url": "demo.jpg",
        "category": "electronics",
        "subcategory": "phones",
        "condition": condition,
        "status": status_roll(rng),
        "attributes": {"brand": brand, "model": model, "storage": storage, "color": color, "warranty": rng.choice(["No", "1 month", "3 months", "Box included"]), "notes": rng.choice(["Clean IMEI", "Factory reset", "Ready to ship", "Unlocked"])}
    }


def make_laptop_listing(rng):
    brand, models = rng.choice(LAPTOP_MODELS)
    model = rng.choice(models)
    ram = rng.choice(["8GB", "16GB", "32GB"])
    storage = rng.choice(["256GB SSD", "512GB SSD", "1TB SSD"])
    color = rng.choice(LAPTOP_COLORS)
    condition = condition_roll(rng)
    base = {
        "Apple": 32000,
        "Dell": 22000,
        "Lenovo": 20000,
        "HP": 19000,
        "ASUS": 21000,
        "Microsoft": 24000,
    }[brand]
    extra = rng.choice([
        "Great for work, study, or creative use.",
        "Battery still holds well for daily use.",
        "Runs smoothly and has a clean keyboard.",
        "Light scratches on the lid, nothing major.",
    ])
    accessories = rng.choice(["charger", "original charger and sleeve", "charger and box", "power adapter", "no accessories"])
    title = f"{brand} {model} {ram} {storage}"
    selected_price = price_with_noise(rng, base, condition)
    return {
        "title": title,
        "description": build_description(condition, brand, f"{model} {ram} {storage}", extra, accessories),
        "selected_price": selected_price,
        "image_url": "demo.jpg",
        "category": "electronics",
        "subcategory": "laptops",
        "condition": condition,
        "status": status_roll(rng),
        "attributes": {"brand": brand, "model": model, "ram": ram, "storage": storage, "color": color, "warranty": rng.choice(["No", "Yes", "Seller 1 month"])}
    }


def make_audio_listing(rng):
    brand, models = rng.choice(AUDIO_MODELS)
    model = rng.choice(models)
    color = rng.choice(AUDIO_COLORS)
    condition = condition_roll(rng)
    base = {
        "Sony": 7200,
        "Bose": 6800,
        "Apple": 5400,
        "JBL": 2100,
        "Sennheiser": 6000,
    }[brand]
    extra = rng.choice([
        "Sound quality is crisp and the ear pads are clean.",
        "Used lightly for commuting and work calls.",
        "Pairing works instantly and battery is healthy.",
        "Excellent for music, meetings, and travel.",
    ])
    accessories = rng.choice(["case and cable", "charging cable", "original box", "soft pouch", "no accessories"])
    title = f"{brand} {model}"
    selected_price = price_with_noise(rng, base, condition)
    return {
        "title": title,
        "description": build_description(condition, brand, model, extra, accessories),
        "selected_price": selected_price,
        "image_url": "demo.jpg",
        "category": "electronics",
        "subcategory": "audio",
        "condition": condition,
        "status": status_roll(rng),
        "attributes": {"brand": brand, "model": model, "color": color, "warranty": rng.choice(["No", "Yes", "Unknown"]), "notes": rng.choice(["Wireless", "Noise cancelling", "Bluetooth"])}
    }


def make_gaming_listing(rng):
    brand, models = rng.choice(GAMING_MODELS)
    model = rng.choice(models)
    condition = condition_roll(rng)
    base = {
        "Sony": 32000,
        "Nintendo": 13500,
        "Microsoft": 1200,
        "LG": 8500,
        "ASUS": 9000,
    }[brand]
    extra = rng.choice([
        "Perfect for weekend gaming sessions.",
        "Barely used and fully tested.",
        "Includes the essentials and works well.",
        "Great pickup for a first gaming setup.",
    ])
    accessories = rng.choice(["controller and cable", "power cable", "box and cable", "stand", "no accessories"])
    title = f"{brand} {model}"
    selected_price = price_with_noise(rng, base, condition)
    return {
        "title": title,
        "description": build_description(condition, brand, model, extra, accessories),
        "selected_price": selected_price,
        "image_url": "demo.jpg",
        "category": "electronics",
        "subcategory": "gaming",
        "condition": condition,
        "status": status_roll(rng),
        "attributes": {"brand": brand, "model": model, "notes": rng.choice(["Works great", "Clean setup", "Ready to use"])}
    }


def make_camera_listing(rng):
    brand, models = rng.choice(CAMERA_MODELS)
    model = rng.choice(models)
    condition = condition_roll(rng)
    base = {
        "Canon": 18000,
        "Sony": 24000,
        "Fujifilm": 22000,
        "Nikon": 16000,
        "GoPro": 12000,
    }[brand]
    extra = rng.choice([
        "Lens and body are both clean.",
        "Great for content creation or travel.",
        "Sensor and controls are working well.",
        "Carefully stored and lightly used.",
    ])
    accessories = rng.choice(["battery and charger", "lens cap", "camera bag", "box and charger", "no accessories"])
    title = f"{brand} {model}"
    selected_price = price_with_noise(rng, base, condition)
    return {
        "title": title,
        "description": build_description(condition, brand, model, extra, accessories),
        "selected_price": selected_price,
        "image_url": "demo.jpg",
        "category": "electronics",
        "subcategory": "cameras",
        "condition": condition,
        "status": status_roll(rng),
        "attributes": {"brand": brand, "model": model, "notes": rng.choice(["Great autofocus", "Vlogging ready", "Clean sensor"])}
    }


def make_wearable_listing(rng):
    brand, models = rng.choice(WEARABLE_MODELS)
    model = rng.choice(models)
    condition = condition_roll(rng)
    base = {
        "Apple": 11500,
        "Samsung": 8000,
        "Garmin": 9000,
        "Fitbit": 6500,
    }[brand]
    extra = rng.choice([
        "Battery lasts through the day.",
        "Clean watch face with minor strap wear.",
        "Fully reset and ready for pairing.",
        "Good for fitness tracking and notifications.",
    ])
    accessories = rng.choice(["charger", "original strap", "box and charger", "extra strap", "no accessories"])
    title = f"{brand} {model}"
    selected_price = price_with_noise(rng, base, condition)
    return {
        "title": title,
        "description": build_description(condition, brand, model, extra, accessories),
        "selected_price": selected_price,
        "image_url": "demo.jpg",
        "category": "electronics",
        "subcategory": "wearables",
        "condition": condition,
        "status": status_roll(rng),
        "attributes": {"brand": brand, "model": model, "notes": rng.choice(["Health tracking", "Bluetooth ready", "Great battery"])}
    }


def make_furniture_listing(rng):
    brand, item, base, subcategory = rng.choice(FURNITURE_ITEMS)
    condition = condition_roll(rng)
    color = rng.choice(FURNITURE_COLORS)
    dimensions = rng.choice(["80x80x75 cm", "120x60x75 cm", "160x90x75 cm", "200x90x80 cm", "60x60x90 cm"])
    room = rng.choice(["living room", "office", "dining area", "bedroom"])
    extra = rng.choice([
        "Solid and practical for everyday use.",
        "Has light cosmetic wear but feels sturdy.",
        "Fits well in a compact apartment or office.",
        "Recently cleaned and ready for pickup.",
    ])
    accessories = rng.choice(["assembly screws", "matching cushions", "chair pads", "no extras", "instruction sheet"])
    title = f"{brand} {item}".replace("  ", " ")
    selected_price = price_with_noise(rng, base, condition)
    return {
        "title": title,
        "description": build_description(condition, brand, item, extra, accessories),
        "selected_price": selected_price,
        "image_url": "demo.jpg",
        "category": "furniture",
        "subcategory": subcategory,
        "condition": condition,
        "status": status_roll(rng),
        "attributes": {"brand": brand, "material": rng.choice(["Wood", "Metal", "Fabric", "MDF", "Oak", "Walnut"]), "color": color, "dimensions": dimensions, "room": room}
    }


def make_clothing_listing(rng):
    brand, item, base, subcategory = rng.choice(CLOTHING_ITEMS)
    condition = condition_roll(rng)
    size = rng.choice(["XS", "S", "M", "L", "XL", "32", "34", "36", "38", "40"])
    color = rng.choice(CLOTHING_COLORS)
    material = rng.choice(["Cotton", "Polyester", "Wool", "Linen", "Denim", "Fleece"])
    extra = rng.choice([
        "Clean fit and ready for a new closet.",
        "Only worn a handful of times.",
        "Great for layering or everyday wear.",
        "No stains or tears noticed.",
    ])
    accessories = rng.choice(["original tag", "care label intact", "zip works well", "belt included", "no accessories"])
    title = f"{brand} {item}".replace("  ", " ")
    selected_price = price_with_noise(rng, base, condition)
    return {
        "title": title,
        "description": build_description(condition, brand, item, extra, accessories),
        "selected_price": selected_price,
        "image_url": "demo.jpg",
        "category": "clothing",
        "subcategory": subcategory,
        "condition": condition,
        "status": status_roll(rng),
        "attributes": {"brand": brand, "size": size, "material": material, "color": color, "fit": rng.choice(["Slim", "Regular", "Relaxed"])}
    }


def make_decor_listing(rng):
    brand, item, base, subcategory = rng.choice(DECOR_ITEMS)
    condition = condition_roll(rng)
    color = rng.choice(DECOR_COLORS)
    dimensions = rng.choice(["20 cm", "30 cm", "45 cm", "60 cm", "80 cm"])
    style = rng.choice(["minimal", "modern", "warm", "vintage", "contemporary"])
    extra = rng.choice([
        "Adds a clean look to any room.",
        "Works well for apartments and small spaces.",
        "Nice accent piece with no major flaws.",
        "Easy to place on shelves or side tables.",
    ])
    accessories = rng.choice(["original packaging", "mounting kit", "no extras", "hanging hardware", "care tag"])
    title = f"{brand} {item}".replace("  ", " ")
    selected_price = price_with_noise(rng, base, condition)
    return {
        "title": title,
        "description": build_description(condition, brand, item, extra, accessories),
        "selected_price": selected_price,
        "image_url": "demo.jpg",
        "category": "decor",
        "subcategory": subcategory,
        "condition": condition,
        "status": status_roll(rng),
        "attributes": {"brand": brand, "material": rng.choice(["Ceramic", "Glass", "Wood", "Metal", "Cotton", "Wool"]), "color": color, "dimensions": dimensions, "style": style}
    }


def make_other_listing(rng):
    brand, item, base, subcategory = rng.choice(OTHER_ITEMS)
    condition = condition_roll(rng)
    extra = rng.choice([
        "Useful everyday item with normal wear.",
        "Fully working and ready for pickup.",
        "A practical bundle for someone who needs it.",
        "Great value compared with buying new.",
    ])
    accessories = rng.choice(["manual", "charger", "box", "case", "no extras"])
    title = f"{brand} {item}".replace("  ", " ")
    selected_price = price_with_noise(rng, base, condition)
    return {
        "title": title,
        "description": build_description(condition, brand, item, extra, accessories),
        "selected_price": selected_price,
        "image_url": "demo.jpg",
        "category": "other",
        "subcategory": subcategory,
        "condition": condition,
        "status": status_roll(rng),
        "attributes": {"brand": brand if rng.random() > 0.3 else None, "notes": rng.choice(["Clean item", "Works well", "Good pickup", "Needs a quick wipe"])}
    }


def build_listings(db, users):
    category_plan = [
        ("electronics", 35),
        ("furniture", 25),
        ("clothing", 20),
        ("decor", 10),
        ("other", 10),
    ]

    builders = {
        "electronics": [
            (make_phone_listing, 0.48),
            (make_laptop_listing, 0.18),
            (make_audio_listing, 0.14),
            (make_gaming_listing, 0.1),
            (make_camera_listing, 0.06),
            (make_wearable_listing, 0.04),
        ],
        "furniture": [(make_furniture_listing, 1.0)],
        "clothing": [(make_clothing_listing, 1.0)],
        "decor": [(make_decor_listing, 1.0)],
        "other": [(make_other_listing, 1.0)],
    }

    author_pools = {
        "electronics": [users["phonefan@example.com"], users["sellersam@example.com"]],
        "furniture": [users["homestylist@example.com"], users["sellersam@example.com"]],
        "clothing": [users["fashionbuyer@example.com"], users["sellersam@example.com"]],
        "decor": [users["homestylist@example.com"], users["sellersam@example.com"]],
        "other": [users["sellersam@example.com"], users["phonefan@example.com"]],
    }

    created = []
    for category, count in category_plan:
        category_builders = builders[category]
        for _ in range(count):
            builder = weighted_choice(RNG, category_builders)
            listing_data = builder(RNG)
            listing_data["author_id"] = RNG.choice(author_pools[category]).id
            listing = models.Listing(**listing_data)
            listing.created_at = datetime.now() - random_age(RNG, listing.status)
            db.add(listing)
            created.append(listing)

    db.commit()
    return created


def seed_messages(db, users, listings):
    by_title = {listing.title: listing for listing in listings}
    sample_listings = [
        by_title.get("Apple iPhone 15 256GB"),
        by_title.get("IKEA MALM bed frame"),
        by_title.get("Nike Tech Fleece hoodie"),
    ]
    messages = [
        {"sender_id": users["phonefan@example.com"].id, "receiver_id": sample_listings[0].author_id if sample_listings[0] else users["sellersam@example.com"].id, "listing_id": sample_listings[0].id if sample_listings[0] else listings[0].id, "content": "Hi, is this iPhone still available?"},
        {"sender_id": sample_listings[0].author_id if sample_listings[0] else users["sellersam@example.com"].id, "receiver_id": users["phonefan@example.com"].id, "listing_id": sample_listings[0].id if sample_listings[0] else listings[0].id, "content": "Yes, it is still available."},
        {"sender_id": users["homestylist@example.com"].id, "receiver_id": sample_listings[1].author_id if sample_listings[1] else users["sellersam@example.com"].id, "listing_id": sample_listings[1].id if sample_listings[1] else listings[1].id, "content": "Can you share the dimensions?"},
        {"sender_id": sample_listings[1].author_id if sample_listings[1] else users["sellersam@example.com"].id, "receiver_id": users["homestylist@example.com"].id, "listing_id": sample_listings[1].id if sample_listings[1] else listings[1].id, "content": "Sure, I will send them now."},
        {"sender_id": users["fashionbuyer@example.com"].id, "receiver_id": sample_listings[2].author_id if sample_listings[2] else users["sellersam@example.com"].id, "listing_id": sample_listings[2].id if sample_listings[2] else listings[2].id, "content": "Would this fit a size medium?"},
    ]
    for message in messages:
        db.add(models.Message(**message))
    db.commit()


def seed_logs(db, users):
    actions = ["LOGIN", "CREATE_POST", "LOGOUT", "UPDATE_PROFILE", "OPEN_FEED"]
    for _ in range(40):
        user = RNG.choice(list(users.values()))
        db.add(
            models.Log(
                timestamp=datetime.now() - timedelta(days=RNG.randint(0, 14), hours=RNG.randint(0, 23)),
                user_id=user.id,
                role=user.role,
                action=RNG.choice(actions),
                result="SUCCESS" if RNG.random() > 0.08 else "FAILED",
                ip=f"192.168.1.{RNG.randint(1, 255)}",
            )
        )
    db.commit()


def seed_feed_events(db, users, listings):
    listings_by_category = defaultdict(list)
    for listing in listings:
        if listing.status == "active":
            listings_by_category[listing.category].append(listing)

    phone_listings = [l for l in listings_by_category["electronics"] if (l.subcategory or "") == "phones"]
    furniture_listings = [l for l in listings_by_category["furniture"]]
    decor_listings = [l for l in listings_by_category["decor"]]
    clothing_listings = [l for l in listings_by_category["clothing"]]

    phone_user = users["phonefan@example.com"]
    home_user = users["homestylist@example.com"]
    fashion_user = users["fashionbuyer@example.com"]

    phone_queries = ["iphone 15", "phone", "samsung galaxy", "pixel phone", "used iphone"]
    for query in phone_queries:
        db.add(models.FeedEvent(user_id=phone_user.id, event_type="search", category="electronics", query=query, event_metadata={"source": "seed"}))
    for listing in RNG.sample(phone_listings, min(10, len(phone_listings))):
        db.add(models.FeedEvent(user_id=phone_user.id, event_type="open", listing_id=listing.id, category=listing.category, event_metadata={"source": "seed"}))
    for listing in RNG.sample(phone_listings, min(5, len(phone_listings))):
        db.add(models.FeedEvent(user_id=phone_user.id, event_type="favorite", listing_id=listing.id, category=listing.category, event_metadata={"source": "seed"}))
    for listing in RNG.sample(phone_listings, min(8, len(phone_listings))):
        db.add(models.FeedEvent(user_id=phone_user.id, event_type="impression", listing_id=listing.id, category=listing.category, event_metadata={"source": "seed"}))

    home_queries = ["sofa", "coffee table", "desk chair", "home decor"]
    for query in home_queries:
        db.add(models.FeedEvent(user_id=home_user.id, event_type="search", category="furniture", query=query, event_metadata={"source": "seed"}))
    for listing in RNG.sample(furniture_listings, min(8, len(furniture_listings))):
        db.add(models.FeedEvent(user_id=home_user.id, event_type="open", listing_id=listing.id, category=listing.category, event_metadata={"source": "seed"}))
    for listing in RNG.sample(decor_listings, min(4, len(decor_listings))):
        db.add(models.FeedEvent(user_id=home_user.id, event_type="favorite", listing_id=listing.id, category=listing.category, event_metadata={"source": "seed"}))

    fashion_queries = ["nike hoodie", "zara shirt", "levi jeans", "winter jacket"]
    for query in fashion_queries:
        db.add(models.FeedEvent(user_id=fashion_user.id, event_type="search", category="clothing", query=query, event_metadata={"source": "seed"}))
    for listing in RNG.sample(clothing_listings, min(8, len(clothing_listings))):
        db.add(models.FeedEvent(user_id=fashion_user.id, event_type="open", listing_id=listing.id, category=listing.category, event_metadata={"source": "seed"}))

    db.commit()


def seed_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding users...")
        users = build_users(db)

        print("Seeding listings...")
        listings = build_listings(db, users)
        if len(listings) != TOTAL_LISTINGS:
            raise RuntimeError(f"Expected {TOTAL_LISTINGS} listings, got {len(listings)}")

        print("Seeding messages...")
        seed_messages(db, users, listings)

        print("Seeding logs...")
        seed_logs(db, users)

        print("Seeding feed events...")
        seed_feed_events(db, users, listings)

        print(f"Database seeding completed successfully with {len(listings)} listings.")
        print("Demo accounts:")
        print("  phonefan@example.com / password")
        print("  homestylist@example.com / password")
        print("  fashionbuyer@example.com / password")
        print("  sellersam@example.com / password")
        print("  admin@ecovalue.com / password")
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
