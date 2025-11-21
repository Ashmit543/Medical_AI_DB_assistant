"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";

type Props = {
  params: { id: string };
};

export default function PatientDetailPage({ params }: Props) {
  const { data, isLoading } = useSWR(`/patients/${params.id}`, fetcher);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading record…</p>;
  }

  if (!data) {
    return <p className="text-sm text-rose-500">Patient not found or access denied.</p>;
  }

  const patient = data.patient;

  return (
    <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          {patient.display_id}
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">{patient.name}</h2>
        <p className="mt-2 text-sm text-slate-600">{patient.demographics}</p>
      </header>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          AI Summaries
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {patient.summaries?.map((summary: any) => (
            <div key={summary.type} className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="text-xs uppercase tracking-widest text-slate-400">
                {summary.type}
              </p>
              <p className="mt-2 text-slate-700">{summary.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Lab Trends
        </h3>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
          {patient.labs?.map((lab: any) => (
            <li key={lab.report_id} className="p-4 text-sm text-slate-700">
              <p className="font-semibold">{lab.title}</p>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                {lab.collected_at} · {lab.abnormal_markers.join(", ")}
              </p>
              <p className="mt-2 text-slate-600">{lab.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

