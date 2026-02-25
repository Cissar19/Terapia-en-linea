"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toggleTaskCompleted } from "@/lib/firebase/firestore";
import { usePatientTasks } from "@/hooks/useTasks";
import type { PatientTask } from "@/lib/firebase/types";

type Filter = "all" | "pending" | "completed";

export default function TareasPage() {
  const { user } = useAuth();
  const { data: tasks, loading } = usePatientTasks(user?.uid);
  const [filter, setFilter] = useState<Filter>("all");

  async function handleToggle(taskId: string, completed: boolean) {
    await toggleTaskCompleted(taskId, !completed);
  }

  const PRIORITY_ORDER: Record<string, number> = { alta: 0, media: 1, baja: 2 };

  function sortTasks(list: PatientTask[]): PatientTask[] {
    return [...list].sort((a, b) => {
      // Due date first (soonest first, no date last)
      const aDue = a.dueDate ? a.dueDate.toMillis() : Infinity;
      const bDue = b.dueDate ? b.dueDate.toMillis() : Infinity;
      if (aDue !== bDue) return aDue - bDue;
      // Then by priority (alta first)
      const aPri = PRIORITY_ORDER[a.priority || ""] ?? 3;
      const bPri = PRIORITY_ORDER[b.priority || ""] ?? 3;
      if (aPri !== bPri) return aPri - bPri;
      // Then by creation date (newest first)
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
  }

  const pendingTasks = sortTasks(tasks.filter((t) => !t.completed));
  const completedTasks = tasks.filter((t) => t.completed);
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const filteredTasks =
    filter === "pending"
      ? pendingTasks
      : filter === "completed"
        ? completedTasks
        : [...pendingTasks, ...completedTasks];

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-gray-100 rounded mb-8 animate-pulse" />
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gray-100" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-3 w-32 bg-gray-50 rounded" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="flex items-start gap-3">
                <div className="h-4 w-4 rounded bg-gray-100 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-100 rounded" />
                  <div className="h-3 w-1/2 bg-gray-50 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-foreground mb-8">Mis Tareas</h1>

      {/* Progress summary */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-5">
          <div
            className="progress-ring-sm relative flex-shrink-0"
            style={{ "--progress": taskProgress, "--ring-color": "#2DC653" } as React.CSSProperties}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-green">
              {totalTasks > 0 ? `${taskProgress}%` : "—"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Progreso general</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalTasks > 0
                ? `${completedTasks.length} de ${totalTasks} tareas completadas`
                : "No tienes tareas asignadas aún"}
            </p>
          </div>
          {totalTasks > 0 && (
            <div className="flex gap-3 text-center">
              <div>
                <p className="text-xl font-black text-yellow">{pendingTasks.length}</p>
                <p className="text-[10px] font-semibold text-gray-400">Pendientes</p>
              </div>
              <div>
                <p className="text-xl font-black text-green">{completedTasks.length}</p>
                <p className="text-[10px] font-semibold text-gray-400">Completadas</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {totalTasks > 0 && (
        <div className="flex gap-2 mb-6">
          {([
            { key: "all", label: "Todas", count: totalTasks },
            { key: "pending", label: "Pendientes", count: pendingTasks.length },
            { key: "completed", label: "Completadas", count: completedTasks.length },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-green text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      {totalTasks === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-green/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Sin tareas por ahora</p>
          <p className="text-xs text-gray-400">
            Cuando tu profesional te asigne tareas, aparecerán aquí.
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400">
            No hay tareas {filter === "pending" ? "pendientes" : "completadas"}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const dueDateObj = t.dueDate ? t.dueDate.toDate() : null;
            const isOverdue = dueDateObj && !t.completed && dueDateObj < new Date();
            return (
              <label
                key={t.id}
                className={`flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm cursor-pointer hover:shadow-md transition-all ${
                  t.completed ? "opacity-75" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => handleToggle(t.id, t.completed)}
                  className="mt-0.5 h-5 w-5 rounded border-gray-300 text-green focus:ring-green/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${t.completed ? "text-gray-400 line-through" : "text-foreground"}`}>
                      {t.title}
                    </p>
                    {t.priority && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        t.priority === "alta" ? "bg-red/10 text-red"
                          : t.priority === "media" ? "bg-yellow/15 text-orange"
                          : "bg-green/10 text-green"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          t.priority === "alta" ? "bg-red"
                            : t.priority === "media" ? "bg-yellow"
                            : "bg-green"
                        }`} />
                        {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                      </span>
                    )}
                  </div>
                  {t.description && (
                    <p className={`text-xs mt-1 ${t.completed ? "text-gray-300" : "text-gray-500"}`}>
                      {t.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[10px] text-gray-400">
                      Por {t.professionalName}
                    </span>
                    <span className="text-[10px] text-gray-300">
                      {t.createdAt.toDate().toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {dueDateObj && (
                      <span className={`text-[10px] font-medium ${isOverdue ? "text-red" : "text-gray-400"}`}>
                        {isOverdue ? "Vencida: " : "Limite: "}
                        {dueDateObj.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                  {t.attachments && t.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {t.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
                            att.type === "drive"
                              ? "bg-blue/10 text-blue hover:bg-blue/20"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {att.type === "drive" ? (
                            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5L1.15 15l3.43 5.98h6.56L4.58 9.48l3.13-5.98zm1.14 0l6.56 11.48H24l-3.43-5.98H11.98L8.85 3.5zm5.71 12.48L11.14 21h13.43l3.43-5.98-3.43-.04H14.56z"/></svg>
                          ) : (
                            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          )}
                          <span className="max-w-[150px] truncate">{att.name}</span>
                          <svg className="h-3.5 w-3.5 flex-shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <span
                  className={`flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    t.completed ? "bg-green/10 text-green" : "bg-yellow/20 text-orange"
                  }`}
                >
                  {t.completed ? "Completada" : "Pendiente"}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
