import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StickyBookingBar from "@/components/booking/StickyBookingBar";
import BuiltDifferent from "@/components/BuiltDifferent";
import Specialist from "@/components/Specialist";
import Services from "@/components/Services";
import DividerArt from "@/components/DividerArt";
import HowItWorks from "@/components/HowItWorks";
import Privacy from "@/components/Privacy";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <Navbar />
      <Hero />
      <StickyBookingBar />
      <BuiltDifferent />
      <DividerArt />
      <Services />
      <Specialist />
      <HowItWorks />
      <Testimonials />
      <Privacy />
      <CTA />
      <Footer />
    </main>
  );
}
