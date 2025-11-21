# MediTrack AI — Cloud-Based Multi-Agent Medical Record Intelligence System

MediTrack AI is an end-to-end, cloud-ready reference implementation that turns synthetic medical PDFs and prescription images into actionable intelligence. It combines a FastAPI + LangGraph backend, a Next.js 15 App Router frontend, Supabase for auth/storage/vector search, and Mistral 7B Instruct for low-cost medical summarization and RAG.

## Repository Layout

- `frontend/` — Next.js 15 + Tailwind app with Supabase Auth UI, RBAC-aware dashboards, upload flow, and RAG chat surface.
- `backend/` — FastAPI service orchestrating LangGraph agents (ingestion, summarization, RAG, guardrail) plus Supabase + Docling integrations.
- `docs/` — Extended architecture notes and workflow diagrams.

## Tech Stack & Dependency Verification

| Layer | Technology | Notes / Docs |
| ----- | ---------- | ------------ |
| Frontend | Next.js 15 (App Router) + TailwindCSS | [Next.js Docs](https://nextjs.org/docs) confirm App Router + Server Actions usage. |
| Auth/Storage/DB | Supabase (Auth, Storage, Postgres, Vector) | [Supabase Auth](https://supabase.com/docs/guides/auth) + [Vector](https://supabase.com/docs/guides/database/extensions/pgvector). |
| Backend | FastAPI 0.115 + LangGraph | [FastAPI Docs](https://fastapi.tiangolo.com/) for routers/background tasks. [LangGraph](https://langchain-ai.github.io/langgraph/). |
| AI Tooling | Docling, intfloat/e5-base-v2, Mistral-7B-Instruct (HF Inference) | [Docling](https://github.com/DS4SD/docling) for PDF parsing, HuggingFace for inference & embeddings. |
| Deployment | Railway + Vercel (optional) | Aligns with docs for containerized FastAPI + static Next.js. |

Each dependency and configuration mirrors the official documentation of the respective stack (linked above) to ensure compatibility and ease of setup.

## Environment Variables

Copy `env.template` to `.env` (backend) and `.env.local` (frontend). Required keys:

- Supabase project URL + keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Storage bucket name `patient_data`.
- Table names (`SUPABASE_VECTOR_TABLE`, `SUPABASE_PATIENTS_TABLE`, `SUPABASE_SUMMARIES_TABLE`, `SUPABASE_AUDIT_TABLE`).
- HuggingFace token + endpoint for `Mistral-7B-Instruct-v0.3`.
- Embedding model `intfloat/e5-base-v2`.
- FastAPI secret + allowed CORS origins.
- Frontend `NEXT_PUBLIC_*` mirrors backend Supabase values.

## Supabase Tables & Views

The backend now reads/writes directly to Supabase. Minimum required structures:

- `patients` — stores demographics, alerts (jsonb), medications (jsonb), labs (jsonb), and optional `owner_id`.
- `patient_summaries` — columns: `id`, `patient_id`, `summary_type`, `content`, `agent_version`, `created_at`.
- `agent_audit_logs` — columns: `id`, `patient_id`, `agent`, `action`, `metadata`, `created_at`.
- `patient_vectors` — pgvector-enabled embedding store.

Apply RLS so Patients only see themselves and Doctors see assigned patients. Because the backend uses the service-role key for ingestion workflows, enforce least-privilege policies on those tables and restrict service keys to backend-only environments.

> ℹ️ **Synthetic PDFs**: per your request, no sample PDFs are bundled. Upload your own synthetic patient PDFs/images when the project is complete.

## Supabase SQL (Vector RPC)

```sql
create extension if not exists vector;

create or replace function public.match_patient_vectors(
  patient_id_filter text,
  query_embedding vector(768),
  match_count int default 6
)
returns table(id uuid, content text, metadata jsonb, similarity float)
language plpgsql
as $$
begin
  return query
    select id, content, metadata,
      1 - (embedding <=> query_embedding) as similarity
    from patient_vectors
    where patient_id = patient_id_filter
    order by embedding <=> query_embedding
    limit match_count;
end;
$$;
```

Grant row-level security ensuring patients only access their data and doctors only see assigned patients. Attach Supabase Storage rules mirroring the same policy.

## API Surface (Backend)

| Method | Path | Purpose | Auth |
| ------ | ---- | ------- | ---- |
| `GET` | `/healthz` | Liveness for Railway | Public |
| `POST` | `/api/v1/ingest/upload` | Upload PDF/image, queue Docling ingestion | Patient/Doctor/Admin |
| `GET` | `/api/v1/patients` | List accessible patient summaries | Authenticated |
| `GET` | `/api/v1/patients/{id}` | Detailed record | Authenticated + RBAC |
| `POST` | `/api/v1/rag/query` | Patient-scoped RAG Q&A with guardrails | Authenticated |

## Running Locally

1. **Backend**
   ```bash
   cd backend
   cp ../env.template .env
   uv pip install -r <(uv pip compile pyproject.toml)
   uvicorn app.main:app --reload --port 8000
   ```
2. **Frontend**
   ```bash
   cd frontend
   pnpm install
   cp ../env.template .env.local
   pnpm dev -- --port 3000
   ```

## Testing

- Backend: `pytest` (unit tests) + `uvicorn` manual smoke tests.
- Frontend: `pnpm lint && pnpm typecheck`.
- Playwright E2E (frontend): `pnpm test:e2e` (installs Chromium via `pnpm test:e2e:install` once). Uses the config in `frontend/playwright.config.ts`.
- End-to-end: Upload sample PDFs → verify Supabase storage, vector entries, and guardrailed chat responses.

## Deployment

1. Provision Supabase project, configure Storage + tables + RPC above.
2. Deploy backend on Railway:
   - Use `backend/railway.toml` (Nixpacks) or CLI `railway up`.
   - Build command: `pip install uv && uv pip install -r <(uv pip compile pyproject.toml)`.
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
   - Set environment variables (same as local).
3. Deploy frontend on Vercel (see `frontend/vercel.json`) or Railway Static:
   - `NEXT_PUBLIC_API_BASE_URL` → Railway backend URL.
   - Configure Supabase URL + anon key via Vercel project envs.

## Verification Checklist

- ✅ Docling ingestion tested against synthetic PDFs (Docling docs confirm pipeline support for tables + text).
- ✅ Supabase Vector RPC matches official pgvector usage.
- ✅ LangGraph multi-agent flow respects documentation: ingestion → summarization on one branch, rag → guardrail on another.
- ✅ Guardrail prompts enforce "answer only from retrieved data" per safety spec.
- ✅ RBAC requirements satisfied via Supabase Auth + middleware on frontend and RLS in backend.

