"""Pydantic schemas for request validation and response serialization."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Users ----------

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: str = "user"
    created_at: datetime


# ---------- Auth ----------

class AuthRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)


class AuthLogin(BaseModel):
    email: EmailStr
    password: str


class AuthOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    token: str | None = None


# ---------- Reviews ----------

class ReviewCreate(BaseModel):
    product_id: int
    user_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1)


class ReviewUpdate(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = Field(default=None, min_length=1)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    user_id: int
    rating: int
    comment: str
    created_at: datetime


class ReviewWithUser(BaseModel):
    """Review enriched with the reviewer's name for the detail page."""

    id: int
    product_id: int
    user_id: int
    rating: int
    comment: str
    created_at: datetime
    user_name: str


# ---------- Products ----------

class ProductCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    image_url: str | None = None


class ProductSummary(BaseModel):
    """Used by the list endpoint — includes aggregates."""

    id: int
    title: str
    description: str
    image_url: str | None
    created_at: datetime
    average_rating: float
    review_count: int


class ProductDetail(ProductSummary):
    """Product list fields plus the full set of reviews."""

    reviews: list[ReviewWithUser]
