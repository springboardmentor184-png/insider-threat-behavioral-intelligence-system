from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal, ensure_employee_profile_schema
from routers import auth_routes, user_routes, profile_routes, analytics_routes
from employee_profile_seed import ensure_employee_profiles

Base.metadata.create_all(bind=engine)
ensure_employee_profile_schema()

app = FastAPI(title="AI Insider Threat Behavioral Intelligence System")

app.add_middleware(
    CORSMiddleware,
    # Support both common local development origins. The demo browser uses
    # 127.0.0.1 while developers often use localhost.
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(profile_routes.router)
app.include_router(analytics_routes.router)


@app.on_event("startup")
def seed_demo_employee_profiles():
    db = SessionLocal()
    try:
        ensure_employee_profiles(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Insider Threat Backend is running"}
