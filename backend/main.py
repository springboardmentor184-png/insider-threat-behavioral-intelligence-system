from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import models
from app.api import auth
from app.api import admin
from app.api import employees
from app.api import activities
from app.api import reports  # <-- IMPORT HERE
from app.core.mongodb import database
from app.api import risk
from app.api import ueba
from app.api import investigations
from app.api import ml_training
from app.api import notifications
app = FastAPI() 
app.include_router(investigations.router)
app.include_router(ueba.router)
app.include_router(notifications.router)
Base.metadata.create_all(bind=engine)
app.include_router(risk.router) 
app.include_router(ml_training.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTERS (MUST BE AFTER app = FastAPI()) ---
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(admin.router)
app.include_router(employees.router)
app.include_router(activities.router)
app.include_router(reports.router)  # <-- ADD THIS AFTER app = FastAPI()

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