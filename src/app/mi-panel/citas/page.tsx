"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientAppointments } from "@/hooks/useAppointments";
import { cancelAppointmentByPatient } from "@/lib/firebase/firestore";
import CancelAppointmentModal from "@/components/paciente/CancelAppointmentModal";
import type { Appointment } from "@/lib/firebase/types";

type Filter = "todas" | "proximas" | "historial" | "canceladas";
type ViewMode = "lista" | "cards";

function StatusBadge({ status }: { status: Appointment["status"] }) {
  if (status === "confirmed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue">
        <span className="h-1.5 w-1.5 rounded-full bg-blue animate-pulse-soft" />
        Confirmada
      </span>
    );
  if (status === "completed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2.5 py-0.5 text-[10px] font-semibold text-green">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Completada
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red/10 px-2.5 py-0.5 text-[10px] font-semibold text-red/70">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      Cancelada
    </span>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santiago",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}

export default function MisCitasPage() {
  const { user } = useAuth();
  const { data: appointments, loading } = usePatientAppointments(user?.uid);
  const [filter, setFilter] = useState<Filter>("todas");
  const [view, setView] = useState<ViewMode>("cards");
  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const now = new Date();

  const filtered = useMemo(() => {
    const sorted = [...appointments].sort(
      (a, b) => b.date.toDate().getTime() - a.date.toDate().getTime()
    );
    if (filter === "proximas")
      return sorted.filter((a) => a.status === "confirmed" && a.date.toDate() >= now);
    if (filter === "historial")
      return sorted.filter((a) => a.status === "completed");
    if (filter === "canceladas")
      return sorted.filter((a) => a.status === "cancelled");
    return sorted;
  }, [appointments, filter]);

  const counts = useMemo(() => ({
    todas: appointments.length,
    proximas: appointments.filter((a) => a.status === "confirmed" && a.date.toDate() >= now).length,
    historial: appointments.filter((a) => a.status === "completed").length,
    canceladas: appointments.filter((a) => a.status === "cancelled").length,
  }), [appointments]);

  async function handleCancel(appt: Appointment) {
    if (!user) return;
    setCancelling(true);
    await cancelAppointmentByPatient(appt.id, user.uid);
    setCancelling(false);
    setCancellingAppt(null);
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "proximas", label: "Próximas" },
    { key: "historial", label: "Historial" },
    { key: "canceladas", label: "Canceladas" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground mb-1">Mis Citas</h1>
        <p className="text-sm text-gray-500">
          {counts.todas === 0
            ? "Aún no tienes citas registradas."
            : `${counts.todas} cita${counts.todas !== 1 ? "s" : ""} en total`}
        </p>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        {/* Filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === key
                  ? "bg-blue text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {label}
              {counts[key] > 0 && (
                <span
                  className={`inline-flex items-center justify-center h-4 min-w-4 rounded-full text-[10px] font-bold px-1 ${
                    filter === key ? "bg-white/20 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setView("cards")}
            title="Vista cards"
            className={`p-1.5 rounded-lg transition-colors ${
              view === "cards" ? "bg-white shadow-sm text-blue" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setView("lista")}
            title="Vista lista"
            className={`p-1.5 rounded-lg transition-colors ${
              view === "lista" ? "bg-white shadow-sm text-blue" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-blue/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-blue/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-400">
            {filter === "todas"
              ? "No tienes citas aún"
              : filter === "proximas"
              ? "No tienes citas próximas"
              : filter === "historial"
              ? "Aún no hay sesiones completadas"
              : "No hay citas canceladas"}
          </p>
        </div>
      )}

      {/* Cards view */}
      {view === "cards" && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((appt) => {
            const d = appt.date.toDate();
            const isUpcoming = appt.status === "confirmed" && d >= now;
            return (
              <div
                key={appt.id}
                className={`relative rounded-2xl p-5 border transition-shadow hover:shadow-md ${
                  appt.status === "confirmed"
                    ? "bg-blue/5 border-blue/15"
                    : appt.status === "completed"
                    ? "bg-green/5 border-green/15"
                    : "bg-gray-50 border-gray-200 opacity-75"
                }`}
              >
                {/* Status badge top-right */}
                <div className="absolute top-4 right-4">
                  <StatusBadge status={appt.status} />
                </div>

                {/* Date accent */}
                <div className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 mb-3 text-xs font-semibold ${
                  appt.status === "confirmed" ? "bg-blue/10 text-blue" : "bg-gray-100 text-gray-500"
                }`}>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(d)}
                </div>

                <p className="text-sm font-bold text-foreground pr-24 mb-1">{appt.serviceName}</p>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(d)}
                </div>

                {appt.professionalName && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {appt.professionalName}
                  </div>
                )}

                {isUpcoming && (
                  <button
                    onClick={() => setCancellingAppt(appt)}
                    className="mt-3 text-xs font-medium text-red/60 hover:text-red transition-colors"
                  >
                    Cancelar cita
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "lista" && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
          {filtered.map((appt) => {
            const d = appt.date.toDate();
            const isUpcoming = appt.status === "confirmed" && d >= now;
            return (
              <div
                key={appt.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-colors"
              >
                {/* Date block */}
                <div className={`flex-shrink-0 w-12 text-center rounded-xl py-1.5 ${
                  appt.status === "confirmed" ? "bg-blue/10" : "bg-gray-100"
                }`}>
                  <p className={`text-base font-black leading-none ${appt.status === "confirmed" ? "text-blue" : "text-gray-400"}`}>
                    {d.toLocaleDateString("es-CL", { day: "numeric", timeZone: "America/Santiago" })}
                  </p>
                  <p className={`text-[9px] font-semibold uppercase ${appt.status === "confirmed" ? "text-blue/70" : "text-gray-400"}`}>
                    {d.toLocaleDateString("es-CL", { month: "short", timeZone: "America/Santiago" }).replace(".", "")}
                  </p>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{appt.serviceName}</p>
                  <p className="text-xs text-gray-400">
                    {formatTime(d)}
                    {appt.professionalName ? ` · ${appt.professionalName}` : ""}
                  </p>
                </div>

                {/* Status + cancel */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={appt.status} />
                  {isUpcoming && (
                    <button
                      onClick={() => setCancellingAppt(appt)}
                      className="text-[10px] font-medium text-red/60 hover:text-red transition-colors px-2 py-1 rounded-lg hover:bg-red/5"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel modal */}
      {cancellingAppt && (
        <CancelAppointmentModal
          appointment={cancellingAppt}
          onConfirm={() => handleCancel(cancellingAppt)}
          onClose={() => setCancellingAppt(null)}
          submitting={cancelling}
        />
      )}
    </div>
  );
}
