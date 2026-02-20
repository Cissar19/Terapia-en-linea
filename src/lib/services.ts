export interface Service {
  slug: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  bg: string;
  accent: string;
  features: string[];
  calLink: string;
}

const calUsername = process.env.NEXT_PUBLIC_CAL_USERNAME ?? "tu-usuario-cal";

export const services: Service[] = [
  {
    slug: "adaptacion-puesto",
    name: "Adaptación de Puesto de Trabajo",
    description:
      "Evaluación ergonómica y adaptaciones del entorno laboral para personas con discapacidad o condiciones de salud.",
    price: "$45.000",
    duration: "60 min",
    bg: "bg-green-light",
    accent: "bg-green",
    features: [
      "Evaluación ergonómica in-situ",
      "Informe con recomendaciones",
      "Seguimiento post-intervención",
    ],
    calLink: `${calUsername}/adaptacion-puesto`,
  },
  {
    slug: "atencion-temprana",
    name: "Atención Temprana",
    description:
      "Intervención especializada para niños de 0 a 6 años con retraso en el desarrollo o riesgo de presentarlo.",
    price: "$40.000",
    duration: "45 min",
    bg: "bg-blue-light",
    accent: "bg-blue",
    features: [
      "Evaluación del desarrollo infantil",
      "Plan de intervención personalizado",
      "Orientación a padres y cuidadores",
    ],
    calLink: `${calUsername}/atencion-temprana`,
  },
  {
    slug: "babysitting-terapeutico",
    name: "Babysitting Terapéutico",
    description:
      "Cuidado especializado con enfoque terapéutico para niños que requieren atención profesional.",
    price: "$35.000",
    duration: "90 min",
    bg: "bg-yellow-light",
    accent: "bg-orange",
    features: [
      "Profesional a domicilio",
      "Actividades con propósito terapéutico",
      "Reporte de cada sesión",
    ],
    calLink: `${calUsername}/babysitting-terapeutico`,
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
