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
  const [visible, setVisible] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [professional, setProfessional] = useState<UserProfile | null>(null);

  // Observar hero para mostrar la barra
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
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

  if (!visible) return null;

  return (
    <>
      {/* Desktop: barra sticky con widget completo */}
      <div className="hidden md:block fixed top-[104px] left-0 right-0 z-[55] bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm animate-slide-down">
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

      {/* Móvil: botón flotante full-width */}
      <button
        onClick={handleMobileClick}
        className="md:hidden fixed bottom-6 left-4 right-4 z-[55] flex items-center justify-center gap-2 rounded-full bg-foreground text-white shadow-2xl py-3.5 font-semibold text-base animate-slide-up"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Reserva tu hora
      </button>

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
