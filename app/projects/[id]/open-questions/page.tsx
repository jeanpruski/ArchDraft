"use client";

import { useEffect, useState } from "react";
import { QUESTION_STATUS, QUESTION_STATUS_LABELS } from "@/lib/constants";

type OpenQuestion = { id: number; question: string; response: string | null; status: string };

export default function OpenQuestionsPage({ params }: { params: { id: string } }) {
  const [rows, setRows] = useState<OpenQuestion[]>([]);
  const [form, setForm] = useState({ question: "", status: QUESTION_STATUS[0] });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ question: "", response: "", status: QUESTION_STATUS[0] });

  const load = async () => {
    const res = await fetch(`/api/open-questions?projectId=${params.id}`);
    setRows(await res.json());
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/open-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, projectId: Number(params.id) })
    });
    setForm({ question: "", status: QUESTION_STATUS[0] });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/open-questions/${id}`, { method: "DELETE" });
    load();
  };

  const markAsHandled = async (id: number) => {
    const current = rows.find((row) => row.id === id);
    if (!current) return;
    await fetch(`/api/open-questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: current.question,
        response: current.response || "",
        status: "answered"
      })
    });
    load();
  };

  const startEdit = (row: OpenQuestion) => {
    setEditingId(row.id);
    setDraft({ question: row.question, response: row.response || "", status: row.status });
  };

  const saveEdit = async (id: number) => {
    await fetch(`/api/open-questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, projectId: Number(params.id) })
    });
    setEditingId(null);
    setDraft({ question: "", response: "", status: QUESTION_STATUS[0] });
    load();
  };

  const statusClass = (status: string) => {
    if (status === "answered") return "bg-emerald-400/15 text-emerald-200 border-emerald-400/30";
    if (status === "waiting_client") return "bg-amber-400/15 text-amber-200 border-amber-400/30";
    return "bg-rose-400/15 text-rose-200 border-rose-400/30";
  };

  return (
    <div className="grid gap-4">
      <form onSubmit={create} className="card grid gap-2 md:grid-cols-3">
        <input className="input md:col-span-2" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Question ouverte" required />
        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {QUESTION_STATUS.map((status) => <option key={status} value={status}>{QUESTION_STATUS_LABELS[status]}</option>)}
        </select>
        <button className="btn md:col-span-3 justify-self-start">Ajouter</button>
      </form>
      <section className="card">
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-lg border border-slate-800 p-3">
              {editingId === row.id ? (
                <div className="grid gap-2">
                  <input className="input" value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Réponse / décision prise"
                    value={draft.response}
                    onChange={(e) => setDraft({ ...draft, response: e.target.value })}
                  />
                  <select className="input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                    {QUESTION_STATUS.map((status) => <option key={status} value={status}>{QUESTION_STATUS_LABELS[status]}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button className="btn" onClick={() => saveEdit(row.id)} type="button">Enregistrer</button>
                    <button className="btn-danger" type="button" onClick={() => setEditingId(null)}>Annuler</button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{row.question}</p>
                    <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(row.status)}`}>{QUESTION_STATUS_LABELS[row.status as keyof typeof QUESTION_STATUS_LABELS]}</span>
                  </div>
                  <p className="text-sm text-slate-400">{row.response ? `Réponse : ${row.response}` : "Aucune réponse"}</p>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn" onClick={() => startEdit(row)}>Modifier</button>
                    <button className="btn-danger" onClick={() => remove(row.id)}>Supprimer</button>
                    {row.status !== "answered" ? (
                      <button className="btn" onClick={() => markAsHandled(row.id)}>Marquer comme gérée</button>
                    ) : null}
                  </div>
                </div>
              )}
            </article>
          ))}
          {rows.length === 0 ? <p className="text-sm text-slate-400">Aucune question ouverte.</p> : null}
        </div>
      </section>
    </div>
  );
}
