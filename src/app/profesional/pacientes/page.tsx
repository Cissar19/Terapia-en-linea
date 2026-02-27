"use client";

import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  addClinicalNote,
  addPatientTask,
  updatePatientTask,
} from "@/lib/firebase/firestore";
import { useProfessionalAppointments } from "@/hooks/useAppointments";
import { useProfessionalNotes } from "@/hooks/useNotes";
import { useProfessionalTasks } from "@/hooks/useTasks";
import { uploadTaskAttachment } from "@/lib/firebase/storage";
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

export default function PacientesPage() {
  const { user, profile } = useAuth();
  const { data: appointmentsData, loading: loadingAppts } = useProfessionalAppointments(user?.uid);
  const { data: notes, loading: loadingNotes } = useProfessionalNotes(user?.uid);
  const { data: tasks, loading: loadingTasks } = useProfessionalTasks(user?.uid);
  const loading = loadingAppts || loadingNotes || loadingTasks;

  const patients = useMemo(() => {
    const patientMap = new Map<string, PatientInfo>();
    appointmentsData.forEach((a: Appointment) => {
      const existing = patientMap.get(a.userId);
      const apptDate = a.date.toDate();
      if (existing) {
        existing.appointmentCount++;
        if (a.status === "completed") existing.completedCount++;
        if (!existing.lastAppointment || apptDate > existing.lastAppointment) {
          existing.lastAppointment = apptDate;
        }
      } else {
        patientMap.set(a.userId, {
          id: a.userId,
          name: a.userName,
          email: a.userEmail,
          appointmentCount: 1,
          completedCount: a.status === "completed" ? 1 : 0,
          lastAppointment: apptDate,
        });
      }
    });
    return Array.from(patientMap.values());
  }, [appointmentsData]);

  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"notas" | "tareas">("notas");

  // Form states
  const [noteContent, setNoteContent] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority | "">("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [taskAttachments, setTaskAttachments] = useState<TaskAttachment[]>([]);
  const [taskDriveUrl, setTaskDriveUrl] = useState("");
  const [showTaskDriveInput, setShowTaskDriveInput] = useState(false);
  const taskFileInputRef = useRef<HTMLInputElement>(null);

  async function handleAddNote(patientId: string, patientName: string) {
    if (!noteContent.trim() || !user) return;
    setSubmitting(true);
    await addClinicalNote({
      appointmentId: "",
      professionalId: user.uid,
      patientId,
      patientName,
      content: noteContent.trim(),
    });
    setNoteContent("");
    setSubmitting(false);
  }

  async function handleAddTask(patientId: string, patientName: string) {
    if (!taskTitle.trim() || !user || !profile) return;
    setSubmitting(true);
    const taskData: Parameters<typeof addPatientTask>[0] = {
      professionalId: user.uid,
      professionalName: profile.displayName,
      patientId,
      patientName,
      title: taskTitle.trim(),
      description: taskDescription.trim(),
    };
    if (taskPriority) taskData.priority = taskPriority;
    if (taskDueDate) taskData.dueDate = Timestamp.fromDate(new Date(taskDueDate + "T23:59:59"));

    const id = await addPatientTask(taskData);

    // Upload file attachments
    const uploadedAttachments: TaskAttachment[] = [];
    for (const att of taskAttachments) {
      if (att.type === "drive") {
        uploadedAttachments.push(att);
      } else {
        const fileAtt = att as TaskAttachment & { _file?: File };
        if (fileAtt._file) {
          const uploaded = await uploadTaskAttachment(fileAtt._file, id);
          uploadedAttachments.push(uploaded);
        }
      }
    }

    if (uploadedAttachments.length > 0) {
      taskData.attachments = uploadedAttachments;
      await updatePatientTask(id, { attachments: uploadedAttachments });
    }

    // Fire-and-forget email notification
    fetch("/api/tasks/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        priority: taskPriority || undefined,
        dueDate: taskDueDate ? new Date(taskDueDate + "T23:59:59").toISOString() : undefined,
        professionalName: profile.displayName,
        attachmentCount: uploadedAttachments.length || undefined,
      }),
    }).catch(() => { });

    // Revoke blob URLs to free memory
    taskAttachments.forEach((att) => {
      if (att.type === "file" && att.url.startsWith("blob:")) {
        URL.revokeObjectURL(att.url);
      }
    });
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("");
    setTaskDueDate("");
    setTaskAttachments([]);
    setTaskDriveUrl("");
    setShowTaskDriveInput(false);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-black text-foreground mb-8">Pacientes</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-gray-50">
              <div className="h-10 w-10 bg-gray-100 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-56 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Pacientes</h1>
          <p className="text-sm text-gray-500 mt-1">{patients.length} pacientes en total</p>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-1">Aún no tienes pacientes asignados.</p>
          <p className="text-xs text-gray-300">Los pacientes aparecerán aquí cuando tengan citas contigo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patients.map((p) => {
            const isExpanded = expandedPatient === p.id;
            const patientNotes = notes.filter((n) => n.patientId === p.id);
            const patientTasks = tasks.filter((t) => t.patientId === p.id);
            const pendingCount = patientTasks.filter((t) => !t.completed).length;
            const completedTaskCount = patientTasks.filter((t) => t.completed).length;

            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => {
                    setExpandedPatient(isExpanded ? null : p.id);
                    setNoteContent("");
                    setTaskTitle("");
                    setTaskDescription("");
                  }}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green/10 text-green text-sm font-bold">
                      {p.name[0]?.toUpperCase() || "P"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
                      <span>{p.appointmentCount} citas</span>
                      <span>{p.completedCount} completadas</span>
                      {pendingCount > 0 && (
                        <span className="text-yellow font-semibold">{pendingCount} tareas pend.</span>
                      )}
                    </div>
                    <Link
                      href={`/profesional/pacientes/${p.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden sm:inline-flex rounded-lg bg-green/10 px-3 py-1.5 text-xs font-semibold text-green hover:bg-green/20 transition-colors"
                    >
                      Ver perfil completo
                    </Link>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Mobile profile link */}
                    <div className="sm:hidden px-6 pt-4">
                      <Link
                        href={`/profesional/pacientes/${p.id}`}
                        className="inline-flex rounded-lg bg-green/10 px-3 py-1.5 text-xs font-semibold text-green hover:bg-green/20 transition-colors"
                      >
                        Ver perfil completo &rarr;
                      </Link>
                    </div>
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                      <button
                        onClick={() => setActiveTab("notas")}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === "notas"
                            ? "text-green border-b-2 border-green"
                            : "text-gray-400 hover:text-gray-600"
                          }`}
                      >
                        Notas Clínicas ({patientNotes.length})
                      </button>
                      <button
                        onClick={() => setActiveTab("tareas")}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === "tareas"
                            ? "text-green border-b-2 border-green"
                            : "text-gray-400 hover:text-gray-600"
                          }`}
                      >
                        Tareas ({completedTaskCount}/{patientTasks.length})
                      </button>
                    </div>

                    <div className="p-6">
                      {activeTab === "notas" ? (
                        <div className="space-y-4">
                          {/* Add note form */}
                          <div>
                            <textarea
                              value={noteContent}
                              onChange={(e) => setNoteContent(e.target.value)}
                              placeholder="Escribir nota clínica de la sesión..."
                              rows={3}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 resize-none"
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => handleAddNote(p.id, p.name)}
                                disabled={submitting || !noteContent.trim()}
                                className="rounded-xl bg-green px-5 py-2 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors"
                              >
                                {submitting ? "Guardando..." : "Guardar Nota"}
                              </button>
                            </div>
                          </div>

                          {/* Notes list */}
                          {patientNotes.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">Sin notas clínicas aún.</p>
                          ) : (
                            <div className="space-y-3">
                              {patientNotes.map((n) => (
                                <div key={n.id} className="p-4 rounded-xl bg-gray-50">
                                  <p className="text-xs text-gray-400 mb-2">
                                    {n.createdAt.toDate().toLocaleDateString("es-CL", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Add task form */}
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={taskTitle}
                                  onChange={(e) => setTaskTitle(e.target.value)}
                                  placeholder="Título de la tarea..."
                                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
                                />
                                <input
                                  type="text"
                                  value={taskDescription}
                                  onChange={(e) => setTaskDescription(e.target.value)}
                                  placeholder="Descripción o instrucciones (opcional)"
                                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
                                />
                              </div>
                              <button
                                onClick={() => handleAddTask(p.id, p.name)}
                                disabled={submitting || !taskTitle.trim()}
                                className="self-start rounded-xl bg-yellow px-5 py-2 text-sm font-semibold text-foreground hover:bg-yellow/90 disabled:opacity-50 transition-colors"
                              >
                                Crear
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex gap-1">
                                {(["alta", "media", "baja"] as const).map((pr) => (
                                  <button
                                    key={pr}
                                    type="button"
                                    onClick={() => setTaskPriority(taskPriority === pr ? "" : pr)}
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${taskPriority === pr
                                        ? pr === "alta" ? "bg-red/10 text-red ring-1 ring-red/30"
                                          : pr === "media" ? "bg-yellow/15 text-orange ring-1 ring-yellow/30"
                                            : "bg-green/10 text-green ring-1 ring-green/30"
                                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                      }`}
                                  >
                                    {pr.charAt(0).toUpperCase() + pr.slice(1)}
                                  </button>
                                ))}
                              </div>
                              <input
                                type="date"
                                value={taskDueDate}
                                onChange={(e) => setTaskDueDate(e.target.value)}
                                className="rounded-xl border border-gray-200 px-2.5 py-1 text-[10px] focus:outline-none focus:ring-2 focus:ring-green/30"
                                title="Fecha limite"
                              />
                              <input type="file" ref={taskFileInputRef} className="hidden" multiple onChange={(e) => {
                                if (!e.target.files) return;
                                const newAtts: TaskAttachment[] = Array.from(e.target.files).map((f) => ({
                                  name: f.name, url: URL.createObjectURL(f), type: "file" as const, _file: f,
                                })) as (TaskAttachment & { _file?: File })[];
                                setTaskAttachments((prev) => [...prev, ...newAtts]);
                              }} />
                            </div>
                            {/* Attachment buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => taskFileInputRef.current?.click()}
                                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-3 text-gray-500 hover:border-blue hover:bg-blue/5 hover:text-blue transition-all cursor-pointer"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                <span className="text-xs font-semibold">Subir archivo</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowTaskDriveInput(!showTaskDriveInput)}
                                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-3 text-gray-500 hover:border-blue hover:bg-blue/5 hover:text-blue transition-all cursor-pointer"
                              >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5L1.15 15l3.43 5.98h6.56L4.58 9.48l3.13-5.98zm1.14 0l6.56 11.48H24l-3.43-5.98H11.98L8.85 3.5zm5.71 12.48L11.14 21h13.43l3.43-5.98-3.43-.04H14.56z" /></svg>
                                <span className="text-xs font-semibold">Link de Drive</span>
                              </button>
                            </div>
                            {showTaskDriveInput && (
                              <div className="flex gap-2">
                                <input type="url" value={taskDriveUrl} onChange={(e) => setTaskDriveUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..." className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30" onKeyDown={(e) => {
                                  if (e.key === "Enter" && taskDriveUrl.trim()) {
                                    const name = taskDriveUrl.includes("drive.google.com") ? "Google Drive" : new URL(taskDriveUrl).hostname;
                                    setTaskAttachments((prev) => [...prev, { name, url: taskDriveUrl.trim(), type: "drive" }]);
                                    setTaskDriveUrl("");
                                    setShowTaskDriveInput(false);
                                  }
                                }} />
                                <button type="button" onClick={() => {
                                  if (!taskDriveUrl.trim()) return;
                                  const name = taskDriveUrl.includes("drive.google.com") ? "Google Drive" : new URL(taskDriveUrl).hostname;
                                  setTaskAttachments((prev) => [...prev, { name, url: taskDriveUrl.trim(), type: "drive" }]);
                                  setTaskDriveUrl("");
                                  setShowTaskDriveInput(false);
                                }} disabled={!taskDriveUrl.trim()} className="rounded-xl bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue/90 disabled:opacity-50 transition-colors">Agregar</button>
                              </div>
                            )}
                            {taskAttachments.length > 0 && (
                              <div className="space-y-1.5">
                                {taskAttachments.map((att, i) => (
                                  <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${att.type === "drive" ? "bg-blue/10" : "bg-gray-50"}`}>
                                    {att.type === "drive" ? (
                                      <svg className="h-4 w-4 text-blue flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5L1.15 15l3.43 5.98h6.56L4.58 9.48l3.13-5.98zm1.14 0l6.56 11.48H24l-3.43-5.98H11.98L8.85 3.5zm5.71 12.48L11.14 21h13.43l3.43-5.98-3.43-.04H14.56z" /></svg>
                                    ) : (
                                      <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    )}
                                    <span className={`text-sm font-medium flex-1 truncate ${att.type === "drive" ? "text-blue" : "text-foreground"}`}>{att.name}</span>
                                    <button type="button" onClick={() => setTaskAttachments((prev) => prev.filter((_, idx) => idx !== i))} className="p-1 rounded-lg text-gray-400 hover:text-red hover:bg-red/10 transition-colors">
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Tasks list */}
                          {patientTasks.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">Sin tareas asignadas aún.</p>
                          ) : (
                            <div className="space-y-2">
                              {patientTasks.map((t) => {
                                const dueDateObj = t.dueDate ? t.dueDate.toDate() : null;
                                const isOverdue = dueDateObj && !t.completed && dueDateObj < new Date();
                                return (
                                  <div
                                    key={t.id}
                                    className={`p-3 rounded-xl text-sm flex items-start gap-3 ${t.completed ? "bg-green/5" : "bg-yellow/10"
                                      }`}
                                  >
                                    <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 ${t.completed ? "bg-green border-green" : "border-gray-300"
                                      }`}>
                                      {t.completed && (
                                        <svg className="h-full w-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className={`font-medium ${t.completed ? "line-through text-gray-400" : "text-foreground"}`}>
                                          {t.title}
                                        </p>
                                        {t.priority && (
                                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.priority === "alta" ? "bg-red/10 text-red"
                                              : t.priority === "media" ? "bg-yellow/15 text-orange"
                                                : "bg-green/10 text-green"
                                            }`}>
                                            {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                                          </span>
                                        )}
                                      </div>
                                      {t.description && (
                                        <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                                      )}
                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <p className="text-[10px] text-gray-400">
                                          {t.createdAt.toDate().toLocaleDateString("es-CL")}
                                          {t.completed ? " — Completada" : " — Pendiente"}
                                        </p>
                                        {dueDateObj && (
                                          <span className={`text-[10px] font-medium ${isOverdue ? "text-red" : "text-gray-400"}`}>
                                            {isOverdue ? "Vencida: " : "Limite: "}
                                            {dueDateObj.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                                          </span>
                                        )}
                                      </div>
                                      {t.attachments && t.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {t.attachments.map((att, ai) => (
                                            <a key={ai} href={att.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${att.type === "drive" ? "bg-blue/10 text-blue hover:bg-blue/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                              {att.type === "drive" ? (
                                                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5L1.15 15l3.43 5.98h6.56L4.58 9.48l3.13-5.98zm1.14 0l6.56 11.48H24l-3.43-5.98H11.98L8.85 3.5zm5.71 12.48L11.14 21h13.43l3.43-5.98-3.43-.04H14.56z" /></svg>
                                              ) : (
                                                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                              )}
                                              <span className="max-w-[120px] truncate">{att.name}</span>
                                              <svg className="h-3.5 w-3.5 flex-shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
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
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
