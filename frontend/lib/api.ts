"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function fetcher(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    ...init
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function uploadDocument(formData: FormData) {
  const res = await fetch(`${API_BASE}/api/v1/ingest/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

