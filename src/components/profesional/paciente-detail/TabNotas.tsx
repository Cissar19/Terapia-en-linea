"use client";

import { useState } from "react";
import { addClinicalNote } from "@/lib/firebase/firestore";
import type { ClinicalNote } from "@/lib/firebase/types";

interface TabNotasProps {
  notes: ClinicalNote[];
  patientId: string;
  patientName: string;
  professionalId: string;
  onNoteAdded: (note: ClinicalNote) => void;
}

export default function TabNotas({ notes, patientId, patientName, professionalId, onNoteAdded }: TabNotasProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      });
      onNoteAdded({
        id,
        appointmentId: "",
        professionalId,
        patientId,
        patientName,
        content: content.trim(),
        createdAt: { toDate: () => new Date() } as ClinicalNote["createdAt"],
      });
      setContent("");
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Add note */}
      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribir nota clinica de la sesion..."
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 resize-none"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => { setShowForm(false); setContent(""); }}
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
          + Nueva Nota Clinica
        </button>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400">Sin notas clinicas aun.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-xs text-gray-400 mb-2">
                {n.createdAt.toDate().toLocaleDateString("es-CL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
