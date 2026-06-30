"""FastAPI application entrypoint.

- Enables permissive CORS for development.
- Mounts the products, reviews, and users routers.
- Exposes Swagger docs at /docs (default) and a health check at /api/health.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, products, reviews, seed, users

app = FastAPI(
    title="Reviewdibo API",
    description="A product review platform API built with FastAPI.",
    version="1.0.0",
)

# Allow all origins during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
