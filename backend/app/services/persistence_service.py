from datetime import datetime, timezone
from typing import Dict, Any

from loguru import logger
from supabase import APIError

from app.core.config import get_settings
from app.services.supabase_client import get_supabase


def save_agent_summaries(patient_id: str, summaries: Dict[str, str], agent_version: str = "v1") -> None:
    if not summaries:
        return
    settings = get_settings()
    supabase = get_supabase()
    rows = []
    now = datetime.now(timezone.utc).isoformat()
    for summary_type, content in summaries.items():
        rows.append(
            {
                "patient_id": patient_id,
                "summary_type": summary_type,
                "content": content,
                "agent_version": agent_version,
                "created_at": now,
            }
        )
    try:
        supabase.table(settings.supabase_summaries_table).upsert(rows).execute()
    except APIError as exc:
        logger.error(f"Failed to persist summaries for {patient_id}: {exc}")


def log_audit_event(patient_id: str, agent: str, action: str, metadata: Dict[str, Any] | None = None) -> None:
    settings = get_settings()
    supabase = get_supabase()
    payload = {
        "patient_id": patient_id,
        "agent": agent,
        "action": action,
        "metadata": metadata or {},
    }
    try:
        supabase.table(settings.supabase_audit_table).insert(payload).execute()
    except APIError as exc:
        logger.error(f"Failed to write audit event for {patient_id}: {exc}")

