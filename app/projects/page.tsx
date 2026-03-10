"use client";

import { useEffect, useState } from "react";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/constants";

type Client = { id: number; name: string; company: string };
type Project = {
  id: number;
  name: string;
  status: string;
  deadline: string | null;
  updatedAt: string;
  client: Client;
  _count?: { syncFlows: number; risks: number; openQuestions: number };
};

export default function ProjectsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({
    name: "",
    clientId: "",
    description: "",
    context: "",
    objective: "",
    status: "discovery" as (typeof PROJECT_STATUSES)[number],
    deadline: ""
  });

  const load = async () => {
    const [clientsRes, projectsRes] = await Promise.all([fetch("/api/clients"), fetch("/api/projects")]);
    setClients(await clientsRes.json());
    setProjects(await projectsRes.json());
  };

  useEffect(() => {
    load();
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({
      name: "",
      clientId: "",
      description: "",
      context: "",
      objective: "",
      status: "discovery",
      deadline: ""
    });
    load();
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Projets</h1>
      <form onSubmit={createProject} className="card grid gap-3 md:grid-cols-3">
        <input className="input" placeholder="Nom projet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.company})
            </option>
          ))}
        </select>
        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>{PROJECT_STATUS_LABELS[status]}</option>
          ))}
        </select>
        <input className="input md:col-span-2" placeholder="Objectif" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
        <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <button className="btn">Créer un projet</button>
      </form>

      <section className="card table">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Client</th>
              <th>Statut</th>
              <th>Échéance</th>
              <th>Dernière modification</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>
                  <a href={`/projects/${project.id}/overview`} className="text-sky-300 hover:underline">{project.name}</a>
                </td>
                <td>{project.client?.name}</td>
                <td>{PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS]}</td>
                <td>{project.deadline ? new Date(project.deadline).toLocaleDateString("fr-FR") : "-"}</td>
                <td>{new Date(project.updatedAt).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
