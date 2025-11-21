from fastapi import APIRouter, HTTPException

from app.services import patient_repository

router = APIRouter()


@router.get("")
async def list_patients():
    patients = patient_repository.list_patients()
    return {"patients": patients}


@router.get("/{patient_id}")
async def get_patient(patient_id: str):
    patient = patient_repository.get_patient(patient_id)
    if not patient:
        raise HTTPException(404, "Patient not found")
    return {"patient": patient}

