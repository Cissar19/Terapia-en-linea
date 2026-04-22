"use client";

import { useState } from "react";
import { updateUserProfile } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/firebase/types";

interface EditPatientModalProps {
  patient: UserProfile;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditPatientModal({ patient, onClose, onUpdated }: EditPatientModalProps) {
  const [name, setName] = useState(patient.displayName);
  const [phone, setPhone] = useState(patient.phone ?? "");
  const [birthDate, setBirthDate] = useState(patient.birthDate ?? "");
  const [commune, setCommune] = useState(patient.residenceCommune ?? "");
  const [diagnoses, setDiagnoses] = useState(patient.diagnoses ?? "");
  const [medications, setMedications] = useState(patient.medications ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      await updateUserProfile(patient.uid, {
        displayName: name.trim(),
        phone: phone.trim() || null,
        birthDate: birthDate || null,
        residenceCommune: commune.trim() || undefined,
        diagnoses: diagnoses.trim() || undefined,
        medications: medications.trim() || undefined,
      });
      onUpdated();
      onClose();
    } catch {
      setError("Error al guardar los cambios. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 z-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue/15 text-blue">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
            <h2 className="text-lg font-black text-foreground">Editar Paciente</h2>
          </div>
          <p className="text-xs text-gray-400 mb-5 ml-10">{patient.email}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red/10 border border-red/15 p-3 text-sm text-red">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30"
              />
            </div>

            <div className="border-t border-gray-100" />

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Datos adicionales</p>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+56 9 1234 5678"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Comuna de residencia</label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder="Ej: Providencia"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Diagnóstico(s)</label>
                <textarea
                  value={diagnoses}
                  onChange={(e) => setDiagnoses(e.target.value)}
                  rows={2}
                  placeholder="Ej: TEA nivel 1, TDAH..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Medicamentos</label>
                <textarea
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  rows={2}
                  placeholder="Ej: Ritalín 10mg..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/30 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="flex-1 rounded-xl bg-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
