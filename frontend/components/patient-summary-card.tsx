"use client";

import { FileText, Stethoscope } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Patient = {
  id: string;
  display_id: string;
  name: string;
  updated_at: string;
  alerts: string[];
  medications: { name: string; dosage: string }[];
};

type Props = {
  patient: Patient;
};

export function PatientSummaryCard({ patient }: Props) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            {patient.display_id}
          </p>
          <h3 className="text-lg font-semibold text-slate-900">{patient.name}</h3>
        </div>
        <span className="text-xs text-slate-500">
          Updated {new Date(patient.updated_at).toLocaleDateString()}
        </span>
      </header>

      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-brand-500" />
          <p>Medications</p>
        </div>
        <ul className="ml-6 list-disc text-slate-500">
          {patient.medications?.slice(0, 3).map((med) => (
            <li key={med.name}>
              {med.name} · {med.dosage}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Alerts
        </p>
        <ul className="mt-2 space-y-1">
          {patient.alerts?.map((alert) => (
            <li
              key={alert}
              className={cn(
                "rounded-lg border border-rose-100 bg-white/60 px-3 py-1 text-xs text-rose-600",
                "shadow-sm"
              )}
            >
              {alert}
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-5 flex gap-3">
        <Link
          href={`/patients/${patient.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
        >
          <FileText className="h-3.5 w-3.5" /> View Record
        </Link>
        <Link
          href={`/chat?patient_id=${patient.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-700"
        >
          Ask AI
        </Link>
      </footer>
    </article>
  );
}

