"use client";

import { useEffect, useState } from "react";

type Client = {
  id: number;
  name: string;
  company: string;
  website?: string | null;
  notes?: string | null;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    name: "",
    company: "",
    website: "",
    notes: ""
  });

  const load = async () => {
    const res = await fetch("/api/clients");
    setClients(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
      await fetch("/api/clients", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" }
    });
    setForm({ name: "", company: "", website: "", notes: "" });
    load();
  };

  const remove = async (id: number) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={createClient} className="card grid gap-3 md:grid-cols-4">
        <input className="input" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Société" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <input className="input" placeholder="Site web" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        <textarea className="input md:col-span-4" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn" type="submit">Ajouter</button>
      </form>

      <section className="card table">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Société</th>
              <th>Site web</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.company}</td>
                <td>{client.website || "-"}</td>
                <td>
                  <button className="btn-danger" onClick={() => remove(client.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
