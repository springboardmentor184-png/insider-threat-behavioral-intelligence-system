"""
Authentication service: registration, login, and Google OAuth2.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from backend.models.user import User
from backend.models.enums import UserRole
from backend.schemas.user import UserCreate
from backend.core.security import hash_password, verify_password, create_access_token


async def register_user(db: AsyncSession, user_data: UserCreate, is_admin_create: bool = False) -> User:
    """Register a new user with hashed password."""
    # Check duplicate email
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Check duplicate username
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
        is_active=True if is_admin_create else False,
        approval_status="approved" if is_admin_create else "pending",
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    """Authenticate a user by email and password."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses OAuth2 login. Please sign in with Google.",
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check approval status first
    if user.approval_status == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account registration is pending administrator approval.",
        )
    elif user.approval_status == "rejected":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account registration request has been denied.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact your administrator.",
        )

    return user


async def get_or_create_oauth_user(db: AsyncSession, oauth_data: dict) -> User:
    """Find or create a user from Google OAuth2 profile data."""
    email = oauth_data.get("email")
    oauth_id = oauth_data.get("sub")
    full_name = oauth_data.get("name", "")
    picture = oauth_data.get("picture", "")

    # Check if user exists by email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        # Update OAuth info if not already set
        if not user.oauth_provider:
            user.oauth_provider = "google"
            user.oauth_id = oauth_id
        if picture and not user.profile_image:
            user.profile_image = picture
        await db.flush()
        await db.refresh(user)
        return user

    # Create new user
    # Generate a username from email
    username = email.split("@")[0]
    # Ensure uniqueness
    result = await db.execute(select(User).where(User.username == username))
    if result.scalar_one_or_none():
        username = f"{username}_{oauth_id[:6]}"

    # Self-registered OAuth users are approved automatically if we decide, 
    # but to be safe let's make OAuth self-registrations approved directly by default.
    user = User(
        email=email,
        username=username,
        full_name=full_name,
        hashed_password=None,
        role=UserRole.SECURITY_ANALYST,
        profile_image=picture,
        oauth_provider="google",
        oauth_id=oauth_id,
        is_active=True,
        approval_status="approved",
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


def generate_token(user: User) -> str:
    """Generate a JWT token for a user."""
    return create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
