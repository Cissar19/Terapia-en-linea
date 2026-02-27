"use client";

import { useEffect, useMemo, useState } from "react";
import type { Appointment } from "@/lib/firebase/types";
import { DEFAULT_DURATION } from "@/lib/services";
import { useServices } from "@/contexts/ServicesContext";

interface DailyTimelineProps {
  appointments: Appointment[];
  date: Date;
  onComplete?: (appointment: Appointment) => void;
}

const HOUR_HEIGHT = 64;
const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_HOURS = END_HOUR - START_HOUR;

const SERVICE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "adaptacion-puesto": {
    bg: "bg-blue-light/50",
    border: "border-l-blue",
    text: "text-blue",
  },
  "atencion-temprana": {
    bg: "bg-green-light/50",
    border: "border-l-green",
    text: "text-green",
  },
  "babysitting-terapeutico": {
    bg: "bg-pink-light/50",
    border: "border-l-pink",
    text: "text-pink",
  },
};

const DEFAULT_COLORS = {
  bg: "bg-lavender-light/50",
  border: "border-l-lavender",
  text: "text-foreground",
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DailyTimeline({ appointments, date, onComplete }: DailyTimelineProps) {
  const { services } = useServices();
  const durationMap = useMemo(
    () => Object.fromEntries(services.map((s) => [s.slug, s.duration])),
    [services]
  );
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const isToday = isSameDay(date, now);

  // Current time position
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = START_HOUR * 60;
  const currentOffset = ((currentMinutes - startMinutes) / 60) * HOUR_HEIGHT;
  const showCurrentLine = isToday && currentMinutes >= startMinutes && currentMinutes <= END_HOUR * 60;

  // Hours array
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="relative flex">
        {/* Hour labels */}
        <div className="flex-shrink-0 w-16 border-r border-gray-100">
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex items-start justify-end pr-3 text-xs text-gray-400 font-medium"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="-mt-2">
                {String(hour).padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        {/* Timeline area */}
        <div className="flex-1 relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {/* Hour grid lines */}
          {hours.map((hour, i) => (
            <div
              key={hour}
              className={`absolute left-0 right-0 border-t border-gray-100 ${i % 2 === 1 ? "bg-gray-50/30" : ""
                }`}
              style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            />
          ))}

          {/* Current time line */}
          {showCurrentLine && (
            <div
              className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
              style={{ top: currentOffset }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red -ml-1" />
              <div className="flex-1 h-0.5 bg-red" />
            </div>
          )}

          {/* Appointment blocks */}
          {appointments.map((apt) => {
            const aptDate = apt.date.toDate();
            const aptMinutes = aptDate.getHours() * 60 + aptDate.getMinutes();
            const duration = durationMap[apt.serviceSlug] ?? DEFAULT_DURATION;
            const colors = SERVICE_COLORS[apt.serviceSlug] ?? DEFAULT_COLORS;

            const top = ((aptMinutes - startMinutes) / 60) * HOUR_HEIGHT;
            const height = (duration / 60) * HOUR_HEIGHT;

            const isConfirmed = apt.status === "confirmed";

            return (
              <button
                key={apt.id}
                type="button"
                disabled={!isConfirmed || !onComplete}
                onClick={() => isConfirmed && onComplete?.(apt)}
                className={`absolute left-1 right-2 z-10 rounded-lg border-l-4 px-3 py-1.5 text-left transition-all ${colors.bg
                  } ${colors.border} ${isConfirmed && onComplete
                    ? "cursor-pointer hover:shadow-md hover:scale-[1.01]"
                    : "cursor-default opacity-75"
                  }`}
                style={{ top, height: Math.max(height, 32) }}
              >
                <p className={`text-[11px] font-bold ${colors.text} leading-tight`}>
                  {aptDate.toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" — "}
                  {apt.userName}
                </p>
                <p className="text-[10px] text-gray-500 leading-tight truncate">
                  {apt.serviceName}
                </p>
                {apt.status === "completed" && (
                  <span className="inline-block mt-0.5 text-[9px] font-semibold text-blue bg-blue/10 rounded-full px-1.5">
                    Completada
                  </span>
                )}
              </button>
            );
          })}

          {/* Empty state */}
          {appointments.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-gray-400">Sin citas para este día</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
