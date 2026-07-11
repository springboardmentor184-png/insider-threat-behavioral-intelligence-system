from fastapi import FastAPI

from app.routes.home import router as home_router
from app.routes.employee import router as employee_router
from app.database.database import Base, engine
from app.routes.auth import router as auth_router
from app.routes.activity import router as activity_router
from app.routes.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware

# Import all models
import app.database.base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Insider Threat Behavioral Intelligence System",
    description="AI-powered Insider Threat Detection API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(home_router)
app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(activity_router)
app.include_router(dashboard_router)