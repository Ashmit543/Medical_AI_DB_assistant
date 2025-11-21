# MediTrack AI Frontend

Next.js 15 App Router UI with TailwindCSS, Supabase Auth UI, and RBAC-aware data fetching for the MediTrack AI platform.

## Requirements

- Node.js 20+ (aligns with Next.js 15 canary support)
- pnpm 9+ (preferred) or npm 10+
- Supabase project (Auth, Storage, Postgres, Vector DB beta)
- FastAPI backend running locally or on Railway

## Setup

```bash
cd frontend
pnpm install
cp ../env.template .env.local # fill NEXT_PUBLIC_* keys
pnpm dev
```

## Feature Highlights

- Supabase Auth UI for Patients, Doctors, Admins.
- Middleware-protected routes + SSR-safe Supabase session checks.
- Upload form posting to FastAPI ingestion endpoint.
- Dashboard + patient detail pages that consume `/api/v1/patients` endpoints.
- RAG chat surface with guardrail-aware messaging.

## Testing

- `pnpm lint` — Next.js + ESLint.
- `pnpm typecheck` — strict TS config.
- `pnpm test:e2e:install` (one-time) then `pnpm test:e2e` — Playwright smoke tests defined in `tests/e2e`.

## Deployment

- Use `frontend/vercel.json` for a one-click import into Vercel (sets `NEXT_PUBLIC_*` env placeholders).
- For Railway Static or other hosts, run `pnpm build && pnpm start` with the same env vars.

