"use client";

import { useState } from "react";

const faqs = [
  {
    question: "¿Necesito una derivación médica para agendar?",
    answer:
      "No. Puedes agendar directamente desde la web sin necesidad de una orden médica. Si tu Isapre o Fonasa requiere derivación para reembolso, te puedo orientar en la primera sesión.",
  },
  {
    question: "¿Las sesiones son presenciales u online?",
    answer:
      "Las sesiones de Atención Temprana y Babysitting Terapéutico son presenciales a domicilio en Santiago. La Adaptación de Puesto de Trabajo puede ser presencial o híbrida según el caso.",
  },
  {
    question: "¿Qué pasa si mi hijo no coopera en la sesión?",
    answer:
      "Es completamente normal. Trabajo con un enfoque lúdico y centrado en el vínculo, así que las primeras sesiones son de exploración y confianza. No hay presión. Cada niño tiene su ritmo y lo respeto.",
  },
  {
    question: "¿Puedo cancelar o reagendar mi cita?",
    answer:
      "Sí, puedes cancelar o reagendar sin costo hasta 24 horas antes de tu cita. Recibirás un email de confirmación con las instrucciones.",
  },
  {
    question: "¿Atienden por Fonasa o Isapre?",
    answer:
      "Emito boleta de honorarios que puedes presentar a tu Isapre para reembolso. El valor de cobertura depende de tu plan. No atiendo directamente por Fonasa, pero puedo orientarte.",
  },
  {
    question: "¿Cuántas sesiones necesita mi hijo?",
    answer:
      "Depende de cada caso. En la primera sesión de evaluación conversamos los objetivos y te doy una estimación. Algunos casos se resuelven en 4-6 sesiones, otros requieren un proceso más largo.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-28 px-6 bg-lavender-light">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <span className="inline-block bg-white rounded-full px-5 py-2 text-sm font-semibold text-blue mb-6">
            Preguntas frecuentes
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            ¿Tienes dudas?
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            Aquí respondo las consultas más comunes.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl bg-white border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-semibold text-foreground text-sm md:text-base">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`grid transition-all duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            ¿No encuentras tu respuesta?{" "}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "56912345678"}?text=${encodeURIComponent("Hola Bárbara, tengo una consulta.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue font-semibold underline underline-offset-2 hover:text-blue-dark"
            >
              Escríbeme por WhatsApp
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
