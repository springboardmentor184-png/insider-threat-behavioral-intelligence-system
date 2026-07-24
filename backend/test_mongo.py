import asyncio 
from motor.motor_asyncio import AsyncIOMotorClient 
 
async def test_connection(): 
    try: 
        client = AsyncIOMotorClient("mongodb://localhost:27017") 
        db = client["test_db"] 
        await db.command("ping") 
        print("? MongoDB connection successful!") 
    except Exception as e: 
        print(f"? MongoDB connection failed: {e}") 
 
asyncio.run(test_connection()) 
