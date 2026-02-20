"use client";

import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole } from "@/lib/firebase/firestore";
import type { UserProfile, UserRole } from "@/lib/firebase/types";
import { useAuth } from "@/contexts/AuthContext";

export default function UsersTable() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(uid: string, role: UserRole) {
    await updateUserRole(uid, role);
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role } : u))
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-gray-100 rounded mb-6" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 py-4 border-b border-gray-50">
            <div className="h-10 w-10 bg-gray-100 rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-40 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-56 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Usuario
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Correo
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Registro
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Rol
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender text-xs font-bold text-foreground">
                        {u.displayName?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                    <span className="text-sm font-medium text-foreground">{u.displayName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.createdAt?.toDate?.().toLocaleDateString("es-CL") ?? "—"}
                </td>
                <td className="px-6 py-4">
                  {u.uid === currentUser?.uid ? (
                    <span className="inline-flex items-center rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold text-blue">
                      {u.role}
                    </span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue/30"
                    >
                      <option value="paciente">paciente</option>
                      <option value="profesional">profesional</option>
                      <option value="admin">admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
