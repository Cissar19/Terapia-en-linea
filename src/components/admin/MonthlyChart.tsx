"use client";

import type { MonthlyData } from "@/lib/firebase/types";

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

interface MonthlyChartProps {
  data: MonthlyData[];
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => d.confirmed + d.cancelled + d.completed),
    1
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">Citas por mes</h3>
      <div className="flex items-end gap-3 h-48">
        {data.map((month) => {
          const total = month.confirmed + month.cancelled + month.completed;
          const height = (total / maxValue) * 100;
          const confirmedH = total > 0 ? (month.confirmed / total) * height : 0;
          const completedH = total > 0 ? (month.completed / total) * height : 0;
          const cancelledH = total > 0 ? (month.cancelled / total) * height : 0;

          return (
            <div key={`${month.year}-${month.month}`} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-foreground">{total}</span>
              <div className="w-full flex flex-col-reverse rounded-t-lg overflow-hidden" style={{ height: `${Math.max(height, 4)}%` }}>
                {confirmedH > 0 && (
                  <div
                    className="bg-blue"
                    style={{ height: `${(confirmedH / height) * 100}%` }}
                    title={`Confirmadas: ${month.confirmed}`}
                  />
                )}
                {completedH > 0 && (
                  <div
                    className="bg-green"
                    style={{ height: `${(completedH / height) * 100}%` }}
                    title={`Completadas: ${month.completed}`}
                  />
                )}
                {cancelledH > 0 && (
                  <div
                    className="bg-red/60"
                    style={{ height: `${(cancelledH / height) * 100}%` }}
                    title={`Canceladas: ${month.cancelled}`}
                  />
                )}
              </div>
              <span className="text-xs text-gray-500">
                {MONTH_NAMES[month.month - 1]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue" /> Confirmadas
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-green" /> Completadas
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-red/60" /> Canceladas
        </span>
      </div>
    </div>
  );
}
