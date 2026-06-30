"""Seed the database with sample products, users, and reviews.

Usage:
    python seed.py

This is idempotent: it skips seeding if products already exist.
"""

import asyncio

from passlib.context import CryptContext
from sqlalchemy import select

from app.database import AsyncSessionLocal, Base, engine
from app.models import Product, Review, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PRODUCTS = [
    {
        "title": 'MacBook Pro 14"',
        "description": (
            "Premium laptop for professionals. Powered by Apple's M3 chip with stunning "
            "Liquid Retina XDR display, 18-hour battery life, and pro-level performance "
            "for creative workflows."
        ),
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
    },
    {
        "title": "Sony WH-1000XM5 Headphones",
        "description": (
            "Industry-leading noise cancelling with two processors controlling eight microphones. "
            "Exceptional sound quality and crystal-clear hands-free calling."
        ),
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    },
    {
        "title": "Keychron K2 Keyboard",
        "description": (
            "Compact 75% layout wireless mechanical keyboard with hot-swappable switches. "
            "Connects via Bluetooth or USB-C. Perfect for Mac and Windows users."
        ),
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
    },
    {
        "title": "Samsung 4K Monitor",
        "description": (
            "27-inch UHD IPS display with HDR10 support. 99% sRGB color accuracy makes it "
            "ideal for photo editing, design work, and immersive entertainment."
        ),
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    },
    {
        "title": "Logitech MX Master 3 Mouse",
        "description": (
            "Advanced wireless mouse with MagSpeed electromagnetic scrolling. Ergonomic design "
            "crafted for power users, coders, and creative professionals."
        ),
        "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
    },
    {
        "title": 'iPad Pro 12.9"',
        "description": (
            "Ultimate creative tablet with M2 chip and Liquid Retina XDR display. Supports "
            "Apple Pencil hover and Magic Keyboard for laptop-like productivity."
        ),
        "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
    },
    {
        "title": "Anker PowerBank 26800mAh",
        "description": (
            "High-capacity portable charger with triple USB ports. Power up to three devices "
            "simultaneously. Perfect for travel, camping, and long commutes."
        ),
        "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800",
    },
    {
        "title": "Bose QuietComfort Earbuds",
        "description": (
            "True wireless noise cancelling earbuds with customizable fit. World-class quiet, "
            "lifelike sound, and secure stay-hear tips for all-day comfort."
        ),
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    },
    {
        "title": 'LG 34" Ultrawide Monitor',
        "description": (
            "Curved 21:9 ultrawide display for multitaskers. Split-screen functionality and "
            "vibrant colors. Ideal for traders, developers, and content creators."
        ),
        "image_url": "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800",
    },
    {
        "title": "Apple Watch Series 9",
        "description": (
            "Advanced health and fitness tracking with double-tap gesture. Temperature sensing, "
            "blood oxygen monitoring, and crash detection keep you informed and safe."
        ),
        "image_url": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
    },
]

USERS = [
    {"name": "James Carter", "email": "james@email.com"},
    {"name": "Sarah Ahmed", "email": "sarah@email.com"},
    {"name": "Marcus Lee", "email": "marcus@email.com"},
    {"name": "Priya Nair", "email": "priya@email.com"},
    {"name": "David Kim", "email": "david@email.com"},
    {"name": "Layla Hassan", "email": "layla@email.com"},
]

# (product_index, user_index, rating, comment)
REVIEWS = [
    # MacBook Pro - 3 reviews
    (
        0, 0, 5,
        "Absolutely incredible machine. The M3 chip handles everything I throw at it - "
        "4K video editing, Xcode builds, even gaming. Battery easily lasts through a full "
        "workday plus evening Netflix. The display is the best I've ever used on a laptop. Worth every penny!"
    ),
    (
        0, 1, 5,
        "Best laptop I've ever owned. The build quality is exceptional, keyboard is a joy "
        "to type on, and it runs completely silent for most tasks. Only downside is the price, "
        "but for professional use it's justified."
    ),
    (
        0, 4, 4,
        "Great performance but I miss having more ports. Dongle life is annoying. "
        "Otherwise a fantastic machine that replaced my desktop setup."
    ),
    # Sony Headphones - 2 reviews
    (
        1, 2, 5,
        "The noise cancellation is witchcraft. I wear these on the subway every day and "
        "can't hear a thing. Sound quality is crisp with punchy bass. The speak-to-chat feature is surprisingly useful."
    ),
    (
        1, 5, 4,
        "Excellent headphones overall. The call quality is crystal clear according to my colleagues. "
        "They're a bit bulky for travel though, and the case takes up significant bag space."
    ),
    # Keychron - 2 reviews
    (
        2, 3, 5,
        "Perfect for my WFH setup. The brown switches are satisfying without being too loud "
        "for calls. Bluetooth connectivity is reliable and battery lasts weeks. Love that it works seamlessly with both my Mac and PC."
    ),
    (
        2, 0, 3,
        "Good keyboard but the keycaps feel a bit cheap. Also had some Bluetooth dropout issues initially. "
        "Switches sound great though and the compact size is perfect for my small desk."
    ),
    # Samsung Monitor - 2 reviews
    (
        3, 1, 5,
        "Color accuracy is spot-on for my photography work. The 4K resolution makes everything "
        "look crisp. HDR content looks stunning. Stand is adjustable and build quality feels premium."
    ),
    (
        3, 2, 4,
        "Great monitor for the price. Colors are vibrant and the IPS panel has good viewing angles. "
        "Wish it had USB-C connectivity for single-cable laptop setup though."
    ),
    # MX Master 3 - 2 reviews
    (
        4, 4, 5,
        "This mouse has genuinely improved my productivity. The horizontal scroll wheel is "
        "perfect for Excel and video editing. Ergonomics are excellent - no more wrist pain after long sessions."
    ),
    (
        4, 5, 5,
        "Game changer for creative work. The customizable buttons and gestures save so much time. "
        "Battery lasts forever and charges quickly via USB-C."
    ),
    # iPad Pro - 2 reviews
    (
        5, 3, 4,
        "The M2 chip is incredibly fast and the display is gorgeous for drawing. I use it as "
        "my primary design tool with Procreate. iPadOS still has some limitations compared to macOS though."
    ),
    (
        5, 1, 5,
        "Replaced my laptop completely. The Magic Keyboard makes it feel like a real computer, "
        "and the pencil is perfect for note-taking. Apple Pencil hover is a subtle but useful feature."
    ),
    # Anker PowerBank - 2 reviews
    (
        6, 2, 5,
        "Essential for travel. Charged my iPhone 7 times and iPad twice on a week-long trip. "
        "The three ports mean I can charge all my devices overnight. Robust build quality too."
    ),
    (
        6, 0, 4,
        "Massive capacity and reliable. A bit heavy to carry around daily, but perfect for "
        "flights and camping. Delivery was faster than expected."
    ),
    # Bose Earbuds - 2 reviews
    (
        7, 5, 5,
        "Finally, earbuds that fit my ears! The wing tips keep them secure during runs. "
        "Sound is balanced and the noise cancellation is impressive for earbuds. Transparency mode sounds natural."
    ),
    (
        7, 3, 4,
        "Great for workouts and commuting. The fit is comfortable for hours. "
        "Wish they had wireless charging case at this price point though."
    ),
    # LG Ultrawide - 1 review
    (
        8, 4, 5,
        "Transformed my coding workflow. Having three full windows side-by-side is incredible. "
        "The curve is subtle and immersive. Colors are accurate enough for my UI design work."
    ),
    # Apple Watch - 2 reviews
    (
        9, 1, 5,
        "The double-tap gesture is surprisingly useful when my hands are full. Sleep tracking "
        "helped me improve my sleep schedule. Battery easily lasts a full day with workouts."
    ),
    (
        9, 2, 4,
        "Excellent fitness companion. The heart rate monitoring is accurate compared to my "
        "chest strap. Always-on display is convenient. Wish battery lasted longer for multi-day trips."
    ),
]


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        existing = (await db.execute(select(Product))).scalars().first()
        if existing is not None:
            print("Database already seeded — skipping.")
            return

        products = [Product(**p) for p in PRODUCTS]
        regular_users = [User(**u) for u in USERS]
        admin_user = User(
            name="Admin",
            email="admin@reviewdibo.com",
            role="admin",
            password_hash=pwd_context.hash("admin123"),
        )
        all_users = regular_users + [admin_user]
        db.add_all(products + all_users)
        await db.commit()
        for obj in products + all_users:
            await db.refresh(obj)

        reviews = [
            Review(
                product_id=products[pi].id,
                user_id=all_users[ui].id,
                rating=rating,
                comment=comment,
            )
            for pi, ui, rating, comment in REVIEWS
        ]
        db.add_all(reviews)
        await db.commit()
        print(f"Seeded {len(products)} products, {len(all_users)} users, {len(reviews)} reviews.")


if __name__ == "__main__":
    asyncio.run(seed())
