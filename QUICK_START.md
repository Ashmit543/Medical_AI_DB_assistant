# Quick Start Guide - Run MediTrack AI Locally

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.11+ installed
- ✅ Node.js 20+ installed
- ✅ pnpm or npm installed
- ✅ Supabase project created with tables and bucket
- ✅ Real Supabase credentials (not placeholders)
- ✅ HuggingFace API token

---

## Step 1: Verify Environment Files

### Backend `.env` file location: `backend/.env`

Make sure it contains **REAL** values (not placeholders):

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (real key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (real key)
HF_API_KEY=hf_xxxxx (real token)
HF_MISTRAL_ENDPOINT=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3
FASTAPI_SECRET_KEY=2G_wNVVn1WvjP3ZsgjnJ32a0aTzXwOPPNpEGeLTcGqg
```

### Frontend `.env.local` file location: `frontend/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co (same as backend)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (same as backend)
NEXT_PUBLIC_SUPABASE_BUCKET=patient_data
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Step 2: Install Backend Dependencies

Open a terminal and run:

```bash
cd backend
pip install -e .
```

**OR** if you have `uv`:

```bash
cd backend
uv pip install -e .
```

**Wait for installation to complete** (may take a few minutes)

---

## Step 3: Install Frontend Dependencies

Open a **new terminal** and run:

```bash
cd frontend
pnpm install
```

**OR** if you don't have pnpm:

```bash
cd frontend
npm install
```

**Wait for installation to complete**

---

## Step 4: Start Backend Server

In the backend terminal:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Keep this terminal open!**

---

## Step 5: Start Frontend Server

In the frontend terminal (new terminal):

```bash
cd frontend
pnpm dev
```

**OR** if using npm:

```bash
cd frontend
npm run dev
```

You should see:
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
```

**Keep this terminal open!**

---

## Step 6: Open in Browser

Open your browser and go to:

**http://localhost:3000**

You should see the MediTrack AI homepage!

---

## Testing the Upload Feature

1. Click **"Start Ingesting"** or go to `/upload`
2. Enter a Patient ID (e.g., `patient-001`)
3. Choose upload type:
   - **Single File**: Upload one PDF/image
   - **ZIP Folder**: Upload a ZIP containing multiple PDFs
4. Select your file
5. Click **"Upload & Ingest"** or **"Upload ZIP & Process All PDFs"**

---

## Troubleshooting

### Backend won't start:
- Check if port 8000 is already in use
- Verify `.env` file exists in `backend/` folder
- Check all environment variables have real values (not placeholders)
- Make sure Python dependencies installed correctly

### Frontend won't start:
- Check if port 3000 is already in use
- Verify `.env.local` file exists in `frontend/` folder
- Make sure Node.js dependencies installed correctly

### "Connection refused" errors:
- Make sure backend is running on port 8000
- Check `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in frontend `.env.local`

### Supabase errors:
- Verify Supabase credentials are correct
- Check Supabase project is active
- Ensure tables are created in Supabase

---

## Available Pages

- **Home**: `http://localhost:3000`
- **Upload**: `http://localhost:3000/upload`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Chat (RAG)**: `http://localhost:3000/chat`
- **Login**: `http://localhost:3000/login`

---

## Stopping the Servers

Press `Ctrl + C` in both terminal windows to stop the servers.

---

## Next Steps

1. Upload some test PDFs to see the system in action
2. Check Supabase dashboard to see data being stored
3. Try the RAG chat feature to query patient data
4. Explore the dashboard to view patient summaries

