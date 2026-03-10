"use client";

import { useEffect, useState } from "react";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";

type ProjectOverview = {
  id: number;
  name: string;
  client: { name: string } | null;
  _count: { syncFlows: number; risks: number; openQuestions: number };
  projectSystems: { system: { name: string } }[];
  status: string;
};

export default function ProjectOverviewPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<ProjectOverview | null>(null);

  const load = async () => {
    const res = await fetch(`/api/projects/${params.id}`);
    setProject(await res.json());
  };

  useEffect(() => {
    load();
  }, [params.id]);

  if (!project) return <div className="card">Chargement du projet...</div>;

  return (
    <section className="grid gap-4">
      <div className="card">
        <h2 className="mb-2 text-xl font-semibold">{project.name}</h2>
        <p>Client : {project.client?.name || "Non défini"}</p>
        <p>Statut : {PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS]}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-400">Outils impliqués</p>
          <p className="text-2xl font-bold">{project.projectSystems.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-400">Flux de synchronisation</p>
          <p className="text-2xl font-bold">{project._count.syncFlows}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-400">Risques ouverts</p>
          <p className="text-2xl font-bold">{project._count.risks}</p>
        </div>
      </div>
      <div className="card">
        <p className="mb-2 font-semibold">Questions en attente</p>
        <p className="text-2xl font-bold">{project._count.openQuestions}</p>
      </div>
    </section>
  );
}
