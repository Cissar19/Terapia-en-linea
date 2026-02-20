"use client";

import { useEffect, useState } from "react";
import { getStats } from "@/lib/firebase/firestore";
import type { DashboardStats } from "@/lib/firebase/types";
import StatsCards from "@/components/admin/StatsCards";
import MonthlyChart from "@/components/admin/MonthlyChart";
import RecentAppointments from "@/components/admin/RecentAppointments";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general del sistema</p>
      </div>

      <StatsCards stats={stats} loading={loading} />

      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <MonthlyChart data={stats.monthlyData} />
          <RecentAppointments appointments={stats.recentAppointments} />
        </div>
      )}
    </div>
  );
}
