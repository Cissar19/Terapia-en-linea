"use client";

import { useState } from "react";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// EDITAR AQUÍ — Agrega o quita fotos y videos.
// El primer item es siempre el principal (el más grande).
//
// Con 1 item  → portrait centrado con badges flotantes.
// Con 2 items → portrait grande izquierda + cuadrado derecha.
// Con 3 items → portrait grande izquierda + 2 cuadrados apilados derecha (bento).
//
// Tipos disponibles:
//   { type: "image", src: "/ruta.jpg", alt: "descripción" }
//   { type: "video", src: "/videos/clip.mp4", label: "Texto overlay", href: "https://..." }
// ─────────────────────────────────────────────────────────────────────────────

type ImageItem = { type: "image"; src: string; alt: string };
type VideoItem = { type: "video"; src: string; label: string; href: string };
type MediaItem = ImageItem | VideoItem;

const mediaItems: MediaItem[] = [
  {
    type: "image",
    src: "/barbara.jpg",
    alt: "Bárbara Alarcón Villafaña — Terapeuta Ocupacional",
  },
  // ── Descomenta para agregar una segunda foto: ──────────────────────────────
  { type: "image", src: "/barbara-2.jpg", alt: "Bárbara trabajando con un niño" },
  //
  // ── Descomenta para agregar un video (muestra preview en loop): ───────────
  // { type: "video", src: "/videos/preview1.mp4", label: "Así trabajo", href: "https://www.instagram.com/to.barbaraalarconv/" },
];

// ─────────────────────────────────────────────────────────────────────────────

const badges = [
  { label: "U. Mayor",        bg: "bg-green", pos: "absolute -top-3 -right-4 animate-float"         },
  { label: "Neurodesarrollo", bg: "bg-pink",  pos: "absolute -bottom-3 -left-4 animate-float-delayed" },
  { label: "Infanto-juvenil", bg: "bg-blue",  pos: "absolute top-1/2 -right-6 animate-float-slow"   },
];

function Slot({ item }: { item: MediaItem }) {
  if (item.type === "image") {
    return (
      <Image
        src={item.src}
        alt={item.alt}
        fill
        className="object-cover object-top"
        sizes="(max-width: 768px) 100vw, 320px"
      />
    );
  }
  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className="relative block w-full h-full">
      <video src={item.src} className="w-full h-full object-cover" autoPlay muted loop playsInline />
      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span className="text-white text-xs font-semibold px-3 py-1 rounded-full bg-black/30">
          {item.label}
        </span>
      </div>
    </a>
  );
}

function MediaGrid({ items }: { items: MediaItem[] }) {
  if (items.length === 0) return null;

  // ── 1 item: portrait centrado ──────────────────────────────────────────────
  if (items.length === 1) {
    return (
      <div className="relative w-72 md:w-80 mx-auto lg:mx-0">
        {/* Shapes decorativas */}
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow rounded-lg rotate-12 z-10 pointer-events-none" />
        <div className="absolute -bottom-5 -right-5 z-10 pointer-events-none">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 25,15 39,15 28,24 32,37 20,29 8,37 12,24 1,15 15,15" fill="#FF6B9D" />
          </svg>
        </div>
        {/* Foto */}
        <div className="relative rounded-3xl overflow-hidden aspect-[3/4]">
          <Slot item={items[0]} />
        </div>
        {/* Badges */}
        {badges.map((b) => (
          <div key={b.label} className={`${b.pos} ${b.bg} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20`}>
            {b.label}
          </div>
        ))}
      </div>
    );
  }

  // ── 2 items: portrait grande + cuadrado derecha ────────────────────────────
  if (items.length === 2) {
    return (
      <div className="flex gap-3 w-full max-w-sm mx-auto lg:mx-0">
        <div className="relative flex-[3] rounded-3xl overflow-hidden aspect-[3/4]">
          <Slot item={items[0]} />
          {badges.map((b) => (
            <div key={b.label} className={`${b.pos} ${b.bg} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20`}>
              {b.label}
            </div>
          ))}
        </div>
        <div className="relative flex-[2] rounded-2xl overflow-hidden aspect-square self-start mt-8">
          <Slot item={items[1]} />
        </div>
      </div>
    );
  }

  // ── 3 items: bento (portrait izquierda, 2 cuadrados derecha) ──────────────
  return (
    <div className="grid grid-cols-[3fr_2fr] grid-rows-2 gap-3 h-[420px] w-full max-w-sm mx-auto lg:mx-0">
      {/* Item principal — ocupa toda la altura izquierda */}
      <div className="relative row-span-2 rounded-3xl overflow-hidden">
        <Slot item={items[0]} />
        {badges.map((b) => (
          <div key={b.label} className={`${b.pos} ${b.bg} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20`}>
            {b.label}
          </div>
        ))}
      </div>
      {/* Items 2 y 3 — apilados en columna derecha */}
      {items.slice(1, 3).map((item, i) => (
        <div key={i} className="relative rounded-2xl overflow-hidden">
          <Slot item={item} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Specialist() {
  const [showCert, setShowCert] = useState(false);

  return (
    <section id="especialista" className="py-20 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            Un espacio seguro para{" "}
            <br className="hidden md:block" />
            crecer juntos
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            Más que terapia
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Columna izquierda — medios */}
          <div className="w-full lg:flex-1 flex flex-col items-center lg:items-start gap-6">
            <MediaGrid items={mediaItems} />

            {/* Link Instagram — solo si no hay video en el grid */}
            {!mediaItems.some((m) => m.type === "video") && (
              <div className="w-72 md:w-80 mx-auto lg:mx-0">
                <a
                  href="https://www.instagram.com/to.barbaraalarconv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl bg-foreground/5 border-2 border-dashed border-gray-200 p-5 text-center hover:border-blue hover:bg-blue/5 transition-all"
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue/10 flex items-center justify-center mb-3 group-hover:bg-blue/20 transition-colors">
                    <svg className="w-5 h-5 text-blue ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Conóceme en Instagram</p>
                  <p className="text-xs text-gray-500 mt-1">Mira cómo trabajo con las familias</p>
                </a>
              </div>
            )}
          </div>

          {/* Columna derecha — contenido */}
          <div className="flex-1 max-w-xl">
            <p className="text-gray-700 leading-relaxed text-lg">
              ¡Hola! Soy <strong>Bárbara Alarcón Villafaña</strong>, Terapeuta Ocupacional (U. Mayor).
              Mi pasión es el mundo infanto-juvenil y el neurodesarrollo. Entiendo que cada niño es
              un universo único, por eso mi enfoque no se trata solo de &quot;ejercicios&quot;, sino de
              <strong> crear un vínculo real</strong>.
            </p>

            <p className="mt-4 text-gray-600 leading-relaxed">
              Cuento con una sólida base clínica gracias a mi experiencia en el <strong>Hospital del Salvador</strong> y
              <strong> Hospital Clínico Mutual de Seguridad</strong>. Además, he trabajado en colegios (Programa Habilidades para la Vida),
              lo que me permite entender los desafíos tanto en casa como en la sala de clases.
            </p>

            {/* Registro profesional verificado */}
            <div className="mt-6 flex items-center gap-4 rounded-2xl bg-green-light border border-green/20 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-green flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Registro profesional verificado</p>
                <p className="text-sm font-bold text-foreground">Superintendencia de Salud · Reg. 879303</p>
              </div>
              <button
                onClick={() => setShowCert(true)}
                className="flex-shrink-0 text-xs text-green font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Verificar
              </button>
            </div>

            {/* Especialidades */}
            <div className="mt-8">
              <h3 className="font-display text-2xl text-foreground mb-6">
                ¿En qué puedo ayudarte?
              </h3>

              <div className="space-y-4">
                <div className="flex gap-4 rounded-2xl bg-yellow-light p-5 hover:scale-[1.01] transition-transform">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-orange flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Alimentación sin batallas</h4>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      <strong>Certificación Japieaters.</strong> Si la hora de comer es estrés, puedo ayudarte. Abordamos selectividad y rechazo alimentario transformando la alimentación en una experiencia positiva.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl bg-blue-light p-5 hover:scale-[1.01] transition-transform">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-blue flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Atención Temprana y Neurodesarrollo</h4>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      <strong>Certificación OTEC Movilízate.</strong> Intervención especializada para potenciar el desarrollo desde las primeras etapas (TEA, síndromes genéticos, retraso psicomotor).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl bg-green-light p-5 hover:scale-[1.01] transition-transform">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-green flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Apoyo Bilingüe y Actualizado</h4>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      Gracias a mi manejo avanzado del inglés (Dallas Baptist University), accedo a la última literatura científica y puedo orientar a familias bilingües.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Garantía */}
            <div className="mt-8 rounded-2xl bg-yellow-light border border-yellow/40 px-5 py-4 flex gap-4 items-start">
              <div className="w-9 h-9 rounded-xl bg-yellow flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Garantía de primera sesión</p>
                <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">
                  Si la primera sesión no es lo que esperabas, te devolvemos el dinero completo — sin preguntas ni trámites.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a
                href="#servicios"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-white font-semibold hover:bg-foreground/90 transition-all"
              >
                <span>Agenda tu hora y conversemos</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <p className="mt-3 text-sm text-gray-500">
                Sin burocracia. Citas disponibles esta semana.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal certificado */}
      {showCert && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCert(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-bold text-foreground text-sm">Registro Profesional</p>
                <p className="text-xs text-gray-500">Superintendencia de Salud · Reg. 879303</p>
              </div>
              <button
                onClick={() => setShowCert(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                <Image
                  src="/Certificado-Barbara.pdf.png"
                  alt="Certificado de registro profesional Bárbara Alarcón — Superintendencia de Salud"
                  width={800}
                  height={1100}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
