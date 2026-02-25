"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserProfile,
  getAppointmentsByPatient,
  getNotesByPatient,
  getTasksByPatient,
  getInterventionPlansByPatient,
} from "@/lib/firebase/firestore";
import type {
  UserProfile,
  Appointment,
  ClinicalNote,
  PatientTask,
  InterventionPlan,
} from "@/lib/firebase/types";

import PatientHeader from "@/components/profesional/paciente-detail/PatientHeader";
import PatientTabs, { type TabKey } from "@/components/profesional/paciente-detail/PatientTabs";
import TabResumen from "@/components/profesional/paciente-detail/TabResumen";
import TabNotas from "@/components/profesional/paciente-detail/TabNotas";
import TabSesiones from "@/components/profesional/paciente-detail/TabSesiones";
import TabAvances from "@/components/profesional/paciente-detail/TabAvances";
import TabTareas from "@/components/profesional/paciente-detail/TabTareas";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const { user, profile: myProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("resumen");

  const [patientProfile, setPatientProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [tasks, setTasks] = useState<PatientTask[]>([]);
  const [plans, setPlans] = useState<InterventionPlan[]>([]);

  // Derived: patient name/email from profile or first appointment
  const patientName = patientProfile?.displayName || appointments[0]?.userName || "Paciente";
  const patientEmail = patientProfile?.email || appointments[0]?.userEmail || "";

  useEffect(() => {
    if (!user || !patientId) return;
    Promise.all([
      getUserProfile(patientId),
      getAppointmentsByPatient(patientId),
      getNotesByPatient(patientId),
      getTasksByPatient(patientId),
      getInterventionPlansByPatient(patientId),
    ])
      .then(([profile, appts, n, t, p]) => {
        setPatientProfile(profile);
        setAppointments(appts);
        setNotes(n);
        setTasks(t);
        setPlans(p);
      })
      .finally(() => setLoading(false));
  }, [user, patientId]);

  // Callbacks for child mutations
  const handleNoteAdded = useCallback((note: ClinicalNote) => {
    setNotes((prev) => [note, ...prev]);
  }, []);

  const handleTaskAdded = useCallback((task: PatientTask) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const handleTaskToggled = useCallback((taskId: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed } : t)));
  }, []);

  const handleTaskUpdated = useCallback((task: PatientTask) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
  }, []);

  const handleTaskDeleted = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const handlePlanUpdated = useCallback((plan: InterventionPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
  }, []);

  // Derived counters for tabs
  const activePlan = plans.find((p) => p.status === "active");
  const allObjectives = activePlan?.objectives ?? [];
  const objectivesCompleted = allObjectives.filter((o) => o.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;

  if (loading) {
    return (
      <div>
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-gray-100 rounded-full" />
            <div>
              <div className="h-5 w-48 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 animate-pulse">
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-8 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PatientHeader
        patientName={patientName}
        patientEmail={patientEmail}
        profile={patientProfile}
      />

      <PatientTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notesCount={notes.length}
        sessionsCount={appointments.length}
        objectivesCompleted={objectivesCompleted}
        objectivesTotal={allObjectives.length}
        tasksPending={pendingTasks}
        tasksTotal={tasks.length}
      />

      {activeTab === "resumen" && (
        <TabResumen
          profile={patientProfile}
          appointments={appointments}
          notes={notes}
          tasks={tasks}
          plans={plans}
          onTabChange={setActiveTab}
        />
      )}

      {activeTab === "notas" && (
        <TabNotas
          notes={notes}
          patientId={patientId}
          patientName={patientName}
          professionalId={user!.uid}
          onNoteAdded={handleNoteAdded}
        />
      )}

      {activeTab === "sesiones" && (
        <TabSesiones appointments={appointments} />
      )}

      {activeTab === "avances" && (
        <TabAvances plans={plans} onPlanUpdated={handlePlanUpdated} />
      )}

      {activeTab === "tareas" && (
        <TabTareas
          tasks={tasks}
          patientId={patientId}
          patientName={patientName}
          professionalId={user!.uid}
          professionalName={myProfile?.displayName || ""}
          onTaskAdded={handleTaskAdded}
          onTaskToggled={handleTaskToggled}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}
