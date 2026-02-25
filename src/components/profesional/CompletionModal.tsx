"use client";

import { useState } from "react";
import type { Appointment, InterventionPlan } from "@/lib/firebase/types";

interface CompletionModalProps {
  appointment: Appointment;
  patientPlan?: InterventionPlan | null;
  onConfirm: (noteContent: string) => void;
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
  const [workedObjectives, setWorkedObjectives] = useState<string[]>([]);

  function toggleArea(area: string) {
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function toggleWorkedObjective(objId: string) {
    setWorkedObjectives((prev) =>
      prev.includes(objId) ? prev.filter((id) => id !== objId) : [...prev, objId]
    );
  }

  const planObjectives = patientPlan?.objectives.filter((o) => !o.completed) ?? [];

  function buildNoteText(): string {
    const lines: string[] = [];

    if (mood !== null) {
      const m = MOOD_OPTIONS.find((o) => o.value === mood);
      if (m) lines.push(`Estado de ánimo: ${m.label} ${m.emoji}`);
    }

    if (participation !== null) {
      const p = PARTICIPATION_LEVELS.find((l) => l.value === participation);
      if (p) lines.push(`Participación: ${participation}/5 (${p.label})`);
    }

    if (areas.length > 0) {
      lines.push(`Áreas trabajadas: ${areas.join(", ")}`);
    }

    if (workedObjectives.length > 0 && patientPlan) {
      const names = workedObjectives
        .map((id) => patientPlan.objectives.find((o) => o.id === id)?.text)
        .filter(Boolean);
      if (names.length > 0) {
        lines.push(`Objetivos del plan trabajados: ${names.join("; ")}`);
      }
    }

    if (lines.length > 0) lines.push("");

    if (objective.trim()) lines.push(`Objetivo: ${objective.trim()}`);
    if (activities.trim()) lines.push(`Actividades: ${activities.trim()}`);
    if (observations.trim()) lines.push(`Observaciones: ${observations.trim()}`);
    if (plan.trim()) lines.push(`Plan: ${plan.trim()}`);

    return lines.join("\n");
  }

  function handleSubmit() {
    const text = buildNoteText();
    onConfirm(text);
  }

  const date = appointment.date.toDate();
  const badgeColor =
    serviceBadgeColors[appointment.serviceSlug] || "bg-gray-100 text-gray-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Close button */}
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
            <h2 className="text-lg font-black text-foreground mb-1">
              Completar Cita
            </h2>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/10 text-green text-xs font-bold">
                {appointment.userName[0]?.toUpperCase() || "P"}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {appointment.userName}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}
                  >
                    {appointment.serviceName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {date.toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    {date.toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Estado de ánimo del paciente
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
                  <span className="text-[10px] text-gray-600 font-medium">
                    {option.label}
                  </span>
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

          {/* Plan Objectives */}
          {planObjectives.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">
                Objetivos del plan trabajados en esta sesion
              </label>
              <div className="flex flex-wrap gap-2">
                {planObjectives.map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => toggleWorkedObjective(obj.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      workedObjectives.includes(obj.id)
                        ? "bg-yellow/15 text-yellow ring-1 ring-yellow/30"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {obj.text}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              {submitting ? "Guardando..." : "Completar Cita"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
