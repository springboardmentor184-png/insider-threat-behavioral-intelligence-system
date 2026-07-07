import time
import jwt
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.jwt_handler import JWT_SECRET, JWT_ALGORITHM

# This tells FastAPI to look for a Bearer token in the headers
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    
    # Decode the token directly. Expiration is verified manually below.
    decoded_token = jwt.decode(
        token, 
        JWT_SECRET, 
        algorithms=[JWT_ALGORITHM], 
        options={"verify_exp": False}
    )
    
    # Check expiration manually
    if decoded_token.get("expires", 0) < time.time():
        raise HTTPException(status_code=403, detail="Token has expired. Please log in again.")
        
    return decoded_token

# RBAC Enforcer: Only allows Administrators
def require_admin(token_data: dict = Depends(verify_token)):
    if token_data.get("role") != "Administrator":
        raise HTTPException(status_code=403, detail="Insufficient privileges. Admin access required.")
    return token_data

# RBAC Enforcer: Allows SOC Engineers and above
def require_soc_engineer(token_data: dict = Depends(verify_token)):
    allowed_roles = ["SOC Engineer", "Security Manager", "Administrator"]
    if token_data.get("role") not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient privileges. SOC Engineer access required.")
    return token_data