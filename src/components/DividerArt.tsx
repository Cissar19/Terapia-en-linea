export default function DividerArt() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="mx-auto max-w-4xl text-center">
        {/* Centered heading — SuperHi "Don't know where to start?" style */}
        <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
          &ldquo;La terapia ocupacional transforma lo cotidiano en terapéutico&rdquo;
        </h2>
        <p className="mt-6 text-gray-500 text-lg">
          Cada actividad es una oportunidad para mejorar la calidad de vida
        </p>

        {/* Pill buttons row — like SuperHi's filter tags */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Neurodesarrollo
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-foreground">
            TEA
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-foreground">
            Integración Sensorial
          </span>
        </div>
      </div>
    </section>
  );
}
