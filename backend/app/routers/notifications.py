from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from app.mongodb import get_mongo_db
from app.models import User
from app.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/api/notifications", tags=["Notification Center"])

require_read = RoleChecker(["Administrator", "Security Analyst", "SOC Engineer", "Security Manager"])

@router.get("")
def get_recent_notifications(
    limit: int = 50,
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_read)
):
    """
    Retrieves recent system notifications (threat alerts, case assignments, risk escalations).
    """
    if db is None:
        return []

    query = {
        "$or": [
            {"recipient": current_user.email},
            {"recipient": current_user.role},
            {"recipient": "ALL"}
        ]
    }
    cursor = db.notifications.find(query).sort("created_at", -1).limit(limit)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

@router.put("/{notif_id}/read")
def mark_notification_as_read(
    notif_id: str,
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_read)
):
    """
    Marks a specific notification as read.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database offline.")

    try:
        result = db.notifications.update_one(
            {"_id": ObjectId(notif_id)},
            {"$set": {"is_read": True}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {e}")

    return {"status": "success", "message": "Notification marked as read."}

@router.post("/clear-all")
def mark_all_notifications_as_read(
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_read)
):
    """
    Marks all unread notifications as read.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database offline.")

    query = {
        "is_read": False,
        "$or": [
            {"recipient": current_user.email},
            {"recipient": current_user.role},
            {"recipient": "ALL"}
        ]
    }
    try:
        db.notifications.update_many(
            query,
            {"$set": {"is_read": True}}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear notifications: {e}")

    return {"status": "success", "message": "All notifications marked as read."}
