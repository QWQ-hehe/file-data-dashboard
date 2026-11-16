import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", DATA_DIR / "uploads"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'dashboard.db'}")
MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_MB", "20")) * 1024 * 1024
SUPPORTED_EXTENSIONS = {".csv", ".xlsx"}
CORS_ORIGINS = tuple(
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
)
