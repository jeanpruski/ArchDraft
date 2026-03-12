"use client";

import { useEffect, useMemo, useState } from "react";
import { MILESTONE_STATUS, MILESTONE_STATUS_LABELS } from "@/lib/constants";

type MilestoneStatus = (typeof MILESTONE_STATUS)[number];

type Milestone = {
  id: number;
  title: string;
  status: MilestoneStatus;
  dueDate: string | null;
};

type MilestoneForm = {
  title: string;
  status: MilestoneStatus;
  dueDate: string;
};

const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fromDateKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (key: string) => fromDateKey(key).toLocaleDateString("fr-FR");

const normalizeDueDate = (dueDate: string | null) => {
  if (!dueDate) return "";
  const [datePart] = dueDate.split("T");
  return datePart || "";
};

const addMonths = (date: Date, offset: number) =>
  new Date(date.getFullYear(), date.getMonth() + offset, 1);

const getCalendarStart = (monthDate: Date) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  const mondayBasedOffset = (dayOfWeek + 6) % 7;
  return new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() - mondayBasedOffset);
};

const getStatusClass = (status: MilestoneStatus) => {
  if (status === "done") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "in_progress") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "blocked") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
};

export default function TimelinePage({ params }: { params: { id: string } }) {
  const [rows, setRows] = useState<Milestone[]>([]);
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [createForm, setCreateForm] = useState<MilestoneForm>({
    title: "",
    status: MILESTONE_STATUS[0],
    dueDate: dateKey(new Date())
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<MilestoneForm>({
    title: "",
    status: MILESTONE_STATUS[0],
    dueDate: ""
  });

  const load = async () => {
    const res = await fetch(`/api/milestones?projectId=${params.id}`);
    setRows(await res.json());
  };

  useEffect(() => {
    load();
  }, [params.id]);

  useEffect(() => {
    setCreateForm((current) => ({ ...current, dueDate: selectedDate }));
  }, [selectedDate]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...createForm,
        projectId: Number(params.id),
        dueDate: createForm.dueDate || null
      })
    });
    setCreateForm({ title: "", status: MILESTONE_STATUS[0], dueDate: selectedDate });
    load();
  };

  const startEdit = (milestone: Milestone) => {
    setEditingId(milestone.id);
    setEditForm({
      title: milestone.title,
      status: milestone.status,
      dueDate: normalizeDueDate(milestone.dueDate)
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", status: MILESTONE_STATUS[0], dueDate: "" });
  };

  const saveEdit = async (id: number) => {
    await fetch(`/api/milestones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        dueDate: editForm.dueDate || null
      })
    });
    setEditingId(null);
    load();
  };

  const remove = async (id: number) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    await fetch(`/api/milestones/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    load();
  };

  const milestonesByDay = useMemo(() => {
    const map = new Map<string, Milestone[]>();
    rows.forEach((milestone) => {
      const key = normalizeDueDate(milestone.dueDate);
      if (!key) return;
      const list = map.get(key) || [];
      list.push(milestone);
      map.set(key, list);
    });

    map.forEach((list) => {
      list.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    });

    return map;
  }, [rows]);

  const days = useMemo(() => {
    const start = getCalendarStart(viewMonth);
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
      const key = dateKey(day);
      return {
        key,
        day,
        isCurrentMonth: day.getMonth() === viewMonth.getMonth(),
        milestones: milestonesByDay.get(key) || []
      };
    });
  }, [viewMonth, milestonesByDay]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aDate = normalizeDueDate(a.dueDate);
      const bDate = normalizeDueDate(b.dueDate);
      if (!aDate && !bDate) return a.title.localeCompare(b.title, "fr");
      if (!aDate) return 1;
      if (!bDate) return -1;
      if (aDate !== bDate) return aDate.localeCompare(bDate);
      return a.title.localeCompare(b.title, "fr");
    });
  }, [rows]);

  const selectedDayMilestones = milestonesByDay.get(selectedDate) || [];

  return (
    <div className="grid gap-4">
      <section className="card grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#102f6f]">Chronologie</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${viewMode === "calendar" ? "border-[#102f6f] bg-[#102f6f] text-white" : "border-[#dce8f2] bg-white text-[#102f6f] hover:bg-[#eef6ff]"}`}
              onClick={() => setViewMode("calendar")}
            >
              Calendrier
            </button>
            <button
              type="button"
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${viewMode === "list" ? "border-[#102f6f] bg-[#102f6f] text-white" : "border-[#dce8f2] bg-white text-[#102f6f] hover:bg-[#eef6ff]"}`}
              onClick={() => setViewMode("list")}
            >
              Liste
            </button>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <div className={`grid gap-4 ${isCreatePanelOpen ? "lg:grid-cols-[minmax(0,1fr)_340px]" : "lg:grid-cols-[minmax(0,1fr)_72px]"}`}>
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium capitalize text-[#35536f]">{monthLabel(viewMonth)}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[#dce8f2] bg-white px-3 py-1.5 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                    onClick={() => setViewMonth((current) => addMonths(current, -1))}
                  >
                    Mois précédent
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[#dce8f2] bg-white px-3 py-1.5 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                    onClick={() => setViewMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[#dce8f2] bg-white px-3 py-1.5 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                    onClick={() => setViewMonth((current) => addMonths(current, 1))}
                  >
                    Mois suivant
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#dce8f2]">
                <div className="grid min-w-[860px] grid-cols-7 bg-[#f8fbff]">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="border-b border-[#dce8f2] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#577590]">
                      {day}
                    </div>
                  ))}

                  {days.map((cell) => {
                    const isToday = dateKey(cell.day) === dateKey(new Date());
                    const isSelected = cell.key === selectedDate;
                    return (
                      <div
                        key={cell.key}
                        className={`min-h-[150px] cursor-pointer border-b border-r border-[#e6eef6] p-2 ${cell.isCurrentMonth ? "bg-white" : "bg-[#f7f9fc]"} ${isSelected ? "ring-2 ring-inset ring-[#0f7f64]" : ""}`}
                        onClick={() => {
                          setSelectedDate(cell.key);
                          setViewMonth(new Date(cell.day.getFullYear(), cell.day.getMonth(), 1));
                        }}
                      >
                        <div className="mb-2 flex items-center justify-between gap-1">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? "bg-[#102f6f] text-white" : "text-[#35536f] hover:bg-[#eef6ff]"}`}
                          >
                            {cell.day.getDate()}
                          </span>
                          <span className="text-[11px] text-[#7c8ea2]">
                            {cell.milestones.length > 0 ? `${cell.milestones.length} jalon(s)` : ""}
                          </span>
                        </div>

                        <div className="grid gap-1">
                          {cell.milestones.map((milestone) => (
                            <div key={milestone.id} className={`rounded-md border px-2 py-1 text-xs ${getStatusClass(milestone.status)}`}>
                              <div className="mb-1">
                                <p className="break-words font-medium leading-4">{milestone.title}</p>
                                <div className="mt-1 flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="shrink-0 text-[11px] text-rose-600 hover:text-rose-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      remove(milestone.id);
                                    }}
                                    title="Supprimer"
                                  >
                                    Suppr.
                                  </button>
                                  <button
                                    type="button"
                                    className="shrink-0 text-[11px] text-[#102f6f] hover:text-[#0f7f64]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEdit(milestone);
                                    }}
                                    title="Éditer"
                                  >
                                    Edit.
                                  </button>
                                </div>
                              </div>
                              <p className="text-[11px]">{MILESTONE_STATUS_LABELS[milestone.status]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className={`rounded-xl border border-[#dce8f2] bg-[#f9fbff] ${isCreatePanelOpen ? "p-3" : "p-2"}`}>
              {isCreatePanelOpen ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#102f6f]">Ajouter un jalon</p>
                    <button
                      type="button"
                      className="rounded-lg border border-[#dce8f2] bg-white px-2.5 py-1 text-xs font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                      onClick={() => setIsCreatePanelOpen(false)}
                    >
                      Replier
                    </button>
                  </div>
                  <p className="mb-3 mt-1 text-xs text-[#577590]">Jour sélectionné: {formatDate(selectedDate)}</p>
                  <form onSubmit={create} className="grid gap-2">
                    <input
                      className="input"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      placeholder="Titre du jalon"
                      required
                    />
                    <input
                      className="input"
                      type="date"
                      value={createForm.dueDate}
                      onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    />
                    <select
                      className="input"
                      value={createForm.status}
                      onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as MilestoneStatus })}
                    >
                      {MILESTONE_STATUS.map((status) => (
                        <option key={status} value={status}>
                          {MILESTONE_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <button className="btn">Ajouter</button>
                  </form>

                  <div className="mt-4 border-t border-[#e3edf7] pt-3">
                    <p className="mb-2 text-sm font-semibold text-[#102f6f]">Jalons du jour</p>
                    {selectedDayMilestones.length === 0 ? (
                      <p className="text-xs text-[#6b7f93]">Aucun jalon pour ce jour.</p>
                    ) : (
                      <div className="grid gap-2">
                        {selectedDayMilestones.map((milestone) => (
                          <div key={milestone.id} className={`rounded-lg border px-2 py-2 text-xs ${getStatusClass(milestone.status)}`}>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <p className="font-medium">{milestone.title}</p>
                              <button
                                type="button"
                                className="text-[#102f6f] hover:text-[#0f7f64]"
                                onClick={() => startEdit(milestone)}
                              >
                                Éditer
                              </button>
                            </div>
                            <p>{MILESTONE_STATUS_LABELS[milestone.status]}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="rounded-lg border border-[#dce8f2] bg-white px-2.5 py-1 text-xs font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                    onClick={() => setIsCreatePanelOpen(true)}
                  >
                    Ouvrir
                  </button>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="grid gap-2">
            {sortedRows.map((milestone) => {
              const dueDate = normalizeDueDate(milestone.dueDate);
              return (
                <div key={milestone.id} className="rounded-xl border border-[#dce8f2] bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#102f6f]">{milestone.title}</p>
                      <p className="text-xs text-[#577590]">
                        Date: {dueDate ? formatDate(dueDate) : "Non définie"}
                      </p>
                      <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs ${getStatusClass(milestone.status)}`}>
                        {MILESTONE_STATUS_LABELS[milestone.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                        onClick={() => startEdit(milestone)}
                      >
                        Éditer
                      </button>
                      <button type="button" className="btn-danger" onClick={() => remove(milestone.id)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {rows.length === 0 ? <p className="text-sm text-[#6b7f93]">Aucun jalon défini.</p> : null}
          </div>
        )}

        {editingId !== null ? (
          <div className="rounded-xl border border-[#dce8f2] bg-[#f9fbff] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#102f6f]">Édition en cours</p>
              <button
                type="button"
                className="rounded-lg border border-[#dce8f2] bg-white px-3 py-1.5 text-xs font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                onClick={cancelEdit}
              >
                Fermer
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              <input
                className="input md:col-span-2"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Titre du jalon"
              />
              <input
                className="input"
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              />
              <select
                className="input"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as MilestoneStatus })}
              >
                {MILESTONE_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {MILESTONE_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <div className="md:col-span-4 flex items-center gap-2">
                <button type="button" className="btn" onClick={() => saveEdit(editingId)}>
                  Enregistrer les changements
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#dce8f2] bg-white px-3 py-2 text-sm font-medium text-[#102f6f] hover:bg-[#eef6ff]"
                  onClick={cancelEdit}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
