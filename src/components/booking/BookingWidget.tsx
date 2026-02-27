"use client";

import { useEffect, useMemo, useState } from "react";
import { toService, type Service } from "@/lib/services";
import { useServices } from "@/contexts/ServicesContext";
import type { UserProfile } from "@/lib/firebase/types";
import { getAllProfessionals } from "@/lib/firebase/firestore";
import BookingModal from "./BookingModal";

interface BookingWidgetProps {
  variant: "hero" | "compact";
}

const serviceColors: Record<string, { selected: string; ring: string }> = {
  "bg-green-light": { selected: "border-green bg-green-light", ring: "ring-green" },
  "bg-blue-light": { selected: "border-blue bg-blue-light", ring: "ring-blue" },
  "bg-yellow-light": { selected: "border-orange bg-yellow-light", ring: "ring-orange" },
};

function Initials({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const parts = name.trim().split(" ");
  const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  return (
    <span className={`font-bold text-white ${size === "sm" ? "text-xs" : "text-sm"}`}>
      {initials.toUpperCase()}
    </span>
  );
}

export default function BookingWidget({ variant }: BookingWidgetProps) {
  const { services: docs } = useServices();
  const services = useMemo(() => docs.map((d) => toService(d)), [docs]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPro, setSelectedPro] = useState<UserProfile | null>(null);
  const [professionals, setProfessionals] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getAllProfessionals()
      .then((pros) => {
        setProfessionals(pros);
        // Auto-select if only one professional
        if (pros.length === 1) {
          setSelectedPro(pros[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const canBook = selectedService && selectedPro;
  const proHasCalendar = !!selectedPro?.calUsername;

  const ctaText = !selectedService
    ? "Elige un servicio"
    : !selectedPro
      ? "Elige profesional"
      : `Agendar con ${selectedPro.displayName.split(" ")[0]}`;

  if (variant === "compact") {
    return (
      <>
        <div className="flex items-center gap-3 w-full">
          {/* Service pills */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {services.map((s) => {
              const isSelected = selectedService?.slug === s.slug;
              const colors = serviceColors[s.bg];
              return (
                <button
                  key={s.slug}
                  onClick={() => setSelectedService(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all whitespace-nowrap ${
                    isSelected
                      ? `${colors?.selected} border-current`
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {s.name.split(" ").slice(0, 2).join(" ")}
                </button>
              );
            })}
          </div>

          {/* Professional avatar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : professionals.length === 1 && selectedPro ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue flex items-center justify-center flex-shrink-0">
                  {selectedPro.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedPro.photoURL} alt={selectedPro.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <Initials name={selectedPro.displayName} size="sm" />
                  )}
                </div>
                <span className="text-xs font-medium text-foreground hidden lg:block">
                  {selectedPro.displayName.split(" ")[0]}
                </span>
              </div>
            ) : (
              professionals.map((pro) => (
                <button
                  key={pro.uid}
                  onClick={() => setSelectedPro(pro)}
                  className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedPro?.uid === pro.uid
                      ? "ring-2 ring-blue ring-offset-1 scale-110"
                      : "hover:scale-105"
                  }`}
                >
                  <div className="w-full h-full bg-blue flex items-center justify-center">
                    {pro.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pro.photoURL} alt={pro.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <Initials name={pro.displayName} size="sm" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowModal(true)}
            disabled={!canBook}
            className={`ml-auto px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              canBook
                ? "bg-foreground text-white hover:bg-foreground/90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {canBook ? ctaText : "Reservar"}
          </button>
        </div>

        {showModal && selectedService && selectedPro && (
          <BookingModal
            service={selectedService}
            onClose={() => setShowModal(false)}
            initialProfessional={selectedPro}
            initialStep={proHasCalendar ? "calendar" : "professional"}
          />
        )}
      </>
    );
  }

  // ── Variant: hero ──
  return (
    <>
      <div className="rounded-3xl bg-white/90 backdrop-blur-sm p-6 shadow-xl">
        {/* Title + promo badge */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">Reserva tu hora</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-bold text-green">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            1era sesión -20%
          </span>
        </div>

        {/* Service selector */}
        <div className="space-y-2 mb-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Servicio</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {services.map((s) => {
              const isSelected = selectedService?.slug === s.slug;
              const colors = serviceColors[s.bg];
              return (
                <button
                  key={s.slug}
                  onClick={() => setSelectedService(s)}
                  className={`text-left rounded-xl p-3 border-2 transition-all ${
                    isSelected
                      ? `${colors?.selected}`
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.price} · {s.duration}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Professional selector */}
        <div className="space-y-2 mb-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Profesional</p>

          {loading ? (
            <div className="flex gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="w-14 h-14 rounded-full bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : professionals.length === 0 ? (
            <p className="text-sm text-gray-500">Contáctanos para agendar</p>
          ) : professionals.length === 1 && selectedPro ? (
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue flex items-center justify-center flex-shrink-0">
                {selectedPro.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedPro.photoURL} alt={selectedPro.displayName} className="w-full h-full object-cover" />
                ) : (
                  <Initials name={selectedPro.displayName} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {selectedPro.displayName}
                </p>
                <p className="text-xs text-gray-400">Tu terapeuta</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              {professionals.map((pro) => {
                const isSelected = selectedPro?.uid === pro.uid;
                return (
                  <button
                    key={pro.uid}
                    onClick={() => setSelectedPro(pro)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                        isSelected
                          ? "ring-4 ring-blue scale-105"
                          : "group-hover:scale-105"
                      }`}
                    >
                      <div className="w-full h-full bg-blue flex items-center justify-center">
                        {pro.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pro.photoURL} alt={pro.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <Initials name={pro.displayName} />
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
                      {pro.displayName.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setShowModal(true)}
          disabled={!canBook}
          className={`w-full flex items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-base transition-all ${
            canBook
              ? "bg-foreground text-white hover:bg-foreground/90"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {ctaText}
          {canBook && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          )}
        </button>
      </div>

      {showModal && selectedService && selectedPro && (
        <BookingModal
          service={selectedService}
          onClose={() => setShowModal(false)}
          initialProfessional={selectedPro}
          initialStep={proHasCalendar ? "calendar" : "professional"}
        />
      )}
    </>
  );
}
