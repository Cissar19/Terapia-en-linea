const pains = [
  {
    emoji: "😮‍💨",
    title: "La hora de comer es una batalla diaria",
    body: "Tu hijo rechaza texturas, colores o temperaturas. Cada comida termina en tensión, llanto o presión. Y no sabes si es una etapa que va a pasar sola o si necesita ayuda profesional ahora.",
    bg: "bg-yellow",
    textColor: "text-foreground",
    descColor: "text-foreground/70",
    border: false,
  },
  {
    emoji: "⏳",
    title: "El pediatra dijo \"espera y observa\"",
    body: "Llevas meses con la duda. El médico dice que hay que tener paciencia, pero tu instinto dice que cuanto antes, mejor. Y tienes razón: en neurodesarrollo, el tiempo importa.",
    bg: "bg-blue",
    textColor: "text-white",
    descColor: "text-blue-light",
    border: false,
  },
  {
    emoji: "😵",
    title: "No sabes a quién creerle",
    body: "Hay muchos profesionales, muchos enfoques y mucha información contradictoria. No sabes qué tipo de terapia necesita tu hijo ni cómo distinguir a alguien confiable de alguien que solo cobra caro.",
    bg: "bg-white",
    textColor: "text-foreground",
    descColor: "text-gray-600",
    border: true,
  },
];

export default function BuiltDifferent() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-lavender rounded-full px-5 py-2 text-sm font-bold text-foreground mb-6">
            Para padres como tú
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            ¿Te suena familiar?
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            Si alguna de estas situaciones te describe, estás en el lugar correcto.
          </p>
        </div>

        {/* Pain cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {pains.map((pain) => (
            <div
              key={pain.title}
              className={`rounded-3xl ${pain.bg} ${pain.border ? "border border-gray-200" : ""} p-8 md:p-10 flex flex-col min-h-[340px]`}
            >
              <span className="text-4xl mb-6 block">{pain.emoji}</span>
              <h3 className={`font-display text-2xl md:text-3xl leading-tight ${pain.textColor}`}>
                {pain.title}
              </h3>
              <p className={`mt-4 text-sm leading-relaxed ${pain.descColor}`}>
                {pain.body}
              </p>
            </div>
          ))}
        </div>

        {/* Reassurance bridge */}
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            No tienes que resolverlo solo/a.{" "}
            <span className="font-semibold text-foreground">Para eso estoy yo.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
