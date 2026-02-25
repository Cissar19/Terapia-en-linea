"use client";

import type { InterventionPlan } from "@/lib/firebase/types";

const statusConfig = {
  active: { label: "Activo", bg: "bg-green/10", text: "text-green" },
  completed: { label: "Completado", bg: "bg-blue/10", text: "text-blue" },
  archived: { label: "Archivado", bg: "bg-gray-100", text: "text-gray-500" },
};

interface PlanCardProps {
  plan: InterventionPlan;
  onClick: () => void;
}

export default function PlanCard({ plan, onClick }: PlanCardProps) {
  const status = statusConfig[plan.status] ?? statusConfig.active;
  const totalObj = plan.objectives.length;
  const completedObj = plan.objectives.filter((o) => o.completed).length;
  const progressPct = totalObj > 0 ? Math.round((completedObj / totalObj) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green/10 text-green text-sm font-bold">
            {plan.patientName[0]?.toUpperCase() || "P"}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{plan.patientName}</p>
            <p className="text-xs text-gray-400">
              {plan.age && `${plan.age} anos`}
              {plan.age && plan.residenceCommune && " · "}
              {plan.residenceCommune}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      {plan.diagnoses && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          <span className="font-semibold text-gray-600">Dx:</span> {plan.diagnoses}
        </p>
      )}

      {/* Objectives progress */}
      {totalObj > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400">Objetivos</span>
            <span className="text-[10px] font-semibold text-green">
              {completedObj}/{totalObj}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-300">
          {plan.createdAt.toDate().toLocaleDateString("es-CL", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        <span className="text-xs text-green font-medium flex items-center gap-1">
          Ver plan
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  );
}
