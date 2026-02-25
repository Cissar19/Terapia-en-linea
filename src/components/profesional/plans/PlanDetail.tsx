"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { updateInterventionPlan } from "@/lib/firebase/firestore";
import type { InterventionPlan, PlanStatus, PlanObjective } from "@/lib/firebase/types";

const statusConfig: Record<PlanStatus, { label: string; bg: string; text: string }> = {
  active: { label: "Activo", bg: "bg-green/10", text: "text-green" },
  completed: { label: "Completado", bg: "bg-blue/10", text: "text-blue" },
  archived: { label: "Archivado", bg: "bg-gray-100", text: "text-gray-500" },
};

const STATUS_OPTIONS: PlanStatus[] = ["active", "completed", "archived"];

interface PlanDetailProps {
  plan: InterventionPlan;
  onBack: () => void;
  onEdit: () => void;
  onPlanUpdated: (plan: InterventionPlan) => void;
}

export default function PlanDetail({ plan, onBack, onEdit, onPlanUpdated }: PlanDetailProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const status = statusConfig[plan.status] ?? statusConfig.active;
  const totalObj = plan.objectives.length;
  const completedObj = plan.objectives.filter((o) => o.completed).length;
  const progressPct = totalObj > 0 ? Math.round((completedObj / totalObj) * 100) : 0;

  async function handleToggleObjective(objectiveId: string) {
    const updated = plan.objectives.map((o): PlanObjective =>
      o.id === objectiveId
        ? { ...o, completed: !o.completed, completedAt: !o.completed ? Timestamp.now() : undefined }
        : o
    );
    await updateInterventionPlan(plan.id, { objectives: updated });
    onPlanUpdated({ ...plan, objectives: updated });
  }

  async function handleStatusChange(newStatus: PlanStatus) {
    await updateInterventionPlan(plan.id, { status: newStatus });
    onPlanUpdated({ ...plan, status: newStatus });
    setShowStatusDropdown(false);
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-foreground mb-6 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a la lista
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-foreground">{plan.patientName}</h1>
            <p className="text-sm text-gray-400 mt-1">
              Creado el{" "}
              {plan.createdAt.toDate().toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-xl bg-blue/10 px-4 py-2 text-xs font-semibold text-blue hover:bg-blue/20 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold ${status.bg} ${status.text} hover:opacity-80 transition-opacity`}
              >
                {status.label}
                <svg className="inline ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showStatusDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[140px]">
                  {STATUS_OPTIONS.map((s) => {
                    const cfg = statusConfig[s];
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                          plan.status === s ? "bg-gray-50 font-semibold" : ""
                        }`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full ${cfg.bg} mr-2`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Patient Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 p-5 rounded-xl bg-green/5 border border-green/10">
          {[
            { label: "Edad", value: plan.age },
            { label: "Comuna", value: plan.residenceCommune },
            { label: "Escolaridad", value: plan.education },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-medium text-foreground">{item.value || "—"}</p>
            </div>
          ))}
        </div>

        {/* Structured Objectives with checklist */}
        {totalObj > 0 && (
          <div className="mb-8 p-5 rounded-xl bg-yellow/5 border border-yellow/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Objetivos Estructurados</h3>
              <span className="text-xs font-semibold text-green">
                {completedObj}/{totalObj} completados
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-green rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="space-y-2">
              {plan.objectives.map((obj) => (
                <label
                  key={obj.id}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    obj.completed
                      ? "bg-green/5 hover:bg-green/10"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={obj.completed}
                    onChange={() => handleToggleObjective(obj.id)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green focus:ring-green/30"
                  />
                  <span
                    className={`text-sm ${
                      obj.completed ? "text-gray-400 line-through" : "text-foreground"
                    }`}
                  >
                    {obj.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {[
          { title: "Diagnosticos", content: plan.diagnoses, color: "green" },
          { title: "Medicamentos", content: plan.medications, color: "green" },
          { title: "Antecedentes Personales", content: plan.personalHistory, color: "blue" },
          { title: "Antecedentes Familiares", content: plan.familyHistory, color: "blue" },
          { title: "Antecedentes Medicos", content: plan.medicalHistory, color: "blue" },
          { title: "Antecedentes Ocupacionales", content: plan.occupationalHistory, color: "blue" },
          { title: "Problematica Ocupacional", content: plan.occupationalProblem, color: "pink" },
          { title: "Foco de Intervencion", content: plan.interventionFocus, color: "pink" },
          { title: "Evaluaciones Aplicadas", content: plan.appliedEvaluations, color: "pink" },
          { title: "Modelos de Intervencion", content: plan.interventionModels, color: "pink" },
          { title: "Objetivo General", content: plan.generalObjective, color: "yellow" },
          { title: "Objetivos Especificos", content: plan.specificObjectives, color: "yellow" },
          { title: "Indicadores de Logro", content: plan.achievementIndicators, color: "yellow" },
          { title: "Estrategias de Intervencion", content: plan.interventionStrategies, color: "yellow" },
        ]
          .filter((s) => s.content)
          .map((section) => (
            <div key={section.title} className="mb-5">
              <h3 className={`text-sm font-bold text-${section.color} mb-2`}>{section.title}</h3>
              <p className={`text-sm text-gray-700 whitespace-pre-wrap pl-4 border-l-2 border-${section.color}/20`}>
                {section.content}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
