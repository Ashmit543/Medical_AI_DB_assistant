from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    api_v1_prefix: str = "/api/v1"
    project_name: str = "MediTrack AI"

    supabase_url: AnyHttpUrl
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_bucket: str = "patient_data"
    supabase_vector_table: str = "patient_vectors"
    supabase_patients_table: str = "patients"
    supabase_summaries_table: str = "patient_summaries"
    supabase_audit_table: str = "agent_audit_logs"

    embedding_model: str = "intfloat/e5-base-v2"
    hf_api_key: str
    hf_mistral_endpoint: AnyHttpUrl
    hf_cross_encoder: str = "sentence-transformers/ms-marco-TinyBERT-L-6"

    fastapi_secret_key: str
    allowed_origins: List[AnyHttpUrl] | List[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    doc_upload_dir: str = "./data/uploads"

    langchain_tracing_v2: bool = False
    langsmith_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()

