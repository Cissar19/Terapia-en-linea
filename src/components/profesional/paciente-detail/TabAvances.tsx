"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { updateInterventionPlan } from "@/lib/firebase/firestore";
import type { InterventionPlan, PlanObjective } from "@/lib/firebase/types";

interface TabAvancesProps {
  plans: InterventionPlan[];
  onPlanUpdated: (plan: InterventionPlan) => void;
}

export default function TabAvances({ plans, onPlanUpdated }: TabAvancesProps) {
  const [showArchived, setShowArchived] = useState(false);

  const activePlan = plans.find((p) => p.status === "active");
  const archivedPlans = plans.filter((p) => p.status !== "active");

  async function handleToggleObjective(plan: InterventionPlan, objectiveId: string) {
    const updated = plan.objectives.map((o): PlanObjective =>
      o.id === objectiveId
        ? { ...o, completed: !o.completed, completedAt: !o.completed ? Timestamp.now() : undefined }
        : o
    );
    await updateInterventionPlan(plan.id, { objectives: updated });
    onPlanUpdated({ ...plan, objectives: updated });
  }

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <p className="text-sm text-gray-400 mb-1">Sin planes de intervencion.</p>
        <p className="text-xs text-gray-300">Crea un plan desde la seccion de Planes.</p>
      </div>
    );
  }

  const totalObj = activePlan ? activePlan.objectives.length : 0;
  const completedObj = activePlan ? activePlan.objectives.filter((o) => o.completed).length : 0;
  const progressPct = totalObj > 0 ? Math.round((completedObj / totalObj) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Active Plan */}
      {activePlan ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Plan Activo</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Creado el {activePlan.createdAt.toDate().toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <span className="rounded-full bg-green/10 px-2.5 py-0.5 text-xs font-semibold text-green">Activo</span>
          </div>

          {/* General objective */}
          {activePlan.generalObjective && (
            <div className="mb-4 p-4 rounded-xl bg-yellow/5 border border-yellow/10">
              <p className="text-xs text-gray-400 mb-1">Objetivo General</p>
              <p className="text-sm text-gray-700">{activePlan.generalObjective}</p>
            </div>
          )}

          {/* Specific objectives */}
          {activePlan.specificObjectives && (
            <div className="mb-4 p-4 rounded-xl bg-blue/5 border border-blue/10">
              <p className="text-xs text-gray-400 mb-1">Objetivos Especificos</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{activePlan.specificObjectives}</p>
            </div>
          )}

          {/* Structured objectives checklist */}
          {totalObj > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>Progreso</span>
                <span className="font-semibold text-green">{completedObj}/{totalObj} completados ({progressPct}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-green rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="space-y-2">
                {activePlan.objectives.map((obj) => (
                  <label
                    key={obj.id}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      obj.completed ? "bg-green/5 hover:bg-green/10" : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={obj.completed}
                      onChange={() => handleToggleObjective(activePlan, obj.id)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green focus:ring-green/30"
                    />
                    <span className={`text-sm ${obj.completed ? "text-gray-400 line-through" : "text-foreground"}`}>
                      {obj.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-sm text-gray-400">Sin plan activo actualmente.</p>
        </div>
      )}

      {/* Archived Plans */}
      {archivedPlans.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className={`h-4 w-4 transition-transform ${showArchived ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Planes anteriores ({archivedPlans.length})
          </button>

          {showArchived && (
            <div className="mt-3 space-y-3">
              {archivedPlans.map((p) => {
                const pTotal = p.objectives.length;
                const pDone = p.objectives.filter((o) => o.completed).length;
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5 opacity-70">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">
                        {p.generalObjective || "Plan sin objetivo"}
                      </p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.status === "completed" ? "bg-blue/10 text-blue" : "bg-gray-100 text-gray-500"
                      }`}>
                        {p.status === "completed" ? "Completado" : "Archivado"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {p.createdAt.toDate().toLocaleDateString("es-CL")}
                      {pTotal > 0 && ` — ${pDone}/${pTotal} objetivos`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
