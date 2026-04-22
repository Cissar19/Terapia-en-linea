"use client";

import { useEffect, useMemo, useState } from "react";
import { useServices } from "@/contexts/ServicesContext";
import { toService, type Service } from "@/lib/services";
import { getAllProfessionals } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/firebase/types";
import BookingModal from "@/components/booking/BookingModal";

// ── Quiz data ──────────────────────────────────────────────────────────────

const questions = [
  {
    id: "age",
    question: "¿Cuántos años tiene tu hijo/a?",
    options: [
      { label: "Menos de 3 años", value: "0-2", emoji: "👶" },
      { label: "3 a 6 años", value: "3-6", emoji: "🧒" },
      { label: "7 a 12 años", value: "7-12", emoji: "🧑" },
      { label: "13 o más", value: "13+", emoji: "🧑‍🎓" },
    ],
  },
  {
    id: "concern",
    question: "¿Cuál es tu mayor preocupación?",
    options: [
      { label: "Alimentación — come selectivo o rechaza texturas", value: "feeding", emoji: "🍽️" },
      { label: "Movimiento — torpeza, retraso o coordinación", value: "motor", emoji: "🏃" },
      { label: "Sensorial/conducta — muy sensible a ruidos, texturas o cambios", value: "sensory", emoji: "🧠" },
      { label: "Adaptación al jardín o colegio", value: "school", emoji: "📚" },
    ],
  },
  {
    id: "support",
    question: "¿Qué tipo de apoyo necesitas?",
    options: [
      { label: "Evaluación + sesiones de terapia", value: "therapy", emoji: "🎯" },
      { label: "Cuidado especializado mientras yo trabajo", value: "care", emoji: "💼" },
      { label: "Orientación para saber por dónde empezar", value: "guidance", emoji: "🧭" },
    ],
  },
];

// ── Recommendation logic ───────────────────────────────────────────────────

function getRecommendedSlug(answers: string[]): string {
  if (answers[2] === "care") return "babysitting-terapeutico";
  return "atencion-temprana";
}

const reasonByConcern: Record<string, string> = {
  feeding:
    "La selectividad alimentaria es una de las especialidades de Bárbara (certificada Japieaters). La Atención Temprana te da el plan específico para el caso de tu hijo.",
  motor:
    "Las dificultades de coordinación responden muy bien a la intervención temprana. Cuanto antes empieces, más rápido verás avances concretos.",
  sensory:
    "La hipersensibilidad sensorial es tratable con técnicas de integración sensorial. La Atención Temprana es el punto de entrada correcto para este perfil.",
  school:
    "Las dificultades de adaptación escolar suelen tener una base sensorial o de neurodesarrollo. La evaluación te da el mapa claro de qué está pasando.",
};

function getReason(answers: string[], slug: string): string {
  if (slug === "babysitting-terapeutico") {
    return "Basándonos en que necesitas cuidado especializado mientras trabajas, el Babysitting Terapéutico es la opción ideal: tu hijo estará con una profesional que trabaja sus objetivos mientras lo cuida.";
  }
  return reasonByConcern[answers[1]] ?? "La evaluación completa es el primer paso para tener claridad y un plan concreto adaptado a tu hijo.";
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ServiceQuiz() {
  const { services: docs, loading } = useServices();
  const services = useMemo(() => docs.map((d) => toService(d)), [docs]);
  const [professional, setProfessional] = useState<UserProfile | null>(null);
  const [activeService, setActiveService] = useState<Service | null>(null);

  const [step, setStep] = useState(0); // 0-2 = questions, 3 = result
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    getAllProfessionals()
      .then((pros) => { if (pros.length >= 1) setProfessional(pros[0]); })
      .catch(console.error);
  }, []);

  function handleAnswer(value: string) {
    const next = [...answers, value];
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(3); // show result
    }
  }

  function reset() {
    setStep(0);
    setAnswers([]);
  }

  function handleBook(slug: string) {
    const match = services.find((s) => s.slug === slug) ?? services[0];
    if (match) setActiveService(match);
  }

  if (loading || services.length === 0) return null;

  const recommendedSlug = step === 3 ? getRecommendedSlug(answers) : "";
  const reason = step === 3 ? getReason(answers, recommendedSlug) : "";
  const recommendedService = services.find((s) => s.slug === recommendedSlug);

  return (
    <>
      <section className="py-24 px-6 bg-lavender overflow-hidden relative">
        {/* Decorative shapes */}
        <div className="absolute top-8 left-[5%] w-14 h-14 bg-blue rounded-full opacity-30 animate-float" />
        <div className="absolute bottom-12 right-[4%] w-10 h-10 bg-pink rounded-lg rotate-12 opacity-40 animate-float-delayed" />

        <div className="mx-auto max-w-2xl relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block bg-white rounded-full px-5 py-2 text-sm font-bold text-foreground mb-6">
              Encuentra tu servicio
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
              ¿No sabes cuál elegir?
            </h2>
            <p className="mt-4 text-foreground/60 text-base max-w-md mx-auto">
              3 preguntas y te digo exactamente cuál es el servicio indicado para tu hijo.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm p-8 md:p-10">

            {step < 3 ? (
              <>
                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                        i <= step ? "bg-foreground" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Back button */}
                {step > 0 && (
                  <button
                    onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                  </button>
                )}

                {/* Question */}
                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-8">
                  {questions[step].question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {questions[step].options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className="w-full flex items-center gap-4 rounded-2xl border-2 border-gray-100 bg-white hover:border-foreground hover:bg-gray-50 p-5 text-left transition-all duration-150 group"
                    >
                      <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                      <span className="text-sm font-medium text-foreground leading-relaxed">
                        {opt.label}
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-300 group-hover:text-foreground ml-auto flex-shrink-0 transition-colors"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>

                {/* Step counter */}
                <p className="mt-8 text-center text-xs text-gray-400">
                  Pregunta {step + 1} de {questions.length}
                </p>
              </>
            ) : (
              <>
                {/* Result screen */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-green flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Tu servicio recomendado
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl text-foreground">
                    {recommendedService?.name ?? "Atención Temprana"}
                  </h3>
                </div>

                {/* Reason */}
                <div className="rounded-2xl bg-lavender px-6 py-5 mb-6">
                  <p className="text-sm text-foreground leading-relaxed">{reason}</p>
                </div>

                {/* Service details */}
                {recommendedService && (
                  <div className="flex items-center gap-6 mb-8 px-1">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Precio</p>
                      <p className="font-bold text-foreground">{recommendedService.price}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Duración</p>
                      <p className="font-bold text-foreground">{recommendedService.duration}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Garantía</p>
                      <p className="font-bold text-green text-sm">Primera sesión</p>
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleBook(recommendedSlug)}
                    className="flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-white font-semibold hover:bg-foreground/90 transition-all hover:scale-[1.02]"
                  >
                    Agendar este servicio
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={reset}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
                  >
                    Volver a empezar
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Skip link */}
          {step < 3 && (
            <p className="mt-6 text-center text-sm text-foreground/50">
              ¿Ya sabes cuál quieres?{" "}
              <a
                href="#servicios"
                className="font-semibold text-foreground underline underline-offset-2"
              >
                Ver todos los servicios
              </a>
            </p>
          )}
        </div>
      </section>

      {activeService && (
        <BookingModal
          service={activeService}
          onClose={() => setActiveService(null)}
          initialProfessional={professional}
          initialStep={professional?.calUsername ? "calendar" : "professional"}
        />
      )}
    </>
  );
}
