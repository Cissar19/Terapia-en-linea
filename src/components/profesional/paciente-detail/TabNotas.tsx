"use client";

import { useState } from "react";
import { addClinicalNote, updateClinicalNote, deleteClinicalNote } from "@/lib/firebase/firestore";
import type { ClinicalNote, NoteType } from "@/lib/firebase/types";
import { NOTE_TYPE_LABELS } from "@/lib/firebase/types";
import RichTextarea from "@/components/RichTextarea";
import MarkdownContent from "@/components/MarkdownContent";

interface TabNotasProps {
  notes: ClinicalNote[];
  patientId: string;
  patientName: string;
  professionalId: string;
  onNoteAdded: (note: ClinicalNote) => void;
  onNoteUpdated?: (note: ClinicalNote) => void;
  onNoteDeleted?: (noteId: string) => void;
}

const NOTE_TYPE_COLORS: Record<NoteType, string> = {
  sesion:      "bg-blue/10 text-blue border-blue/20",
  evaluacion:  "bg-lavender/60 text-indigo-700 border-lavender",
  seguimiento: "bg-yellow/20 text-amber-700 border-yellow/40",
  alta:        "bg-green/10 text-green border-green/20",
};

const QUICK_TEMPLATES = [
  {
    id: "soap",
    label: "SOAP",
    icon: "📋",
    type: "sesion" as NoteType,
    content: `**SUBJETIVO**\nRelato del paciente/cuidador:\n\n\n**OBJETIVO**\nObservaciones clínicas:\n\n\n**ANÁLISIS**\nInterpretación y razonamiento clínico:\n\n\n**PLAN**\nObjetivos y próximos pasos:`,
  },
  {
    id: "seguimiento",
    label: "Seguimiento",
    icon: "🔄",
    type: "seguimiento" as NoteType,
    content: `**SEGUIMIENTO**\n\n**Objetivos trabajados:**\n\n**Avances observados:**\n\n**Dificultades:**\n\n**Indicaciones para el hogar:**`,
  },
  {
    id: "evaluacion",
    label: "Evaluación",
    icon: "🔍",
    type: "evaluacion" as NoteType,
    content: `**EVALUACIÓN INICIAL**\n\n**Motivo de consulta:**\n\n**Áreas evaluadas:**\n\n**Impresión diagnóstica:**\n\n**Objetivos propuestos:**`,
  },
  {
    id: "alta",
    label: "Alta",
    icon: "✅",
    type: "alta" as NoteType,
    content: `**NOTA DE ALTA**\n\n**Resumen del proceso:**\n\n**Objetivos alcanzados:**\n\n**Recomendaciones finales:**`,
  },
];

export default function TabNotas({
  notes,
  patientId,
  patientName,
  professionalId,
  onNoteAdded,
  onNoteUpdated,
  onNoteDeleted,
}: TabNotasProps) {
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("sesion");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState<NoteType>("sesion");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete state
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<ClinicalNote | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const id = await addClinicalNote({
        appointmentId: "",
        professionalId,
        patientId,
        patientName,
        content: content.trim(),
        type: noteType,
      });
      onNoteAdded({
        id,
        appointmentId: "",
        professionalId,
        patientId,
        patientName,
        content: content.trim(),
        type: noteType,
        createdAt: { toDate: () => new Date() } as ClinicalNote["createdAt"],
      });
      setContent("");
      setNoteType("sesion");
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(note: ClinicalNote) {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditType(note.type ?? "sesion");
    setConfirmDeleteNote(null);
  }

  async function handleSaveEdit(note: ClinicalNote) {
    if (!editContent.trim()) return;
    setSavingEdit(true);
    try {
      await updateClinicalNote(note.id, { content: editContent.trim(), type: editType });
      onNoteUpdated?.({
        ...note,
        content: editContent.trim(),
        type: editType,
      });
      setEditingId(null);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId);
    try {
      await deleteClinicalNote(noteId);
      onNoteDeleted?.(noteId);
      setConfirmDeleteNote(null);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Add note */}
      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Template picker */}
          {!content.trim() && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-400 mb-2">Plantilla rápida</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setContent(t.content); setNoteType(t.type); }}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <label className="text-xs font-medium text-gray-500 flex-shrink-0">Tipo:</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as NoteType)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
            >
              {(Object.keys(NOTE_TYPE_LABELS) as NoteType[]).map((t) => (
                <option key={t} value={t}>{NOTE_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <RichTextarea
            value={content}
            onChange={setContent}
            placeholder="Escribir nota clínica de la sesión..."
            minRows={5}
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => { setShowForm(false); setContent(""); setNoteType("sesion"); }}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={submitting || !content.trim()}
              className="rounded-xl bg-green px-5 py-2 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Guardando..." : "Guardar Nota"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-2xl border-2 border-dashed border-gray-200 p-4 text-sm font-medium text-gray-400 hover:border-green hover:text-green transition-colors"
        >
          + Nueva Nota Clínica
        </button>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400">Sin notas clínicas aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => {
            const typeColor = n.type ? NOTE_TYPE_COLORS[n.type] : "bg-gray-100 text-gray-500 border-gray-200";
            const typeLabel = n.type ? NOTE_TYPE_LABELS[n.type] : null;
            return (
              <div key={n.id} className="bg-white rounded-2xl shadow-sm p-5">
                {editingId === n.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-gray-500 flex-shrink-0">Tipo:</label>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as NoteType)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
                      >
                        {(Object.keys(NOTE_TYPE_LABELS) as NoteType[]).map((t) => (
                          <option key={t} value={t}>{NOTE_TYPE_LABELS[t]}</option>
                        ))}
                      </select>
                    </div>
                    <RichTextarea
                      value={editContent}
                      onChange={setEditContent}
                      minRows={6}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(n)}
                        disabled={savingEdit || !editContent.trim()}
                        className="rounded-xl bg-green px-5 py-2 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors"
                      >
                        {savingEdit ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-gray-400">
                          {n.createdAt.toDate().toLocaleDateString("es-CL", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {typeLabel && (
                          <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${typeColor}`}>
                            {typeLabel}
                          </span>
                        )}
                        {n.updatedAt && (
                          <span className="text-[11px] text-gray-300">
                            (editado)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(n)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-gray-300 hover:text-blue hover:bg-blue/5 transition-colors"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteNote(n)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red hover:bg-red/5 transition-colors"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <MarkdownContent content={n.content} className="text-sm text-gray-700" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
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
