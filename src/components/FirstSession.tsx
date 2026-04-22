const steps = [
  {
    number: "01",
    title: "Llegamos a tu casa",
    duration: "5 min",
    description:
      "Sin sala de espera. Sin traslado con el niño. Bárbara llega puntual a tu domicilio en Santiago. El ambiente familiar hace que tu hijo se sienta cómodo desde el primer momento.",
    dotBg: "bg-yellow",
    dotText: "text-foreground",
  },
  {
    number: "02",
    title: "Tú nos cuentas",
    duration: "15 min",
    description:
      "Conversamos (mientras tu hijo juega) sobre lo que observas en casa: qué lo desafía, qué lo frustra, qué dijo el colegio. Tu percepción como papá o mamá es el mejor punto de partida.",
    dotBg: "bg-blue",
    dotText: "text-white",
  },
  {
    number: "03",
    title: "Evaluación lúdica",
    duration: "30–40 min",
    description:
      "Bárbara trabaja directamente con tu hijo a través del juego. Observa su coordinación, respuesta sensorial, atención y habilidades. Tu hijo no sabe que lo están evaluando — para él es un juego.",
    dotBg: "bg-green",
    dotText: "text-white",
  },
  {
    number: "04",
    title: "Devolución honesta",
    duration: "10 min",
    description:
      "Bárbara te explica en lenguaje claro lo que encontró — sin tecnicismos, sin alarmar innecesariamente. Al terminar sabrás exactamente qué está pasando y por qué.",
    dotBg: "bg-pink",
    dotText: "text-white",
  },
  {
    number: "05",
    title: "Plan concreto para tu familia",
    duration: "5 min",
    description:
      "Recibes 2–3 objetivos terapéuticos y una propuesta de continuidad adaptada a tu realidad. No es una venta: es la hoja de ruta más honesta que puedes tener para avanzar.",
    dotBg: "bg-orange",
    dotText: "text-white",
  },
];

export default function FirstSession() {
  return (
    <section className="py-24 px-6 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-lavender rounded-full px-5 py-2 text-sm font-bold text-foreground mb-6">
            Primera sesión
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            ¿Qué pasa{" "}
            <br className="hidden sm:block" />
            el primer día?
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            Sin sorpresas. Exactamente lo que puedes esperar cuando agendas tu primera sesión.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {steps.map((step, i) => (
            <div key={step.number} className="flex gap-6">
              {/* Left: dot + connector line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-2xl ${step.dotBg} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <span className={`font-bold text-sm ${step.dotText}`}>{step.number}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-100 my-2" />
                )}
              </div>

              {/* Right: content */}
              <div className={`pb-10 flex-1 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="font-display text-xl md:text-2xl text-foreground">
                    {step.title}
                  </h3>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full flex-shrink-0">
                    {step.duration}
                  </span>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total + CTA */}
        <div className="mt-12 rounded-3xl bg-foreground p-8 md:p-10 text-center text-white">
          <p className="font-display text-3xl md:text-4xl">Total: ~75 minutos</p>
          <p className="mt-3 text-white/70 text-base max-w-lg mx-auto leading-relaxed">
            Al salir sabrás exactamente qué tiene tu hijo, qué se puede hacer y cómo avanzar. Sin vaguedades.
          </p>
          <a
            href="#servicios"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-yellow px-8 py-4 text-foreground font-semibold hover:bg-yellow/90 transition-all hover:scale-105"
          >
            Quiero esta sesión
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
