export default function CTA() {
  return (
    <>
      {/* "Trusted by" section — SuperHi blue bg with overlapping quote cards */}
      <section className="relative py-24 px-6 bg-blue overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight mb-12">
            Confían en nosotros
          </h2>

          {/* Overlapping colored quote cards */}
          <div className="relative h-[320px] md:h-[280px]">
            {/* Card 1 — Yellow, slight rotation */}
            <div className="absolute left-0 top-0 w-72 md:w-80 rounded-2xl bg-yellow p-6 rotate-[-2deg] shadow-xl z-10">
              <p className="text-sm text-foreground leading-relaxed font-medium">
                &ldquo;La atención temprana cambió la vida de mi hija. El proceso de agendar online fue increíblemente simple.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">C</span>
                </div>
                <span className="text-xs font-bold text-foreground">Carolina M.</span>
              </div>
            </div>

            {/* Card 2 — Green, center */}
            <div className="absolute left-[15%] md:left-[25%] top-8 w-72 md:w-80 rounded-2xl bg-green-light p-6 rotate-[1deg] shadow-xl z-20">
              <p className="text-sm text-foreground leading-relaxed font-medium">
                &ldquo;La adaptación de puesto me permitió volver a trabajar cómodo. Todo el proceso fue online, sin burocracia.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">R</span>
                </div>
                <span className="text-xs font-bold text-foreground">Roberto A.</span>
              </div>
            </div>

            {/* Card 3 — Pink-light, right */}
            <div className="absolute right-0 md:right-[10%] top-16 w-72 md:w-80 rounded-2xl bg-pink-light p-6 rotate-[-1deg] shadow-xl z-30">
              <p className="text-sm text-foreground leading-relaxed font-medium">
                &ldquo;El babysitting terapéutico nos da tranquilidad. Sabemos que Tomás está con una profesional.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-pink flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">M</span>
                </div>
                <span className="text-xs font-bold text-foreground">Marcela V.</span>
              </div>
            </div>

            {/* Card 4 — Lavender, far right, partially hidden */}
            <div className="absolute right-[-5%] top-4 w-64 rounded-2xl bg-lavender-light p-6 rotate-[3deg] shadow-xl z-0 hidden lg:block">
              <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                &ldquo;Profesionales certificados con un enfoque realmente humano y cercano.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA — SuperHi dark bottom CTA style */}
      <section className="relative py-28 px-6 bg-foreground overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-8 left-[10%] animate-float opacity-30">
          <svg width="50" height="50" viewBox="0 0 50 50">
            <polygon points="25,3 47,43 3,43" fill="#FFD43B" />
          </svg>
        </div>
        <div className="absolute bottom-12 right-[8%] w-14 h-14 rounded-full bg-pink opacity-20 animate-float-delayed" />
        <div className="absolute top-1/3 right-[15%] w-10 h-10 rounded-lg bg-green opacity-20 rotate-12 animate-wiggle" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-8 w-14 h-14 rounded-2xl bg-blue flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>

          <h2 className="font-display text-4xl md:text-6xl text-white tracking-tight leading-tight">
            Comienza tu camino hacia el bienestar
          </h2>
          <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
            Agenda tu primera sesión de terapia ocupacional hoy.
            Pago seguro, confirmación instantánea, profesionales certificados.
          </p>

          <div className="mt-10">
            <a
              href="#servicios"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-4 text-foreground font-bold text-lg hover:bg-yellow transition-colors"
            >
              Agendar Ahora
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Trust items */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Sin contratos
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Cancela hasta 24h antes
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Pago 100% seguro
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
