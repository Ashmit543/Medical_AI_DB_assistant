"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { PatientSummaryCard } from "@/components/patient-summary-card";

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/patients", fetcher);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-widest text-brand-500">Dashboard</p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Patient Summaries & Alerts
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Results are scoped by your Supabase RBAC role. Doctors see assigned patients,
          patients see their own data, admins see audit views.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading && <p className="text-sm text-slate-500">Loading patients…</p>}
        {data?.patients?.map((patient: any) => (
          <PatientSummaryCard key={patient.id} patient={patient} />
        ))}
      </div>
    </section>
  );
}

