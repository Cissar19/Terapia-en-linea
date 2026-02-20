"use client";

import { useState } from "react";

const faqItems = [
  {
    question: "Sin datos de tarjeta almacenados",
    answer:
      "Flow.cl y Transbank manejan tu información financiera. Nunca pasa por nuestros servidores.",
  },
  {
    question: "Webhook validado con firma HMAC",
    answer:
      "Tu cita solo se confirma cuando verificamos criptográficamente que el pago es legítimo.",
  },
  {
    question: "Row Level Security en Supabase",
    answer:
      "Cada paciente solo puede ver sus propios datos. Aislamiento total entre usuarios.",
  },
  {
    question: "Variables sensibles en el servidor",
    answer:
      "API keys y secretos nunca se exponen al navegador. Solo el backend los maneja.",
  },
  {
    question: "¿Cómo se protege mi información clínica?",
    answer:
      "Entendemos la sensibilidad de la información de salud. Por eso implementamos múltiples capas de seguridad para que solo tú y tu terapeuta accedan a tus datos.",
  },
  {
    question: "¿El sitio usa conexión cifrada?",
    answer:
      "Sí, todo el tráfico entre tu navegador y nuestros servidores está cifrado con HTTPS. Tu información clínica y personal está protegida con los más altos estándares de seguridad.",
  },
];

export default function Privacy() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="privacidad" className="py-28 px-6 bg-white">
      <div className="mx-auto max-w-3xl">
        {/* Section header — SuperHi "The big questions" style */}
        <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-tight mb-12">
          Tus datos clínicos,
          <br />
          siempre protegidos
        </h2>

        {/* First item expanded by default — like SuperHi FAQ */}
        <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {faqItems.map((item, i) => (
            <div key={item.question}>
              <button
                className="w-full flex items-center justify-between py-6 text-left group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="text-lg font-medium text-foreground group-hover:text-blue transition-colors pr-8">
                  {item.question}
                </span>
                <span className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-blue group-hover:text-blue transition-colors">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openIndex === i ? "rotate-45" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>

              {openIndex === i && (
                <div className="pb-6 pr-12">
                  <p className="text-gray-500 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
