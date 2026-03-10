"use client";

import { useEffect, useState } from "react";
import {
  MAPPING_DIRECTIONS,
  MAPPING_DIRECTION_LABELS
} from "@/lib/constants";

type SyncFlow = {
  id: number;
  name: string;
  sourceSystem: { name: string };
  targetSystem: { name: string };
  direction: string;
};
type Mapping = {
  id: number;
  syncFlowId: number;
  sourceField: string;
  targetField: string;
  direction: string;
  transformation: string | null;
  required: boolean;
  defaultValue: string | null;
  notes: string | null;
  syncFlow: SyncFlow;
};

export default function FieldMappingsPage({ params }: { params: { id: string } }) {
  const [flows, setFlows] = useState<SyncFlow[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [form, setForm] = useState({
    syncFlowId: "",
    sourceField: "",
    targetField: "",
    direction: MAPPING_DIRECTIONS[0],
    transformation: "",
    required: false,
    defaultValue: "",
    notes: ""
  });

  const load = async () => {
    const [flowsRes, mappingsRes] = await Promise.all([
      fetch(`/api/sync-flows?projectId=${params.id}`),
      fetch(`/api/field-mappings?projectId=${params.id}`)
    ]);
    const list = await flowsRes.json();
    const maps = await mappingsRes.json();
    setFlows(list);
    setMappings(maps);
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFlow = flows.find((flow) => flow.id === Number(form.syncFlowId));
    const direction = selectedFlow?.direction === "bidirectional" ? form.direction : "source_to_target";
    await fetch("/api/field-mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        syncFlowId: Number(form.syncFlowId),
        direction,
        required: form.required
      })
    });
    setForm({
      syncFlowId: "",
      sourceField: "",
      targetField: "",
      direction: MAPPING_DIRECTIONS[0],
      transformation: "",
      required: false,
      defaultValue: "",
      notes: ""
    });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/field-mappings/${id}`, { method: "DELETE" });
    load();
  };

  const selectedFlow = flows.find((flow) => flow.id === Number(form.syncFlowId));
  const allowedDirections = selectedFlow?.direction === "bidirectional" ? MAPPING_DIRECTIONS : [MAPPING_DIRECTIONS[0]];
  const grouped = mappings.reduce<Record<number, Mapping[]>>((acc, mapping) => {
    if (!acc[mapping.syncFlowId]) acc[mapping.syncFlowId] = [];
    acc[mapping.syncFlowId].push(mapping);
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      <form onSubmit={create} className="card grid gap-2 md:grid-cols-4">
        <select className="input" value={form.syncFlowId} onChange={(e) => setForm({ ...form, syncFlowId: e.target.value })} required>
          <option value="">Flux</option>
          {flows.map((flow) => <option key={flow.id} value={flow.id}>{flow.name} ({flow.sourceSystem.name} → {flow.targetSystem.name})</option>)}
        </select>
        <input className="input" placeholder="Champ source" value={form.sourceField} onChange={(e) => setForm({ ...form, sourceField: e.target.value })} required />
        <input className="input" placeholder="Champ cible" value={form.targetField} onChange={(e) => setForm({ ...form, targetField: e.target.value })} required />
        <select
          className="input"
          value={form.direction}
          onChange={(e) => setForm({ ...form, direction: e.target.value })}
          disabled={!selectedFlow || selectedFlow.direction !== "bidirectional"}
        >
          {allowedDirections.map((direction) => (
            <option key={direction} value={direction}>{MAPPING_DIRECTION_LABELS[direction]}</option>
          ))}
        </select>
        <input className="input" placeholder="Transformation" value={form.transformation} onChange={(e) => setForm({ ...form, transformation: e.target.value })} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} />
          Requis
        </label>
        <input className="input" placeholder="Valeur par défaut" value={form.defaultValue} onChange={(e) => setForm({ ...form, defaultValue: e.target.value })} />
        <input className="input" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn">Ajouter un mapping</button>
      </form>

      <section className="card">
        <h3 className="mb-3 text-lg font-semibold">Vue visuelle des mappings</h3>
        <div className="grid gap-3">
          {flows.map((flow) => (
            <div key={flow.id} className="rounded-xl border border-slate-800 p-3">
              <p className="mb-2 font-semibold">{flow.name}</p>
              <div className="space-y-2">
                {(grouped[flow.id] || []).length === 0 ? (
                  <p className="text-sm text-slate-400">Aucun mapping pour ce flux.</p>
                ) : null}
                {(grouped[flow.id] || []).map((row) => (
                  <div key={row.id} className="rounded-lg border border-slate-700 p-2 text-sm">
                    <p>
                      {row.direction === "target_to_source" ? row.targetField : row.sourceField}
                      {" "}
                      <span className="text-slate-500">→</span>
                      {" "}
                      {row.direction === "target_to_source" ? row.sourceField : row.targetField}
                    </p>
                    <p className="text-xs text-slate-400">
                      Sens : {MAPPING_DIRECTION_LABELS[row.direction as keyof typeof MAPPING_DIRECTION_LABELS]} |
                      {row.transformation ? ` Transformation : ${row.transformation}` : ""}
                      {row.required ? " | Obligatoire" : ""}
                    </p>
                    {row.notes ? <p className="text-xs text-slate-500">Notes : {row.notes}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card table">
        <table>
          <thead>
            <tr>
              <th>Flux</th>
              <th>Sens</th>
              <th>Source</th>
              <th>Cible</th>
              <th>Transformation</th>
              <th>Obligatoire</th>
              <th>Défaut</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((row) => (
              <tr key={row.id}>
                <td>{row.syncFlow?.name}</td>
                <td>{MAPPING_DIRECTION_LABELS[row.direction as keyof typeof MAPPING_DIRECTION_LABELS]}</td>
                <td>{row.direction === "target_to_source" ? row.targetField : row.sourceField}</td>
                <td>{row.direction === "target_to_source" ? row.sourceField : row.targetField}</td>
                <td>{row.transformation || "-"}</td>
                <td>{row.required ? "oui" : "non"}</td>
                <td>{row.defaultValue || "-"}</td>
                <td>{row.notes || "-"}</td>
                <td><button className="btn-danger" onClick={() => remove(row.id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
