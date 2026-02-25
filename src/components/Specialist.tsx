import Image from "next/image";

export default function Specialist() {
  return (
    <section id="especialista" className="py-28 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            Un espacio seguro para{" "}
            <br className="hidden md:block" />
            crecer juntos
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            Más que terapia
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left — Photo placeholder + decorative shapes */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              {/* Photo container */}
              <div className="w-72 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden">
                <Image
                  src="/barbara.jpg"
                  alt="Bárbara Alarcón Villafaña — Terapeuta Ocupacional"
                  width={320}
                  height={384}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              </div>

              {/* Floating badges */}
              <div className="absolute -top-3 -right-4 bg-green text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-float">
                U. Mayor
              </div>
              <div className="absolute -bottom-3 -left-4 bg-pink text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-float-delayed">
                Neurodesarrollo
              </div>
              <div className="absolute top-1/2 -right-6 bg-blue text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-float-slow">
                Infanto-juvenil
              </div>

              {/* Decorative shapes */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow rounded-lg rotate-12" />
              <div className="absolute -bottom-5 -right-5">
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <polygon points="20,2 25,15 39,15 28,24 32,37 20,29 8,37 12,24 1,15 15,15" fill="#FF6B9D" />
                </svg>
              </div>
            </div>

            {/* Video intro */}
            <div className="mt-8 w-72 md:w-80">
              <a
                href="https://www.instagram.com/to.barbaraalarconv/"
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl bg-foreground/5 border-2 border-dashed border-gray-200 p-5 text-center hover:border-blue hover:bg-blue/5 transition-all"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-blue/10 flex items-center justify-center mb-3 group-hover:bg-blue/20 transition-colors">
                  <svg className="w-5 h-5 text-blue ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-foreground">Conóceme en Instagram</p>
                <p className="text-xs text-gray-500 mt-1">Mira cómo trabajo con las familias</p>
              </a>
            </div>
          </div>

          {/* Right — Content */}
          <div className="flex-1 max-w-xl">
            <p className="text-gray-700 leading-relaxed text-lg">
              ¡Hola! Soy <strong>Bárbara Alarcón Villafaña</strong>, Terapeuta Ocupacional (U. Mayor).
              Mi pasión es el mundo infanto-juvenil y el neurodesarrollo. Entiendo que cada niño es
              un universo único, por eso mi enfoque no se trata solo de &quot;ejercicios&quot;, sino de
              <strong> crear un vínculo real</strong>.
            </p>

            <p className="mt-4 text-gray-600 leading-relaxed">
              Cuento con una sólida base clínica gracias a mi experiencia en el <strong>Hospital del Salvador</strong> y
              <strong> Hospital Clínico Mutual de Seguridad</strong>. Además, he trabajado en colegios (Programa Habilidades para la Vida),
              lo que me permite entender los desafíos tanto en casa como en la sala de clases.
            </p>

            {/* Certifications */}
            <div className="mt-8">
              <h3 className="font-display text-2xl text-foreground mb-6">
                ¿En qué puedo ayudarte?
              </h3>

              <div className="space-y-4">
                <div className="flex gap-4 rounded-2xl bg-yellow-light p-5 hover:scale-[1.01] transition-transform">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-orange flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Alimentación sin batallas</h4>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      <strong>Certificación Japieaters.</strong> Si la hora de comer es estrés, puedo ayudarte. Abordamos selectividad y rechazo alimentario transformando la alimentación en una experiencia positiva.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl bg-blue-light p-5 hover:scale-[1.01] transition-transform">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-blue flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Atención Temprana y Neurodesarrollo</h4>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      <strong>Certificación OTEC Movilízate.</strong> Intervención especializada para potenciar el desarrollo desde las primeras etapas (TEA, síndromes genéticos, retraso psicomotor).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl bg-green-light p-5 hover:scale-[1.01] transition-transform">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-green flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Apoyo Bilingüe y Actualizado</h4>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      Gracias a mi manejo avanzado del inglés (Dallas Baptist University), accedo a la última literatura científica y puedo orientar a familias bilingües.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10">
              <a
                href="#servicios"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-white font-semibold hover:bg-foreground/90 transition-all"
              >
                <span>Agenda tu hora y conversemos</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <p className="mt-3 text-sm text-gray-500">
                Sin burocracia. Citas disponibles esta semana.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
