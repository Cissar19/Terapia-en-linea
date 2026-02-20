"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAppointmentsByPatient,
  getTasksByPatient,
  getNotesByPatient,
  toggleTaskCompleted,
} from "@/lib/firebase/firestore";
import type { Appointment, PatientTask, ClinicalNote } from "@/lib/firebase/types";

export default function MiPanelPage() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<PatientTask[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getAppointmentsByPatient(user.uid),
      getTasksByPatient(user.uid),
      getNotesByPatient(user.uid),
    ])
      .then(([appts, t, n]) => {
        setAppointments(appts);
        setTasks(t);
        setNotes(n);
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleToggleTask(taskId: string, completed: boolean) {
    await toggleTaskCompleted(taskId, !completed);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !completed } : t))
    );
  }

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "confirmed" && a.date.toDate() >= now
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === "completed"
  );
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Derive professional name from appointments or tasks
  const professionalName = appointments.find((a) => a.professionalName)?.professionalName
    || tasks.find((t) => t.professionalName)?.professionalName
    || null;

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-black text-foreground mb-2">
          Hola, {profile?.displayName?.split(" ")[0] || "Paciente"}
        </h1>
        <p className="text-gray-500 mb-8">Panel de seguimiento</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-5 w-32 bg-gray-100 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-12 bg-gray-50 rounded-xl" />
                <div className="h-12 bg-gray-50 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-foreground mb-2">
        Hola, {profile?.displayName?.split(" ")[0] || "Paciente"}
      </h1>
      <p className="text-gray-500 mb-8">Panel de seguimiento</p>

      {/* Professional info card */}
      {professionalName && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green/10 flex items-center justify-center flex-shrink-0">
            <svg className="h-6 w-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Tu profesional</p>
            <p className="text-sm font-bold text-foreground">{professionalName}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Próximas Citas</h2>
            <Link href="/#servicios" className="text-sm text-blue hover:underline font-medium">
              Agendar
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-3">No tienes citas próximas.</p>
              <Link
                href="/#servicios"
                className="inline-flex rounded-full bg-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue/90 transition-colors"
              >
                Agendar Cita
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 5).map((a) => (
                <div key={a.id} className="p-4 rounded-xl bg-blue/5 border border-blue/10">
                  <p className="text-sm font-semibold text-foreground">{a.serviceName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {a.date.toDate().toLocaleDateString("es-CL", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    —{" "}
                    {a.date.toDate().toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {a.professionalName && (
                    <p className="text-xs text-gray-400 mt-1">Con {a.professionalName}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks with progress */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Tareas para Casa</h2>

          {totalTasks === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No tienes tareas asignadas aún.
            </p>
          ) : (
            <>
              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-500">Progreso</span>
                  <span className="text-xs font-bold text-green">{completedTasks.length}/{totalTasks} completadas</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green rounded-full transition-all duration-500"
                    style={{ width: `${taskProgress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {pendingTasks.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-yellow/10 cursor-pointer hover:bg-yellow/15 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => handleToggleTask(t.id, t.completed)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green focus:ring-green/30"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      {t.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">Por {t.professionalName}</p>
                    </div>
                  </label>
                ))}
                {completedTasks.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-green/5 cursor-pointer hover:bg-green/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleToggleTask(t.id, t.completed)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green focus:ring-green/30"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-400 line-through">{t.title}</p>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Clinical Notes — readonly for parents */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Notas Clínicas</h2>
        <p className="text-xs text-gray-400 mb-4">Registro de observaciones del profesional después de cada sesión.</p>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            Aún no hay notas clínicas registradas.
          </p>
        ) : (
          <div className="space-y-4">
            {notes.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-lavender-light/50 border border-lavender/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue">
                    {n.createdAt.toDate().toLocaleDateString("es-CL", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session History */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Historial de Sesiones</h2>
        {pastAppointments.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            Aún no hay sesiones completadas.
          </p>
        ) : (
          <div className="space-y-3">
            {pastAppointments.map((a) => {
              const noteForSession = notes.find((n) => n.appointmentId === a.id);
              return (
                <div key={a.id} className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground">{a.serviceName}</p>
                    <span className="inline-flex items-center rounded-full bg-green/10 px-2.5 py-0.5 text-[10px] font-semibold text-green">
                      Completada
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {a.date.toDate().toLocaleDateString("es-CL", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                    {a.professionalName && ` — ${a.professionalName}`}
                  </p>
                  {noteForSession && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Nota de sesión:</p>
                      <p className="text-xs text-gray-600">{noteForSession.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/#servicios"
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow text-center"
        >
          <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-blue/10 flex items-center justify-center">
            <svg className="h-5 w-5 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">Agendar Cita</p>
        </Link>
        <Link
          href="/mi-panel/perfil"
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow text-center"
        >
          <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-pink/10 flex items-center justify-center">
            <svg className="h-5 w-5 text-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">Mi Perfil</p>
        </Link>
        <Link
          href="/#contacto"
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow text-center"
        >
          <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-green/10 flex items-center justify-center">
            <svg className="h-5 w-5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">Contacto</p>
        </Link>
      </div>
    </div>
  );
}
