import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.jwt_handler import get_current_user
from app.models.activity_event import ActivityEvent
from app.models.employee import EmployeeProfile
from app.schemas.activity_event import (
    ActivityEventCreate,
    ActivityEventResponse,
    BulkIngestResponse,
)

router = APIRouter(prefix="/activity", tags=["Activity Monitoring"])


@router.post("/event", response_model=ActivityEventResponse)
def create_event(
    event: ActivityEventCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """For live/real-time single events tied to a known employee."""
    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.id == event.employee_id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    new_event = ActivityEvent(
        source_user_id=employee.employee_id,
        employee_id=employee.id,
        event_type=event.event_type,
        timestamp=event.timestamp,
        source=event.source,
        details=event.details,
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


@router.post("/ingest", response_model=BulkIngestResponse)
async def bulk_ingest(
    file: UploadFile = File(...),
    source: str = Form("dataset"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    For loading CERT/LANL/CMU dataset CSVs.
    Expected columns: source_user_id, event_type, timestamp
    (any other columns are stored as-is in `details`)
    """
    contents = await file.read()
    decoded = contents.decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))

    inserted = 0
    skipped = 0
    errors = []

    for i, row in enumerate(reader):
        try:
            source_user_id = row.get("source_user_id")
            event_type = row.get("event_type")
            timestamp_raw = row.get("timestamp")

            if not source_user_id or not event_type or not timestamp_raw:
                skipped += 1
                continue

            timestamp = datetime.fromisoformat(timestamp_raw)

            extra = {
                k: v for k, v in row.items()
                if k not in ("source_user_id", "event_type", "timestamp")
            }

            new_event = ActivityEvent(
                source_user_id=source_user_id,
                employee_id=None,  # resolved later during enrichment
                event_type=event_type,
                timestamp=timestamp,
                source=source,
                details=extra,
            )

            db.add(new_event)
            inserted += 1

        except Exception as e:
            skipped += 1
            errors.append(f"Row {i}: {str(e)}")

    db.commit()

    return BulkIngestResponse(
        message="Ingestion complete",
        inserted=inserted,
        skipped=skipped,
        errors=errors[:20],
    )


@router.get("/events", response_model=list[ActivityEventResponse])
def list_events(
    source_user_id: str | None = None,
    event_type: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(ActivityEvent)

    if source_user_id:
        query = query.filter(ActivityEvent.source_user_id == source_user_id)
    if event_type:
        query = query.filter(ActivityEvent.event_type == event_type)

    return query.order_by(ActivityEvent.timestamp.desc()).limit(500).all()