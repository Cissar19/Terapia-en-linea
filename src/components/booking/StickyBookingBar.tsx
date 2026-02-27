"use client";

import { useEffect, useMemo, useState } from "react";
import BookingWidget from "./BookingWidget";
import BookingModal from "./BookingModal";
import { toService } from "@/lib/services";
import { useServices } from "@/contexts/ServicesContext";

export default function StickyBookingBar() {
  const { services: docs } = useServices();
  const services = useMemo(() => docs.map((d) => toService(d)), [docs]);
  const [visible, setVisible] = useState(false);
  const [mobileModal, setMobileModal] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Desktop: sticky bar below navbar */}
      <div className="hidden md:block fixed top-[104px] left-0 right-0 z-[55] bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm animate-slide-down">
        <div className="mx-auto max-w-7xl px-6 py-2.5">
          <BookingWidget variant="compact" />
        </div>
      </div>

      {/* Mobile: floating button */}
      <button
        onClick={() => {
          // Scroll to hero if it's somewhat close, otherwise open modal
          const hero = document.getElementById("hero");
          if (hero) {
            const rect = hero.getBoundingClientRect();
            if (rect.bottom > -500) {
              hero.scrollIntoView({ behavior: "smooth" });
              return;
            }
          }
          setMobileModal(true);
        }}
        className="md:hidden fixed bottom-6 left-4 right-4 z-[55] flex items-center justify-center gap-2 rounded-full bg-foreground text-white shadow-2xl py-3.5 font-semibold text-base animate-slide-up"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Reserva tu hora
      </button>

      {/* Mobile modal fallback — opens with first service pre-selected */}
      {mobileModal && services[0] && (
        <BookingModal
          service={services[0]}
          onClose={() => setMobileModal(false)}
        />
      )}
    </>
  );
}
