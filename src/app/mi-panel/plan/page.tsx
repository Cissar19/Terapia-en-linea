"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getInterventionPlansByPatient } from "@/lib/firebase/firestore";
import type { InterventionPlan, PlanStatus } from "@/lib/firebase/types";

const DETAIL_SECTIONS = [
  { title: "Perfil Ocupacional", color: "blue", fields: ["personalHistory", "familyHistory", "medicalHistory", "occupationalHistory"] as const, labels: ["Antecedentes personales", "Antecedentes familiares", "Antecedentes medicos", "Antecedentes ocupacionales"] },
  { title: "Analisis Clinico", color: "pink", fields: ["occupationalProblem", "interventionFocus", "appliedEvaluations", "interventionModels"] as const, labels: ["Problematica Ocupacional", "Foco de Intervencion", "Evaluaciones Aplicadas", "Modelos de Intervencion"] },
  { title: "Objetivos y Estrategias", color: "yellow", fields: ["generalObjective", "specificObjectives", "achievementIndicators", "interventionStrategies"] as const, labels: ["Objetivo General", "Objetivos Especificos", "Indicadores de Logro", "Estrategias de Intervencion"] },
  { title: "Datos Clinicos", color: "green", fields: ["diagnoses", "medications"] as const, labels: ["Diagnosticos", "Medicamentos"] },
];

const STATUS_CONFIG: Record<PlanStatus, { label: string; bg: string; text: string }> = {
  active: { label: "Plan Activo", bg: "bg-green/10", text: "text-green" },
  completed: { label: "Completado", bg: "bg-blue/10", text: "text-blue" },
  archived: { label: "Archivado", bg: "bg-gray-100", text: "text-gray-500" },
};

export default function MiPlanPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<InterventionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    getInterventionPlansByPatient(user.uid)
      .then((allPlans) => {
        setPlans(allPlans);
        // Auto-select the active plan if one exists
        const active = allPlans.find((p) => p.status === "active");
        if (active) setSelectedPlanId(active.id);
        else if (allPlans.length > 0) setSelectedPlanId(allPlans[0].id);
      })
      .catch(() => setError("No se pudo cargar el plan. Intenta recargar la página."))
      .finally(() => setLoading(false));
  }, [user]);

  const plan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const activePlans = plans.filter((p) => p.status === "active");
  const otherPlans = plans.filter((p) => p.status !== "active");

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-black text-foreground mb-8">Mi Plan de Intervencion</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm animate-pulse">
          <div className="h-6 w-48 bg-gray-100 rounded mb-4" />
          <div className="h-4 w-64 bg-gray-100 rounded mb-3" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-black text-foreground mb-8">Mi Plan de Intervencion</h1>
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-red/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red text-sm mb-1">{error}</p>
          <button onClick={() => window.location.reload()} className="text-xs text-blue hover:underline mt-2">
            Recargar pagina
          </button>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-black text-foreground mb-8">Mi Plan de Intervencion</h1>
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-green/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-1">Aun no tienes un plan de intervencion.</p>
          <p className="text-xs text-gray-300">Tu profesional lo creara despues de evaluarte.</p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const statusConfig = STATUS_CONFIG[plan.status];
  const totalObj = plan.objectives.length;
  const completedObj = plan.objectives.filter((o) => o.completed).length;
  const progressPct = totalObj > 0 ? Math.round((completedObj / totalObj) * 100) : 0;

  return (
    <div>
      <Link
        href="/mi-panel"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-foreground mb-6 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al panel
      </Link>

      {/* Plan selector (if multiple plans) */}
      {plans.length > 1 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {activePlans.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPlanId(p.id); setExpandedSection(null); }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${selectedPlanId === p.id
                    ? "bg-green text-white shadow-sm"
                    : "bg-green/10 text-green hover:bg-green/20"
                  }`}
              >
                Plan Activo
              </button>
            ))}
            {otherPlans.map((p) => {
              const cfg = STATUS_CONFIG[p.status];
              return (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPlanId(p.id); setExpandedSection(null); }}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${selectedPlanId === p.id
                      ? `${cfg.bg} ${cfg.text} ring-1 ring-current`
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  {cfg.label} — {p.createdAt.toDate().toLocaleDateString("es-CL", { month: "short", year: "numeric" })}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-foreground">Mi Plan de Intervencion</h1>
            <p className="text-sm text-gray-400 mt-1">
              Por {plan.professionalName} · Creado el{" "}
              {plan.createdAt.toDate().toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text} text-xs font-semibold`}>
            {statusConfig.label}
          </span>
        </div>

        {/* General Objective */}
        {plan.generalObjective && (
          <div className="p-5 rounded-xl bg-green/5 border border-green/10 mb-6">
            <p className="text-xs font-bold text-green mb-2">Objetivo General</p>
            <p className="text-sm text-foreground">{plan.generalObjective}</p>
          </div>
        )}

        {/* Objectives checklist (read-only) */}
        {totalObj > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Progreso de Objetivos</h3>
              <span className="text-xs font-semibold text-green">
                {completedObj}/{totalObj} completados ({progressPct}%)
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-green rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="space-y-2">
              {plan.objectives.map((obj) => (
                <div
                  key={obj.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${obj.completed ? "bg-green/5" : "bg-gray-50"
                    }`}
                >
                  <span className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center ${obj.completed ? "bg-green border-green" : "border-gray-300"
                    }`}>
                    {obj.completed && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-sm ${obj.completed ? "text-gray-400 line-through" : "text-foreground"}`}>
                    {obj.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable sections */}
        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {DETAIL_SECTIONS.map((section, idx) => {
            const hasContent = section.fields.some((f) => plan[f]);
            if (!hasContent) return null;
            const isOpen = expandedSection === idx;
            return (
              <div key={section.title}>
                <button
                  onClick={() => setExpandedSection(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <span className={`text-sm font-semibold text-${section.color}`}>{section.title}</span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="pb-4 space-y-3">
                    {section.fields.map((field, fi) => {
                      const value = plan[field];
                      if (!value) return null;
                      return (
                        <div key={field}>
                          <p className="text-xs text-gray-400 mb-1">{section.labels[fi]}</p>
                          <p className={`text-sm text-gray-700 whitespace-pre-wrap pl-3 border-l-2 border-${section.color}/20`}>
                            {value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
