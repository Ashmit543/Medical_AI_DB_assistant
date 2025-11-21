from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.agents.workflow import run_rag_workflow

router = APIRouter()


class RAGRequest(BaseModel):
    patient_id: str = Field(..., description="Patient owner of the records")
    question: str
    top_k: int = 6


@router.post("/query")
async def rag_query(payload: RAGRequest):
    state = await run_rag_workflow(payload.patient_id, payload.question, top_k=payload.top_k)
    answer = state.get("answer")
    if not answer:
        raise HTTPException(500, "RAG pipeline did not produce an answer.")
    return {"answer": answer}

