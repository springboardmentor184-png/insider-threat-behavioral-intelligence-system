from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import models
from app.api import auth
from app.api import admin
from app.api import employees
from app.api import activities
from app.api import anomaly  # <-- Import here
from app.core.mongodb import database

Base.metadata.create_all(bind=engine)

app = FastAPI()  # <-- app is CREATED HERE

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ALL routers go AFTER app = FastAPI()
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(admin.router)
app.include_router(employees.router)
app.include_router(activities.router)
app.include_router(anomaly.router)  # <-- This MUST be AFTER app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "AI Insider Threat System is Online!"}

@app.on_event("startup")
async def startup_db_client():
    try:
        await database.command("ping")
        print("✅ MongoDB connected successfully!")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")