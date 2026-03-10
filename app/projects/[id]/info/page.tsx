"use client";

import { useEffect, useState } from "react";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, PROJECT_SYSTEM_ROLES, PROJECT_SYSTEM_ROLE_LABELS } from "@/lib/constants";

type Project = {
  id: number;
  name: string;
  description: string | null;
  context: string | null;
  objective: string | null;
  status: string;
  deadline: string | null;
  complexityScore: number;
  client: { id: number; name: string; company: string };
  projectSystems: { id: number; role: string; system: { id: number; name: string } }[];
};
type Client = { id: number; name: string; company: string };
type System = { id: number; name: string; type: string };

export default function ProjectInfoPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [form, setForm] = useState({ name: "", description: "", context: "", objective: "", status: "discovery" as (typeof PROJECT_STATUSES)[number], deadline: "", clientId: "" });
  const [linkForm, setLinkForm] = useState({ systemId: "", role: "both" as (typeof PROJECT_SYSTEM_ROLES)[number] });

  const load = async () => {
    const [projectRes, clientsRes, systemsRes] = await Promise.all([
      fetch(`/api/projects/${params.id}`),
      fetch("/api/clients"),
      fetch("/api/systems")
    ]);
    const p = await projectRes.json();
    setProject(p);
    setForm({
      name: p.name,
      description: p.description || "",
      context: p.context || "",
      objective: p.objective || "",
      status: p.status,
      deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : "",
      clientId: String(p.client.id)
    });
    setClients(await clientsRes.json());
    setSystems(await systemsRes.json());
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/projects/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, deadline: form.deadline || null, clientId: Number(form.clientId) })
    });
    load();
  };

  const addSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/project-systems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: Number(params.id), systemId: Number(linkForm.systemId), role: linkForm.role })
    });
    setLinkForm({ systemId: "", role: "both" });
    load();
  };

  const removeSystem = async (id: number) => {
    await fetch(`/api/project-systems/${id}`, { method: "DELETE" });
    load();
  };

  if (!project) return <div className="card">Chargement...</div>;

  return (
    <div className="grid gap-4">
      <form onSubmit={save} className="card grid gap-3">
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name} ({client.company})</option>
          ))}
        </select>
        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
          {PROJECT_STATUSES.map((status) => <option key={status} value={status}>{PROJECT_STATUS_LABELS[status]}</option>)}
        </select>
        <input className="input" placeholder="Objectif" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
        <input className="input" placeholder="Contexte" value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} />
        <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <button className="btn">Enregistrer les modifications</button>
      </form>

      <section className="card">
        <h3 className="mb-2 font-semibold">Score de complexité</h3>
        <p className="text-3xl font-bold">{project.complexityScore}</p>
      </section>

      <section className="card">
        <h3 className="mb-2 font-semibold">Systèmes du projet</h3>
        <form className="mb-3 grid gap-2 md:grid-cols-3" onSubmit={addSystem}>
          <select className="input" value={linkForm.systemId} onChange={(e) => setLinkForm({ ...linkForm, systemId: e.target.value })} required>
            <option value="">Ajouter un système</option>
            {systems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}
          </select>
          <select className="input" value={linkForm.role} onChange={(e) => setLinkForm({ ...linkForm, role: e.target.value as any })}>
            {PROJECT_SYSTEM_ROLES.map((role) => <option key={role} value={role}>{PROJECT_SYSTEM_ROLE_LABELS[role]}</option>)}
          </select>
          <button className="btn">Ajouter</button>
        </form>
        <div className="space-y-2">
          {project.projectSystems.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between border border-slate-800 p-2 rounded-lg">
              <div>{entry.system.name} <span className="text-slate-400">({PROJECT_SYSTEM_ROLE_LABELS[entry.role as keyof typeof PROJECT_SYSTEM_ROLE_LABELS]})</span></div>
              <button className="btn-danger" onClick={() => removeSystem(entry.id)}>Retirer</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
