"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotesByProfessional,
  getAppointmentsByProfessional,
  addClinicalNote,
} from "@/lib/firebase/firestore";
import type { ClinicalNote, Appointment } from "@/lib/firebase/types";

interface PatientOption {
  id: string;
  name: string;
}

export default function NotasProfesionalPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPatient, setFilterPatient] = useState("");

  // Form
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getNotesByProfessional(user.uid),
      getAppointmentsByProfessional(user.uid),
    ])
      .then(([n, appts]) => {
        setNotes(n);
        // Derive unique patients from appointments
        const map = new Map<string, string>();
        appts.forEach((a: Appointment) => map.set(a.userId, a.userName));
        setPatients(Array.from(map.entries()).map(([id, name]) => ({ id, name })));
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSubmit() {
    if (!noteContent.trim() || !selectedPatient || !user) return;
    const patient = patients.find((p) => p.id === selectedPatient);
    if (!patient) return;

    setSubmitting(true);
    const id = await addClinicalNote({
      appointmentId: "",
      professionalId: user.uid,
      patientId: patient.id,
      patientName: patient.name,
      content: noteContent.trim(),
    });
    setNotes((prev) => [
      {
        id,
        appointmentId: "",
        professionalId: user.uid,
        patientId: patient.id,
        patientName: patient.name,
        content: noteContent.trim(),
        createdAt: { toDate: () => new Date() } as ClinicalNote["createdAt"],
      },
      ...prev,
    ]);
    setNoteContent("");
    setSelectedPatient("");
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
