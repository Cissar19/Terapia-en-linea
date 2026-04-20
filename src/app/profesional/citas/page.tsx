"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  updateAppointmentStatus,
  addClinicalNote,
  getActivePlanForPatient,
} from "@/lib/firebase/firestore";
import { useProfessionalAppointments } from "@/hooks/useAppointments";
import type { Appointment, InterventionPlan } from "@/lib/firebase/types";
import { useServices } from "@/contexts/ServicesContext";
import { formatCLP, formatDuration } from "@/lib/format";
import DailyTimeline from "@/components/profesional/DailyTimeline";
import CompletionModal from "@/components/profesional/CompletionModal";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";

const statusLabels: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CitasProfesionalPage() {
  const { user } = useAuth();
  const { data: appointments, loading } = useProfessionalAppointments(user?.uid);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completingPlan, setCompletingPlan] = useState<InterventionPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<"list" | "cards" | "timeline">("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [planBanner, setPlanBanner] = useState<{ patientId: string; patientName: string } | null>(null);

  async function openCompletionModal(appointmentId: string) {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;
    setCompletingId(appointmentId);
    try {
      const plan = await getActivePlanForPatient(apt.userId);
      setCompletingPlan(plan);
    } catch {
      setCompletingPlan(null);
    }
  }

  async function handleComplete(appointment: Appointment, noteContent: string) {
    if (!user) return;
    setSubmitting(true);
    await updateAppointmentStatus(appointment.id, "completed");

    if (noteContent.trim()) {
      await addClinicalNote({
        appointmentId: appointment.id,
        professionalId: user.uid,
        patientId: appointment.userId,
        patientName: appointment.userName,
        content: noteContent.trim(),
      });
    }

    // Check if this is the first completed session and the patient has no plan
    const patientCompletedCount = appointments.filter(
      (a) => a.userId === appointment.userId && a.status === "completed"
    ).length;
    if (patientCompletedCount === 0 && !completingPlan) {
      setPlanBanner({ patientId: appointment.userId, patientName: appointment.userName });
    }

    setCompletingId(null);
    setCompletingPlan(null);
    setSubmitting(false);
  }

  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const completedAll = appointments.filter((a) => a.status === "completed");
  const cancelledAll = appointments.filter((a) => a.status === "cancelled");

  const completedPag = usePagination(completedAll, 10);
  const cancelledPag = usePagination(cancelledAll, 10);

  if (loading) {
    return (
      <div>
        <h1 className="text-4xl font-black text-foreground mb-8">Mis Citas</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl mb-3" />
          ))}
        </div>
      </div>
    );
  }

  const timelineAppointments = appointments.filter((a) => {
    if (a.status === "cancelled") return false;
    const aptDate = a.date.toDate();
    return isSameDay(aptDate, selectedDate);
  });

  function handleTimelineComplete(appointment: Appointment) {
    openCompletionModal(appointment.id);
  }

  function shiftDate(days: number) {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + days);
      return d;
    });
  }

  const completingAppointment = completingId
    ? appointments.find((a) => a.id === completingId) ?? null
    : null;

  return (
    <div>
      {/* Completion Modal */}
      {completingAppointment && (
        <CompletionModal
          appointment={completingAppointment}
          patientPlan={completingPlan}
          onConfirm={(noteContent) => handleComplete(completingAppointment, noteContent)}
          onClose={() => { setCompletingId(null); setCompletingPlan(null); }}
          submitting={submitting}
        />
      )}

      {/* Plan suggestion banner */}
      {planBanner && (
        <div className="mb-6 p-4 rounded-2xl bg-yellow/10 border border-yellow/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-yellow/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {planBanner.patientName} no tiene un plan de intervencion
              </p>
              <p className="text-base text-gray-500">Considera crear uno despues de esta primera sesion.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlanBanner(null)}
              className="text-base text-gray-400 hover:text-gray-600 px-2 py-1"
            >
              Cerrar
            </button>
            <Link
              href={`/profesional/planes?newFor=${planBanner.patientId}`}
              className="rounded-lg bg-yellow px-4 py-2 text-base font-semibold text-white hover:bg-yellow/90 transition-colors"
            >
              Crear Plan
            </Link>
          </div>
        </div>
      )}

      {/* Header with view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-black text-foreground">Mis Citas</h1>
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-1.5 rounded-full text-base font-semibold transition-colors ${view === "list"
                ? "bg-white text-foreground shadow-sm"
                : "text-gray-500 hover:text-foreground"
              }`}
          >
            Lista
          </button>
          <button
            onClick={() => setView("cards")}
            className={`px-4 py-1.5 rounded-full text-base font-semibold transition-colors ${view === "cards"
                ? "bg-white text-foreground shadow-sm"
                : "text-gray-500 hover:text-foreground"
              }`}
          >
            Cards
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`px-4 py-1.5 rounded-full text-base font-semibold transition-colors ${view === "timeline"
                ? "bg-white text-foreground shadow-sm"
                : "text-gray-500 hover:text-foreground"
              }`}
          >
            Línea de Tiempo
          </button>
        </div>
      </div>

      {/* Date navigator (timeline mode only) */}
      {view === "timeline" && (
        <div className="flex items-center justify-between mb-6 bg-white rounded-2xl shadow-sm px-4 py-3">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="rounded-lg bg-blue/10 px-3 py-1 text-base font-semibold text-blue hover:bg-blue/20 transition-colors"
            >
              Hoy
            </button>
            <span className="text-lg font-bold text-foreground">
              {selectedDate.toLocaleDateString("es-CL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
          <button
            onClick={() => shiftDate(1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}

      {/* Timeline view */}
      {view === "timeline" && (
        <DailyTimeline
          appointments={timelineAppointments}
          date={selectedDate}
          onComplete={handleTimelineComplete}
        />
      )}

      {/* Cards view — grouped by week then day */}
      {view === "cards" && (() => {
        const getWeekStart = (d: Date) => {
          const day = d.getDay();
          const diff = day === 0 ? -6 : 1 - day;
          const mon = new Date(d);
          mon.setDate(d.getDate() + diff);
          mon.setHours(0, 0, 0, 0);
          return mon;
        };

        const getWeekLabel = (weekStart: Date) => {
          const now = new Date();
          const thisWeek = getWeekStart(now).getTime();
          const wt = weekStart.getTime();
          if (wt === thisWeek) return "Esta semana";
          if (wt === thisWeek + 7 * 86400000) return "Próxima semana";
          if (wt === thisWeek - 7 * 86400000) return "Semana pasada";
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return `Semana del ${weekStart.toLocaleDateString("es-CL", { day: "numeric", month: "short" })} al ${weekEnd.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`;
        };

        const getDayLabel = (d: Date) => {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          const dateStr = d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Santiago" });
          if (target === today) return `Hoy · ${dateStr}`;
          if (target === today + 86400000) return `Mañana · ${dateStr}`;
          if (target === today - 86400000) return `Ayer · ${dateStr}`;
          return dateStr;
        };

        // Sort all appointments chronologically
        const sorted = [...appointments].sort(
          (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
        );

        // Group by day key
        const byDay = new Map<string, { date: Date; items: Appointment[] }>();
        for (const a of sorted) {
          const d = a.date.toDate();
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (!byDay.has(key)) byDay.set(key, { date: d, items: [] });
          byDay.get(key)!.items.push(a);
        }

        // Group days by week
        const byWeek = new Map<number, { weekStart: Date; days: { date: Date; items: Appointment[] }[] }>();
        for (const { date, items } of byDay.values()) {
          const ws = getWeekStart(date);
          const wt = ws.getTime();
          if (!byWeek.has(wt)) byWeek.set(wt, { weekStart: ws, days: [] });
          byWeek.get(wt)!.days.push({ date, items });
        }

        const weeks = [...byWeek.values()].sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

        if (weeks.length === 0) {
          return (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <p className="text-lg text-gray-400">No hay citas registradas.</p>
            </div>
          );
        }

        return (
          <div className="space-y-8">
            {weeks.map(({ weekStart, days }) => (
              <div key={weekStart.getTime()}>
                {/* Week header */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-base font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {getWeekLabel(weekStart)}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div className="space-y-6">
                  {days.map(({ date, items }) => (
                    <div key={date.getTime()}>
                      {/* Day header */}
                      <p className="text-lg font-semibold text-foreground mb-3 capitalize">
                        {getDayLabel(date)}
                      </p>

                      {/* Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((a) => {
                          const isConfirmed = a.status === "confirmed";
                          const isCompleted = a.status === "completed";
                          return (
                            <div
                              key={a.id}
                              className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow ${
                                isConfirmed
                                  ? "border-green/15"
                                  : isCompleted
                                  ? "border-blue/10"
                                  : "border-gray-100 opacity-50"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-black ${
                                  isConfirmed ? "bg-green/10 text-green" : isCompleted ? "bg-blue/10 text-blue" : "bg-red/10 text-red"
                                }`}>
                                  {a.userName[0]?.toUpperCase() || "P"}
                                </span>
                                {isConfirmed && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2.5 py-0.5 text-sm font-semibold text-green">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse-soft" />
                                    Confirmada
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2.5 py-0.5 text-sm font-semibold text-blue">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Completada
                                  </span>
                                )}
                                {!isConfirmed && !isCompleted && (
                                  <span className="inline-flex items-center rounded-full bg-red/10 px-2.5 py-0.5 text-sm font-semibold text-red">
                                    Cancelada
                                  </span>
                                )}
                              </div>
                              <p className="text-lg font-bold text-foreground mb-0.5">{a.userName}</p>
                              <p className="text-base text-gray-500 mb-3">{a.serviceName}</p>
                              <div className="flex items-center gap-1.5 text-base text-gray-400 mb-4">
                                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {a.date.toDate().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago" })}
                              </div>
                              {isConfirmed && (
                                <button
                                  onClick={() => openCompletionModal(a.id)}
                                  className="w-full rounded-xl bg-blue/10 py-2 text-base font-semibold text-blue hover:bg-blue/20 transition-colors"
                                >
                                  Completar sesión
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* List view */}
      {view === "list" && (
        <>
          {/* Confirmed */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Confirmadas</h2>
              <span className="text-base text-gray-400">{confirmed.length}</span>
            </div>
            {confirmed.length === 0 ? (
              <p className="px-6 py-8 text-center text-lg text-gray-400">No hay citas confirmadas.</p>
            ) : (
              <div>
                {confirmed.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green/10 text-green text-base font-bold">
                        {a.userName[0]?.toUpperCase() || "P"}
                      </span>
                      <div>
                        <p className="text-lg font-medium text-foreground">{a.userName}</p>
                        <p className="text-base text-gray-500">{a.serviceName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-medium text-foreground">
                          {a.date.toDate().toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                        </p>
                        <p className="text-base text-gray-400">
                          {a.date.toDate().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <button
                        onClick={() => openCompletionModal(a.id)}
                        className="rounded-lg bg-blue/10 px-3 py-1.5 text-base font-medium text-blue hover:bg-blue/20 transition-colors"
                      >
                        Completar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Completadas</h2>
              <span className="text-base text-gray-400">{completedAll.length}</span>
            </div>
            {completedAll.length === 0 ? (
              <p className="px-6 py-8 text-center text-lg text-gray-400">No hay citas completadas.</p>
            ) : (
              <div>
                {completedPag.items.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue text-base font-bold">
                        {a.userName[0]?.toUpperCase() || "P"}
                      </span>
                      <div>
                        <p className="text-lg font-medium text-foreground">{a.userName}</p>
                        <p className="text-base text-gray-500">{a.serviceName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-gray-600">
                        {a.date.toDate().toLocaleDateString("es-CL")}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-blue/10 px-2 py-0.5 text-sm font-semibold text-blue">
                        Completada
                      </span>
                    </div>
                  </div>
                ))}
                <div className="px-6 pb-4">
                  <Pagination
                    page={completedPag.page}
                    totalPages={completedPag.totalPages}
                    totalItems={completedPag.totalItems}
                    hasNextPage={completedPag.hasNextPage}
                    hasPrevPage={completedPag.hasPrevPage}
                    onNext={completedPag.nextPage}
                    onPrev={completedPag.prevPage}
                    label="citas completadas"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cancelled */}
          {cancelledAll.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Canceladas</h2>
                <span className="text-base text-gray-400">{cancelledAll.length}</span>
              </div>
              <div>
                {cancelledPag.items.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 opacity-60">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red text-base font-bold">
                        {a.userName[0]?.toUpperCase() || "P"}
                      </span>
                      <div>
                        <p className="text-lg font-medium text-foreground">{a.userName}</p>
                        <p className="text-base text-gray-500">{a.serviceName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-gray-600">
                        {a.date.toDate().toLocaleDateString("es-CL")}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-red/10 px-2 py-0.5 text-sm font-semibold text-red">
                        Cancelada
                      </span>
                    </div>
                  </div>
                ))}
                <div className="px-6 pb-4">
                  <Pagination
                    page={cancelledPag.page}
                    totalPages={cancelledPag.totalPages}
                    totalItems={cancelledPag.totalItems}
                    hasNextPage={cancelledPag.hasNextPage}
                    hasPrevPage={cancelledPag.hasPrevPage}
                    onNext={cancelledPag.nextPage}
                    onPrev={cancelledPag.prevPage}
                    label="citas canceladas"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
