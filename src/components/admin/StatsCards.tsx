"use client";

import type { DashboardStats } from "@/lib/firebase/types";

function formatCLP(amount: number): string {
  return "$" + amount.toLocaleString("es-CL");
}

const cardConfig = [
  {
    key: "totalUsers" as const,
    label: "Usuarios",
    bg: "bg-blue-light/40",
    text: "text-blue",
    format: (v: number) => String(v),
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "confirmedAppointments" as const,
    label: "Confirmadas",
    bg: "bg-green-light/40",
    text: "text-green",
    format: (v: number) => String(v),
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "cancelledAppointments" as const,
    label: "Canceladas",
    bg: "bg-red/10",
    text: "text-red",
    format: (v: number) => String(v),
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "completedAppointments" as const,
    label: "Completadas",
    bg: "bg-yellow-light/40",
    text: "text-orange",
    format: (v: number) => String(v),
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    key: "newPatientsThisMonth" as const,
    label: "Nuevos este mes",
    bg: "bg-lavender/60",
    text: "text-blue",
    format: (v: number) => String(v),
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    key: "revenueEstimate" as const,
    label: "Ingresos estimados",
    bg: "bg-green-light/40",
    text: "text-green",
    format: (v: number) => formatCLP(v),
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-10 w-10 bg-gray-100 rounded-xl mb-3" />
            <div className="h-8 w-16 bg-gray-100 rounded mb-1" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cardConfig.map((card) => (
        <div key={card.key} className="bg-white rounded-2xl p-6 shadow-sm">
          <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${card.bg} ${card.text} mb-3`}>
            {card.icon}
          </div>
          <p className="text-3xl font-black text-foreground">
            {card.format(stats?.[card.key] ?? 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
