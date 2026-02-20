"use client";

import type { Service } from "@/lib/services";
import CalEmbed from "./CalEmbed";

interface BookingPageProps {
  service: Service;
}

export default function BookingPage({ service }: BookingPageProps) {
  return (
    <section className="relative min-h-screen pt-24 pb-16 px-6 bg-lavender-light overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-32 right-10 w-20 h-20 bg-pink rounded-full opacity-40 animate-float" />
      <div className="absolute top-60 left-6 w-14 h-14 bg-yellow rounded-lg rotate-12 opacity-50 animate-float-delayed" />
      <div className="absolute bottom-24 right-20 w-10 h-10 bg-green rounded-full opacity-40 animate-float-slow" />

      <div className="relative mx-auto max-w-4xl">
        {/* Back link */}
        <a
          href="/#servicios"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a servicios
        </a>

        {/* Service info card */}
        <div className={`rounded-3xl ${service.bg} p-8 mb-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground">
                {service.name}
              </h1>
              <p className="mt-2 text-gray-600">{service.description}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="text-3xl font-black text-foreground">{service.price}</span>
              <span className="text-gray-500 text-sm ml-2">/ {service.duration}</span>
            </div>
          </div>
        </div>

        {/* Calendar embed */}
        <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm min-h-[500px]">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Selecciona tu horario
          </h2>
          <CalEmbed calLink={service.calLink} />
        </div>
      </div>
    </section>
  );
}
