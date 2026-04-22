"use client";

import { useEffect, useMemo, useState } from "react";
import BookingWidget from "./BookingWidget";
import BookingModal from "./BookingModal";
import { toService, type Service } from "@/lib/services";
import { useServices } from "@/contexts/ServicesContext";
import { getAllProfessionals } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/firebase/types";

const serviceEmojis = ["💼", "👶", "🌟"];

export default function StickyBookingBar() {
  const { services: docs } = useServices();
  const services = useMemo(() => docs.map((d) => toService(d)), [docs]);
  const [desktopVisible, setDesktopVisible] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [professional, setProfessional] = useState<UserProfile | null>(null);

  // Desktop: aparece cuando el hero sale del viewport
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setDesktopVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Mobile: aparece a los 2 segundos sin necesidad de scroll
  useEffect(() => {
    const timer = setTimeout(() => setMobileVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Cargar profesional para saltar directo al calendario
  useEffect(() => {
    getAllProfessionals()
      .then((pros) => { if (pros.length >= 1) setProfessional(pros[0]); })
      .catch(console.error);
  }, []);

  function handleMobileClick() {
    const hero = document.getElementById("hero");
    if (hero) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > -500) {
        hero.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    setShowPicker(true);
  }

  function handleServicePick(service: Service) {
    setShowPicker(false);
    setActiveService(service);
  }

  if (!desktopVisible && !mobileVisible) return null;

  return (
    <>
      {/* Desktop: barra sticky con widget completo */}
      <div className={`hidden md:block fixed top-[104px] left-0 right-0 z-[55] bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-500 ${desktopVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="mx-auto max-w-7xl px-6 py-2.5 flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-green font-semibold flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
            </span>
            Citas disponibles esta semana
          </div>
          <div className="flex-1">
            <BookingWidget variant="compact" />
          </div>
        </div>
      </div>

      {/* Móvil: barra dual llamativa */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[55] shadow-[0_-6px_32px_rgba(0,0,0,0.25)] transition-all duration-500 ${mobileVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"}`}>
        {/* Franja superior de atención */}
        <div className="flex items-center justify-center gap-2 bg-yellow py-2 text-foreground border-t-2 border-foreground">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
          </span>
          <span className="text-[11px] font-extrabold tracking-widest uppercase">Agenda abierta · Sin lista de espera</span>
        </div>
        {/* Botones */}
        <div className="flex">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "56912345678"}?text=${encodeURIComponent("Hola Bárbara, tengo una consulta sobre terapia ocupacional.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-[#25D366] text-white py-4 active:brightness-90"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-[13px] font-bold">WhatsApp</span>
            <span className="text-[10px] opacity-80">Consultar gratis</span>
          </a>
          <div className="w-px bg-white/20" />
          <button
            onClick={handleMobileClick}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-foreground text-white py-4 active:brightness-90"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[13px] font-bold">Reservar hora</span>
            <span className="text-[10px] opacity-70">20% off 1ª sesión</span>
          </button>
        </div>
      </div>

      {/* Móvil: selector de servicio (bottom sheet) */}
      {showPicker && (
        <div className="md:hidden fixed inset-0 z-[70] flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPicker(false)}
          />
          {/* Sheet */}
          <div className="relative w-full bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl">
            {/* Handle */}
            <div className="mx-auto w-10 h-1 rounded-full bg-gray-200 mb-5" />

            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-2xl text-foreground">¿Qué necesitas?</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {services.map((service, i) => (
                <button
                  key={service.slug}
                  onClick={() => handleServicePick(service)}
                  className="w-full flex items-center gap-4 rounded-2xl bg-gray-50 hover:bg-lavender transition-colors p-4 text-left"
                >
                  <span className="text-2xl flex-shrink-0">{serviceEmojis[i] ?? "📅"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{service.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{service.price} · {service.duration}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            <p className="mt-5 text-center text-xs text-gray-400">
              Cancela hasta 24h antes · Sin contratos
            </p>
          </div>
        </div>
      )}

      {/* Modal de booking — salta directo al calendario */}
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
