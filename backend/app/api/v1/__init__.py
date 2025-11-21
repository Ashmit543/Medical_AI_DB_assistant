from fastapi import APIRouter

from app.api.v1.routes import ingest, patients, rag, system

router = APIRouter()
router.include_router(system.router, tags=["system"])
router.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
router.include_router(patients.router, prefix="/patients", tags=["patients"])
router.include_router(rag.router, prefix="/rag", tags=["rag"])

