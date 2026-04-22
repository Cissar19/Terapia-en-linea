"use client";

import { useRef, useState } from "react";

const signals = [
  "Come solo 3–5 alimentos iguales y rechaza todo lo nuevo",
  "Se pone de puntillas frecuentemente, especialmente en superficies nuevas",
  "Se tapa los oídos ante ruidos que a otros niños no les molestan",
  "Se cae más que sus pares o choca con objetos sin querer",
  "Le cuesta mucho abrocharse, usar tijeras o sostener el lápiz",
  "Hace rabietas intensas cuando algo pequeño cambia en su rutina",
  "Evita texturas: arena, masa, pintura de dedos, césped descalzo",
  "Le cuesta adaptarse al jardín o colegio más que a sus compañeros",
  "Tiene mucha dificultad para sentarse quieto o parece nunca cansarse",
  "Le molestan las etiquetas de la ropa o ciertos tipos de tela",
];

export default function AlertSigns() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const modalTriggered = useRef(false);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);

      if (next.size === 2 && !modalTriggered.current) {
        modalTriggered.current = true;
        // Pequeño delay para que el usuario vea el check antes del modal
        setTimeout(() => setShowModal(true), 400);
      }

      return next;
    });
  };

  const count = checked.size;
  const checkedSignals = signals.filter((_, i) => checked.has(i));

  return (
    <>
      <section className="py-24 px-6 bg-lavender overflow-hidden relative">
        {/* Decorative shapes */}
        <div className="absolute top-10 right-[5%] w-16 h-16 bg-pink rounded-full opacity-40 animate-float" />
        <div className="absolute bottom-14 left-[3%] w-12 h-12 bg-yellow rounded-lg rotate-12 opacity-50 animate-float-delayed" />
        <div className="absolute top-1/2 right-[2%] w-8 h-8 bg-blue rounded-full opacity-30 animate-float-slow" />

        <div className="mx-auto max-w-4xl relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block bg-white rounded-full px-5 py-2 text-sm font-bold text-foreground mb-6">
              Lista de señales
            </span>
            <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
              ¿Tu hijo muestra{" "}
              <br className="hidden sm:block" />
              alguna de estas señales?
            </h2>
            <p className="mt-4 text-foreground/60 text-lg max-w-xl mx-auto">
              Marca las que reconoces. No es un diagnóstico — es una guía para saber si la terapia ocupacional puede ayudar a tu hijo.
            </p>
          </div>

          {/* Checklist */}
          <div className="grid gap-3 sm:grid-cols-2">
            {signals.map((signal, i) => {
              const isChecked = checked.has(i);
              return (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className={`flex items-start gap-4 rounded-2xl p-5 text-left transition-all duration-200 cursor-pointer ${
                    isChecked
                      ? "bg-foreground text-white shadow-lg scale-[1.01]"
                      : "bg-white/70 hover:bg-white text-foreground hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      isChecked ? "bg-green border-green" : "border-gray-300"
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm leading-relaxed font-medium">{signal}</span>
                </button>
              );
            })}
          </div>

          {/* Counter */}
          <div className="mt-8 text-center">
            {count === 0 ? (
              <p className="text-foreground/50 text-sm">Selecciona las señales que observas en tu hijo</p>
            ) : (
              <p className="text-foreground font-semibold text-lg">
                Marcaste{" "}
                <span className="font-display text-3xl">{count}</span>{" "}
                de {signals.length} señales
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Franja superior de color */}
            <div className="h-2 bg-green" />

            <div className="px-8 py-8">
              {/* Close */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-yellow flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="font-display text-2xl md:text-3xl text-foreground leading-tight">
                Estas señales tienen solución
              </h3>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                Lo que marcaste no es &quot;pura personalidad&quot; ni algo que vaya a pasar solo.
                La terapia ocupacional trata exactamente esto:
              </p>

              {/* Señales marcadas */}
              <ul className="mt-5 space-y-2">
                {checkedSignals.map((signal) => (
                  <li key={signal} className="flex items-start gap-3 text-sm text-foreground">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green/15 flex items-center justify-center">
                      <svg className="w-3 h-3 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="leading-relaxed">{signal}</span>
                  </li>
                ))}
              </ul>

              {/* Mensaje */}
              <div className="mt-6 rounded-2xl bg-lavender px-5 py-4">
                <p className="text-sm text-foreground leading-relaxed">
                  Con una evaluación de{" "}
                  <strong>75 minutos</strong> puedes saber exactamente qué está pasando y tener
                  un plan concreto. No necesitas esperar a que sean más señales.
                </p>
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href="#servicios"
                  onClick={() => setShowModal(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-white font-semibold hover:bg-foreground/90 transition-all hover:scale-[1.02]"
                >
                  Quiero la evaluación
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
                >
                  Seguir viendo las señales
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
