"use client";

import ServicesManager from "@/components/admin/ServicesManager";

export default function SesionesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">Sesiones</h1>
        <p className="text-gray-500 mt-1">Crea, edita y administra los servicios disponibles</p>
      </div>
      <ServicesManager />
    </div>
  );
}
