const waitSteps = [
  {
    time: "Semana 1–4",
    title: '"A ver si pasa solo"',
    desc: "La situación continúa igual. Cada comida, cada salida, cada mañana de colegio con la misma tensión acumulada.",
  },
  {
    time: "Mes 2–3",
    title: "El colegio empieza a notar",
    desc: "La profesora llama. Aparecen palabras como 'derivación' o 'informe de conducta'. Tú ya lo sabías, pero duele escucharlo.",
  },
  {
    time: "Mes 4–5",
    title: "La brecha con sus pares crece",
    desc: "Tu hijo lo empieza a sentir también. La frustración aumenta. Se aísla más o reacciona con más intensidad.",
  },
  {
    time: "Mes 6+",
    title: "El patrón se consolida",
    desc: "Lo que era moldeable ahora es un hábito arraigado. El proceso terapéutico será más largo y más costoso.",
  },
];

const actSteps = [
  {
    time: "Semana 1",
    title: "Evaluación completa",
    desc: "Sabes exactamente qué tiene tu hijo y por qué. Sin más noches de incertidumbre ni búsquedas en Google.",
  },
  {
    time: "Semana 2–3",
    title: "Primeros cambios visibles",
    desc: "Con objetivos claros, los avances empiezan. La hora de comer es un poco más tranquila. El ambiente mejora.",
  },
  {
    time: "Mes 2–3",
    title: "Patrón más estable",
    desc: "Menos rabietas, más tolerancia sensorial, mejor participación en el colegio. Tú también respiras diferente.",
  },
  {
    time: "Mes 4–6",
    title: "Tu hijo con nuevas herramientas",
    desc: "Habilidades que antes le costaban ahora las hace solo. Tú con menos preguntas y más claridad.",
  },
];

export default function InactionCost() {
  return (
    <section className="py-24 px-6 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-yellow rounded-full px-5 py-2 text-sm font-bold text-foreground mb-6">
            El costo de esperar
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            ¿Qué pasa si espero{" "}
            <br className="hidden md:block" />
            un poco más?
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            La mayoría de las familias espera en promedio 6 meses antes de buscar ayuda.
            Esto es lo que ocurre en ese tiempo.
          </p>
        </div>

        {/* Two-column comparison */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Waiting path */}
          <div className="rounded-3xl bg-gray-50 border border-gray-200 p-8 md:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm font-bold text-gray-600">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                Si esperas...
              </div>
            </div>

            <div className="space-y-7">
              {waitSteps.map((step) => (
                <div key={step.time} className="flex gap-4">
                  <div className="flex-shrink-0 pt-0.5">
                    <span className="inline-block bg-gray-200 text-gray-500 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {step.time}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{step.title}</p>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acting path */}
          <div className="rounded-3xl bg-green-light border border-green/20 p-8 md:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-green px-4 py-2 text-sm font-bold text-white">
                <div className="w-2 h-2 rounded-full bg-white" />
                Si actúas esta semana...
              </div>
            </div>

            <div className="space-y-7">
              {actSteps.map((step) => (
                <div key={step.time} className="flex gap-4">
                  <div className="flex-shrink-0 pt-0.5">
                    <span className="inline-block bg-green text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {step.time}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{step.title}</p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href="#servicios"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-white font-semibold hover:bg-foreground/90 transition-all hover:scale-105"
          >
            Quiero actuar esta semana
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <p className="mt-3 text-sm text-gray-400">Primera sesión con garantía de devolución</p>
        </div>
      </div>
    </section>
  );
}
