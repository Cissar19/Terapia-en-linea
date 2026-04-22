"use client";

import { useEffect, useMemo, useState } from "react";
import { useServices } from "@/contexts/ServicesContext";
import { toService, type Service } from "@/lib/services";
import { getAllProfessionals } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/firebase/types";
import BookingModal from "@/components/booking/BookingModal";

const scenarios = [
  {
    slugHint: "atencion-temprana",
    emoji: "👶",
    title: "Mi hijo tiene dificultades",
    description:
      "En la alimentación, el movimiento, la integración escolar o el desarrollo.",
    bg: "bg-blue-light",
    border: "border-blue/20",
    hoverBorder: "hover:border-blue",
  },
  {
    slugHint: "adaptacion-puesto",
    emoji: "💼",
    title: "Tuve una lesión o molestia laboral",
    description:
      "Dolor de espalda, cuello u otra dificultad que afecta mi trabajo.",
    bg: "bg-green-light",
    border: "border-green/20",
    hoverBorder: "hover:border-green",
  },
  {
    slugHint: "babysitting-terapeutico",
    emoji: "🌟",
    title: "Busco cuidado especializado",
    description:
      "Necesito que cuiden a mi hijo con un enfoque terapéutico mientras yo trabajo.",
    bg: "bg-yellow",
    border: "border-yellow/40",
    hoverBorder: "hover:border-orange",
  },
];

export default function ServiceFinder() {
  const { services: docs, loading } = useServices();
  const services = useMemo(() => docs.map((d) => toService(d)), [docs]);
  const [professional, setProfessional] = useState<UserProfile | null>(null);
  const [activeService, setActiveService] = useState<Service | null>(null);

  // Carga el profesional al montar para poder saltar directo al calendario
  useEffect(() => {
    getAllProfessionals()
      .then((pros) => { if (pros.length >= 1) setProfessional(pros[0]); })
      .catch(console.error);
  }, []);

  function handleSelect(slugHint: string) {
    const match =
      services.find((s) => s.slug === slugHint) ??
      services.find((s) => s.slug.includes(slugHint.split("-")[0]));
    if (match) setActiveService(match);
  }

  if (loading || services.length === 0) return null;

  return (
    <>
      <section className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <span className="inline-block bg-lavender rounded-full px-5 py-2 text-sm font-bold text-foreground mb-4">
              Encuentra tu servicio
            </span>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
                ¿No sabes por cuál empezar?
              </h2>
              <p className="text-gray-500 text-sm max-w-xs">
                Elige tu situación y te llevo directo al calendario — sin pasos extras.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {scenarios.map((s) => (
              <button
                key={s.slugHint}
                onClick={() => handleSelect(s.slugHint)}
                className={`group text-left rounded-3xl border-2 ${s.bg} ${s.border} ${s.hoverBorder} p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
              >
                <span className="text-4xl mb-5 block">{s.emoji}</span>
                <h3 className="font-bold text-foreground text-lg leading-tight">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {s.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-foreground group-hover:gap-3 transition-all">
                  Elegir horario
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            ¿Prefieres ver detalles y precios?{" "}
            <a
              href="#servicios"
              className="font-semibold text-foreground underline underline-offset-2 hover:text-blue transition-colors"
            >
              Ver servicios completos
            </a>
          </p>
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
