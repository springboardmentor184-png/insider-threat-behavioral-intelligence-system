from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from jose import jwt
from pydantic import BaseModel
import datetime

# ✅ Database connection
DATABASE_URL = "postgresql://postgres:Goutham543@localhost:5432/insider_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# 🔐 Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 📊 Models
class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)   # usernames can repeat
    email = Column(String(150), unique=True, nullable=False)  # Gmail must be unique
    password_hash = Column(Text, nullable=False)
    role_name = Column(String(50), nullable=False)   # ✅ store role name directly
    department = Column(String(100))
    designation = Column(String(100))
    created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)

class LoginActivity(Base):
    __tablename__ = "login_activities"
    activity_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    username = Column(String(100))   # ✅ store username
    login_time = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    logout_time = Column(TIMESTAMP, nullable=True)
    ip_address = Column(String(45))
    device_info = Column(Text)
    status = Column(String(20))

# ✅ Create tables in insider_db
Base.metadata.create_all(bind=engine)

# 🚀 FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# 🔧 Helpers
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

# 📑 Schemas
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role_name: str
    department: str | None = None
    designation: str | None = None

# 🛠 Routes
@app.post("/register")
def register(req: RegisterRequest):
    db = SessionLocal()

    # ✅ Only check for duplicate Gmail
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="⚠️ Gmail already registered")

    # Create new user (username can repeat, role stored as name)
    user = User(
        username=req.username,
        email=req.email,
        password_hash=get_password_hash(req.password),
        role_name=req.role_name,
        department=req.department,
        designation=req.designation
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"msg": "✅ User registered successfully", "user_id": user.user_id}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    # Login via Gmail (email field)
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Record login activity with username
    activity = LoginActivity(
        user_id=user.user_id,
        username=user.username,
        ip_address="127.0.0.1",   # Replace with real IP if needed
        device_info="Browser",
        status="SUCCESS"
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    token = create_access_token({"sub": user.email, "role": user.role_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role_name,
        "activity_id": activity.activity_id
    }

@app.post("/logout/{activity_id}")
def logout(activity_id: int):
    db = SessionLocal()
    activity = db.query(LoginActivity).filter(LoginActivity.activity_id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    activity.logout_time = datetime.datetime.utcnow()
    db.commit()
    return {"msg": "Logout recorded"}
