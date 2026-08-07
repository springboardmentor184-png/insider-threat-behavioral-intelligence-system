# backend/app/core/mongodb.py
import json
import os
import uuid
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = "insider_threat_db"
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
JSON_STORAGE_PATH = os.path.join(BACKEND_DIR, "activity_logs.json")

def load_json_storage():
    if os.path.exists(JSON_STORAGE_PATH):
        try:
            with open(JSON_STORAGE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                for doc in data:
                    if "timestamp" in doc and isinstance(doc["timestamp"], str):
                        try:
                            doc["timestamp"] = datetime.fromisoformat(doc["timestamp"])
                        except Exception:
                            pass
                return data
        except Exception:
            return []
    return []

def save_json_storage(items):
    try:
        json_ready = []
        for item in items:
            copy_item = dict(item)
            if "timestamp" in copy_item and isinstance(copy_item["timestamp"], datetime):
                copy_item["timestamp"] = copy_item["timestamp"].isoformat()
            json_ready.append(copy_item)
        with open(JSON_STORAGE_PATH, "w", encoding="utf-8") as f:
            json.dump(json_ready, f, indent=2)
    except Exception as e:
        print(f"Error saving JSON storage: {e}")

_storage = load_json_storage()

class LocalInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class FallbackCursor:
    def __init__(self, items):
        self._items = items

    def sort(self, key, direction=-1):
        def _sort_key(item):
            val = item.get(key)
            if isinstance(val, datetime):
                return val.timestamp()
            return val or 0
        self._items.sort(key=_sort_key, reverse=(direction == -1))
        return self

    def skip(self, n):
        self._items = self._items[n:]
        return self

    def limit(self, n):
        self._items = self._items[:n]
        return self

    async def to_list(self, length=1000):
        res = []
        for doc in self._items[:length]:
            copy_doc = dict(doc)
            if "_id" not in copy_doc:
                copy_doc["_id"] = str(uuid.uuid4())
            res.append(copy_doc)
        return res

class FallbackActivityCollection:
    def __init__(self):
        self.items = _storage

    async def insert_one(self, doc):
        new_doc = dict(doc)
        if "_id" not in new_doc:
            new_doc["_id"] = str(uuid.uuid4())
        self.items.append(new_doc)
        save_json_storage(self.items)
        return LocalInsertResult(new_doc["_id"])

    async def insert_many(self, docs):
        res = []
        for doc in docs:
            r = await self.insert_one(doc)
            res.append(r.inserted_id)
        return res

    def find(self, query=None):
        # Reload latest storage from file in case another process updated it
        current_items = load_json_storage()
        query = query or {}
        matched = []
        for item in current_items:
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                matched.append(item)
        return FallbackCursor(matched)

    async def count_documents(self, query=None):
        cursor = self.find(query)
        res = await cursor.to_list(10000)
        return len(res)

client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=500)
database = client[MONGO_DB_NAME]
raw_activity_collection = database["activity_logs"]
fallback_collection = FallbackActivityCollection()

class SafeActivityCollection:
    def __getattr__(self, name):
        attr = getattr(raw_activity_collection, name)
        if callable(attr):
            async def wrapper(*args, **kwargs):
                try:
                    return await attr(*args, **kwargs)
                except Exception:
                    fallback_attr = getattr(fallback_collection, name)
                    return await fallback_attr(*args, **kwargs)
            return wrapper
        return attr

    def find(self, *args, **kwargs):
        try:
            return raw_activity_collection.find(*args, **kwargs)
        except Exception:
            return fallback_collection.find(*args, **kwargs)

activity_collection = SafeActivityCollection()