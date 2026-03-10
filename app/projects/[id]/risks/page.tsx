"use client";

import { useEffect, useState } from "react";
import { RISK_STATUS, RISK_STATUS_LABELS } from "@/lib/constants";

type Risk = { id: number; description: string; impact: string; status: string };

export default function RisksPage({ params }: { params: { id: string } }) {
  const [rows, setRows] = useState<Risk[]>([]);
  const [form, setForm] = useState({ description: "", impact: "", status: RISK_STATUS[0] });

  const load = async () => {
    const res = await fetch(`/api/risks?projectId=${params.id}`);
    setRows(await res.json());
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/risks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, projectId: Number(params.id) })
    });
    setForm({ description: "", impact: "", status: RISK_STATUS[0] });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/risks/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid gap-4">
      <form onSubmit={create} className="card grid gap-2 md:grid-cols-4">
        <input className="input" placeholder="Description du risque" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input className="input" placeholder="Impact potentiel" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} required />
        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {RISK_STATUS.map((status) => <option key={status} value={status}>{RISK_STATUS_LABELS[status]}</option>)}
        </select>
        <button className="btn">Ajouter</button>
      </form>
      <section className="card table">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Impact</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.description}</td>
                <td>{row.impact}</td>
                <td>{RISK_STATUS_LABELS[row.status as keyof typeof RISK_STATUS_LABELS]}</td>
                <td><button className="btn-danger" onClick={() => remove(row.id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
