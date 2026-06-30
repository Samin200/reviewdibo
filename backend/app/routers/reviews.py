"""Review endpoints: list, create, update, delete."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Product, Review, User
from ..schemas import ReviewCreate, ReviewOut, ReviewUpdate

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.get("")
async def list_reviews(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(
            Review.id,
            Review.product_id,
            Review.user_id,
            Review.rating,
            Review.comment,
            Review.created_at,
            Product.title.label("product_title"),
            User.name.label("user_name"),
            User.email.label("user_email"),
        )
        .join(Product, Review.product_id == Product.id)
        .join(User, Review.user_id == User.id)
        .order_by(Review.created_at.desc())
    )
    rows = (await db.execute(stmt)).all()
    return [
        {
            "id": r.id,
            "productId": r.product_id,
            "userId": r.user_id,
            "rating": r.rating,
            "comment": r.comment,
            "createdAt": r.created_at.isoformat(),
            "productTitle": r.product_title,
            "userName": r.user_name,
            "userEmail": r.user_email,
        }
        for r in rows
    ]


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(payload: ReviewCreate, db: AsyncSession = Depends(get_db)):
    # Validate foreign keys for friendly errors.
    if await db.get(Product, payload.product_id) is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if await db.get(User, payload.user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")

    review = Review(
        product_id=payload.product_id,
        user_id=payload.user_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


@router.put("/{review_id}", response_model=ReviewOut)
async def update_review(
    review_id: int, payload: ReviewUpdate, db: AsyncSession = Depends(get_db)
):
    review = await db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")

    if payload.rating is not None:
        review.rating = payload.rating
    if payload.comment is not None:
        review.comment = payload.comment

    await db.commit()
    await db.refresh(review)
    return review


@router.delete("/{review_id}")
async def delete_review(review_id: int, db: AsyncSession = Depends(get_db)):
    review = await db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")

    await db.delete(review)
    await db.commit()
    return {"ok": True, "id": review_id}
