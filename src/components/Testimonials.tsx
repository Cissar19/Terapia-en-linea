const testimonials = [
  {
    name: "Carolina M.",
    role: "Mamá de Sofía, 4 años",
    text: "La atención temprana cambió la vida de mi hija. El proceso de agendar online fue increíblemente simple y el pago con Webpay me dio confianza.",
    service: "Atención Temprana",
  },
  {
    name: "Roberto A.",
    role: "Ingeniero, 38 años",
    text: "Tras mi accidente laboral, la adaptación de puesto me permitió volver a trabajar cómodo. Todo el proceso fue online, sin burocracia.",
    service: "Adaptación de Puesto",
  },
  {
    name: "Marcela V.",
    role: "Mamá de Tomás, 2 años",
    text: "El babysitting terapéutico nos da tranquilidad. Sabemos que Tomás está con una profesional que trabaja sus objetivos mientras lo cuida.",
    service: "Babysitting Terapéutico",
  },
];

function Stars() {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-blue" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-28 px-6 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            Lo que dicen nuestros pacientes
          </h2>
        </div>

        {/* Testimonial cards — SuperHi horizontal overflow style */}
        <div className="relative">
          {/* Overflow indicators on sides */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none hidden xl:block" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none hidden xl:block" />

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex-shrink-0 w-[300px] md:w-auto snap-center rounded-3xl bg-white border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                {/* Header with avatar and info */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-lavender flex items-center justify-center overflow-hidden">
                    <span className="text-sm font-bold text-blue">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>

                {/* Text */}
                <p className="text-gray-700 text-sm leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Service tag */}
                <div className="mt-5">
                  <span className="text-xs text-gray-500 font-medium">
                    {t.service}
                  </span>
                </div>

                {/* Stars */}
                <div className="mt-4">
                  <Stars />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
