"use client";

import { useEffect, useState } from "react";

type System = {
  id: number;
  name: string;
  type: string;
  description: string | null;
};

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [form, setForm] = useState({ name: "", type: "crm", description: "" });

  const load = async () => {
    const res = await fetch("/api/systems");
    setSystems(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const createSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/systems", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" }
    });
    setForm({ name: "", type: "crm", description: "" });
    load();
  };

  const removeSystem = async (id: number) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    await fetch(`/api/systems/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={createSystem} className="card grid gap-3 md:grid-cols-4">
        <input className="input" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Type (crm, erp, ecommerce, paiement...)" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
        <input className="input md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn md:col-span-4 justify-self-start" type="submit">Ajouter</button>
      </form>
      <section className="card table">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((system) => (
              <tr key={system.id}>
                <td>{system.name}</td>
                <td>{system.type}</td>
                <td>{system.description || "-"}</td>
                <td>
                  <button className="btn-danger" onClick={() => removeSystem(system.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
