from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UploadBatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    status: str
    total_records: int
    error_message: str | None
    created_at: datetime


class DataRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    batch_id: int
    row_number: int
    payload: dict


class RecordListOut(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[DataRecordOut]


class DashboardSummaryOut(BaseModel):
    total_files: int
    successful_files: int
    failed_files: int
    processing_files: int
    total_records: int
    recent_uploads: list[UploadBatchOut]
