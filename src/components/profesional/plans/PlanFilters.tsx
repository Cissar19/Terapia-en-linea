"use client";

import type { PlanStatus } from "@/lib/firebase/types";

const STATUS_OPTIONS: { label: string; value: PlanStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Completados", value: "completed" },
  { label: "Archivados", value: "archived" },
];

interface PlanFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: PlanStatus | "all";
  onStatusChange: (v: PlanStatus | "all") => void;
}

export default function PlanFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: PlanFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre del paciente..."
          className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 bg-white"
        />
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
              statusFilter === opt.value
                ? "bg-white text-foreground shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
