from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from dotenv import load_dotenv
import os

from app.api.auth import router as auth_router
from app.database import Base, engine
from app.models import user, employee, department, device

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY
)

app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "message": "Insider Threat Behavioral Intelligence System Backend is Running 🚀"
    }