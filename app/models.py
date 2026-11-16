from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UploadBatch(Base):
    __tablename__ = "upload_batches"

    id: Mapped[int] = mapped_column(primary_key=True)
    original_filename: Mapped[str] = mapped_column(String(255))
    stored_path: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="processing", index=True)
    total_records: Mapped[int] = mapped_column(default=0)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )


class DataRecord(Base):
    __tablename__ = "data_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("upload_batches.id"), index=True)
    row_number: Mapped[int] = mapped_column()
    payload: Mapped[dict] = mapped_column(JSON)
