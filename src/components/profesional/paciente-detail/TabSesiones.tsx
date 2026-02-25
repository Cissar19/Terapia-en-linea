import type { Appointment } from "@/lib/firebase/types";

interface TabSesionesProps {
  appointments: Appointment[];
}

const statusConfig = {
  confirmed: { label: "Confirmada", bg: "bg-green/10", text: "text-green" },
  completed: { label: "Completada", bg: "bg-blue/10", text: "text-blue" },
  cancelled: { label: "Cancelada", bg: "bg-red/10", text: "text-red" },
} as const;

function AppointmentRow({ appt, dimmed }: { appt: Appointment; dimmed?: boolean }) {
  const cfg = statusConfig[appt.status];
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl ${dimmed ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${cfg.bg} ${cfg.text}`}>
          {appt.serviceName}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {appt.date.toDate().toLocaleDateString("es-CL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-400">
            {appt.date.toDate().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    </div>
  );
}

export default function TabSesiones({ appointments }: TabSesionesProps) {
  const now = new Date();
  const upcoming = appointments.filter((a) => a.status === "confirmed" && a.date.toDate() > now);
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <p className="text-sm text-gray-400">Sin sesiones registradas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-2">
            <h3 className="text-sm font-bold text-foreground">Proximas ({upcoming.length})</h3>
          </div>
          <div className="divide-y divide-gray-50 px-2 pb-2">
            {upcoming.map((a) => <AppointmentRow key={a.id} appt={a} />)}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-2">
            <h3 className="text-sm font-bold text-foreground">Completadas ({completed.length})</h3>
          </div>
          <div className="divide-y divide-gray-50 px-2 pb-2">
            {completed.map((a) => <AppointmentRow key={a.id} appt={a} />)}
          </div>
        </div>
      )}

      {/* Cancelled */}
      {cancelled.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-2">
            <h3 className="text-sm font-bold text-gray-400">Canceladas ({cancelled.length})</h3>
          </div>
          <div className="divide-y divide-gray-50 px-2 pb-2">
            {cancelled.map((a) => <AppointmentRow key={a.id} appt={a} dimmed />)}
          </div>
        </div>
      )}
    </div>
  );
}
