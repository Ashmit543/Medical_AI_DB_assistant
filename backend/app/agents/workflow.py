import json
from pathlib import Path
from typing import Any, Dict, List

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from loguru import logger

from app.services.docling_service import parse_document
from app.services.embedding_service import embed_texts
from app.services.vector_store import upsert_vectors, similarity_search
from app.services.llm_service import mistral_complete, guardrail_validate
from app.services.persistence_service import save_agent_summaries, log_audit_event


class AgentState(dict):
    document_path: str
    patient_id: str
    chunks: List[Dict[str, Any]]
    embeddings: List[List[float]]
    summaries: Dict[str, str]
    query: str
    retrieved: List[Dict[str, Any]]
    answer: str


def ingestion_node(state: AgentState) -> AgentState:
    chunks = parse_document(Path(state["document_path"]))
    embeddings = embed_texts([chunk["text"] for chunk in chunks])
    upsert_vectors(state["patient_id"], chunks, embeddings)
    state.update({"chunks": chunks, "embeddings": embeddings})
    log_audit_event(
        patient_id=state["patient_id"],
        agent="ingestion",
        action="chunks_upserted",
        metadata={"chunks": len(chunks)},
    )
    logger.info("Ingestion agent finished")
    return state


async def summarization_node(state: AgentState) -> AgentState:
    sections = "\n\n".join(chunk["text"] for chunk in state.get("chunks", [])[:10])
    prompt = f"""You summarize medical documents.
Return valid JSON with keys:
- patient_summary (string)
- doctor_summary (string)
- lab_highlights (string)

Source text:
{sections}

JSON:"""
    summary_raw = await mistral_complete(prompt)
    try:
        summary_payload = json.loads(summary_raw)
    except json.JSONDecodeError:
        summary_payload = {"patient_summary": summary_raw.strip()}
    state.setdefault("summaries", {}).update(summary_payload)
    save_agent_summaries(state["patient_id"], summary_payload, agent_version="v1")
    log_audit_event(
        patient_id=state["patient_id"],
        agent="summarization",
        action="summary_generated",
        metadata={"keys": list(summary_payload.keys())},
    )
    logger.info("Summarization agent finished")
    return state


async def rag_node(state: AgentState) -> AgentState:
    embeddings = embed_texts([state["query"]])
    top_k = state.get("top_k", 6)
    retrieved = similarity_search(state["patient_id"], embeddings[0], top_k=top_k)
    context = "\n\n".join(item["content"] for item in retrieved)
    if not context:
        state["answer"] = "This information is not present in the provided medical files."
        log_audit_event(
            patient_id=state["patient_id"],
            agent="rag",
            action="no_matches",
            metadata={"question": state["query"]},
        )
        return state
    prompt = f"""You are a medical data assistant. Answer strictly from the context. If information is missing, say exactly: "This information is not present in the provided medical files."
Question: {state['query']}

Context:
{context}
"""
    answer = await mistral_complete(prompt)
    state["retrieved"] = retrieved
    state["answer"] = answer
    log_audit_event(
        patient_id=state["patient_id"],
        agent="rag",
        action="retrieval_complete",
        metadata={"matches": len(retrieved)},
    )
    logger.info("RAG agent finished")
    return state


async def guardrail_node(state: AgentState) -> AgentState:
    validated = await guardrail_validate(state.get("answer", ""), state.get("retrieved", []))
    state["answer"] = validated.strip()
    log_audit_event(
        patient_id=state["patient_id"],
        agent="guardrail",
        action="response_validated",
        metadata={"had_citations": bool(state.get("retrieved"))},
    )
    logger.info("Guardrail agent finished")
    return state


def build_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("ingestion", ingestion_node)
    workflow.add_node("summarization", summarization_node)
    workflow.add_node("rag", rag_node)
    workflow.add_node("guardrail", guardrail_node)

    workflow.set_entry_point("ingestion")
    workflow.add_edge("ingestion", "summarization")
    workflow.add_edge("summarization", END)

    workflow.add_edge("rag", "guardrail")
    workflow.add_edge("guardrail", END)

    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)


graph = build_graph()


async def run_ingestion_workflow(patient_id: str, document_path: Path):
    state = {"patient_id": patient_id, "document_path": str(document_path)}
    return await graph.ainvoke(
        state,
        config={"configurable": {"thread_id": f"ingest-{patient_id}"}},
    )


async def run_rag_workflow(patient_id: str, question: str, top_k: int = 6):
    state = {"patient_id": patient_id, "query": question, "top_k": top_k}
    return await graph.ainvoke(
        state,
        config={"configurable": {"thread_id": f"rag-{patient_id}"}, "entry_point": "rag"},
    )

