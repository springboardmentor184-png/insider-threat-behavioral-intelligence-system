from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.database import Base, engine
from app.models import user

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router)

@app.get("/")
def home():
    return {"message": "Insider Threat Behavioral Intelligence System Backend is Running 🚀"}