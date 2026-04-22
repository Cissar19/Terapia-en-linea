"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { Appointment, ClinicalNote, PatientTask, TaskPriority, TaskAttachment } from "@/lib/firebase/types";
import { Timestamp } from "firebase/firestore";

interface PatientInfo {
  id: string;
  name: string;
  email: string;
  appointmentCount: number;
  completedCount: number;
  lastAppointment: Date | null;
}

interface PatientModalProps {
  patient: PatientInfo;
  appointments: Appointment[];
  notes: ClinicalNote[];
  tasks: PatientTask[];
  onAddNote: (patientId: string, patientName: string, content: string) => Promise<void>;
  onAddTask: (patientId: string, patientName: string, data: TaskFormData) => Promise<void>;
  onClose: () => void;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority | "";
  dueDate: string;
  attachments: TaskAttachment[];
}

type Tab = "resumen" | "sesiones" | "tareas" | "notas";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  alta: "bg-red/10 text-red",
  media: "bg-yellow/15 text-orange",
  baja: "bg-green/10 text-green",
};

export default function PatientModal({
  patient,
  appointments,
  notes,
  tasks,
  onAddNote,
  onAddTask,
  onClose,
}: PatientModalProps) {
  const [tab, setTab] = useState<Tab>("resumen");
  const [submitting, setSubmitting] = useState(false);

  // Note form
  const [noteContent, setNoteContent] = useState("");

  // Task form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority | "">("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAttachments, setTaskAttachments] = useState<TaskAttachment[]>([]);
  const [taskDriveUrl, setTaskDriveUrl] = useState("");
  const [showDriveInput, setShowDriveInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const upcomingAppointments = appointments
    .filter((a) => a.status === "confirmed" && a.date.toDate() >= now)
    .sort((a, b) => a.date.toMillis() - b.date.toMillis());
  const pastAppointments = appointments
    .filter((a) => a.status !== "confirmed" || a.date.toDate() < now)
    .sort((a, b) => b.date.toMillis() - a.date.toMillis());

  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  async function submitNote() {
    if (!noteContent.trim()) return;
    setSubmitting(true);
    await onAddNote(patient.id, patient.name, noteContent.trim());
    setNoteContent("");
    setSubmitting(false);
  }

  async function submitTask() {
    if (!taskTitle.trim()) return;
    setSubmitting(true);
    await onAddTask(patient.id, patient.name, {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      priority: taskPriority,
      dueDate: taskDueDate,
      attachments: taskAttachments,
    });
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("");
    setTaskDueDate("");
    setTaskAttachments([]);
    setTaskDriveUrl("");
    setShowDriveInput(false);
    setSubmitting(false);
  }

  function addDriveLink() {
    if (!taskDriveUrl.trim()) return;
    const name = taskDriveUrl.includes("drive.google.com") ? "Google Drive" : taskDriveUrl;
    setTaskAttachments((prev) => [...prev, { name, url: taskDriveUrl.trim(), type: "drive" }]);
    setTaskDriveUrl("");
    setShowDriveInput(false);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "resumen", label: "Resumen" },
    { id: "sesiones", label: `Sesiones (${appointments.length})` },
    { id: "tareas", label: `Tareas (${tasks.length})` },
    { id: "notas", label: `Notas (${notes.length})` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green/10 text-green text-sm font-black">
              {patient.name[0]?.toUpperCase() || "P"}
            </span>
            <div>
              <p className="text-base font-black text-foreground">{patient.name}</p>
              <p className="text-xs text-gray-400">{patient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/profesional/pacientes/${patient.id}?name=${encodeURIComponent(patient.name)}`}
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Ver perfil completo →
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 flex-shrink-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "text-green border-b-2 border-green"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Resumen ── */}
          {tab === "resumen" && (
            <div className="space-y-4">
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-black text-foreground">{appointments.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Total citas</p>
                </div>
                <div className="rounded-xl bg-blue/5 p-4 text-center">
                  <p className="text-2xl font-black text-blue">{patient.completedCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Completadas</p>
                </div>
                <div className="rounded-xl bg-yellow/5 p-4 text-center">
                  <p className="text-2xl font-black text-orange">{pendingTasks.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tareas pend.</p>
                </div>
                <div className="rounded-xl bg-red/5 p-4 text-center">
                  <p className="text-2xl font-black text-red">{cancelledCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Canceladas</p>
                </div>
              </div>

              {/* Próxima cita */}
              {upcomingAppointments.length > 0 && (
                <div className="rounded-xl border border-green/15 bg-green/5 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Próxima sesión</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{upcomingAppointments[0].serviceName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {upcomingAppointments[0].date.toDate().toLocaleDateString("es-CL", {
                          weekday: "long", day: "numeric", month: "long", timeZone: "America/Santiago",
                        })}{" "}
                        · {upcomingAppointments[0].date.toDate().toLocaleTimeString("es-CL", {
                          hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago",
                        })}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green/15 px-2.5 py-1 text-xs font-semibold text-green">
                      <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                      Confirmada
                    </span>
                  </div>
                </div>
              )}

              {/* Última sesión */}
              {patient.lastAppointment && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Última actividad</p>
                  <p className="text-sm text-gray-600">
                    {patient.lastAppointment.toLocaleDateString("es-CL", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Santiago",
                    })}
                  </p>
                </div>
              )}

              {/* Tareas resumen */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tareas</p>
                {tasks.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin tareas asignadas.</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-green rounded-full transition-all"
                        style={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {completedTasks.length}/{tasks.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Notes preview */}
              {notes.length > 0 && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Última nota</p>
                  <p className="text-xs text-gray-400 mb-1">
                    {notes[0].createdAt.toDate().toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">{notes[0].content}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Sesiones ── */}
          {tab === "sesiones" && (
            <div className="space-y-5">
              {upcomingAppointments.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Próximas</p>
                  <div className="space-y-2">
                    {upcomingAppointments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-xl border border-green/15 bg-green/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{a.serviceName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {a.date.toDate().toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Santiago" })}
                            {" · "}
                            {a.date.toDate().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago" })}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green/15 px-2 py-0.5 text-xs font-semibold text-green">
                          <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                          Confirmada
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pastAppointments.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Historial</p>
                  <div className="space-y-2">
                    {pastAppointments.map((a) => (
                      <div key={a.id} className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                        a.status === "completed" ? "bg-blue/5 border border-blue/10" :
                        a.status === "cancelled" ? "bg-gray-50 border border-gray-100 opacity-60" :
                        "bg-gray-50 border border-gray-100"
                      }`}>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{a.serviceName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {a.date.toDate().toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "America/Santiago" })}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          a.status === "completed" ? "bg-blue/10 text-blue" :
                          a.status === "cancelled" ? "bg-red/10 text-red" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {a.status === "completed" ? "Completada" : a.status === "cancelled" ? "Cancelada" : "Confirmada"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {appointments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Sin sesiones registradas.</p>
              )}
            </div>
          )}

          {/* ── Tareas ── */}
          {tab === "tareas" && (
            <div className="space-y-4">
              {/* Add task form */}
              <div className="space-y-2 rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Nueva tarea</p>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Título de la tarea..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 bg-white"
                />
                <input
                  type="text"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Descripción o instrucciones (opcional)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 bg-white"
                />
                <div className="flex flex-wrap items-center gap-2">
                  {(["alta", "media", "baja"] as const).map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => setTaskPriority(taskPriority === pr ? "" : pr)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                        taskPriority === pr ? PRIORITY_COLORS[pr] + " ring-1 ring-current/30" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {pr.charAt(0).toUpperCase() + pr.slice(1)}
                    </button>
                  ))}
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="rounded-xl border border-gray-200 px-2.5 py-1 text-[10px] focus:outline-none focus:ring-2 focus:ring-green/30 bg-white"
                    title="Fecha límite"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const newAtts = Array.from(e.target.files).map((f) => ({
                        name: f.name, url: URL.createObjectURL(f), type: "file" as const, _file: f,
                      }));
                      setTaskAttachments((prev) => [...prev, ...newAtts as TaskAttachment[]]);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
                  >
                    + Archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDriveInput(!showDriveInput)}
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
                  >
                    + Drive
                  </button>
                </div>
                {showDriveInput && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={taskDriveUrl}
                      onChange={(e) => setTaskDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      onKeyDown={(e) => e.key === "Enter" && addDriveLink()}
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 bg-white"
                    />
                    <button
                      type="button"
                      onClick={addDriveLink}
                      disabled={!taskDriveUrl.trim()}
                      className="rounded-xl bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue/90 disabled:opacity-50 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                )}
                {taskAttachments.length > 0 && (
                  <div className="space-y-1.5">
                    {taskAttachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-3 py-2">
                        <span className="flex-1 text-xs truncate text-gray-600">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => setTaskAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-gray-300 hover:text-red transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={submitTask}
                    disabled={submitting || !taskTitle.trim()}
                    className="rounded-xl bg-yellow px-5 py-2 text-sm font-semibold text-foreground hover:bg-yellow/90 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Creando..." : "Crear Tarea"}
                  </button>
                </div>
              </div>

              {/* Tasks list */}
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sin tareas asignadas aún.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => {
                    const due = t.dueDate?.toDate() ?? null;
                    const overdue = due && !t.completed && due < now;
                    return (
                      <div
                        key={t.id}
                        className={`rounded-xl p-3 flex items-start gap-3 ${t.completed ? "bg-green/5" : "bg-yellow/5"}`}
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 ${t.completed ? "bg-green border-green" : "border-gray-300"}`}>
                          {t.completed && (
                            <svg className="h-full w-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-medium ${t.completed ? "line-through text-gray-400" : "text-foreground"}`}>
                              {t.title}
                            </p>
                            {t.priority && (
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[t.priority]}`}>
                                {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                              </span>
                            )}
                          </div>
                          {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <p className="text-[10px] text-gray-400">{t.createdAt.toDate().toLocaleDateString("es-CL")}</p>
                            {due && (
                              <span className={`text-[10px] font-medium ${overdue ? "text-red" : "text-gray-400"}`}>
                                {overdue ? "Vencida: " : "Límite: "}
                                {due.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                              </span>
                            )}
                          </div>
                          {t.attachments && t.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {t.attachments.map((att, ai) => (
                                <a
                                  key={ai}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                  {att.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Notas ── */}
          {tab === "notas" && (
            <div className="space-y-4">
              {/* Add note form */}
              <div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Escribir nota clínica..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={submitNote}
                    disabled={submitting || !noteContent.trim()}
                    className="rounded-xl bg-green px-5 py-2 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Guardando..." : "Guardar Nota"}
                  </button>
                </div>
              </div>

              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sin notas clínicas aún.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-xl bg-gray-50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {n.type && (
                          <span className="rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-semibold text-blue capitalize">
                            {n.type}
                          </span>
                        )}
                        <p className="text-xs text-gray-400">
                          {n.createdAt.toDate().toLocaleDateString("es-CL", {
                            weekday: "long", day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
