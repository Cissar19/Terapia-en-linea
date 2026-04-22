import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServicesProvider } from "@/contexts/ServicesContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  variable: "--font-dm-serif",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://terapiaenfacil.cl";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Terapia en Fácil — Terapeuta Ocupacional en Santiago, Chile",
    template: "%s | Terapia en Fácil",
  },
  description:
    "Terapeuta Ocupacional especializada en neurodesarrollo infantil en Santiago, Chile. Servicios de Atención Temprana, Adaptación de Puesto y Babysitting Terapéutico. Agenda online con pago seguro Webpay.",
  keywords: [
    "terapia ocupacional",
    "terapeuta ocupacional",
    "terapia ocupacional Santiago",
    "terapia ocupacional Chile",
    "atención temprana infantil",
    "neurodesarrollo infantil",
    "adaptación puesto de trabajo",
    "babysitting terapéutico",
    "terapia ocupacional infantil",
    "integración sensorial",
    "TEA terapia ocupacional",
  ],
  authors: [{ name: "Bárbara Alarcón Villafaña" }],
  creator: "Bárbara Alarcón Villafaña",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: BASE_URL,
    siteName: "Terapia en Fácil",
    title: "Terapia en Fácil — Terapeuta Ocupacional en Santiago, Chile",
    description:
      "Terapeuta Ocupacional especializada en neurodesarrollo infantil. Agenda online tu hora con pago seguro Webpay.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terapia en Fácil — Terapeuta Ocupacional en Santiago, Chile",
    description:
      "Terapeuta Ocupacional especializada en neurodesarrollo infantil. Agenda online tu hora con pago seguro Webpay.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${dmSerif.variable} antialiased`}
      >
        <AuthProvider>
          <ServicesProvider>{children}</ServicesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
