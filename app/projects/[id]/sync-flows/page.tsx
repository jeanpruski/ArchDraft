"use client";

import { useEffect, useState } from "react";
import {
  FLOW_DIRECTIONS,
  FLOW_DIRECTION_LABELS,
  FLOW_MODES,
  FLOW_MODE_LABELS,
  FLOW_TRIGGERS,
  FLOW_TRIGGER_LABELS,
  FLOW_FREQUENCIES,
  FLOW_FREQUENCY_LABELS,
  FLOW_FREQUENCY_DB_LABELS
} from "@/lib/constants";

type SyncFlow = {
  id: number;
  name: string;
  sourceSystemId: number;
  targetSystemId: number;
  objectType: string;
  direction: string;
  triggerType: string;
  mode: string;
  frequency: string | null;
  description: string | null;
  sourceSystem: { name: string };
  targetSystem: { name: string };
};
type System = { id: number; name: string };

export default function SyncFlowsPage({ params }: { params: { id: string } }) {
  const [flows, setFlows] = useState<SyncFlow[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [form, setForm] = useState({
    name: "",
    sourceSystemId: "",
    targetSystemId: "",
    objectType: "",
    direction: FLOW_DIRECTIONS[0],
    triggerType: FLOW_TRIGGERS[0],
    mode: FLOW_MODES[0],
    frequency: FLOW_FREQUENCIES[0],
    description: ""
  });

  const load = async () => {
    const [flowsRes, systemsRes] = await Promise.all([
      fetch(`/api/sync-flows?projectId=${params.id}`),
      fetch("/api/systems")
    ]);
    setFlows(await flowsRes.json());
    setSystems(await systemsRes.json());
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const createFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/sync-flows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, projectId: Number(params.id), sourceSystemId: Number(form.sourceSystemId), targetSystemId: Number(form.targetSystemId) })
    });
    setForm({
      name: "",
      sourceSystemId: "",
      targetSystemId: "",
      objectType: "",
      direction: FLOW_DIRECTIONS[0],
      triggerType: FLOW_TRIGGERS[0],
      mode: FLOW_MODES[0],
      frequency: FLOW_FREQUENCIES[0],
      description: ""
    });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/sync-flows/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid gap-4">
      <form onSubmit={createFlow} className="card grid gap-2 md:grid-cols-4">
        <input className="input" placeholder="Nom du flux" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="input" value={form.sourceSystemId} onChange={(e) => setForm({ ...form, sourceSystemId: e.target.value })} required>
          <option value="">Système source</option>
          {systems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}
        </select>
        <select className="input" value={form.targetSystemId} onChange={(e) => setForm({ ...form, targetSystemId: e.target.value })} required>
          <option value="">Système cible</option>
          {systems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}
        </select>
        <input className="input" placeholder="Objet métier" value={form.objectType} onChange={(e) => setForm({ ...form, objectType: e.target.value })} required />
        <select className="input" value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
          {FLOW_DIRECTIONS.map((item) => <option key={item} value={item}>{FLOW_DIRECTION_LABELS[item]}</option>)}
        </select>
        <select className="input" value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value })}>
          {FLOW_TRIGGERS.map((item) => <option key={item} value={item}>{FLOW_TRIGGER_LABELS[item]}</option>)}
        </select>
        <select className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
          {FLOW_MODES.map((item) => <option key={item} value={item}>{FLOW_MODE_LABELS[item]}</option>)}
        </select>
        <select className="input" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
          {FLOW_FREQUENCIES.map((item) => <option key={item} value={item}>{FLOW_FREQUENCY_LABELS[item]}</option>)}
        </select>
        <textarea className="input md:col-span-3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn md:col-span-1">Ajouter flux</button>
      </form>

      <section className="card">
        <h3 className="mb-3 text-lg font-semibold">Aperçu des flux</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {flows.map((flow) => (
            <article key={flow.id} className="rounded-xl border border-[#dce8f2] bg-[#f9fcff] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-semibold text-sky-300">{flow.name}</h4>
                <span className="rounded-full border border-[#b8dbcf] bg-[#eaf8f3] px-2 py-1 text-xs text-[#0f7f64]">
                  {FLOW_DIRECTION_LABELS[flow.direction as keyof typeof FLOW_DIRECTION_LABELS]}
                </span>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2">{flow.sourceSystem.name}</div>
                  <span className="text-lg text-[#1c8e70]">{flow.direction === "bidirectional" ? "↔" : "→"}</span>
                  <div className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2">{flow.targetSystem.name}</div>
                </div>
                <p className="text-sm text-[#233a54]"><span className="text-[#6b7f93]">Objet métier :</span> {flow.objectType}</p>
                <p className="text-sm text-[#233a54]"><span className="text-[#6b7f93]">Déclenchement :</span> {FLOW_TRIGGER_LABELS[flow.triggerType as keyof typeof FLOW_TRIGGER_LABELS]}</p>
                <p className="text-sm text-[#233a54]"><span className="text-[#6b7f93]">Mode :</span> {FLOW_MODE_LABELS[flow.mode as keyof typeof FLOW_MODE_LABELS]} · {flow.frequency ? FLOW_FREQUENCY_DB_LABELS[flow.frequency as keyof typeof FLOW_FREQUENCY_DB_LABELS] : "-"}</p>
                {flow.description ? <p className="text-sm text-[#6b7f93]">Note : {flow.description}</p> : null}
              </div>
              <div className="mt-3 flex justify-end">
                <button className="btn-danger" onClick={() => remove(flow.id)}>Supprimer</button>
              </div>
            </article>
          ))}
          {flows.length === 0 ? <p className="text-sm text-[#6b7f93]">Aucun flux pour le moment.</p> : null}
        </div>
      </section>
    </div>
  );
}
