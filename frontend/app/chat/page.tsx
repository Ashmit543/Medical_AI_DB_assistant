"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [patientId, setPatientId] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: patients } = useSWR("/patients", fetcher);

  async function ask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!question || !patientId) return;

    const newTurns = [...turns, { role: "user", content: question }];
    setTurns(newTurns);
    setIsLoading(true);

    try {
      const res = await fetcher("/rag/query", {
        method: "POST",
        body: JSON.stringify({ patient_id: patientId, question, top_k: 6 })
      });
      setTurns([
        ...newTurns,
        {
          role: "assistant",
          content: res.answer ?? "No answer returned."
        }
      ]);
    } catch (error: any) {
      setTurns([
        ...newTurns,
        { role: "assistant", content: `Error: ${error.message}` }
      ]);
    } finally {
      setIsLoading(false);
      setQuestion("");
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-widest text-brand-500">RAG Q&A</p>
        <h2 className="text-3xl font-semibold text-slate-900">Patient scoped chat</h2>
        <p className="mt-2 text-sm text-slate-600">
          The guardrail agent blocks hallucinations and enforces patient-level access.
          If retrieval returns no chunks, the assistant declines with a safety message.
        </p>
      </header>

      <form
        onSubmit={ask}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          required
        >
          <option value="">Select patient</option>
          {patients?.patients?.map((patient: any) => (
            <option key={patient.id} value={patient.id}>
              {patient.display_id} · {patient.name}
            </option>
          ))}
        </select>

        <textarea
          className="min-h-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Summarize abnormal kidney markers in the last 6 months…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-brand-600 py-3 text-sm font-semibold uppercase tracking-widest text-white disabled:opacity-60"
        >
          {isLoading ? "Thinking…" : "Ask"}
        </button>
      </form>

      <div className="space-y-3">
        {turns.map((turn, idx) => (
          <div
            key={`${turn.role}-${idx}`}
            className={`rounded-xl border border-slate-200 bg-white p-4 text-sm ${
              turn.role === "assistant" ? "border-brand-200" : ""
            }`}
          >
            <p className="text-xs uppercase tracking-widest text-slate-400">
              {turn.role === "assistant" ? "Guardrailed Answer" : "You"}
            </p>
            <p className="mt-2 text-slate-700">{turn.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

