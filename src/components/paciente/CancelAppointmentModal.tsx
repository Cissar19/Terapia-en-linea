"use client";

import type { Appointment } from "@/lib/firebase/types";

interface Props {
  appointment: Appointment;
  onConfirm: () => void;
  onClose: () => void;
  submitting: boolean;
}

export default function CancelAppointmentModal({ appointment, onConfirm, onClose, submitting }: Props) {
  const apptDate = appointment.date.toDate();
  const hoursUntil = (apptDate.getTime() - Date.now()) / (1000 * 60 * 60);
  const canCancel = hoursUntil >= 24;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-full bg-red/10 flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-foreground">Cancelar Cita</h2>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 mb-5">
            <p className="text-sm font-semibold text-foreground">{appointment.serviceName}</p>
            <p className="text-xs text-gray-500 mt-1">
              {apptDate.toLocaleDateString("es-CL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              —{" "}
              {apptDate.toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {appointment.professionalName && (
              <p className="text-xs text-gray-400 mt-1">Con {appointment.professionalName}</p>
            )}
          </div>

          {canCancel ? (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Esta accion no se puede deshacer. Si necesitas reagendar, puedes crear una nueva cita despues de cancelar.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={onConfirm}
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-red/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Cancelando..." : "Confirmar Cancelacion"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-yellow/10 border border-yellow/20 p-4 mb-6">
                <p className="text-sm font-semibold text-foreground mb-1">No es posible cancelar</p>
                <p className="text-xs text-gray-600">
                  Las citas solo se pueden cancelar con al menos 24 horas de anticipacion.
                  Tu cita es en menos de {Math.max(1, Math.round(hoursUntil))} horas.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue/90 transition-colors"
              >
                Entendido
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
