import csv
from datetime import date, datetime, time
from pathlib import Path

from openpyxl import load_workbook
from sqlalchemy.orm import Session

from app.config import SUPPORTED_EXTENSIONS
from app.models import DataRecord, UploadBatch


class FileImportError(ValueError):
    pass


def _is_empty_row(row: list[object]) -> bool:
    return all(value is None or value == "" for value in row)


def _read_csv_rows(path: Path) -> list[list[object]]:
    for encoding in ("utf-8-sig", "gb18030"):
        try:
            with path.open("r", encoding=encoding, newline="") as source:
                return list(csv.reader(source))
        except UnicodeDecodeError:
            continue
    raise FileImportError("无法识别 CSV 编码，请使用 UTF-8 或 GB18030")


def _read_xlsx_rows(path: Path) -> list[list[object]]:
    try:
        workbook = load_workbook(path, read_only=True, data_only=True)
    except Exception as exc:
        raise FileImportError("无法读取 Excel 文件，请确认文件格式正确") from exc

    try:
        sheet = workbook.active
        return [list(row) for row in sheet.iter_rows(values_only=True)]
    finally:
        workbook.close()


def _headers(row: list[object]) -> list[str]:
    headers: list[str] = []
    for index, value in enumerate(row, start=1):
        base = str(value).strip() if value is not None else ""
        base = base or f"column_{index}"
        header = base
        suffix = 2
        while header in headers:
            header = f"{base}_{suffix}"
            suffix += 1
        headers.append(header)
    return headers


def _json_value(value: object) -> object:
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def parse_file(path: Path) -> list[dict]:
    suffix = path.suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise FileImportError("仅支持 CSV 和 XLSX 文件")

    try:
        rows = _read_csv_rows(path) if suffix == ".csv" else _read_xlsx_rows(path)
    except (csv.Error, OSError) as exc:
        raise FileImportError("文件读取失败，请确认文件未损坏") from exc

    rows = [row for row in rows if not _is_empty_row(row)]
    if not rows:
        raise FileImportError("文件为空或缺少表头")

    headers = _headers(rows[0])
    records: list[dict] = []
    for row in rows[1:]:
        values = list(row[: len(headers)])
        values.extend([None] * (len(headers) - len(values)))
        records.append(
            {header: _json_value(value) for header, value in zip(headers, values)}
        )
    return records


def import_file(
    db: Session, file_path: str | Path, original_filename: str | None = None
) -> UploadBatch:
    """Import a downloaded or uploaded file and return its batch record."""
    path = Path(file_path).resolve()
    filename = Path(original_filename or path.name).name
    batch = UploadBatch(
        original_filename=filename,
        stored_path=str(path),
        status="processing",
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    try:
        records = parse_file(path)
        db.add_all(
            [
                DataRecord(batch_id=batch.id, row_number=index, payload=payload)
                for index, payload in enumerate(records, start=1)
            ]
        )
        batch.total_records = len(records)
        batch.status = "success"
        db.commit()
        db.refresh(batch)
        return batch
    except Exception as exc:
        db.rollback()
        batch.status = "failed"
        batch.error_message = str(exc)[:2000]
        db.commit()
        if isinstance(exc, FileImportError):
            raise
        raise FileImportError("文件入库失败") from exc
