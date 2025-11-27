"use client";

import { FormEvent, useState } from "react";
import { uploadDocument, uploadZipFolder } from "@/lib/api";

export default function UploadPage() {
  const [patientId, setPatientId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"single" | "zip">("single");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Uploading…");

    const formData = new FormData(e.currentTarget);
    formData.append("patient_id", patientId);

    try {
      if (uploadType === "zip") {
        await uploadZipFolder(formData);
        setStatus("✅ ZIP upload queued. All PDFs will be processed.");
      } else {
        await uploadDocument(formData);
        setStatus("✅ Upload queued for ingestion agent.");
      }
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
          Upload single files or ZIP folders containing multiple PDFs. Files are processed through the Docling-powered
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

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Upload Type
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="uploadType"
                value="single"
                checked={uploadType === "single"}
                onChange={(e) => setUploadType(e.target.value as "single" | "zip")}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">Single File</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="uploadType"
                value="zip"
                checked={uploadType === "zip"}
                onChange={(e) => setUploadType(e.target.value as "single" | "zip")}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">ZIP Folder</span>
            </label>
          </div>
        </div>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          {uploadType === "zip" ? "ZIP Folder" : "Document"}
          <input
            type="file"
            name="file"
            accept={uploadType === "zip" ? ".zip" : ".pdf,.png,.jpg,.jpeg"}
            required
            className="mt-2 w-full rounded-lg border border-dashed border-slate-300 px-3 py-10 text-center text-sm text-slate-500"
          />
        </label>

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold uppercase tracking-widest text-white hover:bg-brand-500 transition"
        >
          {uploadType === "zip" ? "Upload ZIP & Process All PDFs" : "Upload & Ingest"}
        </button>

        {status && <p className="mt-4 text-xs text-slate-500">{status}</p>}
      </form>
    </section>
  );
}

