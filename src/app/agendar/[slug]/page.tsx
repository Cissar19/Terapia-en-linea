import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { services, getServiceBySlug } from "@/lib/services";
import Navbar from "@/components/Navbar";
import BookingPage from "@/components/booking/BookingPage";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: `Agendar ${service.name} — Terapia en facil`,
    description: `${service.description} ${service.price} por sesión de ${service.duration}.`,
  };
}

export default async function AgendarPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="overflow-hidden">
      <Navbar />
      <BookingPage service={service} />
      <Footer />
    </main>
  );
}
