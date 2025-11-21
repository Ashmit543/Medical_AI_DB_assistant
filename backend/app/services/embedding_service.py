from typing import List

from sentence_transformers import SentenceTransformer
from loguru import logger

from app.core.config import get_settings

_model: SentenceTransformer | None = None


def get_embedder() -> SentenceTransformer:
    global _model
    if _model is None:
        settings = get_settings()
        logger.info(f"Loading embedding model {settings.embedding_model}")
        _model = SentenceTransformer(settings.embedding_model)
    return _model


def embed_texts(texts: List[str]) -> List[List[float]]:
    model = get_embedder()
    return model.encode(texts, normalize_embeddings=True).tolist()

