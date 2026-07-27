from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil
import os

from app.database import get_db
from app.services.import_service import import_dataset

router = APIRouter(
    prefix="/import",
    tags=["Import"]
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/dataset")
def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Allow only CSV files
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed."
        )

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Call service
    result = import_dataset(file_path, db)

    return result