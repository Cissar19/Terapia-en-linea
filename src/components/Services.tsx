import { services } from "@/lib/services";

const cardStyles = [
  {
    bg: "bg-blue",
    textColor: "text-white",
    descColor: "text-blue-light",
    iconBg: "bg-white/20",
  },
  {
    bg: "bg-green",
    textColor: "text-white",
    descColor: "text-green-light",
    iconBg: "bg-white/20",
  },
  {
    bg: "bg-yellow",
    textColor: "text-foreground",
    descColor: "text-foreground/70",
    iconBg: "bg-foreground/10",
  },
];

const icons = [
  // Laptop/desk icon
  <svg key="desk" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>,
  // Heart icon
  <svg key="heart" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>,
  // Sun icon
  <svg key="sun" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>,
];

export default function Services() {
  return (
    <section id="servicios" className="py-28 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            Elige tu servicio y{" "}
            <br className="hidden md:block" />
            agenda ahora
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            Tres especialidades diseñadas para mejorar tu calidad de vida.
            Selecciona, paga con Webpay y confirma tu cita al instante.
          </p>
        </div>

        {/* Stacked colored cards — SuperHi newsletter/community/course style */}
        <div className="space-y-6">
          {services.map((service, i) => {
            const style = cardStyles[i];
            return (
              <div
                key={service.slug}
                className={`rounded-3xl ${style.bg} p-8 md:p-12 hover:scale-[1.005] transition-transform duration-300`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  {/* Left content */}
                  <div className="flex-1">
                    {/* Small icon badge */}
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${style.iconBg} ${style.textColor} mb-6`}>
                      {icons[i]}
                    </div>

                    <h3 className={`font-display text-3xl md:text-4xl ${style.textColor} leading-tight`}>
                      {service.name}
                    </h3>
                    <p className={`mt-3 ${style.descColor} text-base leading-relaxed max-w-lg`}>
                      {service.description}
                    </p>

                    {/* Features */}
                    <ul className="mt-6 space-y-2">
                      {service.features.map((feat) => (
                        <li key={feat} className={`flex items-center gap-2 text-sm ${style.textColor}`}>
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {feat}
                        </li>
                      ))}
                    </ul>

                    {/* Price */}
                    <div className="mt-6 flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${style.textColor}`}>{service.price}</span>
                      <span className={`text-sm ${style.descColor}`}>/ {service.duration}</span>
                    </div>
                  </div>

                  {/* Right CTA */}
                  <div className="flex-shrink-0">
                    <a
                      href={`/agendar/${service.slug}`}
                      className={`inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-base transition-all hover:scale-105 ${
                        i === 2
                          ? "bg-foreground text-white"
                          : "bg-white text-foreground"
                      }`}
                    >
                      Agendar Cita
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
