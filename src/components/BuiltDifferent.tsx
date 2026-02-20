const featureGroups = [
  {
    title: "Datos protegidos + agenda online",
    description:
      "Tu información clínica y personal está cifrada y protegida con los más altos estándares de seguridad. Reserva tu hora en cualquier momento. Nuestro calendario se actualiza en tiempo real con Cal.com.",
    cta: "Agenda online",
    ctaLink: "#servicios",
  },
  {
    title: "Pago con Webpay seguro y confiable",
    description:
      "Paga de forma segura con tarjeta de débito o crédito a través de Flow.cl y Transbank. Tu cita se confirma automáticamente tras el pago. Sin esperas, sin llamadas telefónicas.",
    cta: "Pagar con Webpay",
    ctaLink: "#servicios",
  },
  {
    title: "Enfoque integral basado en evidencia",
    description:
      "Abordamos cada caso de forma holística, considerando el contexto personal, familiar y laboral. Nuestras intervenciones se fundamentan en investigación científica actualizada.",
    cta: "Conocer más",
    ctaLink: "#como-funciona",
  },
];

export default function BuiltDifferent() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Section header — SuperHi "Student work" style */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            Atención diferente
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            Combinamos excelencia clínica con tecnología.
            Para brindarte la mejor experiencia en terapia ocupacional.
          </p>
        </div>

        {/* Label row — SuperHi "Most Popular" + "See all content" */}
        <div className="flex items-center justify-between mb-6">
          <span className="inline-block bg-yellow rounded-full px-5 py-2 text-sm font-bold text-foreground">
            Atención diferente
          </span>
          <a
            href="#servicios"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-blue transition-colors"
          >
            Ver servicios
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Card grid — SuperHi "Most Popular" style: 3 cards with different visual treatments */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 — Green, tall */}
          <div className="rounded-3xl bg-green-light p-8 md:p-10 flex flex-col justify-between min-h-[420px] hover:scale-[1.01] transition-transform duration-300">
            <div>
              <h3 className="font-display text-3xl md:text-4xl leading-tight text-foreground">
                {featureGroups[0].title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {featureGroups[0].description}
              </p>
            </div>
            <a
              href={featureGroups[0].ctaLink}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity"
            >
              {featureGroups[0].cta}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Card 2 — Dark blue with geometric shapes overlay */}
          <div className="rounded-3xl bg-blue relative overflow-hidden p-8 md:p-10 flex flex-col justify-between min-h-[420px] hover:scale-[1.01] transition-transform duration-300">
            {/* Floating shapes inside card */}
            <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-orange opacity-70" />
            <div className="absolute top-20 right-12 w-10 h-10 rounded-lg bg-yellow rotate-12 opacity-60" />
            <div className="absolute bottom-16 right-8">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <polygon points="20,2 25,15 39,15 28,24 32,37 20,29 8,37 12,24 1,15 15,15" fill="#FF6B9D" opacity="0.7" />
              </svg>
            </div>
            <div className="absolute bottom-8 right-24 w-8 h-8 rounded-full bg-green opacity-60" />

            <div className="relative z-10">
              <h3 className="font-display text-3xl md:text-4xl leading-tight text-white">
                {featureGroups[1].title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-blue-light">
                {featureGroups[1].description}
              </p>
            </div>
            <a
              href={featureGroups[1].ctaLink}
              className="relative z-10 mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:opacity-70 transition-opacity"
            >
              {featureGroups[1].cta}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Card 3 — White with border */}
          <div className="rounded-3xl bg-white border border-gray-200 p-8 md:p-10 flex flex-col justify-between min-h-[420px] hover:scale-[1.01] transition-transform duration-300">
            <div>
              <span className="inline-block bg-green-light text-green text-xs font-bold px-3 py-1 rounded-full mb-4">
                Basado en evidencia
              </span>
              <h3 className="font-display text-3xl md:text-4xl leading-tight text-foreground">
                {featureGroups[2].title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {featureGroups[2].description}
              </p>
            </div>
            <a
              href={featureGroups[2].ctaLink}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity"
            >
              {featureGroups[2].cta}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
