from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserOut
from dependencies import get_current_user, require_role

router = APIRouter()


# Any logged-in user (any role) can access this - just checks a valid token exists
@router.get("/users/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


# Only admin and manager roles can view the full employee list
@router.get("/users", response_model=list[UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
):
    return db.query(User).all()


# Only admin can change another user's role
@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    user.role = new_role
    db.commit()
    db.refresh(user)
    return {"message": f"Role updated to {new_role} for user {user_id}"}