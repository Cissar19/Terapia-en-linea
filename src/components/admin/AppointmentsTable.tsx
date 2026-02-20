"use client";

import { useEffect, useState } from "react";
import { getAllAppointments, updateAppointmentStatus } from "@/lib/firebase/firestore";
import type { Appointment } from "@/lib/firebase/types";

const statusStyles: Record<Appointment["status"], string> = {
  confirmed: "bg-green-light text-green",
  cancelled: "bg-red/10 text-red",
  completed: "bg-yellow-light text-orange",
};

const statusLabels: Record<Appointment["status"], string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default function AppointmentsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAppointments()
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(id: string) {
    await updateAppointmentStatus(id, "cancelled");
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a))
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-gray-100 rounded mb-6" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-50 rounded mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Paciente
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Servicio
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Fecha
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Estado
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-foreground">{a.userName}</p>
                  <p className="text-xs text-gray-500">{a.userEmail}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.serviceName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {a.date?.toDate?.().toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }) ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[a.status]}`}
                  >
                    {statusLabels[a.status]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {a.status === "confirmed" && (
                    <button
                      onClick={() => handleCancel(a.id)}
                      className="text-xs font-medium text-red hover:underline"
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No hay citas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
