"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useProfessionalTasks } from "@/hooks/useTasks";
import { toggleTaskCompleted, getAllUsers, addPatientTask, updatePatientTask } from "@/lib/firebase/firestore";
import { uploadTaskAttachment } from "@/lib/firebase/storage";
import RichTextarea from "@/components/RichTextarea";
import MarkdownContent from "@/components/MarkdownContent";
import type { PatientTask, TaskPriority, TaskAttachment, UserProfile } from "@/lib/firebase/types";

type Filter = "pendientes" | "vencidas" | "completadas" | "todas";

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bg: string; text: string; dot: string }> = {
  alta: { label: "Alta", bg: "bg-red/10", text: "text-red", dot: "bg-red" },
  media: { label: "Media", bg: "bg-yellow/15", text: "text-orange", dot: "bg-yellow" },
  baja: { label: "Baja", bg: "bg-green/10", text: "text-green", dot: "bg-green" },
};

function PriorityBadge({ priority }: { priority?: TaskPriority }) {
  if (!priority) return null;
  const c = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function PrioritySelector({ value, onChange }: { value: TaskPriority | ""; onChange: (v: TaskPriority | "") => void }) {
  const options: { key: TaskPriority | ""; label: string }[] = [
    { key: "", label: "Sin prioridad" },
    { key: "alta", label: "Alta" },
    { key: "media", label: "Media" },
    { key: "baja", label: "Baja" },
  ];
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => {
        const isActive = value === opt.key;
        const colorClass = opt.key
          ? isActive
            ? `${PRIORITY_CONFIG[opt.key].bg} ${PRIORITY_CONFIG[opt.key].text} ring-1 ring-current`
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          : isActive
            ? "bg-gray-200 text-foreground ring-1 ring-gray-300"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200";
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${colorClass}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function TareasPage() {
  const { user, profile } = useAuth();
  const { data: tasks, loading } = useProfessionalTasks(user?.uid);
  const [filter, setFilter] = useState<Filter>("pendientes");
  const [toggling, setToggling] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<"patient" | "task">("patient");
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority | "">("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<(TaskAttachment & { _file?: File })[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();

  const filtered = useMemo(() => {
    switch (filter) {
      case "pendientes":
        return tasks.filter((t) => !t.completed);
      case "vencidas":
        return tasks.filter((t) => !t.completed && t.dueDate && t.dueDate.toDate() < now);
      case "completadas":
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, filter]);

  const sorted = useMemo(() => {
    const priorityWeight: Record<string, number> = { alta: 0, media: 1, baja: 2, "": 3 };
    return [...filtered].sort((a, b) => {
      if (!a.completed && !b.completed) {
        const aOverdue = a.dueDate && a.dueDate.toDate() < now;
        const bOverdue = b.dueDate && b.dueDate.toDate() < now;
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        const pw = (priorityWeight[a.priority || ""] ?? 3) - (priorityWeight[b.priority || ""] ?? 3);
        if (pw !== 0) return pw;
      }
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  const byPatient = useMemo(() => {
    const map = new Map<string, { patientName: string; tasks: PatientTask[] }>();
    for (const t of sorted) {
      if (!map.has(t.patientId)) {
        map.set(t.patientId, { patientName: t.patientName, tasks: [] });
      }
      map.get(t.patientId)!.tasks.push(t);
    }
    return Array.from(map.entries()).map(([patientId, val]) => ({ patientId, ...val }));
  }, [sorted]);

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const overdueCount = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate.toDate() < now).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  async function handleToggle(task: PatientTask) {
    setToggling(task.id);
    try {
      await toggleTaskCompleted(task.id, !task.completed);
    } finally {
      setToggling(null);
    }
  }

  async function openModal() {
    setShowModal(true);
    setModalStep("patient");
    setSelectedPatient(null);
    setPatientSearch("");
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("");
    setTaskDueDate("");
    setPendingAttachments([]);
    setLinkUrl("");
    setLinkName("");
    if (patients.length === 0) {
      setPatientsLoading(true);
      try {
        const all = await getAllUsers();
        setPatients(all.filter((u) => u.role === "paciente"));
      } finally {
        setPatientsLoading(false);
      }
    }
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  function closeModal() {
    pendingAttachments.forEach((a) => {
      if (a.type === "file" && a.url.startsWith("blob:")) URL.revokeObjectURL(a.url);
    });
    setShowModal(false);
  }

  function handleFileSelect(files: FileList | null) {
    if (!files) return;
    const newAtts = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: "file" as const,
      _file: f,
    }));
    setPendingAttachments((prev) => [...prev, ...newAtts]);
  }

  function addLink() {
    const url = linkUrl.trim();
    if (!url) return;
    let autoName: string;
    try {
      autoName = url.includes("drive.google.com") ? "Google Drive"
        : url.includes("youtube.com") || url.includes("youtu.be") ? "YouTube"
        : new URL(url).hostname;
    } catch {
      autoName = url;
    }
    const name = linkName.trim() || autoName;
    setPendingAttachments((prev) => [...prev, { name, url, type: "drive" }]);
    setLinkUrl("");
    setLinkName("");
  }

  function removeAttachment(index: number) {
    const removed = pendingAttachments[index];
    if (removed?.type === "file" && removed.url.startsWith("blob:")) URL.revokeObjectURL(removed.url);
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function selectPatient(p: UserProfile) {
    setSelectedPatient(p);
    setModalStep("task");
  }

  async function handleCreateTask() {
    if (!taskTitle.trim() || !selectedPatient || !user || !profile) return;
    setTaskSubmitting(true);
    try {
      const taskData: Parameters<typeof addPatientTask>[0] = {
        professionalId: user.uid,
        professionalName: profile.displayName,
        patientId: selectedPatient.uid,
        patientName: selectedPatient.displayName,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
      };
      if (taskPriority) taskData.priority = taskPriority;
      if (taskDueDate) taskData.dueDate = Timestamp.fromDate(new Date(taskDueDate + "T23:59:59"));

      const id = await addPatientTask(taskData);

      // Upload file attachments; keep drive/url links as-is
      const uploaded: TaskAttachment[] = [];
      for (const att of pendingAttachments) {
        if (att.type === "drive") {
          uploaded.push({ name: att.name, url: att.url, type: "drive" });
        } else if (att._file) {
          const result = await uploadTaskAttachment(att._file, id);
          uploaded.push(result);
        }
      }
      if (uploaded.length > 0) {
        await updatePatientTask(id, { attachments: uploaded });
      }

      fetch("/api/tasks/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.uid,
          title: taskTitle.trim(),
          description: taskDescription.trim() || undefined,
          priority: taskPriority || undefined,
          dueDate: taskDueDate ? new Date(taskDueDate + "T23:59:59").toISOString() : undefined,
          professionalName: profile.displayName,
          attachmentCount: uploaded.length || undefined,
        }),
      }).catch(() => {});

      closeModal();
    } finally {
      setTaskSubmitting(false);
    }
  }

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase();
    return patients.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [patients, patientSearch]);

  const filterOptions: { key: Filter; label: string; count: number; color: string }[] = [
    { key: "pendientes", label: "Pendientes", count: pendingCount, color: "text-orange" },
    { key: "vencidas", label: "Vencidas", count: overdueCount, color: "text-red" },
    { key: "completadas", label: "Completadas", count: completedCount, color: "text-green" },
    { key: "todas", label: "Todas", count: tasks.length, color: "text-gray-500" },
  ];

  if (loading) {
    return (
      <div>
        <div className="bg-lavender-light rounded-3xl p-6 mb-6 animate-pulse">
          <div className="h-6 w-40 bg-lavender rounded mb-2" />
          <div className="h-4 w-24 bg-lavender rounded" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
              <div className="h-4 w-48 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="relative bg-lavender-light rounded-3xl p-6 md:p-8 mb-6 overflow-hidden animate-fade-in-up">
        <svg className="absolute top-3 right-8 h-8 w-8 text-yellow/30 animate-float" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 22,20 2,20" />
        </svg>
        <svg className="absolute bottom-4 right-24 h-6 w-6 text-orange/30 animate-float-delayed" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground mb-1">Tareas</h1>
            <p className="text-sm text-gray-500">
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
              {overdueCount > 0 && (
                <span className="ml-2 font-semibold text-red">· {overdueCount} vencida{overdueCount !== 1 ? "s" : ""}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-full bg-yellow px-4 py-2 text-sm font-semibold text-foreground hover:bg-yellow/90 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nueva tarea
            </button>
            <Link
              href="/profesional/tareas/plantillas"
              className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-gray-200 px-4 py-2 text-sm font-semibold text-foreground hover:bg-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Plantillas
            </Link>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-in-up animation-delay-1">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={`rounded-2xl p-4 text-left transition-all ${
              filter === opt.key
                ? "bg-white shadow-md ring-2 ring-foreground/10"
                : "bg-white/60 hover:bg-white hover:shadow-sm"
            }`}
          >
            <p className={`text-2xl font-black ${opt.color}`}>{opt.count}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{opt.label}</p>
          </button>
        ))}
      </div>

      {/* Task list */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center animate-fade-in-up animation-delay-2">
          <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-yellow/10 flex items-center justify-center">
            <svg className="h-7 w-7 text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            {filter === "vencidas" ? "Sin tareas vencidas" :
             filter === "completadas" ? "Sin tareas completadas" :
             filter === "pendientes" ? "Sin tareas pendientes" :
             "Sin tareas asignadas"}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Crea una tarea personalizada o asígnala desde el perfil del paciente.
          </p>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-full bg-yellow px-4 py-2 text-sm font-semibold text-foreground hover:bg-yellow/90 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva tarea
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-up animation-delay-2">
          {byPatient.map(({ patientId, patientName, tasks: ptasks }) => (
            <div key={patientId}>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/profesional/pacientes/${patientId}`}
                  className="group flex items-center gap-2 flex-1 min-w-0"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/15 text-green text-sm font-black flex-shrink-0">
                    {patientName[0]?.toUpperCase() || "P"}
                  </span>
                  <span className="text-base font-bold text-foreground group-hover:text-green transition-colors truncate">
                    {patientName}
                  </span>
                  <svg className="h-3.5 w-3.5 text-gray-300 group-hover:text-green transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                {ptasks.length > 1 && (
                  <button
                    onClick={() => setCollapsed((prev) => {
                      const next = new Set(prev);
                      next.has(patientId) ? next.delete(patientId) : next.add(patientId);
                      return next;
                    })}
                    className="flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-500 transition-colors flex-shrink-0"
                  >
                    <svg
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${collapsed.has(patientId) ? "-rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    {collapsed.has(patientId) ? `Ver ${ptasks.length} tareas` : "Colapsar"}
                  </button>
                )}
              </div>

              <div className={`space-y-2 ${collapsed.has(patientId) ? "hidden" : ""}`}>
                {ptasks.map((task) => {
                  const dueDateObj = task.dueDate ? task.dueDate.toDate() : null;
                  const isOverdue = !task.completed && dueDateObj && dueDateObj < now;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                        task.completed
                          ? "bg-green/5 border-green/10"
                          : isOverdue
                          ? "bg-red/5 border-red/15"
                          : "bg-white border-gray-100 shadow-sm"
                      }`}
                    >
                      <button
                        onClick={() => handleToggle(task)}
                        disabled={toggling === task.id}
                        className={`mt-0.5 h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          task.completed
                            ? "bg-green border-green"
                            : isOverdue
                            ? "border-red hover:bg-red hover:border-red"
                            : "border-gray-300 hover:border-green"
                        } ${toggling === task.id ? "opacity-50" : ""}`}
                      >
                        {task.completed && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className={`text-base font-semibold ${task.completed ? "line-through text-gray-400" : "text-foreground"}`}>
                            {task.title}
                          </p>
                          <PriorityBadge priority={task.priority} />
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red/10 px-2 py-0.5 text-xs font-bold text-red">
                              Vencida
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <MarkdownContent content={task.description} className="text-sm text-gray-500 mt-0.5" />
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {dueDateObj && (() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const diff = Math.round((dueDateObj.getTime() - today.getTime()) / 86400000);
                            const dateStr = dueDateObj.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
                            let countdown = "";
                            if (!task.completed) {
                              if (diff < 0) countdown = ` · vencida hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? "s" : ""}`;
                              else if (diff === 0) countdown = " · vence hoy";
                              else if (diff === 1) countdown = " · vence mañana";
                              else countdown = ` · faltan ${diff} días`;
                            }
                            return (
                              <span className={`text-xs font-medium ${isOverdue ? "text-red" : diff <= 1 && !task.completed ? "text-orange" : "text-gray-400"}`}>
                                Límite: {dateStr}{countdown}
                              </span>
                            );
                          })()}
                          {task.attachments && task.attachments.length > 0 && (
                            <span className="text-xs text-gray-400">
                              {task.attachments.length} adjunto{task.attachments.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/profesional/pacientes/${patientId}?tab=tareas`}
                        className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-blue hover:bg-blue/10 transition-colors"
                        title="Ver en perfil del paciente"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                {modalStep === "task" && (
                  <button
                    onClick={() => setModalStep("patient")}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {modalStep === "patient" ? "Seleccionar paciente" : "Nueva tarea"}
                  </h2>
                  {modalStep === "task" && selectedPatient && (
                    <p className="text-xs text-gray-400">Para {selectedPatient.displayName}</p>
                  )}
                </div>
              </div>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step 1: Patient picker */}
            {modalStep === "patient" && (
              <>
                <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Buscar paciente..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow/40"
                  />
                </div>
                <div className="overflow-y-auto flex-1 p-4">
                  {patientsLoading ? (
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      {patientSearch ? "Sin resultados." : "No hay pacientes registrados."}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredPatients.map((p) => (
                        <button
                          key={p.uid}
                          onClick={() => selectPatient(p)}
                          className="w-full flex items-center gap-3 rounded-2xl bg-gray-50 hover:bg-lavender-light p-4 transition-colors text-left"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green/15 text-green text-sm font-black flex-shrink-0">
                            {p.displayName[0]?.toUpperCase() || "P"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{p.displayName}</p>
                            <p className="text-xs text-gray-400 truncate">{p.email}</p>
                          </div>
                          <svg className="h-4 w-4 text-gray-300 flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Task form */}
            {modalStep === "task" && (
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Título de la tarea..."
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow/40"
                />
                <RichTextarea
                  value={taskDescription}
                  onChange={setTaskDescription}
                  placeholder="Descripción o instrucciones (opcional)"
                  minRows={3}
                />
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Prioridad</label>
                  <PrioritySelector value={taskPriority} onChange={setTaskPriority} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Fecha límite</label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow/40"
                    />
                    {taskDueDate && (() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const due = new Date(taskDueDate + "T00:00:00");
                      const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
                      if (diff < 0) return (
                        <span className="text-xs font-semibold text-red">
                          Vencida hace {Math.abs(diff)} día{Math.abs(diff) !== 1 ? "s" : ""}
                        </span>
                      );
                      if (diff === 0) return (
                        <span className="text-xs font-semibold text-orange">Vence hoy</span>
                      );
                      if (diff === 1) return (
                        <span className="text-xs font-semibold text-orange">Vence mañana</span>
                      );
                      return (
                        <span className="text-xs font-semibold text-green">
                          Faltan {diff} días
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Adjuntos</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-3 text-sm text-gray-500 hover:border-blue hover:bg-blue/5 hover:text-blue transition-all"
                    >
                      <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="font-semibold">Archivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLinkInput((v) => !v)}
                      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-3 text-sm text-gray-500 hover:border-blue hover:bg-blue/5 hover:text-blue transition-all"
                    >
                      <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                      <span className="font-semibold">Link</span>
                    </button>
                  </div>

                  {showLinkInput && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={linkName}
                        onChange={(e) => setLinkName(e.target.value)}
                        placeholder="Nombre del link (ej: Tarea 1, Video YouTube...)"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
                          onKeyDown={(e) => e.key === "Enter" && addLink()}
                        />
                        <button
                          type="button"
                          onClick={addLink}
                          disabled={!linkUrl.trim()}
                          className="rounded-xl bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue/90 disabled:opacity-50 transition-colors"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  )}

                  {pendingAttachments.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {pendingAttachments.map((att, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${att.type === "drive" ? "bg-blue/10" : "bg-gray-50"}`}
                        >
                          {att.type === "drive" ? (
                            <svg className="h-4 w-4 text-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                            </svg>
                          )}
                          <span className={`text-xs font-medium flex-1 truncate ${att.type === "drive" ? "text-blue" : "text-foreground"}`}>
                            {att.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="p-1 rounded-lg text-gray-400 hover:text-red hover:bg-red/10 transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={closeModal}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateTask}
                    disabled={taskSubmitting || !taskTitle.trim()}
                    className="rounded-xl bg-yellow px-5 py-2 text-sm font-semibold text-foreground hover:bg-yellow/90 disabled:opacity-50 transition-colors"
                  >
                    {taskSubmitting ? "Creando..." : "Crear tarea"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
