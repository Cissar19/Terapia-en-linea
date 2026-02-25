"use client";

import { useState } from "react";
import type { InterventionPlan, UserProfile, PlanObjective } from "@/lib/firebase/types";

const EMPTY_FORM = {
  patientName: "",
  age: "",
  residenceCommune: "",
  education: "",
  diagnoses: "",
  medications: "",
  personalHistory: "",
  familyHistory: "",
  medicalHistory: "",
  occupationalHistory: "",
  occupationalProblem: "",
  interventionFocus: "",
  appliedEvaluations: "",
  interventionModels: "",
  generalObjective: "",
  specificObjectives: "",
  achievementIndicators: "",
  interventionStrategies: "",
};

type FormData = typeof EMPTY_FORM;

export interface PatientOption {
  id: string;
  name: string;
  email: string;
  profile?: UserProfile;
}

interface SectionConfig {
  title: string;
  icon: React.ReactNode;
  color: string;
  fields: { key: keyof FormData; label: string; type: "input" | "textarea" }[];
}

const SECTIONS: SectionConfig[] = [
  {
    title: "Datos del Paciente",
    color: "green",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    fields: [
      { key: "patientName", label: "Nombre completo", type: "input" },
      { key: "age", label: "Edad", type: "input" },
      { key: "residenceCommune", label: "Comuna de residencia", type: "input" },
      { key: "education", label: "Escolaridad", type: "input" },
      { key: "diagnoses", label: "Diagnosticos", type: "textarea" },
      { key: "medications", label: "Medicamentos", type: "textarea" },
    ],
  },
  {
    title: "Perfil Ocupacional",
    color: "blue",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    fields: [
      { key: "personalHistory", label: "Antecedentes personales", type: "textarea" },
      { key: "familyHistory", label: "Antecedentes familiares", type: "textarea" },
      { key: "medicalHistory", label: "Antecedentes medicos", type: "textarea" },
      { key: "occupationalHistory", label: "Antecedentes ocupacionales (Roles, rutinas, rituales, patrones de desempeno)", type: "textarea" },
    ],
  },
  {
    title: "Analisis Clinico",
    color: "pink",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    fields: [
      { key: "occupationalProblem", label: "Problematica Ocupacional", type: "textarea" },
      { key: "interventionFocus", label: "Foco de Intervencion", type: "textarea" },
      { key: "appliedEvaluations", label: "Evaluaciones Aplicadas", type: "textarea" },
      { key: "interventionModels", label: "Modelos de Intervencion", type: "textarea" },
    ],
  },
  {
    title: "Objetivos y Estrategias",
    color: "yellow",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    fields: [
      { key: "generalObjective", label: "Objetivo General", type: "textarea" },
      { key: "specificObjectives", label: "Objetivos Especificos (texto libre)", type: "textarea" },
      { key: "achievementIndicators", label: "Indicadores de Logro", type: "textarea" },
      { key: "interventionStrategies", label: "Estrategias de Intervencion", type: "textarea" },
    ],
  },
];

export interface PlanFormSubmission extends FormData {
  objectives: PlanObjective[];
  selectedPatientId: string;
}

interface PlanFormProps {
  mode: "create" | "edit";
  initialData?: InterventionPlan;
  patientOptions: PatientOption[];
  preselectedPatientId?: string;
  onSubmit: (data: PlanFormSubmission) => Promise<void>;
  onCancel: () => void;
}

export default function PlanForm({
  mode,
  initialData,
  patientOptions,
  preselectedPatientId,
  onSubmit,
  onCancel,
}: PlanFormProps) {
  const [form, setForm] = useState<FormData>(() => {
    if (initialData) {
      return {
        patientName: initialData.patientName,
        age: initialData.age,
        residenceCommune: initialData.residenceCommune,
        education: initialData.education,
        diagnoses: initialData.diagnoses,
        medications: initialData.medications,
        personalHistory: initialData.personalHistory,
        familyHistory: initialData.familyHistory,
        medicalHistory: initialData.medicalHistory,
        occupationalHistory: initialData.occupationalHistory,
        occupationalProblem: initialData.occupationalProblem,
        interventionFocus: initialData.interventionFocus,
        appliedEvaluations: initialData.appliedEvaluations,
        interventionModels: initialData.interventionModels,
        generalObjective: initialData.generalObjective,
        specificObjectives: initialData.specificObjectives,
        achievementIndicators: initialData.achievementIndicators,
        interventionStrategies: initialData.interventionStrategies,
      };
    }
    return { ...EMPTY_FORM };
  });

  const [objectives, setObjectives] = useState<PlanObjective[]>(
    initialData?.objectives ?? []
  );
  const [selectedPatientId, setSelectedPatientId] = useState(
    preselectedPatientId || initialData?.patientId || ""
  );
  const [expandedSection, setExpandedSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [newObjectiveText, setNewObjectiveText] = useState("");

  // Auto-fill patient data on initial load if preselected
  useState(() => {
    if (preselectedPatientId && !initialData) {
      handleSelectPatient(preselectedPatientId);
    }
  });

  function handleSelectPatient(patientId: string) {
    setSelectedPatientId(patientId);
    if (!patientId) {
      setForm({ ...EMPTY_FORM });
      return;
    }
    const patient = patientOptions.find((p) => p.id === patientId);
    if (patient) {
      setForm((prev) => ({
        ...prev,
        patientName: patient.profile?.displayName || patient.name,
        age: patient.profile?.age || "",
        residenceCommune: patient.profile?.residenceCommune || "",
        education: patient.profile?.education || "",
        diagnoses: patient.profile?.diagnoses || "",
        medications: patient.profile?.medications || "",
      }));
    }
  }

  function updateField(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addObjective() {
    const text = newObjectiveText.trim();
    if (!text) return;
    setObjectives((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, completed: false },
    ]);
    setNewObjectiveText("");
  }

  function removeObjective(id: string) {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patientName.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...form, objectives, selectedPatientId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {mode === "create" ? "Nuevo Plan de Intervencion" : "Editar Plan de Intervencion"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-foreground transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Patient selector (only in create mode) */}
        {mode === "create" && (
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-green/5">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Seleccionar Paciente
            </label>
            {patientOptions.length === 0 ? (
              <p className="text-sm text-gray-400">No tienes pacientes con citas aun.</p>
            ) : (
              <>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handleSelectPatient(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 bg-white"
                >
                  <option value="">— Selecciona un paciente —</option>
                  {patientOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
                {selectedPatientId && (
                  <p className="text-xs text-green mt-2 font-medium">
                    Datos del paciente cargados automaticamente. Puedes editarlos si es necesario.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Section Accordion */}
        <div className="divide-y divide-gray-100">
          {SECTIONS.map((section, idx) => {
            const isOpen = expandedSection === idx;
            const filledCount = section.fields.filter((f) => form[f.key].trim()).length;
            return (
              <div key={section.title}>
                <button
                  type="button"
                  onClick={() => setExpandedSection(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full bg-${section.color}/10 text-${section.color} flex items-center justify-center`}>
                      {section.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{section.title}</p>
                      <p className="text-xs text-gray-400">
                        {filledCount}/{section.fields.length} campos completados
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">
                          {field.label}
                        </label>
                        {field.type === "input" ? (
                          <input
                            type="text"
                            value={form[field.key]}
                            onChange={(e) => updateField(field.key, e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 transition-shadow"
                            placeholder={`Ingrese ${field.label.toLowerCase()}...`}
                          />
                        ) : (
                          <textarea
                            value={form[field.key]}
                            onChange={(e) => updateField(field.key, e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 resize-none transition-shadow"
                            placeholder={`Ingrese ${field.label.toLowerCase()}...`}
                          />
                        )}
                      </div>
                    ))}

                    {/* Structured objectives in the last section */}
                    {idx === SECTIONS.length - 1 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Objetivos Estructurados (seguimiento con checklist)
                        </label>
                        <div className="space-y-2 mb-3">
                          {objectives.map((obj) => (
                            <div
                              key={obj.id}
                              className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow/5 border border-yellow/10"
                            >
                              <span className="flex-1 text-sm text-foreground">{obj.text}</span>
                              <button
                                type="button"
                                onClick={() => removeObjective(obj.id)}
                                className="p-1 rounded-lg hover:bg-red/10 text-gray-400 hover:text-red transition-colors"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newObjectiveText}
                            onChange={(e) => setNewObjectiveText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addObjective();
                              }
                            }}
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow/30 transition-shadow"
                            placeholder="Escribir objetivo y presionar Enter o Agregar..."
                          />
                          <button
                            type="button"
                            onClick={addObjective}
                            className="rounded-xl bg-yellow/10 px-4 py-2.5 text-sm font-semibold text-yellow hover:bg-yellow/20 transition-colors"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Next section button */}
                    {idx < SECTIONS.length - 1 && (
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setExpandedSection(idx + 1)}
                          className={`flex items-center gap-1.5 text-sm font-medium text-${section.color} hover:underline`}
                        >
                          Siguiente seccion
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {Object.values(form).filter((v) => v.trim()).length}/{Object.keys(form).length} campos completados
            {objectives.length > 0 && ` · ${objectives.length} objetivos estructurados`}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !form.patientName.trim()}
              className="rounded-xl bg-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? "Guardando..." : mode === "create" ? "Guardar Plan" : "Actualizar Plan"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
