"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAppointmentsByProfessional,
  getNotesByProfessional,
  getTasksByProfessional,
} from "@/lib/firebase/firestore";
import type { Appointment, ClinicalNote, PatientTask } from "@/lib/firebase/types";

export default function ProfesionalPage() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [tasks, setTasks] = useState<PatientTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getAppointmentsByProfessional(user.uid),
      getNotesByProfessional(user.uid),
      getTasksByProfessional(user.uid),
    ])
      .then(([appts, n, t]) => {
        setAppointments(appts);
        setNotes(n);
        setTasks(t);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = appointments.filter((a) => {
    const d = a.date.toDate();
    return d >= today && d < tomorrow && a.status === "confirmed";
  });

  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  // Unique patients
  const uniquePatients = new Set(appointments.map((a) => a.userId));
  const patientCount = uniquePatients.size;

  // Task stats
  const pendingTaskCount = tasks.filter((t) => !t.completed).length;

  const recentNotes = notes.slice(0, 5);

  // Upcoming appointments (future, confirmed)
  const upcomingAppointments = appointments
    .filter((a) => a.status === "confirmed" && a.date.toDate() >= today)
    .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-black text-foreground mb-2">
          Hola, {profile?.displayName?.split(" ")[0] || "Profesional"}
        </h1>
        <p className="text-gray-500 mb-8">Panel de gestión clínica</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-4 w-20 bg-gray-100 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-foreground mb-2">
        Hola, {profile?.displayName?.split(" ")[0] || "Profesional"}
      </h1>
      <p className="text-gray-500 mb-8">Panel de gestión clínica</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Citas Hoy</p>
          <p className="text-3xl font-black text-foreground">{todayAppointments.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Pacientes</p>
          <p className="text-3xl font-black text-blue">{patientCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Sesiones Completadas</p>
          <p className="text-3xl font-black text-green">{completedCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Tareas Pendientes</p>
          <p className="text-3xl font-black text-yellow">{pendingTaskCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Citas de Hoy</h2>
            <Link href="/profesional/citas" className="text-sm text-blue hover:underline font-medium">
              Ver todas
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay citas para hoy.</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-green/5 border border-green/10">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.userName}</p>
                    <p className="text-xs text-gray-500">{a.serviceName}</p>
                  </div>
                  <p className="text-sm font-medium text-green">
                    {a.date.toDate().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Próximas Citas</h2>
            <span className="text-xs text-gray-400">{confirmedCount} confirmadas</span>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay citas próximas.</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-blue/5 border border-blue/10">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.userName}</p>
                    <p className="text-xs text-gray-500">{a.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-blue">
                      {a.date.toDate().toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.date.toDate().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent notes */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Últimas Notas Clínicas</h2>
          <Link href="/profesional/notas" className="text-sm text-blue hover:underline font-medium">
            Ver todas
          </Link>
        </div>
        {recentNotes.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Aún no hay notas clínicas.</p>
        ) : (
          <div className="space-y-3">
            {recentNotes.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green/10 text-green text-[10px] font-bold">
                      {n.patientName[0]?.toUpperCase() || "P"}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{n.patientName}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {n.createdAt.toDate().toLocaleDateString("es-CL")}
                  </p>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 ml-8">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/profesional/pacientes"
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow text-center"
        >
          <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-green/10 flex items-center justify-center">
            <svg className="h-5 w-5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">Ver Pacientes</p>
        </Link>
        <Link
          href="/profesional/citas"
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow text-center"
        >
          <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-blue/10 flex items-center justify-center">
            <svg className="h-5 w-5 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">Gestionar Citas</p>
        </Link>
        <Link
          href="/profesional/notas"
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow text-center"
        >
          <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-yellow/10 flex items-center justify-center">
            <svg className="h-5 w-5 text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">Notas Clínicas</p>
        </Link>
      </div>
    </div>
  );
}
