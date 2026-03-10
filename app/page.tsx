"use client";

import { useEffect, useState } from "react";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";

type DashboardStats = {
  totalProjects: number;
  activeProjects: number;
  blockedProjects: number;
  recentProjects: Array<{ id: number; name: string; status: string; updatedAt: string }>;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="card">Chargement tableau de bord...</div>;
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-xs text-slate-400">Nombre de projets</p>
          <p className="text-3xl font-bold">{stats.totalProjects}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400">Projets actifs</p>
          <p className="text-3xl font-bold">{stats.activeProjects}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400">Projets bloqués</p>
          <p className="text-3xl font-bold">{stats.blockedProjects}</p>
        </div>
      </div>
      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Projets récents</h2>
        <ul className="space-y-2">
          {stats.recentProjects.map((project) => (
            <li key={project.id} className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2">
              <div>
                <a href={`/projects/${project.id}/overview`} className="font-semibold text-sky-300 hover:underline">
                  {project.name}
                </a>
              </div>
              <div className="text-xs text-slate-400">{PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS]}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
