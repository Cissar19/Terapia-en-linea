"use client";

import { useState } from "react";

const items = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    question: "Sin derivación médica",
    answer:
      "No necesitas una orden del médico para agendar. Puedes empezar hoy mismo, sin trámites, sin esperar un cupo en el sistema público.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    question: "A domicilio en Santiago",
    answer:
      "Voy a tu casa. No necesitas desplazarte con tu hijo en transporte público ni reorganizar toda tu agenda. La terapia ocurre en el ambiente natural de tu hijo, que es donde mejor funciona.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    question: "Cancelas sin complicaciones",
    answer:
      "Hasta 24 horas antes, sin costo y sin preguntas. La vida con niños es impredecible — lo entiendo perfectamente. Recibirás el link para reagendar directamente en el email de confirmación.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    question: "Agendas en 5 minutos",
    answer:
      "Elige el servicio, escoge el horario que te acomode, paga con Webpay y listo. Confirmación inmediata en tu email, sin llamadas ni formularios engorrosos.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    question: "La información de tu hijo es privada",
    answer:
      "Los datos clínicos de tu hijo solo los ves tú y Bárbara. Nadie más tiene acceso. Toda la información está cifrada y protegida. Tu tranquilidad también es parte de la terapia.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    question: "Empezamos con una evaluación completa",
    answer:
      "La primera sesión es de evaluación. Antes de proponer cualquier plan de intervención, entiendo el caso completo: historia clínica, contexto familiar y objetivos terapéuticos.",
  },
];

export default function Privacy() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="privacidad" className="py-28 px-6 bg-lavender-light">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12">
          <span className="inline-block bg-white rounded-full px-5 py-2 text-sm font-semibold text-blue mb-6">
            Sin complicaciones
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            Pensado para
            <br />
            facilitarte la vida.
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-md">
            Ya tienes bastante con lo que tienes. El proceso de agendar no debería ser un problema más.
          </p>
        </div>

        <div className="divide-y divide-gray-200 border-t border-b border-gray-200 bg-white rounded-2xl overflow-hidden">
          {items.map((item, i) => (
            <div key={item.question}>
              <button
                className="w-full flex items-center justify-between py-5 px-6 text-left group gap-4"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="flex-shrink-0 text-blue">{item.icon}</span>
                  <span className="text-base font-semibold text-foreground group-hover:text-blue transition-colors">
                    {item.question}
                  </span>
                </div>
                <span className="flex-shrink-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-blue group-hover:text-blue transition-colors">
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${openIndex === i ? "rotate-45" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>

              {openIndex === i && (
                <div className="pb-5 px-6 pl-[3.25rem]">
                  <p className="text-gray-500 text-sm leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
