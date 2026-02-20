"use client";

import type { RecentAppointment } from "@/lib/firebase/types";
import { Timestamp } from "firebase/firestore";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  confirmed: { label: "Confirmada", bg: "bg-blue-light/40", text: "text-blue" },
  cancelled: { label: "Cancelada", bg: "bg-red/10", text: "text-red" },
  completed: { label: "Completada", bg: "bg-green-light/40", text: "text-green" },
};

function formatShortDate(ts: Timestamp): string {
  const d = ts.toDate();
  return d.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}

interface RecentAppointmentsProps {
  appointments: RecentAppointment[];
}

export default function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">Citas recientes</h3>
      {appointments.length === 0 ? (
        <p className="text-sm text-gray-400">No hay citas recientes</p>
      ) : (
        <ul className="space-y-3">
          {appointments.map((apt) => {
            const config = STATUS_CONFIG[apt.status] || STATUS_CONFIG.confirmed;
            return (
              <li key={apt.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {apt.userName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {apt.serviceName} — {formatShortDate(apt.date)}
                  </p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
                  {config.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
