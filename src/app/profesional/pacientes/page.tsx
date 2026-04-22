"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";
import {
  addClinicalNote,
  addPatientTask,
  updatePatientTask,
  getPatientsByProfessional,
  getUserProfile,
} from "@/lib/firebase/firestore";
import { useProfessionalAppointments } from "@/hooks/useAppointments";
import { useProfessionalNotes } from "@/hooks/useNotes";
import { useProfessionalTasks } from "@/hooks/useTasks";
import { uploadTaskAttachment } from "@/lib/firebase/storage";
import type { Appointment, TaskAttachment, UserProfile } from "@/lib/firebase/types";
import { Timestamp } from "firebase/firestore";
import PatientModal from "@/components/profesional/PatientModal";
import type { TaskFormData } from "@/components/profesional/PatientModal";
import CreatePatientModal from "@/components/profesional/CreatePatientModal";
import EditPatientModal from "@/components/profesional/EditPatientModal";

interface PatientInfo {
  id: string;
  name: string;
  email: string;
  appointmentCount: number;
  completedCount: number;
  lastAppointment: Date | null;
}

export default function PacientesPage() {
  const { user, profile } = useAuth();
  const { data: appointmentsData, loading: loadingAppts } = useProfessionalAppointments(user?.uid);
  const { data: notes, loading: loadingNotes } = useProfessionalNotes(user?.uid);
  const { data: tasks, loading: loadingTasks } = useProfessionalTasks(user?.uid);
  const loading = loadingAppts || loadingNotes || loadingTasks;

  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [createdPatients, setCreatedPatients] = useState<UserProfile[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<PatientInfo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const createdPatientIds = useMemo(() => new Set(createdPatients.map((p) => p.uid)), [createdPatients]);

  const loadCreatedPatients = useCallback(async () => {
    if (!user) return;
    try {
      const list = await getPatientsByProfessional(user.uid);
      setCreatedPatients(list);
    } catch {
      // silently ignore permission errors
    }
  }, [user]);

  useEffect(() => { loadCreatedPatients(); }, [loadCreatedPatients]);

  useEffect(() => {
    window.addEventListener("patient-created", loadCreatedPatients);
    return () => window.removeEventListener("patient-created", loadCreatedPatients);
  }, [loadCreatedPatients]);

  const patients = useMemo(() => {
    const patientMap = new Map<string, PatientInfo>();
    appointmentsData.forEach((a: Appointment) => {
      const existing = patientMap.get(a.userId);
      const apptDate = a.date.toDate();
      if (existing) {
        existing.appointmentCount++;
        if (a.status === "completed") existing.completedCount++;
        if (!existing.lastAppointment || apptDate > existing.lastAppointment) {
          existing.lastAppointment = apptDate;
        }
      } else {
        patientMap.set(a.userId, {
          id: a.userId,
          name: a.userName,
          email: a.userEmail,
          appointmentCount: 1,
          completedCount: a.status === "completed" ? 1 : 0,
          lastAppointment: apptDate,
        });
      }
    });
    // Merge patients created manually (no appointments yet)
    for (const cp of createdPatients) {
      if (!patientMap.has(cp.uid)) {
        patientMap.set(cp.uid, {
          id: cp.uid,
          name: cp.displayName,
          email: cp.email,
          appointmentCount: 0,
          completedCount: 0,
          lastAppointment: null,
        });
      }
    }

    return Array.from(patientMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [appointmentsData, createdPatients]);

  const patientsPag = usePagination(patients, 10);

  async function handleAddNote(patientId: string, patientName: string, content: string) {
    if (!user) return;
    await addClinicalNote({
      appointmentId: "",
      professionalId: user.uid,
      patientId,
      patientName,
      content,
    });
  }

  async function handleAddTask(patientId: string, patientName: string, data: TaskFormData) {
    if (!user || !profile || !data.title.trim()) return;

    const taskData: Parameters<typeof addPatientTask>[0] = {
      professionalId: user.uid,
      professionalName: profile.displayName,
      patientId,
      patientName,
      title: data.title,
      description: data.description,
    };
    if (data.priority) taskData.priority = data.priority;
    if (data.dueDate) taskData.dueDate = Timestamp.fromDate(new Date(data.dueDate + "T23:59:59"));

    const id = await addPatientTask(taskData);

    // Upload file attachments
    const uploaded: TaskAttachment[] = [];
    for (const att of data.attachments) {
      if (att.type === "drive") {
        uploaded.push(att);
      } else {
        const fileAtt = att as TaskAttachment & { _file?: File };
        if (fileAtt._file) {
          uploaded.push(await uploadTaskAttachment(fileAtt._file, id));
        }
      }
    }
    if (uploaded.length > 0) {
      await updatePatientTask(id, { attachments: uploaded });
    }

    // Revoke blob URLs
    data.attachments.forEach((att) => {
      if (att.type === "file" && att.url.startsWith("blob:")) URL.revokeObjectURL(att.url);
    });

    // Fire-and-forget notification
    fetch("/api/tasks/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        title: data.title,
        description: data.description || undefined,
        priority: data.priority || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate + "T23:59:59").toISOString() : undefined,
        professionalName: profile.displayName,
        attachmentCount: uploaded.length || undefined,
      }),
    }).catch(() => {});
  }

  async function handleEditClick(e: React.MouseEvent, patientId: string) {
    e.stopPropagation();
    const fullProfile = await getUserProfile(patientId);
    if (fullProfile) setEditingProfile(fullProfile);
  }

  async function handleDeleteConfirm() {
    if (!deletingPatient || !user) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch("/api/admin/delete-patient", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId: deletingPatient.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "Error al eliminar el paciente.");
        return;
      }
      setDeletingPatient(null);
      loadCreatedPatients();
    } catch {
      setDeleteError("Error inesperado. Intenta de nuevo.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-black text-foreground mb-8">Pacientes</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-gray-50">
              <div className="h-10 w-10 bg-gray-100 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-56 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Patient Modal */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          appointments={appointmentsData.filter((a) => a.userId === selectedPatient.id)}
          notes={notes.filter((n) => n.patientId === selectedPatient.id)}
          tasks={tasks.filter((t) => t.patientId === selectedPatient.id)}
          onAddNote={handleAddNote}
          onAddTask={handleAddTask}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {/* Create Patient Modal */}
      {showCreateModal && (
        <CreatePatientModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Patient Modal */}
      {editingProfile && (
        <EditPatientModal
          patient={editingProfile}
          onClose={() => setEditingProfile(null)}
          onUpdated={loadCreatedPatients}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setDeletingPatient(null); setDeleteError(""); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red flex-shrink-0">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-black text-foreground">Eliminar paciente</p>
                <p className="text-xs text-gray-400">{deletingPatient.name}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Esta acción eliminará la cuenta del paciente de forma permanente. No se puede deshacer.
            </p>
            {deleteError && (
              <div className="rounded-xl bg-red/10 border border-red/15 p-3 text-sm text-red mb-4">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeletingPatient(null); setDeleteError(""); }}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 rounded-xl bg-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-red/90 disabled:opacity-50 transition-colors"
              >
                {deleteLoading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Pacientes</h1>
          <p className="text-sm text-gray-500 mt-1">{patients.length} pacientes en total</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green/90 transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Paciente
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-1">Aún no tienes pacientes asignados.</p>
          <p className="text-xs text-gray-300">Los pacientes aparecerán aquí cuando tengan citas contigo.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {patientsPag.items.map((p, idx) => {
            const patientTasks = tasks.filter((t) => t.patientId === p.id);
            const pendingCount = patientTasks.filter((t) => !t.completed).length;
            const upcomingCount = appointmentsData.filter(
              (a) => a.userId === p.id && a.status === "confirmed" && a.date.toDate() >= new Date()
            ).length;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/70 transition-colors cursor-pointer ${
                  idx < patientsPag.items.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green/10 text-green text-sm font-bold flex-shrink-0">
                    {p.name[0]?.toUpperCase() || "P"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
                    <span>{p.completedCount} sesiones</span>
                    {upcomingCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-green font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                        {upcomingCount} próxima{upcomingCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {pendingCount > 0 && (
                      <span className="text-orange font-semibold">{pendingCount} tarea{pendingCount > 1 ? "s" : ""}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleEditClick(e, p.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-blue hover:bg-blue/10 transition-colors"
                      title="Editar paciente"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {createdPatientIds.has(p.id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteError(""); setDeletingPatient(p); }}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red hover:bg-red/10 transition-colors"
                        title="Eliminar paciente"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}

          <div className="px-6 py-4 border-t border-gray-50">
            <Pagination
              page={patientsPag.page}
              totalPages={patientsPag.totalPages}
              totalItems={patientsPag.totalItems}
              hasNextPage={patientsPag.hasNextPage}
              hasPrevPage={patientsPag.hasPrevPage}
              onNext={patientsPag.nextPage}
              onPrev={patientsPag.prevPage}
              label="pacientes"
            />
          </div>
        </div>
      )}
    </div>
  );
}
