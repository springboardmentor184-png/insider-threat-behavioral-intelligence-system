"""
User/employee profile routes: CRUD and admin management.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.core.database import get_db
from backend.models.user import User
from backend.models.enums import UserRole
from backend.schemas.user import UserResponse, UserUpdate, RoleUpdate, UserCreate
from backend.routers.deps import get_current_user, require_role
from backend.services.auth_service import register_user
from backend.services.user_service import (
    get_user_by_id,
    get_all_users,
    update_user_profile,
    update_user_role,
    deactivate_user,
)

router = APIRouter(prefix="/api/users", tags=["Users"])


# --- Current User Profile ---

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current authenticated user's profile."""
    return await update_user_profile(db, current_user.id, update_data)


# --- Admin User Management ---

@router.post("/", response_model=UserResponse)
async def create_user_by_admin(
    user_data: UserCreate,
    current_user: User = Depends(require_role(UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
):
    """Create a new user (Administrator only)."""
    return await register_user(db, user_data, is_admin_create=True)


@router.get("/", response_model=list[UserResponse])
async def list_users(
    current_user: User = Depends(require_role(UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
):
    """List all users (Administrator only)."""
    return await get_all_users(db)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_role(UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific user by ID (Administrator only)."""
    return await get_user_by_id(db, user_id)


@router.put("/{user_id}/role", response_model=UserResponse)
async def change_user_role(
    user_id: int,
    role_data: RoleUpdate,
    current_user: User = Depends(require_role(UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
):
    """Change a user's role (Administrator only)."""
    return await update_user_role(db, user_id, role_data)


@router.delete("/{user_id}", response_model=UserResponse)
async def toggle_user_active(
    user_id: int,
    current_user: User = Depends(require_role(UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
):
    """Toggle a user's active status (Administrator only)."""
    return await deactivate_user(db, user_id)


@router.post("/{user_id}/approve", response_model=UserResponse)
async def approve_user_registration(
    user_id: int,
    current_user: User = Depends(require_role(UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
):
    """Approve a pending user registration request (Administrator only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.approval_status = "approved"
    user.is_active = True
    await db.flush()
    await db.refresh(user)
    return user


@router.post("/{user_id}/reject", response_model=UserResponse)
async def reject_user_registration(
    user_id: int,
    current_user: User = Depends(require_role(UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
):
    """Reject a pending user registration request (Administrator only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.approval_status = "rejected"
    user.is_active = False
    await db.flush()
    await db.refresh(user)
    return user
