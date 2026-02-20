"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase/firestore";

export default function PerfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    await updateUserProfile(user.uid, {
      displayName: displayName.trim(),
      phone: phone.trim() || null,
    });
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-foreground mb-8">Mi Perfil</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre completo
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+56 9 1234 5678"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-white hover:bg-pink/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
            {saved && (
              <span className="text-sm text-green font-medium">Guardado correctamente</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
