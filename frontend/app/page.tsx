"use client";

import Link from "next/link";

const callouts = [
  {
    title: "Upload Pipeline",
    body: "Docling powered ingestion stores structured chunks + metadata in Supabase.",
    href: "/upload"
  },
  {
    title: "Insights Dashboard",
    body: "Summaries, labs, prescriptions, and timeline views per patient.",
    href: "/dashboard"
  },
  {
    title: "RAG Q&A",
    body: "Mistral-powered answers restricted to retrieved patient chunks.",
    href: "/chat"
  }
];

export default function HomePage() {
  return (
    <main className="space-y-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm uppercase tracking-widest text-brand-500">
          MediTrack AI
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">
          Cloud-Based Multi-Agent Medical Record Intelligence
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-slate-600">
          Process PDFs and prescription images, build patient-scoped embeddings, and
          surface trustworthy summaries and Q&A through a Supabase-authenticated
          workspace. Deployed cheaply via Railway + Supabase free tiers.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/upload"
            className="rounded-full bg-brand-600 px-6 py-3 text-white transition hover:bg-brand-500"
          >
            Start Ingesting
          </Link>
          <Link
            href="/docs"
            className="rounded-full border border-slate-200 px-6 py-3 text-slate-600 hover:border-brand-500 hover:text-brand-600"
          >
            View Docs
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {callouts.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-500"
          >
            <p className="text-sm font-semibold text-brand-600">{item.title}</p>
            <p className="mt-3 text-sm text-slate-600">{item.body}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

