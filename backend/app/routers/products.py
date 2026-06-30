"""Product endpoints: list (with aggregates), detail (with reviews), create."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Product, Review, User
from ..schemas import (
    ProductCreate,
    ProductDetail,
    ProductSummary,
    ReviewWithUser,
)

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductSummary])
async def list_products(db: AsyncSession = Depends(get_db)):
    """List all products with their average rating and review count."""
    # LEFT JOIN aggregate so products with no reviews still appear.
    stmt = (
        select(
            Product,
            func.coalesce(func.avg(Review.rating), 0).label("average_rating"),
            func.count(Review.id).label("review_count"),
        )
        .outerjoin(Review, Review.product_id == Product.id)
        .group_by(Product.id)
        .order_by(Product.created_at.desc())
    )
    rows = (await db.execute(stmt)).all()

    return [
        ProductSummary(
            id=product.id,
            title=product.title,
            description=product.description,
            image_url=product.image_url,
            created_at=product.created_at,
            average_rating=float(avg),
            review_count=int(count),
        )
        for product, avg, count in rows
    ]


@router.get("/{product_id}", response_model=ProductDetail)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Return a single product with all of its reviews (incl. reviewer name)."""
    product = await db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    stmt = (
        select(Review, User.name)
        .join(User, Review.user_id == User.id)
        .where(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
    )
    rows = (await db.execute(stmt)).all()

    reviews = [
        ReviewWithUser(
            id=review.id,
            product_id=review.product_id,
            user_id=review.user_id,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            user_name=user_name,
        )
        for review, user_name in rows
    ]

    review_count = len(reviews)
    average_rating = (
        sum(r.rating for r in reviews) / review_count if review_count else 0.0
    )

    return ProductDetail(
        id=product.id,
        title=product.title,
        description=product.description,
        image_url=product.image_url,
        created_at=product.created_at,
        average_rating=float(average_rating),
        review_count=review_count,
        reviews=reviews,
    )


@router.post("", response_model=ProductSummary, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)):
    """Create a new product."""
    product = Product(
        title=payload.title,
        description=payload.description,
        image_url=payload.image_url,
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)

    return ProductSummary(
        id=product.id,
        title=product.title,
        description=product.description,
        image_url=product.image_url,
        created_at=product.created_at,
        average_rating=0.0,
        review_count=0,
    )


@router.delete("/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(product)
    await db.commit()
    return {"ok": True, "id": product_id}
