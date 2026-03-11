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
  const [editingSystemId, setEditingSystemId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<(typeof PROJECT_SYSTEM_ROLES)[number]>("both");

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
    if (!window.confirm("Confirmer le retrait de ce système du projet ?")) return;
    await fetch(`/api/project-systems/${id}`, { method: "DELETE" });
    load();
  };

  const startEditSystem = (id: number, role: string) => {
    setEditingSystemId(id);
    setEditingRole(role as (typeof PROJECT_SYSTEM_ROLES)[number]);
  };

  const saveSystemEdit = async (id: number) => {
    await fetch(`/api/project-systems/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editingRole })
    });
    setEditingSystemId(null);
    setEditingRole("both");
    load();
  };

  if (!project) return <div className="card">Chargement...</div>;

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
        <form onSubmit={save} className="card grid gap-4 md:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm font-medium text-[#35536f]">Nom du projet</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium text-[#35536f]">Client</label>
            <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name} ({client.company})</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium text-[#35536f]">Statut</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              {PROJECT_STATUSES.map((status) => <option key={status} value={status}>{PROJECT_STATUS_LABELS[status]}</option>)}
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium text-[#35536f]">Date cible</label>
            <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium text-[#35536f]">Objectif</label>
            <input className="input" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium text-[#35536f]">Contexte</label>
            <input className="input" value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} />
          </div>
          <div className="grid gap-1 md:col-span-2">
            <label className="text-sm font-medium text-[#35536f]">Description</label>
            <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <button className="btn">Enregistrer les modifications</button>
          </div>
        </form>

        <section className="card xl:sticky xl:top-6">
          <h3 className="mb-2 font-semibold">Score de complexité</h3>
          <p className="text-3xl font-bold">{project.complexityScore}</p>
        </section>
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
              {editingSystemId === entry.id ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.system.name}</span>
                    <select
                      className="input w-44"
                      value={editingRole}
                      onChange={(e) => setEditingRole(e.target.value as (typeof PROJECT_SYSTEM_ROLES)[number])}
                    >
                      {PROJECT_SYSTEM_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {PROJECT_SYSTEM_ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn" type="button" onClick={() => saveSystemEdit(entry.id)}>Enregistrer</button>
                    <button className="btn-danger" type="button" onClick={() => setEditingSystemId(null)}>Annuler</button>
                  </div>
                </>
              ) : (
                <>
                  <div>{entry.system.name} <span className="text-slate-400">({PROJECT_SYSTEM_ROLE_LABELS[entry.role as keyof typeof PROJECT_SYSTEM_ROLE_LABELS]})</span></div>
                  <div className="flex items-center gap-2">
                    <button className="btn" type="button" onClick={() => startEditSystem(entry.id, entry.role)}>Éditer</button>
                    <button className="btn-danger" type="button" onClick={() => removeSystem(entry.id)}>Retirer</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
