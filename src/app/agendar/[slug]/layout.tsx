import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://terapiaenfacil.cl";

const SERVICE_META: Record<string, { name: string; description: string }> = {
  "adaptacion-puesto": {
    name: "Adaptación de Puesto de Trabajo",
    description:
      "Agenda tu sesión de Adaptación de Puesto con Bárbara Alarcón, Terapeuta Ocupacional en Santiago. Evaluación ergonómica y plan de intervención personalizado. Pago seguro con Webpay.",
  },
  "atencion-temprana": {
    name: "Atención Temprana",
    description:
      "Agenda tu sesión de Atención Temprana en neurodesarrollo infantil con Bárbara Alarcón, Terapeuta Ocupacional en Santiago. A domicilio. Pago seguro con Webpay.",
  },
  "babysitting-terapeutico": {
    name: "Babysitting Terapéutico",
    description:
      "Agenda tu sesión de Babysitting Terapéutico con Bárbara Alarcón, Terapeuta Ocupacional en Santiago. Cuidado especializado a domicilio. Pago seguro con Webpay.",
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICE_META[slug];

  if (!service) return { title: "Agendar Sesión" };

  return {
    title: `Agendar ${service.name}`,
    description: service.description,
    alternates: { canonical: `${BASE_URL}/agendar/${slug}` },
    openGraph: {
      title: `Agendar ${service.name} — Terapia en Fácil`,
      description: service.description,
      url: `${BASE_URL}/agendar/${slug}`,
    },
  };
}

export default function AgendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
