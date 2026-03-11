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
  sourceItemTypes: string | null;
  targetItemTypes: string | null;
  direction: string | null;
  triggerType: string | null;
  mode: string | null;
  frequency: string | null;
  description: string | null;
  sourceSystem: { name: string };
  targetSystem: { name: string };
};
type System = { id: number; name: string };

export default function SyncFlowsPage({ params }: { params: { id: string } }) {
  const [flows, setFlows] = useState<SyncFlow[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [sourceTypes, setSourceTypes] = useState<string[]>([""]);
  const [targetTypes, setTargetTypes] = useState<string[]>([""]);
  const [typeError, setTypeError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFlowId, setEditingFlowId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    sourceSystemId: "",
    targetSystemId: "",
    sourceItemTypes: "",
    targetItemTypes: "",
    direction: "",
    triggerType: "",
    mode: "",
    frequency: "",
    description: ""
  });
  const [form, setForm] = useState({
    name: "",
    sourceSystemId: "",
    targetSystemId: "",
    direction: "",
    triggerType: "",
    mode: "",
    frequency: "",
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

  const parseTypeList = (value: string | null) =>
    (value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const buildTypeLinks = (sourceItems: string[], targetItems: string[]) => {
    const sources = sourceItems.length > 0 ? sourceItems : ["-"];
    const targets = targetItems.length > 0 ? targetItems : ["-"];

    if (sources.length === 1 && targets.length === 1) {
      return [{ source: sources[0], target: targets[0] }];
    }

    if (sources.length > 1 && targets.length === 1) {
      return sources.map((source) => ({ source, target: targets[0] }));
    }

    if (sources.length === 1 && targets.length > 1) {
      return targets.map((target) => ({ source: sources[0], target }));
    }

    const max = Math.max(sources.length, targets.length);
    return Array.from({ length: max }, (_, index) => ({
      source: sources[index] || "-",
      target: targets[index] || "-"
    }));
  };

  const renderTypeMapping = (flow: SyncFlow) => {
    const sourceItems = parseTypeList(flow.sourceItemTypes || flow.objectType || "");
    const targetItems = parseTypeList(flow.targetItemTypes);

    if (sourceItems.length > 1 && targetItems.length === 1) {
      return (
        <div className="rounded-lg border border-[#dce8f2] bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b7f93]">Mapping des types d'item</p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="space-y-2">
              {sourceItems.map((source, index) => (
                <div key={`${flow.id}-source-graph-${index}`} className="rounded-md border border-[#dce8f2] bg-[#f9fcff] px-2 py-1 text-sm">
                  {source}
                </div>
              ))}
            </div>
            <div className="space-y-2 text-center text-[#1c8e70]">
              {sourceItems.map((_, index) => (
                <div key={`${flow.id}-arrow-right-${index}`} className="text-lg leading-6">→</div>
              ))}
            </div>
            <div className="flex h-full items-center">
              <div className="w-full rounded-md border border-[#dce8f2] bg-[#f9fcff] px-2 py-1 text-sm">{targetItems[0]}</div>
            </div>
          </div>
        </div>
      );
    }

    if (sourceItems.length === 1 && targetItems.length > 1) {
      return (
        <div className="rounded-lg border border-[#dce8f2] bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b7f93]">Mapping des types d'item</p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex h-full items-center">
              <div className="w-full rounded-md border border-[#dce8f2] bg-[#f9fcff] px-2 py-1 text-sm">{sourceItems[0]}</div>
            </div>
            <div className="space-y-2 text-center text-[#1c8e70]">
              {targetItems.map((_, index) => (
                <div key={`${flow.id}-arrow-left-${index}`} className="text-lg leading-6">→</div>
              ))}
            </div>
            <div className="space-y-2">
              {targetItems.map((target, index) => (
                <div key={`${flow.id}-target-graph-${index}`} className="rounded-md border border-[#dce8f2] bg-[#f9fcff] px-2 py-1 text-sm">
                  {target}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-[#dce8f2] bg-white p-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b7f93]">Mapping des types d'item</p>
        {buildTypeLinks(sourceItems, targetItems).map((link, index) => (
          <div key={`${flow.id}-type-${index}`} className="mb-1 flex items-center gap-2 text-sm last:mb-0">
            <span className="rounded-md border border-[#dce8f2] bg-[#f9fcff] px-2 py-1">{link.source}</span>
            <span className="text-[#1c8e70]">→</span>
            <span className="rounded-md border border-[#dce8f2] bg-[#f9fcff] px-2 py-1">{link.target}</span>
          </div>
        ))}
      </div>
    );
  };

  const toUiFrequency = (value: string | null) => {
    if (value === "minutes_5") return "5min";
    if (value === "minutes_15") return "15min";
    return value || "";
  };

  const createFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedSourceTypes = sourceTypes.map((item) => item.trim()).filter(Boolean);
    const cleanedTargetTypes = targetTypes.map((item) => item.trim()).filter(Boolean);
    if (cleanedSourceTypes.length === 0 || cleanedTargetTypes.length === 0) {
      setTypeError("Ajoute au moins un type d'item source et un type d'item cible.");
      return;
    }
    setTypeError("");
    await fetch("/api/sync-flows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        sourceItemTypes: cleanedSourceTypes.join(", "),
        targetItemTypes: cleanedTargetTypes.join(", "),
        projectId: Number(params.id),
        sourceSystemId: Number(form.sourceSystemId),
        targetSystemId: Number(form.targetSystemId)
      })
    });
    setForm({
      name: "",
      sourceSystemId: "",
      targetSystemId: "",
      direction: "",
      triggerType: "",
      mode: "",
      frequency: "",
      description: ""
    });
    setSourceTypes([""]);
    setTargetTypes([""]);
    load();
  };

  const remove = async (id: number) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    await fetch(`/api/sync-flows/${id}`, { method: "DELETE" });
    load();
  };

  const startEdit = (flow: SyncFlow) => {
    setEditingFlowId(flow.id);
    setEditForm({
      name: flow.name,
      sourceSystemId: String(flow.sourceSystemId),
      targetSystemId: String(flow.targetSystemId),
      sourceItemTypes: flow.sourceItemTypes || flow.objectType || "",
      targetItemTypes: flow.targetItemTypes || "",
      direction: flow.direction || "",
      triggerType: flow.triggerType || "",
      mode: flow.mode || "",
      frequency: toUiFrequency(flow.frequency),
      description: flow.description || ""
    });
  };

  const saveEdit = async (id: number) => {
    await fetch(`/api/sync-flows/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        sourceSystemId: Number(editForm.sourceSystemId),
        targetSystemId: Number(editForm.targetSystemId)
      })
    });
    setEditingFlowId(null);
    load();
  };

  return (
    <div className="grid gap-4">
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#102f6f]">Nouveau flux de synchronisation</h3>
          <button
            type="button"
            className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
            onClick={() => setIsCreateOpen((v) => !v)}
          >
            {isCreateOpen ? "Fermer" : "Créer un flux"}
          </button>
        </div>
        {isCreateOpen ? (
          <form onSubmit={createFlow} className="mt-4 grid gap-2 md:grid-cols-4">
            <div className="flex flex-col gap-0.5 md:col-span-4">
              <label className="text-sm font-medium text-[#35536f]">Nom du flux</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-0.5 md:col-span-4">
              <label className="text-sm font-medium text-[#35536f]">Système source</label>
              <select className="input" value={form.sourceSystemId} onChange={(e) => setForm({ ...form, sourceSystemId: e.target.value })} required>
                <option value="">Sélectionner</option>
                {systems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5 md:col-span-4">
              <label className="text-sm font-medium text-[#35536f]">Type(s) d'item source</label>
              <div className="grid gap-2">
                {sourceTypes.map((value, index) => (
                  <div key={`source-${index}`} className="flex items-center gap-2">
                    <input
                      className="input"
                      value={value}
                      onChange={(e) => setSourceTypes((prev) => prev.map((item, i) => (i === index ? e.target.value : item)))}
                      placeholder={index === 0 ? "lead" : "autre type source"}
                    />
                    {sourceTypes.length > 1 ? (
                      <button
                        type="button"
                        className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2 text-sm text-[#35536f] hover:bg-[#f0f7ff]"
                        onClick={() => setSourceTypes((prev) => prev.filter((_, i) => i !== index))}
                      >
                        -
                      </button>
                    ) : null}
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    className="rounded-lg border border-[#dce8f2] bg-white px-3 py-1.5 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                    onClick={() => setSourceTypes((prev) => [...prev, ""])}
                  >
                    + Ajouter type source
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 md:col-span-4">
              <label className="text-sm font-medium text-[#35536f]">Système cible</label>
              <select className="input" value={form.targetSystemId} onChange={(e) => setForm({ ...form, targetSystemId: e.target.value })} required>
                <option value="">Sélectionner</option>
                {systems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5 md:col-span-4">
              <label className="text-sm font-medium text-[#35536f]">Type(s) d'item cible</label>
              <div className="grid gap-2">
                {targetTypes.map((value, index) => (
                  <div key={`target-${index}`} className="flex items-center gap-2">
                    <input
                      className="input"
                      value={value}
                      onChange={(e) => setTargetTypes((prev) => prev.map((item, i) => (i === index ? e.target.value : item)))}
                      placeholder={index === 0 ? "deal" : "autre type cible"}
                    />
                    {targetTypes.length > 1 ? (
                      <button
                        type="button"
                        className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2 text-sm text-[#35536f] hover:bg-[#f0f7ff]"
                        onClick={() => setTargetTypes((prev) => prev.filter((_, i) => i !== index))}
                      >
                        -
                      </button>
                    ) : null}
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    className="rounded-lg border border-[#dce8f2] bg-white px-3 py-1.5 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                    onClick={() => setTargetTypes((prev) => [...prev, ""])}
                  >
                    + Ajouter type cible
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Direction</label>
              <select className="input" value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
                <option value="">Sélectionner</option>
                {FLOW_DIRECTIONS.map((item) => <option key={item} value={item}>{FLOW_DIRECTION_LABELS[item]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Type de déclenchement</label>
              <select className="input" value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value })}>
                <option value="">Sélectionner</option>
                {FLOW_TRIGGERS.map((item) => <option key={item} value={item}>{FLOW_TRIGGER_LABELS[item]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Mode</label>
              <select className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                <option value="">Sélectionner</option>
                {FLOW_MODES.map((item) => <option key={item} value={item}>{FLOW_MODE_LABELS[item]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Fréquence</label>
              <select className="input" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                <option value="">Sélectionner</option>
                {FLOW_FREQUENCIES.map((item) => <option key={item} value={item}>{FLOW_FREQUENCY_LABELS[item]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5 md:col-span-3">
              <label className="text-sm font-medium text-[#35536f]">Description</label>
              <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="self-end">
              <button className="btn md:w-full">Ajouter flux</button>
            </div>
            {typeError ? <p className="md:col-span-4 text-sm text-rose-600">{typeError}</p> : null}
          </form>
        ) : null}
      </section>

      <section className="card">
        <h3 className="mb-3 text-lg font-semibold">Aperçu des flux</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {flows.map((flow) => (
            <article key={flow.id} className="rounded-xl border border-[#dce8f2] bg-[#f9fcff] p-4">
              {editingFlowId === flow.id ? (
                <div className="grid gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-medium text-[#35536f]">Nom du flux</label>
                    <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-xs font-medium text-[#35536f]">Système source</label>
                      <select className="input" value={editForm.sourceSystemId} onChange={(e) => setEditForm({ ...editForm, sourceSystemId: e.target.value })}>
                        {systems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-xs font-medium text-[#35536f]">Système cible</label>
                      <select className="input" value={editForm.targetSystemId} onChange={(e) => setEditForm({ ...editForm, targetSystemId: e.target.value })}>
                        {systems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-xs font-medium text-[#35536f]">Type(s) source</label>
                      <input className="input" value={editForm.sourceItemTypes} onChange={(e) => setEditForm({ ...editForm, sourceItemTypes: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-xs font-medium text-[#35536f]">Type(s) cible</label>
                      <input className="input" value={editForm.targetItemTypes} onChange={(e) => setEditForm({ ...editForm, targetItemTypes: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-xs font-medium text-[#35536f]">Direction</label>
                      <select className="input" value={editForm.direction} onChange={(e) => setEditForm({ ...editForm, direction: e.target.value })}>
                        <option value="">Sélectionner</option>
                        {FLOW_DIRECTIONS.map((item) => <option key={item} value={item}>{FLOW_DIRECTION_LABELS[item]}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-xs font-medium text-[#35536f]">Déclenchement</label>
                      <select className="input" value={editForm.triggerType} onChange={(e) => setEditForm({ ...editForm, triggerType: e.target.value })}>
                        <option value="">Sélectionner</option>
                        {FLOW_TRIGGERS.map((item) => <option key={item} value={item}>{FLOW_TRIGGER_LABELS[item]}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-xs font-medium text-[#35536f]">Mode</label>
                      <select className="input" value={editForm.mode} onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}>
                        <option value="">Sélectionner</option>
                        {FLOW_MODES.map((item) => <option key={item} value={item}>{FLOW_MODE_LABELS[item]}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-xs font-medium text-[#35536f]">Fréquence</label>
                      <select className="input" value={editForm.frequency} onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}>
                        <option value="">Sélectionner</option>
                        {FLOW_FREQUENCIES.map((item) => <option key={item} value={item}>{FLOW_FREQUENCY_LABELS[item]}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-medium text-[#35536f]">Description</label>
                    <textarea className="input" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <button className="btn" type="button" onClick={() => saveEdit(flow.id)}>Enregistrer</button>
                    <button className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2 text-sm font-medium text-[#35536f] hover:bg-[#f0f7ff]" type="button" onClick={() => setEditingFlowId(null)}>Annuler</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-sky-300">{flow.name}</h4>
                    <span className="rounded-full border border-[#b8dbcf] bg-[#eaf8f3] px-2 py-1 text-xs text-[#0f7f64]">
                      {flow.direction ? FLOW_DIRECTION_LABELS[flow.direction as keyof typeof FLOW_DIRECTION_LABELS] : "-"}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2">{flow.sourceSystem.name}</div>
                      <span className="text-lg text-[#1c8e70]">{flow.direction === "bidirectional" ? "↔" : "→"}</span>
                      <div className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2">{flow.targetSystem.name}</div>
                    </div>
                    {renderTypeMapping(flow)}
                    <p className="text-sm text-[#233a54]"><span className="text-[#6b7f93]">Déclenchement :</span> {flow.triggerType ? FLOW_TRIGGER_LABELS[flow.triggerType as keyof typeof FLOW_TRIGGER_LABELS] : "-"}</p>
                    <p className="text-sm text-[#233a54]"><span className="text-[#6b7f93]">Mode :</span> {flow.mode ? FLOW_MODE_LABELS[flow.mode as keyof typeof FLOW_MODE_LABELS] : "-"} · {flow.frequency ? FLOW_FREQUENCY_DB_LABELS[flow.frequency as keyof typeof FLOW_FREQUENCY_DB_LABELS] : "-"}</p>
                    {flow.description ? <p className="text-sm text-[#6b7f93]">Note : {flow.description}</p> : null}
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button className="btn" type="button" onClick={() => startEdit(flow)}>Éditer</button>
                    <button className="btn-danger" type="button" onClick={() => remove(flow.id)}>Supprimer</button>
                  </div>
                </>
              )}
            </article>
          ))}
          {flows.length === 0 ? <p className="text-sm text-[#6b7f93]">Aucun flux pour le moment.</p> : null}
        </div>
      </section>
    </div>
  );
}
