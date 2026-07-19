from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import Base, engine
from api.auth import router as auth_router
from api.employees import router as employees_router
from api.logs import router as logs_router

app = FastAPI(
    title="Insider Threat Behavioral Intelligence System",
    description="AI-powered insider threat detection & behavioral analytics platform",
    version="0.1.0",
)
app.include_router(auth_router)
app.include_router(employees_router)
app.include_router(logs_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"status": "online", "system": "Insider Threat Behavioral Intelligence System"}