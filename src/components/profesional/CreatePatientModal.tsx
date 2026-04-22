"use client";

import { useState, useRef } from "react";
import { getAuth } from "firebase/auth";

interface CreatePatientModalProps {
  onClose: () => void;
  onCreated: (name: string) => void;
}

export default function CreatePatientModal({ onClose, onCreated }: CreatePatientModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [commune, setCommune] = useState("");
  const [diagnoses, setDiagnoses] = useState("");
  const [medications, setMedications] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdPassword, setCreatedPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setError("");
    setSubmitting(true);

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("No autenticado");

      const res = await fetch("/api/admin/create-patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          birthDate: birthDate || undefined,
          residenceCommune: commune.trim() || undefined,
          diagnoses: diagnoses.trim() || undefined,
          medications: medications.trim() || undefined,
          tempPassword: tempPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear el paciente");
        return;
      }

      setCreatedPassword(tempPassword.trim());
      setSuccess(
        tempPassword.trim()
          ? `Paciente creado con contraseña provisoria.`
          : `Paciente creado. Se envió un email a ${email.trim()} para que establezca su contraseña.`
      );
      window.dispatchEvent(new CustomEvent("patient-created"));
      onCreated(name.trim());
    } catch (err) {
      setError("Error inesperado. Intenta de nuevo.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 z-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/15 text-green">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <h2 className="text-lg font-black text-foreground">Nuevo Paciente</h2>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-green/10 border border-green/20 p-4 space-y-2">
                <p className="text-sm font-semibold text-green">Paciente creado</p>
                <p className="text-sm text-gray-600">{success}</p>
                {createdPassword && (
                  <div className="mt-3 rounded-xl bg-white border border-green/20 p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                      Contraseña provisoria
                    </p>
                    <p className="text-base font-mono font-bold text-foreground tracking-widest">
                      {createdPassword}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Comparte esta contraseña con el paciente. Puede cambiarla desde su perfil.
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green/90 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red/10 border border-red/15 p-3 text-sm text-red">
                  {error}
                </div>
              )}

              {/* Required */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Datos obligatorios</p>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ej: María González"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="paciente@email.com"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    El paciente recibirá un correo para crear su contraseña.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Optional */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Datos adicionales (opcionales)</p>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Comuna de residencia</label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="Ej: Providencia"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Diagnóstico(s)</label>
                  <textarea
                    value={diagnoses}
                    onChange={(e) => setDiagnoses(e.target.value)}
                    placeholder="Ej: TEA nivel 1, TDAH..."
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Medicamentos</label>
                  <textarea
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="Ej: Ritalín 10mg, Risperdal..."
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30 resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Temporary password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Contraseña provisoria
                  </label>
                  <span className="text-[10px] text-gray-400">opcional</span>
                </div>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  Si dejas esto vacío, el paciente recibirá un email para crear su propia contraseña.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !email.trim() || (tempPassword.length > 0 && tempPassword.length < 6)}
                  className="flex-1 rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Creando..." : "Crear Paciente"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
