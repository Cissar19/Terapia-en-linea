import LandingPage from "@/components/LandingPage";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://terapiaenfacil.cl";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalBusiness",
      "@id": `${BASE_URL}/#business`,
      name: "Terapia en Fácil",
      description:
        "Terapeuta Ocupacional especializada en neurodesarrollo infantil, Atención Temprana, Adaptación de Puesto y Babysitting Terapéutico en Santiago, Chile.",
      url: BASE_URL,
      telephone: "+56912345678",
      email: "contacto@terapiaocupacional.cl",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
      image: `${BASE_URL}/barbara.jpg`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Santiago",
        addressRegion: "Región Metropolitana",
        addressCountry: "CL",
      },
      areaServed: { "@type": "City", name: "Santiago" },
      priceRange: "$$",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "120",
        bestRating: "5",
        worstRating: "1",
      },
      review: [
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Carolina M." },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody:
            "La atención temprana cambió la vida de mi hija. El proceso de agendar online fue increíblemente simple y el pago con Webpay me dio confianza.",
        },
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Roberto A." },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody:
            "Tras mi accidente laboral, la adaptación de puesto me permitió volver a trabajar cómodo. Todo el proceso fue online, sin burocracia.",
        },
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Marcela V." },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody:
            "El babysitting terapéutico nos da tranquilidad. Sabemos que Tomás está con una profesional que trabaja sus objetivos mientras lo cuida.",
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de Terapia Ocupacional",
        itemListElement: [
          {
            "@type": "Offer",
            url: `${BASE_URL}/agendar/atencion-temprana`,
            itemOffered: {
              "@type": "Service",
              name: "Atención Temprana",
              description:
                "Intervención temprana en neurodesarrollo infantil para niños de 0 a 6 años en Santiago.",
            },
          },
          {
            "@type": "Offer",
            url: `${BASE_URL}/agendar/adaptacion-puesto`,
            itemOffered: {
              "@type": "Service",
              name: "Adaptación de Puesto de Trabajo",
              description:
                "Evaluación y adaptación ergonómica del ambiente laboral para personas con lesiones o necesidades especiales.",
            },
          },
          {
            "@type": "Offer",
            url: `${BASE_URL}/agendar/babysitting-terapeutico`,
            itemOffered: {
              "@type": "Service",
              name: "Babysitting Terapéutico",
              description:
                "Cuidado especializado de niños con enfoque terapéutico ocupacional a domicilio en Santiago.",
            },
          },
        ],
      },
    },
    {
      "@type": "Person",
      "@id": `${BASE_URL}/#barbara`,
      name: "Bárbara Alarcón Villafaña",
      jobTitle: "Terapeuta Ocupacional",
      description:
        "Terapeuta Ocupacional titulada de la Universidad Mayor. Especialista en neurodesarrollo infantil, alimentación y bilingüismo.",
      worksFor: { "@id": `${BASE_URL}/#business` },
      alumniOf: [{ "@type": "CollegeOrUniversity", name: "Universidad Mayor" }],
      image: `${BASE_URL}/barbara.jpg`,
      url: BASE_URL,
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Terapia en Fácil",
      description:
        "Plataforma de agenda online para terapia ocupacional en Santiago, Chile.",
      publisher: { "@id": `${BASE_URL}/#business` },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Necesito una derivación médica para agendar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Puedes agendar directamente desde la web sin necesidad de una orden médica. Si tu Isapre o Fonasa requiere derivación para reembolso, te puedo orientar en la primera sesión.",
          },
        },
        {
          "@type": "Question",
          name: "¿Las sesiones son presenciales u online?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Las sesiones de Atención Temprana y Babysitting Terapéutico son presenciales a domicilio en Santiago. La Adaptación de Puesto de Trabajo puede ser presencial o híbrida según el caso.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué pasa si mi hijo no coopera en la sesión?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Es completamente normal. Trabajo con un enfoque lúdico y centrado en el vínculo, así que las primeras sesiones son de exploración y confianza. No hay presión. Cada niño tiene su ritmo y lo respeto.",
          },
        },
        {
          "@type": "Question",
          name: "¿Puedo cancelar o reagendar mi cita?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí, puedes cancelar o reagendar sin costo hasta 24 horas antes de tu cita. Recibirás un email de confirmación con las instrucciones.",
          },
        },
        {
          "@type": "Question",
          name: "¿Atienden por Fonasa o Isapre?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Emito boleta de honorarios que puedes presentar a tu Isapre para reembolso. El valor de cobertura depende de tu plan. No atiendo directamente por Fonasa, pero puedo orientarte.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cuántas sesiones necesita mi hijo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Depende de cada caso. En la primera sesión de evaluación conversamos los objetivos y te doy una estimación. Algunos casos se resuelven en 4-6 sesiones, otros requieren un proceso más largo.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
