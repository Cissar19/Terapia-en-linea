const steps = [
  {
    number: "01",
    title: "Elige tu servicio",
    description:
      "Selecciona entre adaptación de puesto, atención temprana o babysitting terapéutico según lo que necesites.",
    detail: "Cada servicio está diseñado por terapeutas ocupacionales con años de experiencia clínica.",
    bg: "bg-green-light",
    accent: "bg-green",
  },
  {
    number: "02",
    title: "Selecciona tu horario",
    description:
      "Nuestro calendario en tiempo real te muestra la disponibilidad actualizada. Elige el día y hora que más te acomode.",
    detail: "Integrado con Cal.com para garantizar que tu hora esté siempre disponible.",
    bg: "bg-blue-light",
    accent: "bg-blue",
  },
  {
    number: "03",
    title: "Paga con Webpay",
    description:
      "Redirigimos tu pago de forma segura a Flow.cl con Transbank. Acepta tarjeta de débito, crédito y prepago.",
    detail: "Tu cita solo se confirma cuando el pago es validado por nuestro servidor.",
    bg: "bg-yellow-light",
    accent: "bg-orange",
  },
  {
    number: "04",
    title: "Cita confirmada",
    description:
      "Recibes un correo de confirmación con los detalles de tu cita. Solo queda asistir.",
    detail: "Si necesitas reagendar, puedes hacerlo hasta 24 horas antes sin costo.",
    bg: "bg-pink-light",
    accent: "bg-pink",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-28 px-6 bg-lavender-light">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-6">
          <span className="inline-block bg-white rounded-full px-5 py-2 text-sm font-semibold text-blue mb-6">
            Proceso simple
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            Cómo funciona
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            De la selección a la confirmación en menos de 5 minutos.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`rounded-3xl ${step.bg} p-8 hover:scale-[1.02] transition-transform duration-300 flex flex-col`}
            >
              {/* Number badge */}
              <div className={`w-12 h-12 rounded-full ${step.accent} flex items-center justify-center mb-6`}>
                <span className="text-white font-bold text-lg">{step.number}</span>
              </div>

              <h3 className="font-display text-2xl text-foreground">{step.title}</h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed flex-1">{step.description}</p>
              <p className="mt-4 text-xs text-gray-500 border-t border-black/5 pt-4">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
