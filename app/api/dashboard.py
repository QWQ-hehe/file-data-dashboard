from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DataRecord, UploadBatch
from app.schemas import DashboardSummaryOut, RecordListOut

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
Database = Annotated[Session, Depends(get_db)]


@router.get("/summary", response_model=DashboardSummaryOut)
def dashboard_summary(db: Database):
    status_counts = dict(
        db.execute(
            select(UploadBatch.status, func.count(UploadBatch.id)).group_by(
                UploadBatch.status
            )
        ).all()
    )
    recent_uploads = db.scalars(
        select(UploadBatch)
        .order_by(UploadBatch.created_at.desc(), UploadBatch.id.desc())
        .limit(10)
    ).all()
    return {
        "total_files": sum(status_counts.values()),
        "successful_files": status_counts.get("success", 0),
        "failed_files": status_counts.get("failed", 0),
        "processing_files": status_counts.get("processing", 0),
        "total_records": db.scalar(select(func.count(DataRecord.id))) or 0,
        "recent_uploads": recent_uploads,
    }


@router.get("/records", response_model=RecordListOut)
def dashboard_records(
    db: Database,
    batch_id: int | None = None,
    limit: Annotated[int, Query(ge=1, le=1000)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    records_query = select(DataRecord)
    count_query = select(func.count(DataRecord.id))
    if batch_id is not None:
        records_query = records_query.where(DataRecord.batch_id == batch_id)
        count_query = count_query.where(DataRecord.batch_id == batch_id)

    records = db.scalars(
        records_query.order_by(DataRecord.id).offset(offset).limit(limit)
    ).all()
    return {
        "total": db.scalar(count_query) or 0,
        "limit": limit,
        "offset": offset,
        "items": records,
    }
