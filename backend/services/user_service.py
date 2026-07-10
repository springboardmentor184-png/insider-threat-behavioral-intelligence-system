"""
User profile service: CRUD operations for user/employee profiles.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from backend.models.user import User
from backend.models.enums import UserRole
from backend.schemas.user import UserUpdate, RoleUpdate


async def get_user_by_id(db: AsyncSession, user_id: int) -> User:
    """Get a user by their ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


async def get_all_users(db: AsyncSession) -> list[User]:
    """Get all users (admin use)."""
    result = await db.execute(select(User).order_by(User.id))
    return list(result.scalars().all())


async def update_user_profile(db: AsyncSession, user_id: int, update_data: UserUpdate) -> User:
    """Update a user's profile fields."""
    user = await get_user_by_id(db, user_id)

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return user


async def update_user_role(db: AsyncSession, user_id: int, role_data: RoleUpdate) -> User:
    """Update a user's role (admin only)."""
    user = await get_user_by_id(db, user_id)
    user.role = role_data.role
    await db.flush()
    await db.refresh(user)
    return user


async def deactivate_user(db: AsyncSession, user_id: int) -> User:
    """Deactivate a user account (admin only)."""
    user = await get_user_by_id(db, user_id)
    user.is_active = not user.is_active  # Toggle active status
    await db.flush()
    await db.refresh(user)
    return user
