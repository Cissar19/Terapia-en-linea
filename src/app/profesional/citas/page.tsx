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
import DailyTimeline from "@/components/profesional/DailyTimeline";
import CompletionModal from "@/components/profesional/CompletionModal";

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
  const [view, setView] = useState<"list" | "timeline">("list");
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

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-black text-foreground mb-8">Mis Citas</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl mb-3" />
          ))}
        </div>
      </div>
    );
  }

  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

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
              <p className="text-sm font-semibold text-foreground">
                {planBanner.patientName} no tiene un plan de intervencion
              </p>
              <p className="text-xs text-gray-500">Considera crear uno despues de esta primera sesion.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlanBanner(null)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
            >
              Cerrar
            </button>
            <Link
              href={`/profesional/planes?newFor=${planBanner.patientId}`}
              className="rounded-lg bg-yellow px-4 py-2 text-xs font-semibold text-white hover:bg-yellow/90 transition-colors"
            >
              Crear Plan
            </Link>
          </div>
        </div>
      )}

      {/* Header with view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-black text-foreground">Mis Citas</h1>
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              view === "list"
                ? "bg-white text-foreground shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              view === "timeline"
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="rounded-lg bg-blue/10 px-3 py-1 text-xs font-semibold text-blue hover:bg-blue/20 transition-colors"
            >
              Hoy
            </button>
            <span className="text-sm font-bold text-foreground">
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

      {/* List view */}
      {view === "list" && (
        <>
          {/* Confirmed */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Confirmadas</h2>
              <span className="text-xs text-gray-400">{confirmed.length}</span>
            </div>
            {confirmed.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">No hay citas confirmadas.</p>
            ) : (
              <div>
                {confirmed.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green/10 text-green text-xs font-bold">
                        {a.userName[0]?.toUpperCase() || "P"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.userName}</p>
                        <p className="text-xs text-gray-500">{a.serviceName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {a.date.toDate().toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {a.date.toDate().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <button
                        onClick={() => openCompletionModal(a.id)}
                        className="rounded-lg bg-blue/10 px-3 py-1.5 text-xs font-medium text-blue hover:bg-blue/20 transition-colors"
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
              <h2 className="text-sm font-bold text-foreground">Completadas</h2>
              <span className="text-xs text-gray-400">{completed.length}</span>
            </div>
            {completed.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">No hay citas completadas.</p>
            ) : (
              <div>
                {completed.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue text-xs font-bold">
                        {a.userName[0]?.toUpperCase() || "P"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.userName}</p>
                        <p className="text-xs text-gray-500">{a.serviceName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {a.date.toDate().toLocaleDateString("es-CL")}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-semibold text-blue">
                        Completada
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cancelled */}
          {cancelled.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground">Canceladas</h2>
                <span className="text-xs text-gray-400">{cancelled.length}</span>
              </div>
              <div>
                {cancelled.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 opacity-60">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red text-xs font-bold">
                        {a.userName[0]?.toUpperCase() || "P"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.userName}</p>
                        <p className="text-xs text-gray-500">{a.serviceName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {a.date.toDate().toLocaleDateString("es-CL")}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-red/10 px-2 py-0.5 text-[10px] font-semibold text-red">
                        Cancelada
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
