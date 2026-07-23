from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from dotenv import load_dotenv
import os

from app.api.auth import router as auth_router
from app.api.activity import router as activity_router
from app.database import Base, engine
from app.models import user, employee, department, device, activity_event

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY
)

app.include_router(auth_router)
app.include_router(activity_router)

@app.get("/")
def home():
    return {
        "message": "Insider Threat Behavioral Intelligence System Backend is Running 🚀"
    }