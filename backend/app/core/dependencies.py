from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
from typing import List, Optional
from app.database import get_db
from app.config import settings
from app.models.models import User

security = HTTPBearer(auto_error=False)

def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = None
    
    # 1. Try to extract from Authorization Header
    if credentials:
        token = credentials.credentials
        
    # 2. Try to extract from HttpOnly Cookies (Secure cookie fallback)
    if not token:
        token = request.cookies.get("access_token")
        
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
        
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        subject: str = payload.get("sub")
        token_type = payload.get("type")
        
        # Block refresh tokens from acting as access tokens
        if token_type == "refresh" or subject is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    # Support lookup via username OR email
    user = db.query(User).filter((User.username == subject) | (User.email == subject)).first()
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
        
    return user

def require_roles(allowed_roles: List[str]):
    def role_verifier(current_user: User = Depends(get_current_user)):
        if current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden. This action requires one of the following roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_verifier
