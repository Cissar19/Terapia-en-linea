"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getInterventionPlansByProfessional } from "@/lib/firebase/firestore";
import { useProfessionalAppointments } from "@/hooks/useAppointments";
import { useProfessionalNotes } from "@/hooks/useNotes";
import { useProfessionalTasks } from "@/hooks/useTasks";
import type { InterventionPlan } from "@/lib/firebase/types";
import { useCountUp } from "@/hooks/useCountUp";

export default function ProfesionalPage() {
  const { user, profile } = useAuth();
  const { data: appointments, loading: loadingAppts } = useProfessionalAppointments(user?.uid);
  const { data: notes, loading: loadingNotes } = useProfessionalNotes(user?.uid);
  const { data: tasks, loading: loadingTasks } = useProfessionalTasks(user?.uid);
  const [plans, setPlans] = useState<InterventionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const loading = loadingAppts || loadingNotes || loadingTasks || loadingPlans;

  useEffect(() => {
    if (!user) return;
    getInterventionPlansByProfessional(user.uid)
      .catch(() => [] as InterventionPlan[])
      .then(setPlans)
      .finally(() => setLoadingPlans(false));
  }, [user]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = appointments.filter((a) => {
    const d = a.date.toDate();
    return d >= today && d < tomorrow && a.status === "confirmed";
  });

  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  const uniquePatients = new Set(appointments.map((a) => a.userId));
  const patientCount = uniquePatients.size;

  const pendingTaskCount = tasks.filter((t) => !t.completed).length;

  const activePlansCount = plans.filter((p) => p.status === "active").length;
  const patientIdsWithPlan = new Set(plans.filter((p) => p.status === "active").map((p) => p.patientId));
  const futureConfirmedPatientIds = new Set(
    appointments
      .filter((a) => a.status === "confirmed" && a.date.toDate() >= today)
      .map((a) => a.userId)
  );
  const patientsWithoutPlan = [...futureConfirmedPatientIds].filter((id) => !patientIdsWithPlan.has(id)).length;

  const recentNotes = notes.slice(0, 5);

  const upcomingAppointments = appointments
    .filter((a) => a.status === "confirmed" && a.date.toDate() >= today)
    .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())
    .slice(0, 5);

  // Animated counters
  const animTodayAppts = useCountUp(loading ? 0 : todayAppointments.length);
  const animPatients = useCountUp(loading ? 0 : patientCount);
  const animCompleted = useCountUp(loading ? 0 : completedCount);
  const animPlans = useCountUp(loading ? 0 : activePlansCount);
  const animPendingTasks = useCountUp(loading ? 0 : pendingTaskCount);

  // Progress for today's citas ring
  const todayTotal = todayAppointments.length;
  const todayProgress = todayTotal > 0 ? 100 : 0;

  const dateStr = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statCards = [
    { label: "Citas Hoy", value: animTodayAppts, color: "green", borderColor: "border-l-green", bgIcon: "bg-green/10", textColor: "text-green", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { label: "Pacientes", value: animPatients, color: "blue", borderColor: "border-l-blue", bgIcon: "bg-blue/10", textColor: "text-blue", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
    { label: "Sesiones Completadas", value: animCompleted, color: "green", borderColor: "border-l-green", bgIcon: "bg-green/10", textColor: "text-green", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { label: "Planes Activos", value: animPlans, color: "pink", borderColor: "border-l-pink", bgIcon: "bg-pink/10", textColor: "text-pink", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
    { label: "Tareas Pendientes", value: animPendingTasks, color: "yellow", borderColor: "border-l-yellow", bgIcon: "bg-yellow/10", textColor: "text-yellow", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  ];

  const delayClasses = [
    "animation-delay-1",
    "animation-delay-2",
    "animation-delay-3",
    "animation-delay-4",
    "animation-delay-5",
  ];

  if (loading) {
    return (
      <div>
        {/* Hero skeleton */}
        <div className="bg-lavender-light rounded-3xl p-6 mb-8 animate-pulse">
          <div className="h-6 w-48 bg-lavender rounded mb-2" />
          <div className="h-4 w-32 bg-lavender rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-gray-100 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-100" />
                <div>
                  <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
                  <div className="h-7 w-10 bg-gray-100 rounded" />
                </div>
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

        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground mb-1">
              Hola, {profile?.displayName?.split(" ")[0] || "Profesional"}
            </h1>
            <p className="text-sm text-gray-500 capitalize">{dateStr}</p>
          </div>
          {/* Mini progress ring — citas de hoy */}
          <div className="hidden sm:flex items-center gap-4">
            <div
              className="progress-ring relative"
              style={{ "--progress": todayProgress, "--ring-color": "#2DC653" } as React.CSSProperties}
            >
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-green z-10">
                {todayAppointments.length}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground leading-tight">Citas de hoy</p>
              <p className="text-sm text-gray-500">{todayAppointments.length} confirmadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${card.borderColor} hover:shadow-md hover:-translate-y-1 transition-all duration-200 animate-fade-in-up ${delayClasses[i]}`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${card.bgIcon} flex items-center justify-center flex-shrink-0`}>
                <svg className={`h-5 w-5 ${card.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {card.icon}
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={`text-2xl font-black ${card.textColor}`}>{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patients without plan alert */}
      {patientsWithoutPlan > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-yellow/10 border border-yellow/20 flex items-center justify-between animate-fade-in-up animation-delay-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-yellow/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {patientsWithoutPlan} {patientsWithoutPlan === 1 ? "paciente" : "pacientes"} sin plan de intervencion
              </p>
              <p className="text-xs text-gray-500">Pacientes con citas futuras confirmadas que no tienen un plan activo.</p>
            </div>
          </div>
          <Link
            href="/profesional/planes"
            className="rounded-lg bg-yellow px-4 py-2 text-xs font-semibold text-white hover:bg-yellow/90 transition-colors whitespace-nowrap"
          >
            Ver Planes
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow animate-fade-in-up animation-delay-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Citas de Hoy</h2>
            <Link href="/profesional/citas" className="text-sm text-blue hover:underline font-medium">
              Ver todas
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay citas para hoy.</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-green/5 border border-green/10 hover:bg-green/10 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.userName}</p>
                    <p className="text-xs text-gray-500">{a.serviceName}</p>
                  </div>
                  <p className="text-sm font-medium text-green">
                    {a.date.toDate().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow animate-fade-in-up animation-delay-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Próximas Citas</h2>
            <span className="text-xs text-gray-400">{confirmedCount} confirmadas</span>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay citas próximas.</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-blue/5 border border-blue/10 hover:bg-blue/10 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.userName}</p>
                    <p className="text-xs text-gray-500">{a.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-blue">
                      {a.date.toDate().toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.date.toDate().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent notes */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 hover:shadow-md transition-shadow animate-fade-in-up animation-delay-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Últimas Notas Clínicas</h2>
          <Link href="/profesional/notas" className="text-sm text-blue hover:underline font-medium">
            Ver todas
          </Link>
        </div>
        {recentNotes.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Aún no hay notas clínicas.</p>
        ) : (
          <div className="space-y-3">
            {recentNotes.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-gray-50 hover:bg-lavender-light/40 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green/10 text-green text-[10px] font-bold">
                      {n.patientName[0]?.toUpperCase() || "P"}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{n.patientName}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {n.createdAt.toDate().toLocaleDateString("es-CL")}
                  </p>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 ml-8">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending tasks */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 hover:shadow-md transition-shadow animate-fade-in-up animation-delay-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Tareas Pendientes</h2>
          <Link href="/profesional/pacientes" className="text-sm text-blue hover:underline font-medium">
            Ver todas
          </Link>
        </div>
        {(() => {
          const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 5);
          if (pendingTasks.length === 0) {
            return <p className="text-sm text-gray-400 py-4 text-center">No hay tareas pendientes.</p>;
          }
          return (
            <div className="space-y-3">
              {pendingTasks.map((t) => {
                const dueDateObj = t.dueDate ? t.dueDate.toDate() : null;
                const isOverdue = dueDateObj && dueDateObj < new Date();
                return (
                  <Link
                    key={t.id}
                    href={`/profesional/pacientes/${t.patientId}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-yellow/5 border border-yellow/10 hover:bg-yellow/10 transition-colors block"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow/15 text-yellow text-[10px] font-bold flex-shrink-0">
                        {t.patientName[0]?.toUpperCase() || "P"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                        <p className="text-xs text-gray-400">{t.patientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {t.priority && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          t.priority === "alta" ? "bg-red/10 text-red"
                            : t.priority === "media" ? "bg-yellow/15 text-orange"
                            : "bg-green/10 text-green"
                        }`}>
                          {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                        </span>
                      )}
                      {dueDateObj && (
                        <span className={`text-[10px] font-medium ${isOverdue ? "text-red" : "text-gray-400"}`}>
                          {isOverdue ? "Vencida" : dueDateObj.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in-up animation-delay-6">
        <Link
          href="/profesional/pacientes"
          className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
        >
          <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-green/10 flex items-center justify-center">
            <svg className="h-7 w-7 text-green group-hover-icon-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground group-hover:text-green transition-colors">Ver Pacientes</p>
        </Link>
        <Link
          href="/profesional/citas"
          className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
        >
          <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-blue/10 flex items-center justify-center">
            <svg className="h-7 w-7 text-blue group-hover-icon-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground group-hover:text-blue transition-colors">Gestionar Citas</p>
        </Link>
        <Link
          href="/profesional/notas"
          className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
        >
          <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-yellow/10 flex items-center justify-center">
            <svg className="h-7 w-7 text-yellow group-hover-icon-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground group-hover:text-yellow transition-colors">Notas Clínicas</p>
        </Link>
        <Link
          href="/profesional/planes"
          className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
        >
          <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-pink/10 flex items-center justify-center">
            <svg className="h-7 w-7 text-pink group-hover-icon-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground group-hover:text-pink transition-colors">Planes de Intervención</p>
        </Link>
        <Link
          href="/profesional/pacientes"
          className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
        >
          <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-yellow/10 flex items-center justify-center">
            <svg className="h-7 w-7 text-yellow group-hover-icon-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v4m-2-2h4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground group-hover:text-yellow transition-colors">Asignar Tareas</p>
        </Link>
      </div>
    </div>
  );
}
