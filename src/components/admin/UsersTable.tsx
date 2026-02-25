"use client";

import { useEffect, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { getAllUsers, updateUserRole } from "@/lib/firebase/firestore";
import type { UserProfile, UserRole } from "@/lib/firebase/types";
import { useAuth } from "@/contexts/AuthContext";

export default function UsersTable() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleRoleChange(uid: string, role: UserRole) {
    await updateUserRole(uid, role);
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role } : u))
    );
  }

  async function handleResetPassword(email: string) {
    setActionLoading(email);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      showToast(`Email de recuperación enviado a ${email}`);
    } catch (err) {
      console.error("Error sending password reset:", err);
      showToast("Error al enviar email de recuperación", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteUser(uid: string) {
    setActionLoading(uid);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch(`/api/admin/users?uid=${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      setConfirmDelete(null);
      showToast("Usuario eliminado correctamente");
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast(err instanceof Error ? err.message : "Error al eliminar usuario", "error");
    } finally {
      setActionLoading(null);
    }
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
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[300] max-w-sm rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-slide-down ${
            toast.type === "success"
              ? "bg-green text-white"
              : "bg-red text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

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
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.uid === currentUser?.uid;
                return (
                  <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
                      {isSelf ? (
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
                    <td className="px-6 py-4">
                      {isSelf ? (
                        <span className="text-xs text-gray-300">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* Reset password */}
                          <button
                            onClick={() => handleResetPassword(u.email)}
                            disabled={actionLoading === u.email}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue hover:bg-blue/10 transition-colors disabled:opacity-50"
                            title="Enviar email de recuperación de contraseña"
                          >
                            {actionLoading === u.email ? (
                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                            Resetear clave
                          </button>

                          {/* Delete user */}
                          {confirmDelete === u.uid ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteUser(u.uid)}
                                disabled={actionLoading === u.uid}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white bg-red hover:bg-red/90 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === u.uid ? (
                                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : "Confirmar"}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(u.uid)}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red hover:bg-red/10 transition-colors"
                              title="Eliminar usuario"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
