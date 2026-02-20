"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AuthButtons from "@/components/auth/AuthButtons";
import UserMenu from "@/components/auth/UserMenu";

const links = [
  { label: "Servicios", href: "/#servicios" },
  { label: "Cómo Funciona", href: "/#como-funciona" },
  { label: "Privacidad", href: "/#privacidad" },
  { label: "Contacto", href: "/#contacto" },
];

const tickerText = "AGENDA TU HORA ONLINE  ·  PAGO SEGURO CON WEBPAY  ·  CONFIRMACIÓN INSTANTÁNEA  ·  PROFESIONALES CERTIFICADOS  ·  ";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Ticker bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-foreground text-white overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap py-2 text-xs font-medium tracking-widest">
          <span className="px-4">{tickerText.repeat(8)}</span>
          <span className="px-4">{tickerText.repeat(8)}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-[32px] left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Terapia en facil"
              width={163}
              height={56}
              className="h-12 w-auto object-contain"
              priority
            />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-foreground hover:text-blue font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth area (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? <UserMenu /> : <AuthButtons />}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setOpen(!open)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block text-foreground hover:text-blue font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}

            {user ? (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <UserMenu />
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block text-center text-sm font-medium text-foreground hover:text-blue py-2"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setOpen(false)}
                  className="block text-center rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white"
                >
                  Registrarme
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
