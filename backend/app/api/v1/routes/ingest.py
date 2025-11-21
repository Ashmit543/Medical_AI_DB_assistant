from pathlib import Path
import asyncio
from fastapi import APIRouter, UploadFile, Form
from fastapi import BackgroundTasks

from app.core.config import get_settings
from app.agents.workflow import run_ingestion_workflow

router = APIRouter()
settings = get_settings()


def run_ingestion(patient_id: str, file_path: Path):
    asyncio.run(run_ingestion_workflow(patient_id, file_path))


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile,
    patient_id: str = Form(...),
):
    doc_dir = Path(settings.doc_upload_dir)
    doc_dir.mkdir(parents=True, exist_ok=True)
    target = doc_dir / f"{patient_id}-{file.filename}"
    content = await file.read()
    target.write_bytes(content)

    background_tasks.add_task(run_ingestion, patient_id, target)

    return {"status": "queued", "patient_id": patient_id, "file": target.name}

