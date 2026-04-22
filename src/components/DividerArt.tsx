export default function DividerArt() {
  return (
    <section className="py-24 px-6 bg-foreground overflow-hidden relative">
      {/* Decorative shapes */}
      <div className="absolute top-8 right-[8%] w-20 h-20 rounded-full bg-yellow opacity-20 animate-float" />
      <div className="absolute bottom-10 left-[6%] w-14 h-14 rounded-lg bg-pink opacity-20 rotate-12 animate-float-delayed" />
      <div className="absolute top-1/2 left-[12%] w-10 h-10 rounded-full bg-green opacity-15 animate-float-slow" />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Label */}
        <span className="inline-block bg-white/10 rounded-full px-5 py-2 text-sm font-semibold text-white/70 mb-8">
          El resultado que buscas
        </span>

        {/* Headline */}
        <h2 className="font-display text-4xl md:text-6xl text-white tracking-tight leading-tight">
          Imagina esta semana
          <br className="hidden sm:block" />
          diferente.
        </h2>

        {/* Dream state */}
        <p className="mt-8 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Tu hijo llega tranquilo al colegio. La hora de comer no es una pelea.
          Tú sabes exactamente qué hacer — porque tienes un plan y a alguien de tu lado.
        </p>
        <p className="mt-4 text-base text-gray-400 max-w-xl mx-auto">
          Eso es lo que construimos juntos, sesión a sesión.
        </p>

        {/* Transformation chips */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2.5 text-sm font-medium text-white">
            <span className="text-yellow font-bold">Antes:</span> &ldquo;No come nada&rdquo;
            <span className="text-white/30 mx-1">→</span>
            <span className="text-green font-bold">Después:</span> amplía su menú
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2.5 text-sm font-medium text-white">
            <span className="text-yellow font-bold">Antes:</span> &ldquo;Espera y observa&rdquo;
            <span className="text-white/30 mx-1">→</span>
            <span className="text-green font-bold">Después:</span> plan de acción concreto
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2.5 text-sm font-medium text-white">
            <span className="text-yellow font-bold">Antes:</span> la duda constante
            <span className="text-white/30 mx-1">→</span>
            <span className="text-green font-bold">Después:</span> claridad y dirección
          </span>
        </div>
      </div>
    </section>
  );
}
