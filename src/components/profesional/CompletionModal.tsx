"use client";

import { useState } from "react";
import type { Appointment, InterventionPlan } from "@/lib/firebase/types";
import type { SessionObjectives } from "./StartSessionModal";

interface CompletionModalProps {
  appointment: Appointment;
  patientPlan?: InterventionPlan | null;
  sessionObjectives?: SessionObjectives | null;
  onConfirm: (noteContent: string, achievedObjectiveIds: string[]) => void;
  onClose: () => void;
  submitting: boolean;
}

const MOOD_OPTIONS = [
  { label: "Muy bajo", emoji: "😔", value: 1 },
  { label: "Bajo", emoji: "😕", value: 2 },
  { label: "Neutro", emoji: "😐", value: 3 },
  { label: "Bueno", emoji: "🙂", value: 4 },
  { label: "Muy bueno", emoji: "😊", value: 5 },
  { label: "Excelente", emoji: "😄", value: 6 },
];

const PARTICIPATION_LEVELS = [
  { value: 1, label: "Mínima" },
  { value: 2, label: "Baja" },
  { value: 3, label: "Moderada" },
  { value: 4, label: "Alta" },
  { value: 5, label: "Máxima" },
];

const AREAS = [
  "Motricidad Fina",
  "Motricidad Gruesa",
  "AVD (Actividades de Vida Diaria)",
  "Sensorial",
  "Cognitivo",
  "Social",
  "Lenguaje/Comunicación",
];

const serviceBadgeColors: Record<string, string> = {
  "adaptacion-puesto-trabajo": "bg-blue/10 text-blue",
  "atencion-temprana": "bg-green/10 text-green",
  "babysitting-terapeutico": "bg-pink/10 text-pink",
};

export default function CompletionModal({
  appointment,
  patientPlan,
  sessionObjectives,
  onConfirm,
  onClose,
  submitting,
}: CompletionModalProps) {
  const [mood, setMood] = useState<number | null>(null);
  const [participation, setParticipation] = useState<number | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [objective, setObjective] = useState("");
  const [activities, setActivities] = useState("");
  const [observations, setObservations] = useState("");
  const [plan, setPlan] = useState("");
  // Track which session objectives were met (plan IDs + custom indices)
  const [metPlanObjectives, setMetPlanObjectives] = useState<string[]>([]);
  const [metCustomObjectives, setMetCustomObjectives] = useState<number[]>([]);
  // Fallback: when no session objectives defined, allow picking from plan
  const [workedObjectives, setWorkedObjectives] = useState<string[]>([]);
  const [achievedObjectives, setAchievedObjectives] = useState<string[]>([]);

  const hasSesionObjectives =
    sessionObjectives &&
    (sessionObjectives.planIds.length > 0 || sessionObjectives.custom.length > 0);

  function toggleArea(area: string) {
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function toggleMetPlan(id: string) {
    setMetPlanObjectives((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  function toggleMetCustom(idx: number) {
    setMetCustomObjectives((prev) =>
      prev.includes(idx) ? prev.filter((v) => v !== idx) : [...prev, idx]
    );
  }

  function toggleWorked(objId: string) {
    setWorkedObjectives((prev) =>
      prev.includes(objId) ? prev.filter((id) => id !== objId) : [...prev, objId]
    );
    if (achievedObjectives.includes(objId)) {
      setAchievedObjectives((prev) => prev.filter((id) => id !== objId));
    }
  }

  function toggleAchieved(objId: string) {
    setAchievedObjectives((prev) =>
      prev.includes(objId) ? prev.filter((id) => id !== objId) : [...prev, objId]
    );
    if (!workedObjectives.includes(objId)) {
      setWorkedObjectives((prev) => [...prev, objId]);
    }
  }

  const pendingObjectives = patientPlan?.objectives.filter((o) => !o.completed) ?? [];

  function buildNoteText(): string {
    const lines: string[] = ["[FIN DE SESIÓN]", ""];

    if (mood !== null) {
      const m = MOOD_OPTIONS.find((o) => o.value === mood);
      if (m) lines.push(`Estado de ánimo al cierre: ${m.label} ${m.emoji}`);
    }

    if (participation !== null) {
      const p = PARTICIPATION_LEVELS.find((l) => l.value === participation);
      if (p) lines.push(`Participación: ${participation}/5 (${p.label})`);
    }

    if (areas.length > 0) {
      lines.push(`Áreas trabajadas: ${areas.join(", ")}`);
    }

    // Session objectives results
    if (hasSesionObjectives && sessionObjectives) {
      lines.push("");
      lines.push("Resultados de objetivos planteados:");
      let idx = 1;
      for (const id of sessionObjectives.planIds) {
        const text = patientPlan?.objectives.find((o) => o.id === id)?.text ?? id;
        const met = metPlanObjectives.includes(id);
        lines.push(`  ${idx}. ${text} → ${met ? "✓ Cumplido" : "✗ No cumplido"}`);
        idx++;
      }
      for (let i = 0; i < sessionObjectives.custom.length; i++) {
        const met = metCustomObjectives.includes(i);
        lines.push(`  ${idx}. ${sessionObjectives.custom[i]} → ${met ? "✓ Cumplido" : "✗ No cumplido"}`);
        idx++;
      }
    } else {
      // Fallback: plan objectives worked/achieved
      if (workedObjectives.length > 0 && patientPlan) {
        const names = workedObjectives
          .map((id) => patientPlan.objectives.find((o) => o.id === id)?.text)
          .filter(Boolean);
        if (names.length > 0) lines.push(`Objetivos del plan trabajados: ${names.join("; ")}`);
      }
      if (achievedObjectives.length > 0 && patientPlan) {
        const names = achievedObjectives
          .map((id) => patientPlan.objectives.find((o) => o.id === id)?.text)
          .filter(Boolean);
        if (names.length > 0) lines.push(`Objetivos LOGRADOS: ${names.join("; ")}`);
      }
    }

    lines.push("");
    if (objective.trim()) lines.push(`Objetivo de sesión: ${objective.trim()}`);
    if (activities.trim()) lines.push(`Actividades realizadas: ${activities.trim()}`);
    if (observations.trim()) lines.push(`Observaciones clínicas: ${observations.trim()}`);
    if (plan.trim()) lines.push(`Plan / Indicaciones: ${plan.trim()}`);

    return lines.join("\n");
  }

  function handleSubmit() {
    // Which plan objective IDs to mark as achieved in Firestore
    const toAchieve = hasSesionObjectives
      ? metPlanObjectives
      : achievedObjectives;
    onConfirm(buildNoteText(), toAchieve);
  }

  const date = appointment.date.toDate();
  const badgeColor =
    serviceBadgeColors[appointment.serviceSlug] || "bg-gray-100 text-gray-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue/15 text-blue">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <h2 className="text-lg font-black text-foreground">Finalizar Cita</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/10 text-green text-xs font-bold">
                {appointment.userName[0]?.toUpperCase() || "P"}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{appointment.userName}</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
                    {appointment.serviceName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {date.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}{" "}
                    {date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Estado de ánimo al cierre
            </label>
            <div className="flex gap-2 flex-wrap">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-2 text-center transition-all ${
                    mood === option.value
                      ? "bg-blue/10 ring-2 ring-blue shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="text-[10px] text-gray-600 font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Participation */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Nivel de participación
            </label>
            <div className="flex gap-2">
              {PARTICIPATION_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setParticipation(level.value)}
                  className={`flex-1 rounded-xl py-2.5 text-center transition-all ${
                    participation === level.value
                      ? "bg-blue text-white font-bold shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium"
                  }`}
                >
                  <span className="text-sm block">{level.value}</span>
                  <span className="text-[10px] block">{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Areas */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Áreas trabajadas
            </label>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    areas.includes(area)
                      ? "bg-green/15 text-green ring-1 ring-green/30"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Session objectives: show results if defined at start */}
          {hasSesionObjectives && sessionObjectives ? (
            <div className="rounded-xl border border-gray-100 p-4 space-y-3 bg-gray-50/50">
              <p className="text-xs font-bold text-foreground">
                ¿Se cumplieron los objetivos planteados?
              </p>
              <div className="space-y-2">
                {/* Plan objectives selected at start */}
                {sessionObjectives.planIds.map((id) => {
                  const obj = patientPlan?.objectives.find((o) => o.id === id);
                  const met = metPlanObjectives.includes(id);
                  return (
                    <div
                      key={id}
                      className={`flex items-start gap-3 rounded-xl p-3 border transition-all ${
                        met ? "bg-green/8 border-green/20" : "bg-white border-gray-100"
                      }`}
                    >
                      <div className="flex-1 text-xs text-gray-700 pt-0.5 leading-relaxed">
                        {obj?.text ?? id}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleMetPlan(id)}
                          className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                            met
                              ? "bg-green text-white shadow-sm"
                              : "bg-red/10 text-red hover:bg-red/20"
                          }`}
                        >
                          {met ? "✓ Cumplido" : "✗ No cumplido"}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* Custom objectives defined at start */}
                {sessionObjectives.custom.map((text, i) => {
                  const met = metCustomObjectives.includes(i);
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-xl p-3 border transition-all ${
                        met ? "bg-green/8 border-green/20" : "bg-white border-gray-100"
                      }`}
                    >
                      <div className="flex-1 text-xs text-gray-700 pt-0.5 leading-relaxed">
                        {text}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleMetCustom(i)}
                          className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                            met
                              ? "bg-green text-white shadow-sm"
                              : "bg-red/10 text-red hover:bg-red/20"
                          }`}
                        >
                          {met ? "✓ Cumplido" : "✗ No cumplido"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {metPlanObjectives.length > 0 && (
                <p className="text-[10px] text-green font-medium">
                  {metPlanObjectives.length} objetivo{metPlanObjectives.length > 1 ? "s" : ""} del plan se marcarán como logrado{metPlanObjectives.length > 1 ? "s" : ""}.
                </p>
              )}
            </div>
          ) : pendingObjectives.length > 0 ? (
            /* Fallback: no session objectives defined, show plan objectives */
            <div className="rounded-xl border border-gray-100 p-4 space-y-3 bg-gray-50/50">
              <p className="text-xs font-bold text-foreground">
                Objetivos del plan de intervención
              </p>
              <div className="space-y-2">
                {pendingObjectives.map((obj) => {
                  const worked = workedObjectives.includes(obj.id);
                  const achieved = achievedObjectives.includes(obj.id);
                  return (
                    <div
                      key={obj.id}
                      className={`flex items-start gap-3 rounded-xl p-3 border transition-all ${
                        achieved
                          ? "bg-green/8 border-green/20"
                          : worked
                          ? "bg-yellow/8 border-yellow/20"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      <div className="flex-1 text-xs text-gray-700 pt-0.5">{obj.text}</div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleWorked(obj.id)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-all ${
                            worked
                              ? "bg-yellow/20 text-yellow ring-1 ring-yellow/40"
                              : "bg-gray-100 text-gray-400 hover:bg-yellow/10 hover:text-yellow"
                          }`}
                        >
                          Trabajado
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAchieved(obj.id)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-all ${
                            achieved
                              ? "bg-green/20 text-green ring-1 ring-green/40"
                              : "bg-gray-100 text-gray-400 hover:bg-green/10 hover:text-green"
                          }`}
                        >
                          ✓ Logrado
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {achievedObjectives.length > 0 && (
                <p className="text-[10px] text-green font-medium">
                  {achievedObjectives.length} objetivo{achievedObjectives.length > 1 ? "s" : ""} se marcarán como logrado{achievedObjectives.length > 1 ? "s" : ""} en el plan.
                </p>
              )}
            </div>
          ) : null}

          {/* Objective */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Objetivo de la sesión
            </label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ej: Mejorar prensión de objetos pequeños"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30"
            />
          </div>

          {/* Activities */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Actividades realizadas
            </label>
            <textarea
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="Descripción breve de las actividades..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30 resize-none"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Observaciones clínicas
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observaciones relevantes de la sesión..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30 resize-none"
            />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Plan / Indicaciones
            </label>
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Indicaciones para próxima sesión..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-xl bg-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Guardando..." : "Finalizar Cita"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
