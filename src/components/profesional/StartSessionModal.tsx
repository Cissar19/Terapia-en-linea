"use client";

import { useState, useRef } from "react";
import type { Appointment, InterventionPlan } from "@/lib/firebase/types";

export interface SessionObjectives {
  planIds: string[];
  custom: string[];
}

interface StartSessionModalProps {
  appointment: Appointment;
  patientPlan?: InterventionPlan | null;
  onConfirm: (noteContent: string, objectives: SessionObjectives) => void;
  onClose: () => void;
  submitting: boolean;
}

const ARRIVAL_OPTIONS = [
  { value: "muy_bien", label: "Muy bien", emoji: "😄" },
  { value: "bien", label: "Bien", emoji: "🙂" },
  { value: "regular", label: "Regular", emoji: "😐" },
  { value: "cansado", label: "Cansado/a", emoji: "😴" },
  { value: "con_dolor", label: "Con dolor", emoji: "😣" },
  { value: "ansioso", label: "Ansioso/a", emoji: "😰" },
];

const PAIN_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const PAIN_COLORS = [
  "bg-green text-white",
  "bg-green/80 text-white",
  "bg-green/60 text-white",
  "bg-yellow/70 text-foreground",
  "bg-yellow text-foreground",
  "bg-yellow/80 text-foreground",
  "bg-orange/70 text-white",
  "bg-orange text-white",
  "bg-red/70 text-white",
  "bg-red/85 text-white",
  "bg-red text-white",
];

const MEDICATION_OPTIONS = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
  { value: "no_aplica", label: "No aplica" },
];

export default function StartSessionModal({
  appointment,
  patientPlan,
  onConfirm,
  onClose,
  submitting,
}: StartSessionModalProps) {
  const [arrivals, setArrivals] = useState<string[]>([]);
  const [news, setNews] = useState("");
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [medication, setMedication] = useState<string | null>(null);
  const [observations, setObservations] = useState("");

  // Objectives for this session
  const [selectedPlanObjectives, setSelectedPlanObjectives] = useState<string[]>([]);
  const [customObjectives, setCustomObjectives] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pendingPlanObjectives = patientPlan?.objectives.filter((o) => !o.completed) ?? [];

  function toggleArrival(value: string) {
    setArrivals((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function togglePlanObjective(id: string) {
    setSelectedPlanObjectives((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  function addCustomObjective() {
    const text = customInput.trim();
    if (!text) return;
    setCustomObjectives((prev) => [...prev, text]);
    setCustomInput("");
    inputRef.current?.focus();
  }

  function removeCustomObjective(idx: number) {
    setCustomObjectives((prev) => prev.filter((_, i) => i !== idx));
  }

  function buildNote(): string {
    const lines: string[] = ["[INICIO DE SESIÓN]", ""];

    if (arrivals.length > 0) {
      const labels = arrivals
        .map((v) => ARRIVAL_OPTIONS.find((o) => o.value === v))
        .filter(Boolean)
        .map((o) => `${o!.label} ${o!.emoji}`)
        .join(", ");
      lines.push(`Estado de llegada: ${labels}`);
    }

    if (painLevel !== null) {
      lines.push(`Nivel de dolor al inicio: ${painLevel}/10`);
    }

    if (medication) {
      const opt = MEDICATION_OPTIONS.find((o) => o.value === medication);
      if (opt) lines.push(`Medicación tomada: ${opt.label}`);
    }

    if (news.trim()) {
      lines.push(`Novedades desde última sesión: ${news.trim()}`);
    }

    // Objectives
    const planObjTexts = selectedPlanObjectives
      .map((id) => patientPlan?.objectives.find((o) => o.id === id)?.text)
      .filter(Boolean) as string[];

    const allObjectives = [...planObjTexts, ...customObjectives];
    if (allObjectives.length > 0) {
      lines.push("");
      lines.push("Objetivos de la sesión:");
      allObjectives.forEach((t, i) => lines.push(`  ${i + 1}. ${t}`));
    }

    if (observations.trim()) {
      lines.push("");
      lines.push(`Observaciones iniciales: ${observations.trim()}`);
    }

    return lines.join("\n");
  }

  const date = appointment.date.toDate();
  const totalObjectives = selectedPlanObjectives.length + customObjectives.length;

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
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green/15 text-green">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </span>
              <h2 className="text-lg font-black text-foreground">Iniciar Cita</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/10 text-green text-xs font-bold">
                {appointment.userName[0]?.toUpperCase() || "P"}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{appointment.userName}</p>
                <p className="text-xs text-gray-400">
                  {appointment.serviceName} ·{" "}
                  {date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>

          {/* Arrival state */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              ¿Cómo llega el paciente?
            </label>
            <div className="flex gap-2 flex-wrap">
              {ARRIVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleArrival(opt.value)}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-2 text-center transition-all ${
                    arrivals.includes(opt.value)
                      ? "bg-green/10 ring-2 ring-green shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-[10px] text-gray-600 font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pain level */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Nivel de dolor al inicio{" "}
              <span className="font-normal text-gray-400">(0 = sin dolor)</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {PAIN_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPainLevel(level)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                    painLevel === level
                      ? `${PAIN_COLORS[level]} ring-2 ring-offset-1 ring-current shadow-sm`
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Medication */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              ¿Tomó su medicación?
            </label>
            <div className="flex gap-2">
              {MEDICATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMedication(opt.value)}
                  className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                    medication === opt.value
                      ? "bg-blue text-white font-bold shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* News since last session */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Novedades desde la última sesión{" "}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={news}
              onChange={(e) => setNews(e.target.value)}
              placeholder="Ej: Paciente relata que tuvo una caída, está con antibióticos..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30 resize-none"
            />
          </div>

          {/* Objectives */}
          <div className="rounded-xl border border-gray-100 p-4 space-y-3 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-foreground">
                Objetivos de esta sesión
              </p>
              {totalObjectives > 0 && (
                <span className="text-[10px] font-semibold text-green bg-green/10 rounded-full px-2 py-0.5">
                  {totalObjectives} definido{totalObjectives > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Plan objectives */}
            {pendingPlanObjectives.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Del plan de intervención
                </p>
                <div className="space-y-1.5">
                  {pendingPlanObjectives.map((obj) => {
                    const selected = selectedPlanObjectives.includes(obj.id);
                    return (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => togglePlanObjective(obj.id)}
                        className={`w-full flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all ${
                          selected
                            ? "bg-green/8 border border-green/25 text-foreground"
                            : "bg-white border border-gray-100 text-gray-600 hover:border-green/20"
                        }`}
                      >
                        <span className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all ${
                          selected
                            ? "bg-green border-green text-white"
                            : "border-gray-300"
                        }`}>
                          {selected && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="text-xs leading-relaxed">{obj.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom objectives */}
            <div>
              {pendingPlanObjectives.length > 0 && (
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Objetivos adicionales
                </p>
              )}
              {customObjectives.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {customObjectives.map((text, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl bg-lavender/20 border border-lavender/30 px-3 py-2"
                    >
                      <span className="flex h-4 w-4 flex-shrink-0 mt-0.5 items-center justify-center rounded bg-blue/20 text-blue text-[9px] font-bold">
                        {selectedPlanObjectives.length + idx + 1}
                      </span>
                      <span className="flex-1 text-xs text-foreground leading-relaxed">{text}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomObjective(idx)}
                        className="text-gray-300 hover:text-red transition-colors flex-shrink-0"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomObjective(); } }}
                  placeholder="Agregar objetivo personalizado..."
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30"
                />
                <button
                  type="button"
                  onClick={addCustomObjective}
                  disabled={!customInput.trim()}
                  className="rounded-xl bg-green/10 px-3 py-2 text-xs font-semibold text-green hover:bg-green/20 disabled:opacity-40 transition-colors"
                >
                  + Añadir
                </button>
              </div>
            </div>
          </div>

          {/* Initial observations */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Observaciones iniciales{" "}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observaciones del profesional al inicio de la sesión..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30 resize-none"
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
              onClick={() => onConfirm(buildNote(), { planIds: selectedPlanObjectives, custom: customObjectives })}
              disabled={submitting}
              className="flex-1 rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Iniciando..." : "Iniciar Cita"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
