"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAppointmentsByProfessional,
  getNotesByProfessional,
  getTasksByProfessional,
  addClinicalNote,
  addPatientTask,
} from "@/lib/firebase/firestore";
import type { Appointment, ClinicalNote, PatientTask } from "@/lib/firebase/types";

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
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [tasks, setTasks] = useState<PatientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"notas" | "tareas">("notas");

  // Form states
  const [noteContent, setNoteContent] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getAppointmentsByProfessional(user.uid),
      getNotesByProfessional(user.uid),
      getTasksByProfessional(user.uid),
    ])
      .then(([appts, n, t]) => {
        const patientMap = new Map<string, PatientInfo>();
        appts.forEach((a: Appointment) => {
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
        setPatients(Array.from(patientMap.values()));
        setNotes(n);
        setTasks(t);
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleAddNote(patientId: string, patientName: string) {
    if (!noteContent.trim() || !user) return;
    setSubmitting(true);
    const id = await addClinicalNote({
      appointmentId: "",
      professionalId: user.uid,
      patientId,
      patientName,
      content: noteContent.trim(),
    });
    setNotes((prev) => [
      {
        id,
        appointmentId: "",
        professionalId: user.uid,
        patientId,
        patientName,
        content: noteContent.trim(),
        createdAt: { toDate: () => new Date() } as ClinicalNote["createdAt"],
      },
      ...prev,
    ]);
    setNoteContent("");
    setSubmitting(false);
  }

  async function handleAddTask(patientId: string, patientName: string) {
    if (!taskTitle.trim() || !user || !profile) return;
    setSubmitting(true);
    const id = await addPatientTask({
      professionalId: user.uid,
      professionalName: profile.displayName,
      patientId,
      patientName,
      title: taskTitle.trim(),
      description: taskDescription.trim(),
    });
    setTasks((prev) => [
      {
        id,
        professionalId: user.uid,
        professionalName: profile.displayName,
        patientId,
        patientName,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        completed: false,
        createdAt: { toDate: () => new Date() } as PatientTask["createdAt"],
      },
      ...prev,
    ]);
    setTaskTitle("");
    setTaskDescription("");
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
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
                      <span>{p.appointmentCount} citas</span>
                      <span>{p.completedCount} completadas</span>
                      {pendingCount > 0 && (
                        <span className="text-yellow font-semibold">{pendingCount} tareas pend.</span>
                      )}
                    </div>
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
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                      <button
                        onClick={() => setActiveTab("notas")}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                          activeTab === "notas"
                            ? "text-green border-b-2 border-green"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        Notas Clínicas ({patientNotes.length})
                      </button>
                      <button
                        onClick={() => setActiveTab("tareas")}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                          activeTab === "tareas"
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

                          {/* Tasks list */}
                          {patientTasks.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">Sin tareas asignadas aún.</p>
                          ) : (
                            <div className="space-y-2">
                              {patientTasks.map((t) => (
                                <div
                                  key={t.id}
                                  className={`p-3 rounded-xl text-sm flex items-start gap-3 ${
                                    t.completed ? "bg-green/5" : "bg-yellow/10"
                                  }`}
                                >
                                  <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                                    t.completed ? "bg-green border-green" : "border-gray-300"
                                  }`}>
                                    {t.completed && (
                                      <svg className="h-full w-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <p className={`font-medium ${t.completed ? "line-through text-gray-400" : "text-foreground"}`}>
                                      {t.title}
                                    </p>
                                    {t.description && (
                                      <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                                    )}
                                    <p className="text-[10px] text-gray-400 mt-1">
                                      {t.createdAt.toDate().toLocaleDateString("es-CL")}
                                      {t.completed ? " — Completada" : " — Pendiente"}
                                    </p>
                                  </div>
                                </div>
                              ))}
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
