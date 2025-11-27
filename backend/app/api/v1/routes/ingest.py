from pathlib import Path
import asyncio
import zipfile
from fastapi import APIRouter, UploadFile, Form
from fastapi import BackgroundTasks
from loguru import logger

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


def process_zip_folder(patient_id: str, zip_path: Path):
    """Extract ZIP and process all PDFs inside"""
    extract_dir = zip_path.parent / f"{zip_path.stem}_extracted"
    extract_dir.mkdir(exist_ok=True)
    
    pdf_files = []
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
            # Find all PDFs
            for file_path in extract_dir.rglob("*.pdf"):
                pdf_files.append(file_path)
        
        logger.info(f"Found {len(pdf_files)} PDFs in ZIP for patient {patient_id}")
        
        # Process each PDF
        for pdf_file in pdf_files:
            try:
                run_ingestion(patient_id, pdf_file)
                logger.info(f"Processed {pdf_file.name} for patient {patient_id}")
            except Exception as e:
                logger.error(f"Failed to process {pdf_file.name}: {e}")
        
        logger.info(f"Completed processing {len(pdf_files)} PDFs from ZIP for patient {patient_id}")
    except Exception as e:
        logger.error(f"Failed to process ZIP folder: {e}")


@router.post("/upload-zip")
async def upload_zip_folder(
    background_tasks: BackgroundTasks,
    file: UploadFile,
    patient_id: str = Form(...),
):
    """Upload a ZIP folder containing multiple patient PDFs"""
    doc_dir = Path(settings.doc_upload_dir)
    doc_dir.mkdir(parents=True, exist_ok=True)
    
    # Save ZIP file
    zip_path = doc_dir / f"{patient_id}-{file.filename}"
    content = await file.read()
    zip_path.write_bytes(content)
    
    # Extract ZIP and process all PDFs
    background_tasks.add_task(process_zip_folder, patient_id, zip_path)
    
    return {
        "status": "queued", 
        "patient_id": patient_id, 
        "zip_file": file.filename,
        "message": "ZIP extraction and processing queued"
    }

