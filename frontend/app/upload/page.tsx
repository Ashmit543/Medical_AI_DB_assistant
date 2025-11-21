"use client";

import { FormEvent, useState } from "react";
import { uploadDocument } from "@/lib/api";

export default function UploadPage() {
  const [patientId, setPatientId] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Uploading…");

    const formData = new FormData(e.currentTarget);
    formData.append("patient_id", patientId);

    try {
      await uploadDocument(formData);
      setStatus("✅ Upload queued for ingestion agent.");
      e.currentTarget.reset();
      setPatientId("");
    } catch (error: any) {
      setStatus(`Upload failed: ${error.message}`);
    }
  }

  return (
    <section className="max-w-2xl space-y-6">
      <header>
        <p className="text-sm uppercase tracking-widest text-brand-500">Ingestion</p>
        <h2 className="text-3xl font-semibold text-slate-900">Upload medical PDFs</h2>
        <p className="mt-2 text-sm text-slate-600">
          Files are stored in Supabase Storage and routed through the Docling-powered
          ingestion agent. Supported: profile, timeline, lab reports, prescriptions,
          consultation notes, and prescription images.
        </p>
      </header>

      <form
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Patient ID
          <input
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="patient-001"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          />
        </label>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Document
          <input
            type="file"
            name="file"
            accept=".pdf,.png,.jpg,.jpeg"
            required
            className="mt-2 w-full rounded-lg border border-dashed border-slate-300 px-3 py-10 text-center text-sm text-slate-500"
          />
        </label>

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold uppercase tracking-widest text-white"
        >
          Upload & Ingest
        </button>

        {status && <p className="mt-4 text-xs text-slate-500">{status}</p>}
      </form>
    </section>
  );
}

