from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"
MONGO_DB_NAME = "insider_threat_db"

client = AsyncIOMotorClient(MONGO_URI)
database = client[MONGO_DB_NAME]

# Collection for activity logs
activity_collection = database["activity_logs"]