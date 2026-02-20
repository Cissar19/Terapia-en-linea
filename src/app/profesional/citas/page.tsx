"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAppointmentsByProfessional,
  updateAppointmentStatus,
  addClinicalNote,
} from "@/lib/firebase/firestore";
import type { Appointment } from "@/lib/firebase/types";

const statusStyles: Record<string, string> = {
  confirmed: "bg-green/10 text-green",
  completed: "bg-blue/10 text-blue",
  cancelled: "bg-red/10 text-red",
};

const statusLabels: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

export default function CitasProfesionalPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    getAppointmentsByProfessional(user.uid)
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, [user]);

  async function handleComplete(appointment: Appointment) {
    if (!user) return;
    setSubmitting(true);
    await updateAppointmentStatus(appointment.id, "completed");

    // Save note if provided
    if (noteContent.trim()) {
      await addClinicalNote({
        appointmentId: appointment.id,
        professionalId: user.uid,
        patientId: appointment.userId,
        patientName: appointment.userName,
        content: noteContent.trim(),
      });
    }

    setAppointments((prev) =>
      prev.map((a) => (a.id === appointment.id ? { ...a, status: "completed" as const } : a))
    );
    setCompletingId(null);
    setNoteContent("");
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

  return (
    <div>
      <h1 className="text-2xl font-black text-foreground mb-8">Mis Citas</h1>

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
              <div key={a.id} className="border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
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
                    {completingId === a.id ? (
                      <button
                        onClick={() => { setCompletingId(null); setNoteContent(""); }}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    ) : (
                      <button
                        onClick={() => setCompletingId(a.id)}
                        className="rounded-lg bg-blue/10 px-3 py-1.5 text-xs font-medium text-blue hover:bg-blue/20 transition-colors"
                      >
                        Completar
                      </button>
                    )}
                  </div>
                </div>

                {/* Note form when completing */}
                {completingId === a.id && (
                  <div className="px-6 pb-4">
                    <div className="p-4 rounded-xl bg-blue/5 border border-blue/10">
                      <p className="text-xs font-semibold text-blue mb-2">Nota de sesión (opcional)</p>
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Observaciones de la sesión, avances, indicaciones..."
                        rows={3}
                        className="w-full rounded-lg border border-blue/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleComplete(a)}
                          disabled={submitting}
                          className="rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue/90 disabled:opacity-50 transition-colors"
                        >
                          {submitting ? "Guardando..." : noteContent.trim() ? "Completar y Guardar Nota" : "Completar Cita"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
    </div>
  );
}
