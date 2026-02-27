"use client";

import { useParams, notFound } from "next/navigation";
import { useMemo } from "react";
import { toService } from "@/lib/services";
import { useServices } from "@/contexts/ServicesContext";
import Navbar from "@/components/Navbar";
import BookingPage from "@/components/booking/BookingPage";
import Footer from "@/components/Footer";

export default function AgendarPage() {
  const { slug } = useParams<{ slug: string }>();
  const { services, loading, getBySlug } = useServices();

  const doc = getBySlug(slug);
  const service = useMemo(() => (doc ? toService(doc) : null), [doc]);

  if (!loading && !doc) {
    notFound();
  }

  if (loading || !service) {
    return (
      <main className="overflow-hidden">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="overflow-hidden">
      <Navbar />
      <BookingPage service={service} />
      <Footer />
    </main>
  );
}
