from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.dashboard import router as dashboard_router
from app.api.files import router as files_router
from app.config import BASE_DIR, CORS_ORIGINS, DATA_DIR, UPLOAD_DIR
from app.database import Base, engine


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="File Data Dashboard API",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(files_router)
app.include_router(dashboard_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def project_info():
    return {
        "project": "file-data-dashboard",
        "docs": "/docs",
        "upload": "/api/files/upload",
        "dashboard_summary": "/api/dashboard/summary",
        "dashboard_records": "/api/dashboard/records",
    }


dashboard_dir = BASE_DIR / "dashboard"
if dashboard_dir.exists():
    app.mount(
        "/dashboard",
        StaticFiles(directory=dashboard_dir, html=True),
        name="dashboard",
    )
