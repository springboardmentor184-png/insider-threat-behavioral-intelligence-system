from fastapi import FastAPI
from app.database import engine, Base
from app.models import user_model
from app.routes import auth_routes,user_routes
# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Insider Threat Behavioral Intelligence API")

# Connect the authentication routes to the main app
app.include_router(auth_routes.router)
app.include_router(user_routes.router)

@app.get("/")
def read_root():
    return {"status": "Active", "message": "Secure Backend is running."}