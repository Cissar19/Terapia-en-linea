"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase/firestore";
import ProfileAvatar from "@/components/ProfileAvatar";
import PhotoCropModal from "@/components/PhotoCropModal";
import { COMUNAS_CHILE } from "@/data/comunas-chile";

/** Strip non-digits, format Chilean mobile as "9 1234 5678" */
function formatChileanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits[0]} ${digits.slice(1)}`;
  return `${digits[0]} ${digits.slice(1, 5)} ${digits.slice(5)}`;
}

function phoneDigits(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

/** Calculate age from birth date string */
function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Autocomplete for Chilean communes */
function ComunaAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filtered = value.trim()
    ? COMUNAS_CHILE.filter((c) => normalize(c).includes(normalize(value)))
    : COMUNAS_CHILE;

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-foreground mb-1.5">
        Comuna de residencia
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Escribe tu comuna..."
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {filtered.slice(0, 80).map((comuna) => (
            <li
              key={comuna}
              onClick={() => {
                onChange(comuna);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-pink/10 hover:text-pink ${comuna === value ? "bg-pink/5 text-pink font-medium" : "text-foreground"
                }`}
            >
              {comuna}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PerfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [phone, setPhone] = useState(() => {
    const saved = profile?.phone || "";
    // Strip +56 prefix if stored in E.164
    const digits = saved.replace(/\D/g, "");
    const local = digits.startsWith("56") ? digits.slice(2) : digits;
    return formatChileanPhone(local);
  });
  const [birthDate, setBirthDate] = useState(profile?.birthDate || "");
  const [residenceCommune, setResidenceCommune] = useState(profile?.residenceCommune || "");
  const [education, setEducation] = useState(profile?.education || "");
  const [diagnoses, setDiagnoses] = useState(profile?.diagnoses || "");
  const [medications, setMedications] = useState(profile?.medications || "");
  const [hasMedications, setHasMedications] = useState(!!profile?.medications);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Photo upload state
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [croppedBase64, setCroppedBase64] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");

    // Validate Chilean phone (9 digits)
    const digits = phoneDigits(phone);
    if (digits && digits.length !== 9) {
      setError("El teléfono debe tener 9 dígitos (ej: 9 1234 5678).");
      return;
    }

    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        phone: digits ? `+56${digits}` : null,
        birthDate: birthDate || null,
        residenceCommune: residenceCommune.trim(),
        education: education.trim(),
        diagnoses: diagnoses.trim(),
        medications: medications.trim(),
        ...(croppedBase64 ? { photoURL: croppedBase64 } : {}),
      });
      await refreshProfile();
      setCroppedBase64(null);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      setError("Error al guardar los cambios. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

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
              displayName={displayName || profile?.displayName || ""}
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
                  onClick={() => setCroppedBase64(null)}
                  className="text-xs text-gray-400 hover:text-red transition-colors mt-1"
                >
                  Descartar cambio
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100" />

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
            <div className="flex items-center w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus-within:ring-2 focus-within:ring-pink/30 focus-within:border-pink">
              <span className="flex items-center gap-1.5 text-gray-500 select-none mr-2 shrink-0">
                <span className="text-base leading-none">🇨🇱</span>
                <span>+56</span>
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatChileanPhone(e.target.value))}
                placeholder="9 1234 5678"
                className="flex-1 min-w-0 border-none outline-none bg-transparent text-sm"
              />
            </div>
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
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink"
                  />
                  {birthDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Edad: <span className="font-medium text-foreground">{calculateAge(birthDate)} años</span>
                    </p>
                  )}
                </div>
                <ComunaAutocomplete
                  value={residenceCommune}
                  onChange={setResidenceCommune}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Escolaridad
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink bg-white appearance-none cursor-pointer"
                >
                  <option value="">Selecciona tu escolaridad</option>
                  <option value="Enseñanza básica">Enseñanza básica</option>
                  <option value="Enseñanza media">Enseñanza media</option>
                  <option value="Universitaria">Universitaria</option>
                </select>
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
                  ¿Toma medicamentos?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setHasMedications(true); }}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${hasMedications
                      ? "border-pink bg-pink/10 text-pink"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHasMedications(false); setMedications(""); }}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${!hasMedications
                      ? "border-pink bg-pink/10 text-pink"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {hasMedications && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    ¿Cuáles?
                  </label>
                  <textarea
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    rows={2}
                    placeholder="Ej: Risperidona 0.5mg, Melatonina..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink resize-none"
                  />
                </div>
              )}
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

      {cropFile && (
        <PhotoCropModal
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          accent="pink"
        />
      )}
    </div>
  );
}
