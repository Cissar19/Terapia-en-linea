"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import BookingModal from "@/components/booking/BookingModal";
import { useCountUp } from "@/hooks/useCountUp";
import { toService, type Service } from "@/lib/services";
import { useServices } from "@/contexts/ServicesContext";
import { toggleTaskCompleted, cancelAppointmentByPatient } from "@/lib/firebase/firestore";
import { usePatientAppointments } from "@/hooks/useAppointments";
import { usePatientTasks } from "@/hooks/useTasks";
import { usePatientNotes } from "@/hooks/useNotes";
import CancelAppointmentModal from "@/components/paciente/CancelAppointmentModal";
import type { Appointment } from "@/lib/firebase/types";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function getRelativeDay(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Manana";
  if (diffDays < 7) return `En ${diffDays} dias`;
  if (diffDays < 14) return "En 1 semana";
  return `En ${Math.round(diffDays / 7)} semanas`;
}

export default function MiPanelPage() {
  const { user, profile } = useAuth();
  const { services: docs } = useServices();
  const services = useMemo(() => docs.map((d) => toService(d)), [docs]);
  const { data: appointments, loading: loadingAppts } = usePatientAppointments(user?.uid);
  const { data: tasks, loading: loadingTasks } = usePatientTasks(user?.uid);
  const { data: notes, loading: loadingNotes } = usePatientNotes(user?.uid);
  const loading = loadingAppts || loadingTasks || loadingNotes;
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Open booking modal from sidebar (custom event) or query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("agendar") === "1") {
      setShowServicePicker(true);
      window.history.replaceState({}, "", "/mi-panel");
    }

    const handler = () => setShowServicePicker(true);
    window.addEventListener("open-booking", handler);
    return () => window.removeEventListener("open-booking", handler);
  }, []);

  async function handleToggleTask(taskId: string, completed: boolean) {
    await toggleTaskCompleted(taskId, !completed);
  }

  async function handleCancelAppointment(appointment: Appointment) {
    if (!user) return;
    setCancelling(true);
    await cancelAppointmentByPatient(appointment.id, user.uid);
    setCancelling(false);
    setCancellingAppt(null);
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

  const professionalName = appointments.find((a) => a.professionalName)?.professionalName
    || tasks.find((t) => t.professionalName)?.professionalName
    || null;

  // Next appointment for countdown card
  const nextAppt = upcomingAppointments.sort(
    (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
  )[0] || null;

  // Mi Avance — computed values
  const sessionsCount = pastAppointments.length;
  const allDates = appointments.map((a) => a.date.toDate().getTime());
  const firstDate = allDates.length > 0 ? Math.min(...allDates) : 0;
  const daysInTreatment =
    firstDate > 0
      ? Math.max(1, Math.round((Date.now() - firstDate) / (1000 * 60 * 60 * 24)))
      : 0;

  const animSessions = useCountUp(sessionsCount);
  const animTaskPercent = useCountUp(taskProgress);
  const animDays = useCountUp(daysInTreatment);

  const sessionsByMonth = useMemo(() => {
    const months: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d
        .toLocaleDateString("es-CL", { month: "short" })
        .replace(".", "");
      const count = pastAppointments.filter((a) => {
        const ad = a.date.toDate();
        return (
          ad.getMonth() === d.getMonth() &&
          ad.getFullYear() === d.getFullYear()
        );
      }).length;
      months.push({ label: label.charAt(0).toUpperCase() + label.slice(1), count });
    }
    return months;
  }, [pastAppointments]);

  const maxSessions = Math.max(...sessionsByMonth.map((m) => m.count), 1);

  const milestones = [
    { label: "Primera sesion", unlocked: sessionsCount >= 1, color: "bg-blue/10 text-blue" },
    { label: "5 sesiones", unlocked: sessionsCount >= 5, color: "bg-green/10 text-green" },
    { label: "10 sesiones", unlocked: sessionsCount >= 10, color: "bg-yellow/20 text-orange" },
    { label: "Todas las tareas", unlocked: totalTasks > 0 && pendingTasks.length === 0, color: "bg-green/10 text-green" },
  ];

  const dateStr = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div>
        <div className="bg-lavender-light rounded-3xl p-6 mb-8 animate-pulse">
          <div className="h-6 w-48 bg-lavender rounded mb-2" />
          <div className="h-4 w-32 bg-lavender rounded" />
        </div>
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
      {/* Hero greeting banner */}
      <div className="relative bg-lavender-light rounded-3xl p-6 md:p-8 mb-8 overflow-hidden animate-fade-in-up">
        {/* Decorative shapes */}
        <svg className="absolute top-3 right-8 h-8 w-8 text-green/30 animate-float" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 22,20 2,20" />
        </svg>
        <svg className="absolute bottom-4 right-24 h-6 w-6 text-pink/30 animate-float-delayed" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <svg className="absolute top-6 right-44 h-5 w-5 text-yellow/40 animate-float-slow" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-1">
            {getGreeting()}, {profile?.displayName?.split(" ")[0] || "Paciente"}
          </h1>
          <p className="text-sm text-gray-500 capitalize">{dateStr}</p>
        </div>
      </div>

      {/* ── Profile completion banner ── */}
      {(() => {
        const fields = [
          { key: "phone", label: "Teléfono" },
          { key: "birthDate", label: "Fecha de nacimiento" },
          { key: "residenceCommune", label: "Comuna" },
          { key: "education", label: "Escolaridad" },
          { key: "diagnoses", label: "Diagnósticos" },
        ] as const;
        const missing = fields.filter((f) => !profile?.[f.key]?.trim?.());
        if (missing.length === 0) return null;
        const filled = fields.length - missing.length;
        const pct = Math.round((filled / fields.length) * 100);
        return (
          <Link
            href="/mi-panel/perfil"
            className="group block mb-6 animate-fade-in-up animation-delay-1"
          >
            <div className="relative overflow-hidden rounded-2xl border border-yellow/30 bg-gradient-to-br from-yellow/10 via-white to-orange/5 p-5 hover:shadow-md hover:border-yellow/50 transition-all duration-200">
              {/* Decorative blob */}
              <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-yellow/20 blur-2xl" />

              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 h-11 w-11 rounded-2xl bg-yellow/20 flex items-center justify-center">
                  <svg className="h-6 w-6 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground mb-0.5">
                    ¡Completa tu perfil para una mejor atención!
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Tu terapeuta necesita conocerte mejor para personalizar tu plan.
                    Aún te faltan:{" "}
                    <span className="font-semibold text-orange">
                      {missing.map((f) => f.label).join(", ")}
                    </span>.
                  </p>

                  {/* Progress bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-yellow/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-orange flex-shrink-0">{pct}% completado</span>
                  </div>
                </div>

                {/* Arrow */}
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:translate-x-0.5 transition-transform mt-0.5"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        );
      })()}

      {/* Next appointment countdown card */}
      {nextAppt && (
        <div className="bg-blue rounded-2xl p-6 mb-6 text-white animate-fade-in-up animation-delay-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">Proxima cita</p>
              <p className="text-base font-bold mb-1">{nextAppt.serviceName}</p>
              <p className="text-sm text-white/80">
                {nextAppt.date.toDate().toLocaleDateString("es-CL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                —{" "}
                {nextAppt.date.toDate().toLocaleTimeString("es-CL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {nextAppt.professionalName && (
                <p className="text-xs text-white/60 mt-1">Con {nextAppt.professionalName}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-green animate-pulse-soft" />
                <span className="text-xs text-white/70">Confirmada</span>
              </div>
              <p className="text-2xl font-black">{getRelativeDay(nextAppt.date.toDate())}</p>
            </div>
          </div>
        </div>
      )}

      {/* Professional info card */}
      {professionalName && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 flex items-center gap-4 hover:shadow-md transition-shadow animate-fade-in-up animation-delay-2">
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

      {/* ===== Mi Avance ===== */}
      <div className="mb-6 animate-fade-in-up animation-delay-3">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Mi Avance
        </h2>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue/10 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-blue">{animSessions}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Sesiones</p>
          </div>
          <div className="bg-green/10 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-green">
              {totalTasks > 0 ? `${animTaskPercent}%` : "\u2014"}
            </p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Tareas</p>
          </div>
          <div className="bg-pink/10 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-pink">
              {daysInTreatment > 0 ? animDays : "\u2014"}
            </p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Dias</p>
          </div>
        </div>

        {/* Session chart — last 6 months */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <p className="text-sm font-bold text-foreground mb-3">Sesiones por mes</p>
          {pastAppointments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Completa tu primera sesion para ver tu progreso aqui
            </p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {sessionsByMonth.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  {m.count > 0 && (
                    <span className="text-[10px] font-bold text-blue mb-1">{m.count}</span>
                  )}
                  <div
                    className={`w-full rounded-t-lg transition-colors ${m.count > 0 ? "bg-blue hover:bg-blue-dark" : "bg-gray-100"
                      }`}
                    style={{
                      height: m.count > 0
                        ? `${(m.count / maxSessions) * 80 + 10}%`
                        : "4px",
                    }}
                  />
                  <span className="text-[10px] text-gray-400 font-medium mt-1.5">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="flex flex-wrap gap-2">
          {milestones.map((m, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${m.unlocked ? m.color : "bg-gray-100 text-gray-400 opacity-50"
                }`}
            >
              {m.unlocked ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              {m.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow animate-fade-in-up animation-delay-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Próximas Citas</h2>
            <button onClick={() => setShowServicePicker(true)} className="text-sm text-blue hover:underline font-medium">
              Agendar
            </button>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-3">No tienes citas próximas.</p>
              <button
                onClick={() => setShowServicePicker(true)}
                className="inline-flex rounded-full bg-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue/90 transition-colors"
              >
                Agendar Cita
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 5).map((a) => (
                <div key={a.id} className="p-4 rounded-xl bg-blue/5 border border-blue/10 hover:bg-blue/10 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
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
                    <button
                      onClick={() => setCancellingAppt(a)}
                      className="text-[10px] font-medium text-red/70 hover:text-red transition-colors px-2 py-1 rounded-lg hover:bg-red/5"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks with progress ring */}
        <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow animate-fade-in-up animation-delay-5">
          <h2 className="text-lg font-bold text-foreground mb-4">Tareas para Casa</h2>

          {totalTasks === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No tienes tareas asignadas aún.
            </p>
          ) : (
            <>
              {/* Progress ring + stats */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="progress-ring-sm relative flex-shrink-0"
                  style={{ "--progress": taskProgress, "--ring-color": "#2DC653" } as React.CSSProperties}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-green">
                    {taskProgress}%
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500">Progreso</span>
                  <p className="text-sm font-bold text-green">{completedTasks.length}/{totalTasks} completadas</p>
                </div>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {pendingTasks.map((t) => {
                  const dueDateObj = t.dueDate ? t.dueDate.toDate() : null;
                  const isOverdue = dueDateObj && dueDateObj < new Date();
                  return (
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{t.title}</p>
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
                          <p className="text-[10px] text-gray-400">Por {t.professionalName}</p>
                          {dueDateObj && (
                            <span className={`text-[10px] font-medium ${isOverdue ? "text-red" : "text-gray-400"}`}>
                              {isOverdue ? "Vencida: " : "Limite: "}
                              {dueDateObj.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
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

      {/* Clinical Notes */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 hover:shadow-md transition-shadow animate-fade-in-up animation-delay-7">
        <h2 className="text-lg font-bold text-foreground mb-4">Notas Clínicas</h2>
        <p className="text-xs text-gray-400 mb-4">Registro de observaciones del profesional después de cada sesión.</p>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            Aún no hay notas clínicas registradas.
          </p>
        ) : (
          <div className="space-y-4">
            {notes.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-lavender-light/50 border border-lavender/30 hover:bg-lavender-light/70 transition-colors">
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
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 hover:shadow-md transition-shadow animate-fade-in-up animation-delay-8">
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
                <div key={a.id} className="p-4 rounded-xl bg-gray-50 hover:bg-lavender-light/30 transition-colors">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up animation-delay-9">
        <button
          onClick={() => setShowServicePicker(true)}
          className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
        >
          <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-blue/10 flex items-center justify-center">
            <svg className="h-7 w-7 text-blue group-hover-icon-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground group-hover:text-blue transition-colors">Agendar Cita</p>
        </button>
        <Link
          href="/mi-panel/perfil"
          className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
        >
          <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-pink/10 flex items-center justify-center">
            <svg className="h-7 w-7 text-pink group-hover-icon-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground group-hover:text-pink transition-colors">Mi Perfil</p>
        </Link>
        <Link
          href="/#contacto"
          className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
        >
          <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-green/10 flex items-center justify-center">
            <svg className="h-7 w-7 text-green group-hover-icon-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground group-hover:text-green transition-colors">Contacto</p>
        </Link>
      </div>

      {/* Service Picker Modal */}
      {showServicePicker && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowServicePicker(false)}
          />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-foreground">Elige un servicio</h2>
              <button
                onClick={() => setShowServicePicker(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto">
              {services.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => {
                    setSelectedService(s);
                    setShowServicePicker(false);
                  }}
                  className={`w-full text-left rounded-2xl ${s.bg} p-5 hover:ring-2 hover:ring-foreground/20 transition-all`}
                >
                  <p className="font-bold text-foreground">{s.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{s.price} · {s.duration}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      {/* Cancel Appointment Modal */}
      {cancellingAppt && (
        <CancelAppointmentModal
          appointment={cancellingAppt}
          onConfirm={() => handleCancelAppointment(cancellingAppt)}
          onClose={() => setCancellingAppt(null)}
          submitting={cancelling}
        />
      )}
    </div>
  );
}
