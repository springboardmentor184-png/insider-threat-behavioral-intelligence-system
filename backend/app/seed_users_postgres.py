# Auto-generated database seeding scripts
from sqlalchemy.orm import Session
from app.models.models import User
from app.core.security import get_password_hash
import json
import os

def seed_100_users(db: Session):
    if db.query(User).count() > 5:
        # Dataset already loaded
        return
        
    json_path = "mock_users_dataset.json"
    if not os.path.exists(json_path):
        return
        
    with open(json_path, "r") as f:
        users = json.load(f)
        
    for u in users:
        # Verify user does not exist
        if db.query(User).filter(User.email == u["email"]).first():
            continue
            
        db_user = User(
            full_name=u["full_name"],
            username=u["username"],
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            google_id=u["google_id"],
            profile_picture=u["profile_picture"],
            auth_provider=u["auth_provider"],
            email_verified=u["email_verified"],
            role_id=u["role_id"]
        )
        db.add(db_user)
    db.commit()
    print("Successfully seeded 100 diverse mock users.")
