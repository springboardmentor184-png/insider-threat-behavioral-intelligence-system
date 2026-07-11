from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.base import Base
from app.database.session import engine
from app.models.employee import Employee
from app.models.department import Department
from app.models.role import Role
from app.models.activity import ActivityLog

# Create all tables in the database
Base.metadata.create_all(bind=engine)

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.employee import router as employee_router
from app.api.v1.activity import router as activity_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.health import router as health_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Insider Threat Behavioral Intelligence Platform API",
    version=settings.VERSION,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router, prefix="/health", tags=["Health"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(employee_router, prefix="/api/v1/employees", tags=["Employees"])
app.include_router(activity_router, prefix="/api/v1/activities", tags=["Activities"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["Dashboard"])

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Running"
    }
