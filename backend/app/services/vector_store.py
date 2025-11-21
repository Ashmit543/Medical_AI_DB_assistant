from typing import List, Dict, Any

from loguru import logger
from app.core.config import get_settings
from app.services.supabase_client import get_supabase


def upsert_vectors(patient_id: str, chunks: List[Dict[str, Any]], embeddings: List[List[float]]) -> None:
    settings = get_settings()
    supabase = get_supabase()

    payload = []
    for chunk, embedding in zip(chunks, embeddings, strict=False):
        payload.append(
            {
                "patient_id": patient_id,
                "content": chunk["text"],
                "metadata": chunk["metadata"],
                "embedding": embedding,
            }
        )

    logger.info(f"Upserting {len(payload)} vectors for patient {patient_id}")
    supabase.table(settings.supabase_vector_table).upsert(payload).execute()


def similarity_search(patient_id: str, query_embedding: List[float], top_k: int = 6):
    settings = get_settings()
    supabase = get_supabase()
    response = (
        supabase.rpc(
            "match_patient_vectors",
            {
                "match_count": top_k,
                "query_embedding": query_embedding,
                "patient_id_filter": patient_id,
            },
        )
        .execute()
        .data
    )
    return response or []

