"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase/firestore";

export default function PerfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [age, setAge] = useState(profile?.age || "");
  const [residenceCommune, setResidenceCommune] = useState(profile?.residenceCommune || "");
  const [education, setEducation] = useState(profile?.education || "");
  const [diagnoses, setDiagnoses] = useState(profile?.diagnoses || "");
  const [medications, setMedications] = useState(profile?.medications || "");
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
      age: age.trim(),
      residenceCommune: residenceCommune.trim(),
      education: education.trim(),
      diagnoses: diagnoses.trim(),
      medications: medications.trim(),
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

          {/* Clinical data section */}
          <div className="pt-4 border-t border-gray-100">
            <h2 className="text-sm font-bold text-foreground mb-1">Información Clínica</h2>
            <p className="text-xs text-gray-400 mb-4">
              Estos datos ayudan a tu terapeuta a preparar tu plan de intervención.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Edad
                  </label>
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ej: 5 años"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Comuna de residencia
                  </label>
                  <input
                    type="text"
                    value={residenceCommune}
                    onChange={(e) => setResidenceCommune(e.target.value)}
                    placeholder="Ej: Providencia"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Escolaridad
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="Ej: Pre-kínder, Colegio XYZ"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Diagnósticos
                </label>
                <textarea
                  value={diagnoses}
                  onChange={(e) => setDiagnoses(e.target.value)}
                  rows={2}
                  placeholder="Ej: TEA, TDAH, retraso del desarrollo..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Medicamentos
                </label>
                <textarea
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  rows={2}
                  placeholder="Ej: Risperidona 0.5mg, Melatonina..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink resize-none"
                />
              </div>
            </div>
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
