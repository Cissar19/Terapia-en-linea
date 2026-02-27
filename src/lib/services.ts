import type { ServiceDoc } from "./firebase/types";
import { formatCLP, formatDuration } from "./format";

/** Legacy shape used by landing page components and booking flow */
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

// ── Color lookup tables (safe for Tailwind JIT) ──

const BG_MAP: Record<string, string> = {
  green: "bg-green-light",
  blue: "bg-blue-light",
  yellow: "bg-yellow-light",
  pink: "bg-pink-light",
  lavender: "bg-lavender-light",
  orange: "bg-orange/10",
};

const ACCENT_MAP: Record<string, string> = {
  green: "bg-green",
  blue: "bg-blue",
  yellow: "bg-yellow",
  orange: "bg-orange",
  pink: "bg-pink",
  lavender: "bg-lavender",
};

/** Convert a Firestore ServiceDoc to the legacy Service shape */
export function toService(doc: ServiceDoc, calUsername?: string): Service {
  const user = calUsername || process.env.NEXT_PUBLIC_CAL_USERNAME || "tu-usuario-cal";
  return {
    slug: doc.slug,
    name: doc.name,
    description: doc.description,
    price: formatCLP(doc.price),
    duration: formatDuration(doc.duration),
    bg: BG_MAP[doc.bg] || "bg-gray-100",
    accent: ACCENT_MAP[doc.accent] || "bg-gray-400",
    features: doc.features,
    calLink: `${user}/${doc.calLink}`,
  };
}

// ── Seed data (used by admin to initialize services collection) ──

export const SEED_SERVICES: Omit<ServiceDoc, "id" | "createdAt" | "updatedAt">[] = [
  {
    slug: "adaptacion-puesto",
    name: "Adaptación de Puesto de Trabajo",
    description:
      "Evaluación ergonómica y adaptaciones del entorno laboral para personas con discapacidad o condiciones de salud.",
    price: 45000,
    duration: 60,
    bg: "green",
    accent: "green",
    color: "blue",
    features: [
      "Evaluación ergonómica in-situ",
      "Informe con recomendaciones",
      "Seguimiento post-intervención",
    ],
    calLink: "adaptacion-puesto",
    assignedProfessionalId: null,
    active: true,
    order: 0,
  },
  {
    slug: "atencion-temprana",
    name: "Atención Temprana",
    description:
      "Intervención especializada para niños de 0 a 6 años con retraso en el desarrollo o riesgo de presentarlo.",
    price: 40000,
    duration: 45,
    bg: "blue",
    accent: "blue",
    color: "green",
    features: [
      "Evaluación del desarrollo infantil",
      "Plan de intervención personalizado",
      "Orientación a padres y cuidadores",
    ],
    calLink: "atencion-temprana",
    assignedProfessionalId: null,
    active: true,
    order: 1,
  },
  {
    slug: "babysitting-terapeutico",
    name: "Babysitting Terapéutico",
    description:
      "Cuidado especializado con enfoque terapéutico para niños que requieren atención profesional.",
    price: 35000,
    duration: 90,
    bg: "yellow",
    accent: "orange",
    color: "pink",
    features: [
      "Profesional a domicilio",
      "Actividades con propósito terapéutico",
      "Reporte de cada sesión",
    ],
    calLink: "babysitting-terapeutico",
    assignedProfessionalId: null,
    active: true,
    order: 2,
  },
];

/** Default duration when slug is not found */
export const DEFAULT_DURATION = 60;
