"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase/firestore";
import ProfileAvatar from "@/components/ProfileAvatar";
import PhotoCropModal from "@/components/PhotoCropModal";

export default function ProfesionalPerfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [croppedBase64, setCroppedBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleFileSelect(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 5 MB.");
      return;
    }
    setError("");
    setCropFile(file);
  }

  function handleCropConfirm(base64: string) {
    setCroppedBase64(base64);
    setCropFile(null);
  }

  function handleCropCancel() {
    setCropFile(null);
  }

  function cancelPreview() {
    setCroppedBase64(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !croppedBase64) return;
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile(user.uid, { photoURL: croppedBase64 });
      await refreshProfile();
      setCroppedBase64(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error guardando foto:", err);
      setError("Error al guardar la foto. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const phone = profile?.phone
    ? profile.phone.replace(/^\+56/, "+56 ")
    : null;

  return (
    <div>
      <h1 className="text-2xl font-black text-foreground mb-8">Mi Perfil</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-red/10 text-red text-sm p-4">
              {error}
            </div>
          )}

          {/* Profile photo section */}
          <div className="flex items-center gap-5">
            <ProfileAvatar
              photoURL={croppedBase64 || profile?.photoURL}
              displayName={profile?.displayName || ""}
              size="lg"
              editable
              onFileSelect={handleFileSelect}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Foto de perfil</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG o WebP · Máximo 5 MB</p>
              {croppedBase64 && (
                <button
                  type="button"
                  onClick={cancelPreview}
                  className="text-xs text-gray-400 hover:text-red transition-colors mt-1"
                >
                  Descartar cambio
                </button>
              )}
            </div>
          </div>

          {croppedBase64 && (
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Guardando..." : "Guardar Foto"}
              </button>
            </div>
          )}

          {saved && !croppedBase64 && (
            <span className="text-sm text-green font-medium">Guardado correctamente</span>
          )}

          <div className="border-t border-gray-100" />

          {/* Read-only fields */}
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
              Nombre
            </label>
            <input
              type="text"
              value={profile?.displayName || ""}
              disabled
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
            />
          </div>

          {phone && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Teléfono
              </label>
              <input
                type="text"
                value={phone}
                disabled
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
              />
            </div>
          )}

          <p className="text-xs text-gray-400">
            Para modificar tus datos personales, contacta al administrador.
          </p>
        </form>
      </div>

      {cropFile && (
        <PhotoCropModal
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          accent="green"
        />
      )}
    </div>
  );
}
