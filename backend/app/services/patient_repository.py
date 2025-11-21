from typing import Any, Dict, List, Optional

from loguru import logger
from supabase import APIError

from app.core.config import get_settings
from app.services.supabase_client import get_supabase


def _safe_data(response) -> List[Dict[str, Any]]:
    return response.data or []


def list_patients() -> List[Dict[str, Any]]:
    settings = get_settings()
    supabase = get_supabase()
    try:
        response = (
            supabase.table(settings.supabase_patients_table)
            .select("id,display_id,name,demographics,alerts,medications,updated_at,labs,owner_id")
            .order("updated_at", desc=True)
            .execute()
        )
        patients = _safe_data(response)
        for patient in patients:
            patient.setdefault("alerts", [])
            patient.setdefault("medications", [])
            patient.setdefault("labs", [])
        return patients
    except APIError as exc:
        logger.error(f"Failed to list patients: {exc}")
        return []


def get_patient(patient_id: str) -> Optional[Dict[str, Any]]:
    settings = get_settings()
    supabase = get_supabase()
    try:
        patient_resp = (
            supabase.table(settings.supabase_patients_table)
            .select("*")
            .eq("id", patient_id)
            .single()
            .execute()
        )
        patient = patient_resp.data
        if not patient:
            return None

        summaries_resp = (
            supabase.table(settings.supabase_summaries_table)
            .select("id,summary_type,content,created_at,agent_version")
            .eq("patient_id", patient_id)
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        )
        patient["summaries"] = _safe_data(summaries_resp)
        return patient
    except APIError as exc:
        logger.error(f"Failed to fetch patient {patient_id}: {exc}")
        return None

