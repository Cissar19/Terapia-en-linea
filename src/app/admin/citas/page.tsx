"use client";

import AppointmentsTable from "@/components/admin/AppointmentsTable";

export default function CitasPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">Citas</h1>
        <p className="text-gray-500 mt-1">Gestión de citas y agendamientos</p>
      </div>
      <AppointmentsTable />
    </div>
  );
}
