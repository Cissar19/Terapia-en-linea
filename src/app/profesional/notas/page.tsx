"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { addClinicalNote } from "@/lib/firebase/firestore";
import { useProfessionalNotes } from "@/hooks/useNotes";
import { useProfessionalAppointments } from "@/hooks/useAppointments";
import type { ClinicalNote, Appointment } from "@/lib/firebase/types";

interface PatientOption {
  id: string;
  name: string;
}

const NOTE_TEMPLATES = [
  {
    id: "soap",
    label: "SOAP",
    icon: "📋",
    color: "bg-blue/10 text-blue border-blue/20 hover:bg-blue/20",
    activeColor: "bg-blue/20 ring-2 ring-blue/40",
    content: `SUBJETIVO\nRelato del paciente/cuidador:\n\n\nOBJETIVO\nObservaciones clínicas:\n\n\nANÁLISIS\nInterpretación y razonamiento clínico:\n\n\nPLAN\nObjetivos y próximos pasos:`,
  },
  {
    id: "alimentacion",
    label: "Evaluación Alimentación",
    icon: "🍽️",
    color: "bg-green/10 text-green border-green/20 hover:bg-green/20",
    activeColor: "bg-green/20 ring-2 ring-green/40",
    content: `EVALUACIÓN DE ALIMENTACIÓN\n\nTexturas aceptadas:\n\nTexturas rechazadas:\n\nComportamiento en la mesa:\n\nEstrategias utilizadas:\n\nRecomendaciones para la familia:`,
  },
  {
    id: "sensorial",
    label: "Integración Sensorial",
    icon: "🧩",
    color: "bg-pink/10 text-pink border-pink/20 hover:bg-pink/20",
    activeColor: "bg-pink/20 ring-2 ring-pink/40",
    content: `INTEGRACIÓN SENSORIAL\n\nPerfil sensorial observado:\n\nSistemas evaluados:\n- Táctil:\n- Vestibular:\n- Propioceptivo:\n- Visual:\n- Auditivo:\n\nNivel de alerta/regulación:\n\nActividades realizadas:\n\nRespuesta del niño/a:\n\nIndicaciones para el hogar:`,
  },
];

export default function NotasProfesionalPage() {
  const { user } = useAuth();
  const { data: notes, loading: loadingNotes } = useProfessionalNotes(user?.uid);
  const { data: appointmentsData, loading: loadingAppts } = useProfessionalAppointments(user?.uid);
  const loading = loadingNotes || loadingAppts;
  const [filterPatient, setFilterPatient] = useState("");

  // Derive unique patients from appointments
  const patients: PatientOption[] = (() => {
    const map = new Map<string, string>();
    appointmentsData.forEach((a: Appointment) => map.set(a.userId, a.userName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  })();

  // Form
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  async function handleSubmit() {
    if (!noteContent.trim() || !selectedPatient || !user) return;
    const patient = patients.find((p) => p.id === selectedPatient);
    if (!patient) return;

    setSubmitting(true);
    await addClinicalNote({
      appointmentId: "",
      professionalId: user.uid,
      patientId: patient.id,
      patientName: patient.name,
      content: noteContent.trim(),
    });
    setNoteContent("");
    setSelectedPatient("");
    setActiveTemplate(null);
    setShowForm(false);
    setSubmitting(false);
  }

  const patientNames = [...new Set(notes.map((n) => n.patientName))];
  const filteredNotes = filterPatient
    ? notes.filter((n) => n.patientName === filterPatient)
    : notes;

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-black text-foreground mb-8">Notas Clínicas</h1>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-4 w-32 bg-gray-100 rounded mb-3" />
              <div className="h-3 w-full bg-gray-100 rounded mb-2" />
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-foreground">Notas Clínicas</h1>
        <div className="flex items-center gap-3">
          {patientNames.length > 0 && (
            <select
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
            >
              <option value="">Todos los pacientes</option>
              {patientNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green/90 transition-colors"
          >
            {showForm ? "Cancelar" : "Nueva Nota"}
          </button>
        </div>
      </div>

      {/* Create note form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Nueva Nota Clínica</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Paciente</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
              >
                <option value="">Seleccionar paciente...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {/* Plantillas */}
            {!noteContent.trim() ? (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Usar plantilla</label>
                <div className="flex flex-wrap gap-2">
                  {NOTE_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setNoteContent(t.content);
                        setActiveTemplate(t.id);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${t.color}`}
                    >
                      <span>{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : activeTemplate && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  Plantilla: {NOTE_TEMPLATES.find((t) => t.id === activeTemplate)?.icon}{" "}
                  {NOTE_TEMPLATES.find((t) => t.id === activeTemplate)?.label}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNoteContent("");
                    setActiveTemplate(null);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                >
                  Cambiar plantilla
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Contenido</label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Observaciones de la sesión, avances, indicaciones para la familia..."
                rows={5}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting || !noteContent.trim() || !selectedPatient}
                className="rounded-xl bg-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Guardando..." : "Guardar Nota"}
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-2">
            {filterPatient ? "No hay notas para este paciente." : "Aún no hay notas clínicas."}
          </p>
          {!showForm && patients.length > 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-green font-semibold hover:underline"
            >
              Crear primera nota
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/10 text-green text-xs font-bold">
                    {n.patientName[0]?.toUpperCase() || "P"}
                  </span>
                  <p className="text-sm font-semibold text-foreground">{n.patientName}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {n.createdAt.toDate().toLocaleDateString("es-CL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
