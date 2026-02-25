"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signInWithGoogle, sendPasswordReset } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

const firebaseErrors: Record<string, string> = {
  "auth/user-not-found": "No existe una cuenta con este correo.",
  "auth/wrong-password": "Contrasena incorrecta.",
  "auth/invalid-email": "Correo electronico no valido.",
  "auth/too-many-requests": "Demasiados intentos. Intenta mas tarde.",
  "auth/invalid-credential": "Credenciales invalidas. Verifica tu correo y contrasena.",
};

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Password recovery state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "";
      setError(firebaseErrors[code] || "Error al iniciar sesion. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setSubmitting(true);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "";
      if (code !== "auth/popup-closed-by-user") {
        setError(firebaseErrors[code] || "Error con Google. Intenta de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryError("");
    setRecoverySubmitting(true);
    try {
      await sendPasswordReset(recoveryEmail);
      setRecoverySent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "";
      if (code === "auth/user-not-found") {
        setRecoveryError("No existe una cuenta con este correo.");
      } else if (code === "auth/invalid-email") {
        setRecoveryError("Correo electronico no valido.");
      } else if (code === "auth/too-many-requests") {
        setRecoveryError("Demasiados intentos. Intenta mas tarde.");
      } else {
        setRecoveryError("Error al enviar el correo. Intenta de nuevo.");
      }
    } finally {
      setRecoverySubmitting(false);
    }
  }

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lavender-light">
        <div className="h-8 w-8 rounded-full border-4 border-blue border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-lavender-light px-4 py-16 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-pink-light rounded-full animate-float opacity-60" />
      <div className="absolute bottom-32 right-16 w-20 h-20 bg-yellow-light rounded-2xl rotate-12 animate-float-delayed opacity-60" />
      <div className="absolute top-1/3 right-10 w-12 h-12 bg-green-light rounded-full animate-float-slow opacity-60" />

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Recovery modal */}
          {showRecovery ? (
            <div>
              <button
                onClick={() => {
                  setShowRecovery(false);
                  setRecoverySent(false);
                  setRecoveryError("");
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground mb-6 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Volver al login
              </button>

              <div className="text-center mb-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue/10">
                  <svg className="h-7 w-7 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-foreground">Recuperar Contrasena</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu contrasena.
                </p>
              </div>

              {recoverySent ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green/10">
                    <svg className="h-7 w-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Correo enviado</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Revisa tu bandeja de entrada en <span className="font-semibold">{recoveryEmail}</span> y sigue las instrucciones para restablecer tu contrasena.
                  </p>
                  <p className="text-xs text-gray-400">
                    ¿No lo ves? Revisa tu carpeta de spam.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRecovery} className="space-y-4">
                  {recoveryError && (
                    <div className="rounded-xl bg-red/10 text-red text-sm p-4">
                      {recoveryError}
                    </div>
                  )}
                  <div>
                    <label htmlFor="recovery-email" className="block text-sm font-medium text-foreground mb-1">
                      Correo electronico
                    </label>
                    <input
                      id="recovery-email"
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors"
                      placeholder="tu@correo.com"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={recoverySubmitting || !recoveryEmail.trim()}
                    className="w-full rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white hover:bg-blue-dark transition-colors shadow-lg shadow-blue/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {recoverySubmitting ? "Enviando..." : "Enviar enlace de recuperacion"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Login form */
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-foreground">Iniciar Sesion</h1>
                <p className="text-gray-500 mt-2">Bienvenido/a de vuelta</p>
              </div>

              {error && (
                <div className="rounded-xl bg-red/10 text-red text-sm p-4 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Correo electronico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors"
                    placeholder="tu@correo.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                      Contrasena
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecovery(true);
                        setRecoveryEmail(email);
                      }}
                      className="text-xs font-medium text-blue hover:underline"
                    >
                      ¿Olvidaste tu contrasena?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white hover:bg-blue-dark transition-colors shadow-lg shadow-blue/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Ingresando..." : "Iniciar Sesion"}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-gray-400">o continuar con</span>
                </div>
              </div>

              <button
                onClick={handleGoogle}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>

              <p className="text-center text-sm text-gray-500 mt-6">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="text-blue font-semibold hover:underline">
                  Registrate aqui
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
