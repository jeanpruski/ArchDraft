"use client";

import { useEffect, useState } from "react";

type Decision = { id: number; description: string; decision: string };

export default function DecisionsPage({ params }: { params: { id: string } }) {
  const [rows, setRows] = useState<Decision[]>([]);
  const [form, setForm] = useState({ description: "", decision: "" });

  const load = async () => {
    const res = await fetch(`/api/decisions?projectId=${params.id}`);
    setRows(await res.json());
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, projectId: Number(params.id) })
    });
    setForm({ description: "", decision: "" });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/decisions/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid gap-4">
      <form onSubmit={create} className="card grid gap-2">
        <input className="input" placeholder="Question / situation" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <textarea className="input" placeholder="Décision retenue" value={form.decision} onChange={(e) => setForm({ ...form, decision: e.target.value })} required />
        <button className="btn">Ajouter</button>
      </form>
      <section className="card table">
        <table>
            <thead><tr><th>Description</th><th>Décision</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.description}</td>
                <td>{row.decision}</td>
                <td><button className="btn-danger" onClick={() => remove(row.id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
