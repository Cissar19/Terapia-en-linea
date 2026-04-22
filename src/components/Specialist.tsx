"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface VideoItem {
  id: string;
  title: string;
  preview: string;
  video: string;
}

const videos: VideoItem[] = [
  { id: "1", title: "Cómo trabajamos en casa",      preview: "/videos/preview1.mp4", video: "/videos/video1.mp4" },
  { id: "2", title: "Sesión de alimentación",        preview: "/videos/preview2.mp4", video: "/videos/video2.mp4" },
  { id: "3", title: "Atención temprana en acción",   preview: "/videos/preview3.mp4", video: "/videos/video3.mp4" },
  { id: "4", title: "Tips para papás y mamás",       preview: "/videos/preview4.mp4", video: "/videos/video4.mp4" },
];

function VideoModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl w-full" style={{ maxWidth: 380, aspectRatio: "9/16", maxHeight: "90vh" }}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <video src={video.video} className="w-full h-full object-cover" controls autoPlay playsInline />
      </div>
    </div>
  );
}

export default function Specialist() {
  const [showCert, setShowCert] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (isPaused.current || !el) return;
      const cardWidth = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth + 12
        : 160;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3000);
    const pause = () => { isPaused.current = true; };
    const resume = () => { isPaused.current = false; };
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });
    return () => {
      clearInterval(interval);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, []);

  return (
    <section id="especialista" className="py-20 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            Míranos en acción —{" "}
            <br className="hidden md:block" />
            un espacio para crecer juntos
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            Así trabajamos con cada familia, sesión a sesión. Más que terapia.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-12">

          {/* Columna izquierda — carrusel de videos */}
          <div className="w-full lg:flex-1">
            {/* Grid 2×2 en desktop, scroll horizontal en mobile */}
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0"
            >
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="group flex-shrink-0 w-40 lg:w-auto snap-center relative rounded-2xl overflow-hidden focus:outline-none bg-foreground/5"
                  style={{ aspectRatio: "9/16" }}
                  aria-label={`Reproducir: ${video.title}`}
                >
                  <video
                    src={video.preview}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-semibold leading-tight text-left line-clamp-2">
                      {video.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Link TikTok */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Toca un video para reproducirlo</p>
              <a
                href="https://www.tiktok.com/@barb.alarconv"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z" />
                </svg>
                Ver más en TikTok
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCert(false)} />
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

      {/* Modal de video */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </section>
  );
}
