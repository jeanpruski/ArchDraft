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
  sourceItemTypes?: string | null;
  targetItemTypes?: string | null;
};
type Mapping = {
  id: number;
  syncFlowId: number;
  sourceField: string;
  targetField: string;
  sourceObjectType: string | null;
  targetObjectType: string | null;
  direction: string;
  reconciliationKey: boolean;
  sourceInternalName: string | null;
  sourceDataType: string | null;
  targetInternalName: string | null;
  targetDataType: string | null;
  transformation: string | null;
  required: boolean;
  defaultValue: string | null;
  notes: string | null;
  syncFlow: SyncFlow;
};

const HUBSPOT_KEYWORD = "hubspot";

type ColumnPalette = {
  header: string;
  headerStrong: string;
  cell: string;
  cellStrong: string;
};

const COLUMN_PALETTES: Record<"blue" | "green" | "orange", ColumnPalette> = {
  blue: {
    header: "border-[#cfe2fb] bg-[#f3f8ff] text-[#102f6f]",
    headerStrong: "border-[#dce8f2] bg-[#e7f1ff] text-[#102f6f]",
    cell: "border-[#e1ebf8] bg-[#f8fbff] text-[#24435f]",
    cellStrong: "border-[#e5edf5] bg-[#f3f8ff] text-[#183f73]"
  },
  green: {
    header: "border-[#cdece3] bg-[#f2fbf7] text-[#0f5d47]",
    headerStrong: "border-[#b9e4d6] bg-[#dff5ec] text-[#0f5d47]",
    cell: "border-[#dff0ea] bg-[#f6fcf9] text-[#24435f]",
    cellStrong: "border-[#b9e4d6] bg-[#e9f8f1] text-[#0f5d47]"
  },
  orange: {
    header: "border-[#f4d7b5] bg-[#fff6ec] text-[#8a4b12]",
    headerStrong: "border-[#efc794] bg-[#ffe8cf] text-[#8a4b12]",
    cell: "border-[#f8e1c7] bg-[#fffaf3] text-[#5f3b1f]",
    cellStrong: "border-[#efc794] bg-[#ffefd9] text-[#8a4b12]"
  }
};

const normalizeSystemName = (name: string) => name.trim().toLocaleLowerCase("fr");
const isHubSpotSystem = (name: string) => normalizeSystemName(name).includes(HUBSPOT_KEYWORD);

const getFlowColumnPalettes = (flow: SyncFlow) => {
  const sourceName = normalizeSystemName(flow.sourceSystem.name);
  const targetName = normalizeSystemName(flow.targetSystem.name);

  const sourceIsHubSpot = isHubSpotSystem(flow.sourceSystem.name);
  const targetIsHubSpot = isHubSpotSystem(flow.targetSystem.name);

  const sourcePrimary = sourceName.localeCompare(targetName, "fr", { sensitivity: "base" }) <= 0;

  const sourceKey: keyof typeof COLUMN_PALETTES = sourceIsHubSpot ? "orange" : sourcePrimary ? "blue" : "green";
  const targetKey: keyof typeof COLUMN_PALETTES = targetIsHubSpot ? "orange" : sourcePrimary ? "green" : "blue";

  return {
    source: COLUMN_PALETTES[sourceKey],
    target: COLUMN_PALETTES[targetKey]
  };
};

export default function FieldMappingsPage({ params }: { params: { id: string } }) {
  const [flows, setFlows] = useState<SyncFlow[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    direction: MAPPING_DIRECTIONS[0],
    sourceObjectType: "",
    sourceField: "",
    sourceInternalName: "",
    sourceDataType: "",
    targetObjectType: "",
    targetField: "",
    targetInternalName: "",
    targetDataType: "",
    reconciliationKey: false,
    transformation: "",
    required: false,
    defaultValue: "",
    notes: ""
  });
  const [form, setForm] = useState({
    syncFlowId: "",
    sourceField: "",
    targetField: "",
    sourceObjectType: "",
    targetObjectType: "",
    direction: MAPPING_DIRECTIONS[0],
    reconciliationKey: false,
    sourceInternalName: "",
    sourceDataType: "",
    targetInternalName: "",
    targetDataType: "",
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
      sourceObjectType: "",
      targetObjectType: "",
      direction: MAPPING_DIRECTIONS[0],
      reconciliationKey: false,
      sourceInternalName: "",
      sourceDataType: "",
      targetInternalName: "",
      targetDataType: "",
      transformation: "",
      required: false,
      defaultValue: "",
      notes: ""
    });
    load();
  };

  const remove = async (id: number) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    await fetch(`/api/field-mappings/${id}`, { method: "DELETE" });
    load();
  };

  const startEdit = (row: Mapping) => {
    setEditingId(row.id);
    setEditForm({
      direction: row.direction || MAPPING_DIRECTIONS[0],
      sourceObjectType: row.sourceObjectType || "",
      sourceField: row.sourceField || "",
      sourceInternalName: row.sourceInternalName || "",
      sourceDataType: row.sourceDataType || "",
      targetObjectType: row.targetObjectType || "",
      targetField: row.targetField || "",
      targetInternalName: row.targetInternalName || "",
      targetDataType: row.targetDataType || "",
      reconciliationKey: Boolean(row.reconciliationKey),
      transformation: row.transformation || "",
      required: Boolean(row.required),
      defaultValue: row.defaultValue || "",
      notes: row.notes || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    await fetch(`/api/field-mappings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    load();
  };

  const selectedFlow = flows.find((flow) => flow.id === Number(form.syncFlowId));
  const toObjectOptions = (value?: string | null) =>
    Array.from(
      new Set(
        (value || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
  const sourceObjectOptions = selectedFlow ? toObjectOptions(selectedFlow.sourceItemTypes) : [];
  const targetObjectOptions = selectedFlow ? toObjectOptions(selectedFlow.targetItemTypes) : [];
  const allowedDirections = selectedFlow?.direction === "bidirectional" ? MAPPING_DIRECTIONS : [MAPPING_DIRECTIONS[0]];
  const grouped = mappings.reduce<Record<number, Mapping[]>>((acc, mapping) => {
    if (!acc[mapping.syncFlowId]) acc[mapping.syncFlowId] = [];
    acc[mapping.syncFlowId].push(mapping);
    return acc;
  }, {});
  const getDirectionArrow = (direction: string) => (direction === "target_to_source" ? "←" : "→");

  return (
    <div className="grid gap-4">
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#102f6f]">Nouveau mapping de champs</h3>
          <button
            type="button"
            className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
            onClick={() => setIsCreateOpen((v) => !v)}
          >
            {isCreateOpen ? "Fermer" : "Créer un mapping"}
          </button>
        </div>

        {isCreateOpen ? (
          <form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="flex flex-col gap-0.5 md:col-span-4">
              <label className="text-sm font-medium text-[#35536f]">Flux</label>
              <select className="input" value={form.syncFlowId} onChange={(e) => setForm({ ...form, syncFlowId: e.target.value })} required>
                <option value="">Sélectionner</option>
                {flows.map((flow) => <option key={flow.id} value={flow.id}>{flow.name} ({flow.sourceSystem.name} → {flow.targetSystem.name})</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Objet source</label>
              {sourceObjectOptions.length > 0 ? (
                <select
                  className="input"
                  value={form.sourceObjectType}
                  onChange={(e) => setForm({ ...form, sourceObjectType: e.target.value })}
                >
                  <option value="">Sélectionner</option>
                  {sourceObjectOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="input"
                  value={form.sourceObjectType}
                  onChange={(e) => setForm({ ...form, sourceObjectType: e.target.value })}
                  placeholder="Saisir un objet source"
                />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Champ source</label>
              <input className="input" value={form.sourceField} onChange={(e) => setForm({ ...form, sourceField: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Nom interne source</label>
              <input className="input" value={form.sourceInternalName} onChange={(e) => setForm({ ...form, sourceInternalName: e.target.value })} />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Type source</label>
              <input className="input" value={form.sourceDataType} onChange={(e) => setForm({ ...form, sourceDataType: e.target.value })} />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Objet cible</label>
              {targetObjectOptions.length > 0 ? (
                <select
                  className="input"
                  value={form.targetObjectType}
                  onChange={(e) => setForm({ ...form, targetObjectType: e.target.value })}
                >
                  <option value="">Sélectionner</option>
                  {targetObjectOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="input"
                  value={form.targetObjectType}
                  onChange={(e) => setForm({ ...form, targetObjectType: e.target.value })}
                  placeholder="Saisir un objet cible"
                />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Champ cible</label>
              <input className="input" value={form.targetField} onChange={(e) => setForm({ ...form, targetField: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Nom interne cible</label>
              <input className="input" value={form.targetInternalName} onChange={(e) => setForm({ ...form, targetInternalName: e.target.value })} />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Type cible</label>
              <input className="input" value={form.targetDataType} onChange={(e) => setForm({ ...form, targetDataType: e.target.value })} />
            </div>

            <div className="flex flex-col gap-0.5 md:col-span-4">
              <label className="text-sm font-medium text-[#35536f]">Source -&gt; Cible</label>
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
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.reconciliationKey} onChange={(e) => setForm({ ...form, reconciliationKey: e.target.checked })} />
              Clé de réconciliation
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} />
              Requis
            </label>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Valeur par défaut</label>
              <input className="input" value={form.defaultValue} onChange={(e) => setForm({ ...form, defaultValue: e.target.value })} />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium text-[#35536f]">Transformation</label>
              <input className="input" value={form.transformation} onChange={(e) => setForm({ ...form, transformation: e.target.value })} />
            </div>
            <div className="flex flex-col gap-0.5 md:col-span-2">
              <label className="text-sm font-medium text-[#35536f]">Notes</label>
              <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="md:col-span-4">
              <button className="btn">Ajouter un mapping</button>
            </div>
          </form>
        ) : null}
      </section>

      <section className="grid min-w-0 gap-4">
        {flows.map((flow) => {
          const rows = grouped[flow.id] || [];
          const palettes = getFlowColumnPalettes(flow);
          return (
            <div key={flow.id} className="card min-w-0">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-[#102f6f]">
                  {flow.name}{" "}
                  <span className="text-base font-semibold">
                    (
                    <span className={isHubSpotSystem(flow.sourceSystem.name) ? "text-[#d97706]" : "text-[#0f7f64]"}>
                      {flow.sourceSystem.name}
                    </span>
                    <span className="text-[#577590]"> → </span>
                    <span className={isHubSpotSystem(flow.targetSystem.name) ? "text-[#d97706]" : "text-[#0f7f64]"}>
                      {flow.targetSystem.name}
                    </span>
                    )
                  </span>
                </h3>
              </div>

              {rows.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun mapping pour ce flux.</p>
              ) : (
                <div className="w-full max-w-full overflow-x-auto rounded-xl border border-[#dce8f2] bg-white">
                  <table className="min-w-[1600px] border-collapse text-sm">
                    <thead className="whitespace-nowrap">
                      <tr>
                        <th className="border border-[#dce8f2] bg-[#eef4fa] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#102f6f]">Sens</th>
                        <th className={`border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${palettes.source.header}`}>Objet source</th>
                        <th className={`sticky left-0 z-10 border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${palettes.source.header}`}>Champ source</th>
                        <th className={`border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${palettes.source.headerStrong}`}>Interne source</th>
                        <th className={`border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${palettes.source.header}`}>Type source</th>
                        <th className="border border-[#dce8f2] bg-[#eef4fa] px-3 py-2"></th>
                        <th className={`border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${palettes.target.header}`}>Objet cible</th>
                        <th className={`border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${palettes.target.header}`}>Champ cible</th>
                        <th className={`border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${palettes.target.headerStrong}`}>Interne cible</th>
                        <th className={`border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${palettes.target.header}`}>Type cible</th>
                        <th className="border border-[#dce8f2] bg-[#eef4fa] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#102f6f]">Clé reco</th>
                        <th className="border border-[#dce8f2] bg-[#eef4fa] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#102f6f]">Transformation</th>
                        <th className="border border-[#dce8f2] bg-[#eef4fa] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#102f6f]">Obligatoire</th>
                        <th className="border border-[#dce8f2] bg-[#eef4fa] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#102f6f]">Défaut</th>
                        <th className="border border-[#dce8f2] bg-[#eef4fa] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#102f6f]">Notes</th>
                        <th className="border border-[#dce8f2] bg-[#eef4fa] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#102f6f]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td className="border border-[#e5edf5] bg-white px-3 py-2 whitespace-nowrap font-medium text-[#24435f]">
                            {editingId === row.id ? (
                              <select
                                className="input min-w-[170px] py-1"
                                value={editForm.direction}
                                onChange={(e) => setEditForm({ ...editForm, direction: e.target.value })}
                              >
                                {MAPPING_DIRECTIONS.map((direction) => (
                                  <option key={direction} value={direction}>
                                    {MAPPING_DIRECTION_LABELS[direction]}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              MAPPING_DIRECTION_LABELS[row.direction as keyof typeof MAPPING_DIRECTION_LABELS]
                            )}
                          </td>
                          <td className={`border px-3 py-2 ${palettes.source.cell}`}>
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[180px] py-1"
                                value={editForm.sourceObjectType}
                                onChange={(e) => setEditForm({ ...editForm, sourceObjectType: e.target.value })}
                              />
                            ) : (
                              row.sourceObjectType || "-"
                            )}
                          </td>
                          <td className={`sticky left-0 z-[1] border px-3 py-2 font-mono text-[13px] ${palettes.source.cell}`}>
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[180px] py-1 font-mono"
                                value={editForm.sourceField}
                                onChange={(e) => setEditForm({ ...editForm, sourceField: e.target.value })}
                              />
                            ) : (
                              row.direction === "target_to_source" ? row.targetField : row.sourceField
                            )}
                          </td>
                          <td className={`border px-3 py-2 font-mono text-[13px] font-semibold ${palettes.source.cellStrong}`}>
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[180px] py-1 font-mono"
                                value={editForm.sourceInternalName}
                                onChange={(e) => setEditForm({ ...editForm, sourceInternalName: e.target.value })}
                              />
                            ) : (
                              row.sourceInternalName || "-"
                            )}
                          </td>
                          <td className={`border px-3 py-2 ${palettes.source.cell}`}>
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[140px] py-1"
                                value={editForm.sourceDataType}
                                onChange={(e) => setEditForm({ ...editForm, sourceDataType: e.target.value })}
                              />
                            ) : (
                              row.sourceDataType || "-"
                            )}
                          </td>
                          <td className="border border-[#e5edf5] px-3 py-2 text-center text-base font-semibold text-[#35536f]">
                            {editingId === row.id ? getDirectionArrow(editForm.direction) : getDirectionArrow(row.direction)}
                          </td>
                          <td className={`border px-3 py-2 ${palettes.target.cell}`}>
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[180px] py-1"
                                value={editForm.targetObjectType}
                                onChange={(e) => setEditForm({ ...editForm, targetObjectType: e.target.value })}
                              />
                            ) : (
                              row.targetObjectType || "-"
                            )}
                          </td>
                          <td className={`border px-3 py-2 font-mono text-[13px] ${palettes.target.cell}`}>
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[180px] py-1 font-mono"
                                value={editForm.targetField}
                                onChange={(e) => setEditForm({ ...editForm, targetField: e.target.value })}
                              />
                            ) : (
                              row.direction === "target_to_source" ? row.sourceField : row.targetField
                            )}
                          </td>
                          <td className={`border px-3 py-2 font-mono text-[13px] font-semibold ${palettes.target.cellStrong}`}>
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[180px] py-1 font-mono"
                                value={editForm.targetInternalName}
                                onChange={(e) => setEditForm({ ...editForm, targetInternalName: e.target.value })}
                              />
                            ) : (
                              row.targetInternalName || "-"
                            )}
                          </td>
                          <td className={`border px-3 py-2 ${palettes.target.cell}`}>
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[140px] py-1"
                                value={editForm.targetDataType}
                                onChange={(e) => setEditForm({ ...editForm, targetDataType: e.target.value })}
                              />
                            ) : (
                              row.targetDataType || "-"
                            )}
                          </td>
                          <td className="border border-[#e5edf5] px-3 py-2">
                            {editingId === row.id ? (
                              <label className="inline-flex items-center gap-2 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={editForm.reconciliationKey}
                                  onChange={(e) => setEditForm({ ...editForm, reconciliationKey: e.target.checked })}
                                />
                                oui
                              </label>
                            ) : (
                              row.reconciliationKey ? "oui" : "non"
                            )}
                          </td>
                          <td className="border border-[#e5edf5] px-3 py-2">
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[180px] py-1"
                                value={editForm.transformation}
                                onChange={(e) => setEditForm({ ...editForm, transformation: e.target.value })}
                              />
                            ) : (
                              row.transformation || "-"
                            )}
                          </td>
                          <td className="border border-[#e5edf5] px-3 py-2">
                            {editingId === row.id ? (
                              <label className="inline-flex items-center gap-2 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={editForm.required}
                                  onChange={(e) => setEditForm({ ...editForm, required: e.target.checked })}
                                />
                                oui
                              </label>
                            ) : (
                              row.required ? "oui" : "non"
                            )}
                          </td>
                          <td className="border border-[#e5edf5] px-3 py-2">
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[140px] py-1"
                                value={editForm.defaultValue}
                                onChange={(e) => setEditForm({ ...editForm, defaultValue: e.target.value })}
                              />
                            ) : (
                              row.defaultValue || "-"
                            )}
                          </td>
                          <td className="border border-[#e5edf5] px-3 py-2">
                            {editingId === row.id ? (
                              <input
                                className="input min-w-[220px] py-1"
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                              />
                            ) : (
                              row.notes || "-"
                            )}
                          </td>
                          <td className="border border-[#e5edf5] px-3 py-2">
                            {editingId === row.id ? (
                              <div className="flex items-center gap-2">
                                <button type="button" className="btn" onClick={() => saveEdit(row.id)}>Enregistrer</button>
                                <button
                                  type="button"
                                  className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                                  onClick={cancelEdit}
                                >
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                                  onClick={() => startEdit(row)}
                                >
                                  Éditer
                                </button>
                                <button type="button" className="btn-danger" onClick={() => remove(row.id)}>Supprimer</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
