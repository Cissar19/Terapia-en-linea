"use client";

import UsersTable from "@/components/admin/UsersTable";

export default function UsuariosPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">Usuarios</h1>
        <p className="text-gray-500 mt-1">Gestión de usuarios y roles</p>
      </div>
      <UsersTable />
    </div>
  );
}
