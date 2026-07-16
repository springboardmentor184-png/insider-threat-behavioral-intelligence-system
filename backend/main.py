# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Add this
from app.core.database import engine, Base
from app.models import models
from app.api import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- ADD THIS SECTION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # This is your React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
 )
# -----------------------

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
async def read_root():
    return {"message": "AI Insider Threat System is Online!"}