const facts = [
  {
    stat: "90%",
    label: "del cerebro se desarrolla antes de los 5 años",
    desc: "La estructura neuronal que define el aprendizaje, el comportamiento y la coordinación se forma principalmente en los primeros años de vida.",
    bg: "bg-yellow",
    statColor: "text-foreground",
    labelColor: "text-foreground",
    descColor: "text-foreground/60",
  },
  {
    stat: "3×",
    label: "más efectiva la intervención temprana",
    desc: "Los estudios en neurodesarrollo muestran que actuar en la ventana 0–7 años produce resultados hasta tres veces superiores que intervenir más tarde.",
    bg: "bg-blue",
    statColor: "text-white",
    labelColor: "text-white",
    descColor: "text-blue-light",
  },
  {
    stat: "6–18",
    label: "meses de espera en el sistema público",
    desc: "Tiempo promedio para acceder a terapia ocupacional vía derivación médica en Chile. Con Terapia en Fácil, la primera sesión puede ser esta semana.",
    bg: "bg-foreground",
    statColor: "text-white",
    labelColor: "text-white",
    descColor: "text-gray-400",
  },
];

export default function DevelopmentWindow() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-yellow rounded-full px-5 py-2 text-sm font-bold text-foreground mb-6">
            Por qué actuar ahora importa
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            La ventana del{" "}
            <br className="hidden md:block" />
            neurodesarrollo
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            El cerebro de tu hijo está en su momento de mayor plasticidad.
            Cada mes que pasa sin intervención, esa ventana se va cerrando lentamente.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {facts.map((fact) => (
            <div
              key={fact.stat}
              className={`rounded-3xl ${fact.bg} p-8 md:p-10 flex flex-col`}
            >
              <div className={`font-display text-6xl md:text-7xl font-bold ${fact.statColor} leading-none`}>
                {fact.stat}
              </div>
              <p className={`mt-4 font-bold text-lg leading-snug ${fact.labelColor}`}>
                {fact.label}
              </p>
              <p className={`mt-3 text-sm leading-relaxed ${fact.descColor}`}>
                {fact.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bridge */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            El instinto que te trajo hasta aquí es correcto.{" "}
            <span className="font-semibold text-foreground">
              Cuanto antes empieces, más lejos puede llegar tu hijo.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
