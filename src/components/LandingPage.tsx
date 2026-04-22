import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StickyBookingBar from "@/components/booking/StickyBookingBar";
import BuiltDifferent from "@/components/BuiltDifferent";
import AlertSigns from "@/components/AlertSigns";
import Specialist from "@/components/Specialist";
import VideoReel from "@/components/VideoReel";
import DividerArt from "@/components/DividerArt";
import DevelopmentWindow from "@/components/DevelopmentWindow";
import InactionCost from "@/components/InactionCost";
import ServiceQuiz from "@/components/ServiceQuiz";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import FirstSession from "@/components/FirstSession";
import Testimonials from "@/components/Testimonials";
import Privacy from "@/components/Privacy";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <Navbar />
      <Hero />
      <StickyBookingBar />
      {/* 1. Nombrar el dolor */}
      <BuiltDifferent />
      {/* 2. Reconocimiento específico: ¿mi hijo tiene estas señales? */}
      <AlertSigns />
      {/* 3. Consecuencias de esperar — urgencia sin alarmar */}
      <InactionCost />
      {/* 4. Generar confianza — Bárbara antes que los precios */}
      <Specialist />
      {/* 3. Prueba social en video */}
      <VideoReel />
      {/* 4. Mostrar la transformación */}
      <DividerArt />
      {/* 5. Urgencia basada en evidencia: ventana de neurodesarrollo */}
      <DevelopmentWindow />
      {/* 6. Quiz: encuentra tu servicio en 3 preguntas */}
      <ServiceQuiz />
      {/* 5. Servicios — para quienes quieren ver detalles y precios */}
      <Services />
      {/* 8. Cómo funciona — bajar la fricción */}
      <HowItWorks />
      {/* 9. Qué pasa exactamente en la primera sesión */}
      <FirstSession />
      {/* 10. Prueba social */}
      <Testimonials />
      {/* 8. Resolver objeciones prácticas */}
      <Privacy />
      {/* 9. Resolver las últimas dudas */}
      <FAQ />
      {/* 10. CTA final */}
      <CTA />
      <Footer />
      {/* Flotante: escape de baja fricción para los que tienen dudas */}
      <WhatsAppButton />
    </main>
  );
}
