import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

from .routers import auth, products, reviews, seed, users

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "")

app = FastAPI(
    title="Reviewdibo API",
    description="A product review platform API built with FastAPI.",
    version="1.0.0",
)

origins = [FRONTEND_URL] if FRONTEND_URL else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(reviews.router)
app.include_router(seed.router)
app.include_router(users.router)


@app.get("/api/health", tags=["health"])
async def health():
    return {"ok": True}


@app.get("/", tags=["health"])
async def root():
    return {"message": "Reviewdibo API. See /docs for interactive documentation."}
