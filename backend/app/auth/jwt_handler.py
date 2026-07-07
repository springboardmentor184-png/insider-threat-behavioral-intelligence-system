import time
import jwt

# In a production environment, this secret is hidden in the .env file
JWT_SECRET = "insider_threat_super_secret_key_123"
JWT_ALGORITHM = "HS256"

def sign_jwt(user_email: str, role: str):
    # Set the token to expire in 1 hour (3600 seconds)
    payload = {
        "user_email": user_email,
        "role": role,
        "expires": time.time() + 3600 
    }
    
    # Generate the actual token string
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return {"access_token": token, "token_type": "bearer"}