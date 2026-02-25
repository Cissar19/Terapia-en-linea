import type { Appointment, ClinicalNote, PatientTask, InterventionPlan, UserProfile } from "@/lib/firebase/types";
import type { TabKey } from "./PatientTabs";

interface TabResumenProps {
  profile: UserProfile | null;
  appointments: Appointment[];
  notes: ClinicalNote[];
  tasks: PatientTask[];
  plans: InterventionPlan[];
  onTabChange: (tab: TabKey) => void;
}

export default function TabResumen({ profile, appointments, notes, tasks, plans, onTabChange }: TabResumenProps) {
  const now = new Date();
  const completed = appointments.filter((a) => a.status === "completed").length;
  const upcoming = appointments.find(
    (a) => a.status === "confirmed" && a.date.toDate() > now
  );
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const activePlan = plans.find((p) => p.status === "active");
  const lastNote = notes[0];

  const stats = [
    { label: "Total citas", value: appointments.length, color: "bg-blue/10 text-blue" },
    { label: "Completadas", value: completed, color: "bg-green/10 text-green" },
    {
      label: "Proxima cita",
      value: upcoming
        ? upcoming.date.toDate().toLocaleDateString("es-CL", { day: "numeric", month: "short" })
        : "—",
      color: "bg-yellow/10 text-yellow-700",
    },
    { label: "Tareas pend.", value: pendingTasks, color: "bg-pink/10 text-pink" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color.split(" ")[0]}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color.split(" ")[1]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Active Plan */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-foreground mb-3">Plan de Intervencion</h3>
        {activePlan ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">{activePlan.generalObjective || "Sin objetivo general"}</p>
              <span className="rounded-full bg-green/10 px-2.5 py-0.5 text-xs font-semibold text-green">Activo</span>
            </div>
            {activePlan.objectives.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Progreso de objetivos</span>
                  <span>{activePlan.objectives.filter((o) => o.completed).length}/{activePlan.objectives.length}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green rounded-full transition-all"
                    style={{
                      width: `${Math.round(
                        (activePlan.objectives.filter((o) => o.completed).length / activePlan.objectives.length) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => onTabChange("avances")}
              className="mt-3 text-xs font-semibold text-green hover:underline"
            >
              Ver avances &rarr;
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Sin plan activo</p>
        )}
      </div>

      {/* Clinical Data */}
      {profile && (profile.diagnoses || profile.medications) && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-bold text-foreground mb-3">Datos Clinicos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.diagnoses && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Diagnosticos</p>
                <p className="text-sm text-gray-700">{profile.diagnoses}</p>
              </div>
            )}
            {profile.medications && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Medicamentos</p>
                <p className="text-sm text-gray-700">{profile.medications}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Note */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-foreground mb-3">Ultima Nota Clinica</h3>
        {lastNote ? (
          <div>
            <p className="text-xs text-gray-400 mb-2">
              {lastNote.createdAt.toDate().toLocaleDateString("es-CL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">{lastNote.content}</p>
            <button
              onClick={() => onTabChange("notas")}
              className="mt-3 text-xs font-semibold text-green hover:underline"
            >
              Ver todas las notas &rarr;
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Sin notas clinicas aun.</p>
        )}
      </div>
    </div>
  );
}
