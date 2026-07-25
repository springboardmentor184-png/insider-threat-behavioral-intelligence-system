import pymongo
from app.config import settings

client = None
db = None

try:
    print(f"Initializing MongoDB Client: {settings.MONGODB_URL}...")
    # Timeout after 2 seconds if MongoDB isn't running on local machine
    client = pymongo.MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
    # Force connection check
    client.admin.command('ping')
    db = client[settings.MONGODB_DB]
    print(f"[OK] Successfully connected to MongoDB database: {settings.MONGODB_DB}")
except Exception as e:
    print(f"⚠️ WARNING: Could not connect to local MongoDB. Activity Log Ingestion API will run in offline demo mode. Error: {e}")
    client = None
    db = None

def get_mongo_db():
    # Returns DB instance or None if connection is inactive
    return db
