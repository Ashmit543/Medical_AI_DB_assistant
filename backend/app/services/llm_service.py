from typing import List, Dict, Any

import httpx
from loguru import logger

from app.core.config import get_settings

settings = get_settings()
hf_headers = {
    "Authorization": f"Bearer {settings.hf_api_key}",
    "Content-Type": "application/json",
}


async def mistral_complete(prompt: str) -> str:
    payload = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 512, "temperature": 0.2},
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(settings.hf_mistral_endpoint, headers=hf_headers, json=payload)
        response.raise_for_status()
        data = response.json()
    if isinstance(data, list):
        return data[0]["generated_text"]
    return data["generated_text"]


async def guardrail_validate(answer: str, citations: List[Dict[str, Any]]) -> str:
    if not citations:
        return "This information is not present in the provided medical files."

    prompt = f"""You validate medical responses. Ensure the answer only references provided chunks.
Citations:
{citations}

Answer:
{answer}

Respond with a grounded answer. If unsupported, reply: 'This information is not present in the provided medical files.'
"""
    return await mistral_complete(prompt)

