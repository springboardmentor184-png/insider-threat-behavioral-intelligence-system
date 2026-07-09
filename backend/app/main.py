from fastapi import FastAPI
from . import models
from .database import engine
from .routes import router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Insider Threat Behavioral Intelligence System")

app.include_router(router)


@app.get("/")
def root():
    return {"message": "Insider Threat API is running"}