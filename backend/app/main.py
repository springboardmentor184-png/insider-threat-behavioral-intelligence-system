from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import engine
from app import models
from app.routes.auth_routes import router as auth_router
from app.routes.employee_routes import router as employee_router
from app.routes.activity_routes import router as activity_router
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Insider Threat Behavioral Intelligence System")
app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(activity_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"
    return {"status": "ok", "database": db_status}

@app.get("/")
def root():
    return {"message": "ITBIS API is running"}