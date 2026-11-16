from pathlib import Path
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import MAX_FILE_SIZE_BYTES, SUPPORTED_EXTENSIONS, UPLOAD_DIR
from app.database import get_db
from app.models import UploadBatch
from app.schemas import UploadBatchOut
from app.services import FileImportError, import_file

router = APIRouter(prefix="/api/files", tags=["files"])
Database = Annotated[Session, Depends(get_db)]


@router.post(
    "/upload", response_model=UploadBatchOut, status_code=status.HTTP_201_CREATED
)
async def upload_file(db: Database, file: Annotated[UploadFile, File(...)]):
    original_filename = Path(file.filename or "").name
    suffix = Path(original_filename).suffix.lower()
    if not original_filename or suffix not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="仅支持 CSV 和 XLSX 文件")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    target = UPLOAD_DIR / f"{uuid4().hex}{suffix}"
    size = 0
    try:
        with target.open("xb") as output:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_FILE_SIZE_BYTES:
                    target.unlink(missing_ok=True)
                    raise HTTPException(status_code=413, detail="文件超过大小限制")
                output.write(chunk)

        try:
            return import_file(db, target, original_filename)
        except FileImportError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        await file.close()


@router.get("", response_model=list[UploadBatchOut])
def list_uploads(
    db: Database,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return db.scalars(
        select(UploadBatch)
        .order_by(UploadBatch.created_at.desc(), UploadBatch.id.desc())
        .offset(offset)
        .limit(limit)
    ).all()


@router.get("/{batch_id}", response_model=UploadBatchOut)
def get_upload(batch_id: int, db: Database):
    batch = db.get(UploadBatch, batch_id)
    if batch is None:
        raise HTTPException(status_code=404, detail="上传批次不存在")
    return batch
