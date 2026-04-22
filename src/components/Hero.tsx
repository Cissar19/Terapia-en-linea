"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useServices } from "@/contexts/ServicesContext";
import { toService, type Service } from "@/lib/services";
import { getAllProfessionals } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/firebase/types";
import BookingModal from "@/components/booking/BookingModal";

const serviceConfig: Record<string, { emoji: string; accent: string }> = {
  "atencion-temprana":       { emoji: "🧒", accent: "bg-blue"   },
  "babysitting-terapeutico": { emoji: "⭐", accent: "bg-yellow" },
  "adaptacion-puesto":       { emoji: "💼", accent: "bg-green"  },
};

export default function Hero() {
  const { services: docs } = useServices();
  const services = useMemo(() => docs.map((d) => toService(d)), [docs]);
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [professional, setProfessional] = useState<UserProfile | null>(null);

  useEffect(() => {
    getAllProfessionals()
      .then((pros) => { if (pros.length >= 1) setProfessional(pros[0]); })
      .catch(console.error);
  }, []);

  return (
    <>
      <section id="hero" className="relative flex items-center bg-lavender overflow-hidden pt-24 pb-14">

        {/* Decorative shapes */}
        <div className="hidden sm:block absolute top-[10%] left-[3%] animate-float opacity-70"
          style={{ width: 38, height: 38, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", background: "#2DC653", animationDuration: "7s" }} />
        <div className="hidden sm:block absolute top-[20%] left-[48%] animate-float-delayed opacity-80 rounded-full"
          style={{ width: 22, height: 22, background: "#f87171", animationDuration: "5.5s" }} />
        <div className="hidden sm:block absolute bottom-[25%] right-[52%] animate-float-slow opacity-65"
          style={{ width: 28, height: 28, clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)", background: "#818cf8", animationDuration: "8s", animationDelay: "2s" }} />
        <div className="hidden sm:block absolute bottom-[15%] left-[6%] animate-float rounded-full opacity-60 bg-yellow"
          style={{ width: 42, height: 42, animationDuration: "6.5s", animationDelay: "0.7s" }} />

        <div className="relative z-10 w-full px-5 sm:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">

            {/* Left — texto + cards de servicio */}
            <div className="text-center lg:text-left">

              {/* Eyebrow */}
              <div className="mb-5 inline-flex items-center gap-2 bg-yellow px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-foreground">
                <span className="w-[7px] h-[7px] rounded-full bg-foreground flex-shrink-0 animate-pulse" />
                Santiago · A domicilio · Sin lista de espera
              </div>

              <h1 className="font-display text-[42px] sm:text-[54px] md:text-[62px] lg:text-[clamp(38px,4.5vw,68px)] text-foreground leading-[1.08] tracking-tight mb-5">
                Tu hijo merece<br />
                avanzar <span style={{ color: "#4f46e5" }}>ahora.</span>
              </h1>

              {/* Foto — solo mobile */}
              <div className="lg:hidden mb-6 mx-auto relative w-full max-w-[280px]">
                <div className="rounded-[22px] overflow-hidden shadow-lg relative bg-lavender-light" style={{ aspectRatio: "3/4" }}>
                  <Image src="/barbara-2.jpg" alt="Bárbara Alarcón Villafaña" fill className="object-cover object-top" priority />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md text-center">
                    <div className="text-[9px] text-gray-400">Satisfacción</div>
                    <div className="text-[11px] text-amber-400">★★★★★</div>
                    <div className="text-[10px] font-bold" style={{ color: "#4f46e5" }}>100+ familias</div>
                  </div>
                  <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md text-center">
                    <div className="text-[9px] text-gray-400">1ª sesión</div>
                    <div className="font-display text-base" style={{ color: "#e6b52e" }}>–20%</div>
                    <div className="text-[10px] font-bold" style={{ color: "#4f46e5" }}>+ garantía</div>
                  </div>
                </div>
              </div>

              <p className="text-base sm:text-[17px] text-gray-500 max-w-[500px] leading-[1.75] mb-6 mx-auto lg:mx-0">
                ¿Dificultades en alimentación, movimiento o adaptación escolar?
                Terapia ocupacional a domicilio, cálida y basada en evidencia.
              </p>

              {/* Service cards — click directo al calendario */}
              <div className="mb-6">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center lg:text-left">
                  Elige y reserva directamente
                </p>

                <div className="space-y-2 max-w-[480px] mx-auto lg:mx-0">
                  {services.length === 0 ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="h-[60px] rounded-2xl bg-white/60 animate-pulse" />
                    ))
                  ) : (
                    services.map((service) => {
                      const cfg = serviceConfig[service.slug] ?? { emoji: "📅", accent: "bg-lavender" };
                      return (
                        <button
                          key={service.slug}
                          onClick={() => setActiveService(service)}
                          className="group w-full flex items-center gap-4 rounded-2xl bg-white/80 hover:bg-white border-2 border-transparent hover:border-foreground/10 hover:shadow-md px-4 py-3 text-left transition-all duration-200"
                        >
                          <div className={`w-10 h-10 rounded-xl ${cfg.accent} flex items-center justify-center flex-shrink-0 text-xl`}>
                            {cfg.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground leading-tight">{service.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{service.price} · {service.duration}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[11px] font-semibold text-green bg-green/10 px-2 py-0.5 rounded-full hidden sm:block">
                              –20% hoy
                            </span>
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-400 text-center lg:text-left">
                  Confirmación instantánea · Cancela hasta 24h antes ·{" "}
                  <button
                    onClick={() => document.getElementById("alertas")?.scrollIntoView({ behavior: "smooth" })}
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    ¿No sabes cuál elegir?
                  </button>
                </p>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {[
                  { icon: "🛡️", text: "Garantía 1ª sesión" },
                  { icon: "💳", text: "Pago seguro WebPay" },
                  { icon: "✅", text: "Sin derivación médica" },
                ].map(({ icon, text }) => (
                  <span key={text} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-sm">
                    {icon} {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — foto + tarjetas flotantes (desktop) */}
            <div className="relative hidden lg:block">
              <div className="rounded-[28px] overflow-hidden shadow-xl relative bg-lavender-light" style={{ aspectRatio: "3/4", maxHeight: 540 }}>
                <Image src="/barbara-2.jpg" alt="Bárbara Alarcón Villafaña — Terapeuta Ocupacional" fill className="object-cover object-top" priority />
              </div>

              {/* Tarjeta flotante — disponibilidad */}
              <div className="absolute top-[8%] -right-[8%] bg-white rounded-[18px] px-4 py-3 shadow-xl animate-float">
                <div className="text-[10px] text-gray-400 mb-0.5">Disponibilidad</div>
                <div className="font-display text-lg text-foreground">Esta semana</div>
                <div className="text-[11px] font-bold" style={{ color: "#4f46e5" }}>✦ Sin lista de espera</div>
              </div>

              {/* Tarjeta flotante — satisfacción */}
              <div className="absolute bottom-[20%] -left-[10%] bg-white rounded-[18px] px-4 py-3 shadow-xl animate-float-delayed" style={{ animationDelay: "1.8s" }}>
                <div className="text-[10px] text-gray-400 mb-0.5">Satisfacción</div>
                <div className="text-[13px] text-amber-400 tracking-wide">★★★★★</div>
                <div className="text-[11px] font-bold" style={{ color: "#4f46e5" }}>100+ familias</div>
              </div>

              {/* Tarjeta flotante — descuento */}
              <div className="absolute top-[50%] -right-[8%] bg-white rounded-[18px] px-4 py-3 shadow-xl animate-float-slow" style={{ animationDelay: "0.9s" }}>
                <div className="text-[10px] text-gray-400 mb-0.5">Primera sesión</div>
                <div className="font-display text-lg" style={{ color: "#e6b52e" }}>–20%</div>
                <div className="text-[11px] font-bold" style={{ color: "#4f46e5" }}>+ garantía total</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {activeService && (
        <BookingModal
          service={activeService}
          onClose={() => setActiveService(null)}
          initialProfessional={professional}
          initialStep={professional?.calUsername ? "calendar" : "professional"}
        />
      )}
    </>
  );
}
