"use client";

import { useEffect, useState } from "react";
import { MILESTONE_STATUS, MILESTONE_STATUS_LABELS } from "@/lib/constants";

type Milestone = { id: number; title: string; status: string; dueDate: string | null };

export default function TimelinePage({ params }: { params: { id: string } }) {
  const [rows, setRows] = useState<Milestone[]>([]);
  const [form, setForm] = useState({ title: "", status: MILESTONE_STATUS[0], dueDate: "" });

  const load = async () => {
    const res = await fetch(`/api/milestones?projectId=${params.id}`);
    setRows(await res.json());
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, projectId: Number(params.id), dueDate: form.dueDate || null })
    });
    setForm({ title: "", status: MILESTONE_STATUS[0], dueDate: "" });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/milestones/${id}`, { method: "DELETE" });
    load();
  };

  const statusClass = (status: string) => {
    if (status === "done") return "bg-emerald-400/15 text-emerald-200 border-emerald-400/30";
    if (status === "in_progress") return "bg-sky-400/15 text-sky-200 border-sky-400/30";
    if (status === "blocked") return "bg-rose-400/15 text-rose-200 border-rose-400/30";
    return "bg-slate-400/15 text-slate-200 border-slate-400/30";
  };

  const byDate = [...rows].sort((a, b) => {
    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aDate - bDate;
  });

  return (
    <div className="grid gap-4">
      <form onSubmit={create} className="card grid gap-2 md:grid-cols-4">
        <input className="input md:col-span-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre du jalon" required />
        <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {MILESTONE_STATUS.map((status) => <option key={status} value={status}>{MILESTONE_STATUS_LABELS[status]}</option>)}
        </select>
        <button className="btn md:col-span-4 justify-self-start">Ajouter un jalon</button>
      </form>
      <section className="card">
        <h3 className="mb-3 text-lg font-semibold">Chronologie</h3>
        <ol className="space-y-4 border-l border-slate-700 pl-4">
          {byDate.map((row) => (
            <li key={row.id} className="relative">
              <span className={`absolute left-[-9px] top-1 h-3 w-3 rounded-full border ${statusClass(row.status)} border-current`}></span>
              <div className="rounded-lg border border-slate-800 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{row.title}</p>
                  <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(row.status)}`}>
                    {MILESTONE_STATUS_LABELS[row.status as keyof typeof MILESTONE_STATUS_LABELS]}
                  </span>
                </div>
                <p className="text-sm text-slate-400">Date cible : {row.dueDate ? new Date(row.dueDate).toLocaleDateString("fr-FR") : "Non définie"}</p>
                <div className="mt-2">
                  <button className="btn-danger" onClick={() => remove(row.id)}>Supprimer</button>
                </div>
              </div>
            </li>
          ))}
          {rows.length === 0 ? <p className="text-sm text-slate-400">Aucun jalon défini.</p> : null}
        </ol>
      </section>
    </div>
  );
}
