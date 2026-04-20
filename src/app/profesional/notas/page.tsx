"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { addClinicalNote, updateClinicalNote, deleteClinicalNote } from "@/lib/firebase/firestore";
import { useProfessionalNotes } from "@/hooks/useNotes";
import { useProfessionalAppointments } from "@/hooks/useAppointments";
import type { ClinicalNote, Appointment, NoteType } from "@/lib/firebase/types";
import { NOTE_TYPE_LABELS } from "@/lib/firebase/types";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";
import RichTextarea from "@/components/RichTextarea";
import MarkdownContent from "@/components/MarkdownContent";

interface PatientOption {
  id: string;
  name: string;
}

const NOTE_TYPE_COLORS: Record<NoteType, string> = {
  sesion:      "bg-blue/10 text-blue border-blue/20",
  evaluacion:  "bg-lavender/60 text-indigo-700 border-lavender",
  seguimiento: "bg-yellow/20 text-amber-700 border-yellow/40",
  alta:        "bg-green/10 text-green border-green/20",
};

const NOTE_TEMPLATES = [
  {
    id: "soap",
    label: "SOAP",
    icon: "📋",
    type: "sesion" as NoteType,
    color: "bg-blue/10 text-blue border-blue/20 hover:bg-blue/20",
    content: `**SUBJETIVO**\nRelato del paciente/cuidador:\n\n\n**OBJETIVO**\nObservaciones clínicas:\n\n\n**ANÁLISIS**\nInterpretación y razonamiento clínico:\n\n\n**PLAN**\nObjetivos y próximos pasos:`,
  },
  {
    id: "seguimiento",
    label: "Seguimiento",
    icon: "🔄",
    type: "seguimiento" as NoteType,
    color: "bg-yellow/20 text-amber-700 border-yellow/40 hover:bg-yellow/30",
    content: `**SEGUIMIENTO**\n\n**Objetivos trabajados:**\n\n**Avances observados:**\n\n**Dificultades:**\n\n**Ajuste de estrategias:**\n\n**Indicaciones para el hogar:**`,
  },
  {
    id: "evaluacion",
    label: "Evaluación Inicial",
    icon: "🔍",
    type: "evaluacion" as NoteType,
    color: "bg-lavender/60 text-indigo-700 border-lavender hover:bg-lavender",
    content: `**EVALUACIÓN INICIAL**\n\n**Motivo de consulta:**\n\n**Historia ocupacional:**\n\n**Áreas evaluadas:**\n- Autocuidado:\n- Productividad:\n- Ocio/Tiempo libre:\n\n**Instrumentos aplicados:**\n\n**Impresión diagnóstica:**\n\n**Objetivos propuestos:**`,
  },
  {
    id: "alimentacion",
    label: "Alimentación",
    icon: "🍽️",
    type: "evaluacion" as NoteType,
    color: "bg-green/10 text-green border-green/20 hover:bg-green/20",
    content: `**EVALUACIÓN DE ALIMENTACIÓN**\n\n**Texturas aceptadas:**\n\n**Texturas rechazadas:**\n\n**Comportamiento en la mesa:**\n\n**Estrategias utilizadas:**\n\n**Recomendaciones para la familia:**`,
  },
  {
    id: "sensorial",
    label: "Integración Sensorial",
    icon: "🧩",
    type: "evaluacion" as NoteType,
    color: "bg-pink/10 text-pink border-pink/20 hover:bg-pink/20",
    content: `**INTEGRACIÓN SENSORIAL**\n\n**Perfil sensorial observado:**\n\n**Sistemas evaluados:**\n- Táctil:\n- Vestibular:\n- Propioceptivo:\n- Visual:\n- Auditivo:\n\n**Nivel de alerta/regulación:**\n\n**Actividades realizadas:**\n\n**Respuesta del paciente:**\n\n**Indicaciones para el hogar:**`,
  },
  {
    id: "alta",
    label: "Alta",
    icon: "✅",
    type: "alta" as NoteType,
    color: "bg-green/10 text-green border-green/20 hover:bg-green/20",
    content: `**NOTA DE ALTA**\n\n**Resumen del proceso:**\n\n**Objetivos alcanzados:**\n\n**Objetivos pendientes:**\n\n**Recomendaciones finales:**\n\n**Indicaciones de seguimiento:**`,
  },
];

export default function NotasProfesionalPage() {
  const { user } = useAuth();
  const { data: notes, loading: loadingNotes } = useProfessionalNotes(user?.uid);
  const { data: appointmentsData, loading: loadingAppts } = useProfessionalAppointments(user?.uid);
  const loading = loadingNotes || loadingAppts;

  const [filterPatient, setFilterPatient] = useState("");
  const [filterType, setFilterType] = useState<NoteType | "">("");

  // Derive unique patients from appointments
  const patients: PatientOption[] = (() => {
    const map = new Map<string, string>();
    appointmentsData.forEach((a: Appointment) => map.set(a.userId, a.userName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  })();

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("sesion");
  const [submitting, setSubmitting] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState<NoteType>("sesion");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<ClinicalNote | null>(null);

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
      type: noteType,
    });
    setNoteContent("");
    setSelectedPatient("");
    setNoteType("sesion");
    setActiveTemplate(null);
    setShowForm(false);
    setSubmitting(false);
  }

  function startEdit(note: ClinicalNote) {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditType(note.type ?? "sesion");
    setConfirmDeleteNote(null);
  }

  async function handleSaveEdit(noteId: string) {
    if (!editContent.trim()) return;
    setSavingEdit(true);
    await updateClinicalNote(noteId, { content: editContent.trim(), type: editType });
    setSavingEdit(false);
    setEditingId(null);
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId);
    await deleteClinicalNote(noteId);
    setDeletingId(null);
    setConfirmDeleteNote(null);
  }

  // Session counter per patient (chronological order, so reverse the desc-sorted list)
  const sessionCountByPatient = new Map<string, number>();
  [...notes].reverse().forEach((n) => {
    const prev = sessionCountByPatient.get(n.patientId) ?? 0;
    sessionCountByPatient.set(n.patientId, prev + 1);
  });
  // Map noteId → session number for that patient
  const noteSessionNumber = new Map<string, number>();
  const counterTemp = new Map<string, number>();
  [...notes].reverse().forEach((n) => {
    const prev = counterTemp.get(n.patientId) ?? 0;
    const num = prev + 1;
    counterTemp.set(n.patientId, num);
    noteSessionNumber.set(n.id, num);
  });

  const patientNames = [...new Set(notes.map((n) => n.patientName))];
  const filteredNotes = notes.filter((n) => {
    if (filterPatient && n.patientName !== filterPatient) return false;
    if (filterType && n.type !== filterType) return false;
    return true;
  });

  const notesPag = usePagination(filteredNotes, 10);

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
        <div className="flex items-center gap-3 flex-wrap justify-end">
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
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as NoteType | "")}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
          >
            <option value="">Todos los tipos</option>
            {(Object.keys(NOTE_TYPE_LABELS) as NoteType[]).map((t) => (
              <option key={t} value={t}>{NOTE_TYPE_LABELS[t]}</option>
            ))}
          </select>
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
            <div className="flex gap-4">
              <div className="flex-1">
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
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as NoteType)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
                >
                  {(Object.keys(NOTE_TYPE_LABELS) as NoteType[]).map((t) => (
                    <option key={t} value={t}>{NOTE_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>

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
                        setNoteType(t.type);
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
                  onClick={() => { setNoteContent(""); setActiveTemplate(null); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                >
                  Cambiar plantilla
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Contenido</label>
              <RichTextarea
                value={noteContent}
                onChange={setNoteContent}
                placeholder="Observaciones de la sesión, avances, indicaciones para la familia..."
                minRows={6}
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
            {filterPatient || filterType ? "No hay notas con estos filtros." : "Aún no hay notas clínicas."}
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
          {notesPag.items.map((n) => {
            const sessionNum = noteSessionNumber.get(n.id);
            const typeLabel = n.type ? NOTE_TYPE_LABELS[n.type] : null;
            const typeColor = n.type ? NOTE_TYPE_COLORS[n.type] : "bg-gray-100 text-gray-500 border-gray-200";
            return (
              <div key={n.id} className="bg-white rounded-2xl shadow-sm p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/10 text-green text-xs font-bold flex-shrink-0">
                      {n.patientName[0]?.toUpperCase() || "P"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{n.patientName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {typeLabel && (
                          <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${typeColor}`}>
                            {typeLabel}
                          </span>
                        )}
                        {sessionNum && (
                          <span className="text-[11px] text-gray-400">Nota #{sessionNum}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {n.createdAt.toDate().toLocaleDateString("es-CL", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                    {editingId !== n.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(n)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue hover:bg-blue/5 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteNote(n)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red hover:bg-red/5 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Updated badge */}
                {n.updatedAt && (
                  <p className="text-[11px] text-gray-300 mb-2">
                    Editado {n.updatedAt.toDate().toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                  </p>
                )}

                {/* Content — edit or read */}
                {editingId === n.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo</label>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as NoteType)}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
                      >
                        {(Object.keys(NOTE_TYPE_LABELS) as NoteType[]).map((t) => (
                          <option key={t} value={t}>{NOTE_TYPE_LABELS[t]}</option>
                        ))}
                      </select>
                    </div>
                    <RichTextarea
                      value={editContent}
                      onChange={setEditContent}
                      minRows={8}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 hover:text-foreground hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(n.id)}
                        disabled={savingEdit || !editContent.trim()}
                        className="rounded-xl bg-green px-5 py-2 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors"
                      >
                        {savingEdit ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <MarkdownContent content={n.content} className="text-sm text-gray-600" />
                )}
              </div>
            );
          })}
          <Pagination
            page={notesPag.page}
            totalPages={notesPag.totalPages}
            totalItems={notesPag.totalItems}
            hasNextPage={notesPag.hasNextPage}
            hasPrevPage={notesPag.hasPrevPage}
            onNext={notesPag.nextPage}
            onPrev={notesPag.prevPage}
            label="notas clinicas"
          />
        </div>
      )}

      {/* Delete modal */}
      {confirmDeleteNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deletingId && setConfirmDeleteNote(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red/10 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-foreground">Eliminar nota</p>
                <p className="text-sm text-gray-500">{confirmDeleteNote.patientName}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción no se puede deshacer. ¿Estás seguro que deseas eliminar esta nota clínica?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteNote(null)}
                disabled={!!deletingId}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteNote.id)}
                disabled={!!deletingId}
                className="rounded-xl bg-red px-5 py-2 text-sm font-semibold text-white hover:bg-red/90 disabled:opacity-50 transition-colors"
              >
                {deletingId ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
