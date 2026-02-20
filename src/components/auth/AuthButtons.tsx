"use client";

import Link from "next/link";

export default function AuthButtons() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm font-medium text-gray-600 hover:text-blue transition-colors"
      >
        Iniciar Sesión
      </Link>
      <Link
        href="/registro"
        className="rounded-full bg-blue px-5 py-2 text-sm font-semibold text-white hover:bg-blue-dark transition-colors shadow-lg shadow-blue/25"
      >
        Registrarme
      </Link>
    </div>
  );
}
