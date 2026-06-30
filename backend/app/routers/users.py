"""User endpoints. Used for anonymous review submission.

If a user with the same email already exists we return it (idempotent),
which keeps the frontend's "create user then create review" flow simple.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserOut

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("", response_model=UserOut)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    email = payload.email.lower()

    existing = (
        await db.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    if existing is not None:
        return existing

    user = User(name=payload.name, email=email)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
