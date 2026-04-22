"use client";

import Image from "next/image";
import BookingWidget from "@/components/booking/BookingWidget";

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-lavender overflow-hidden pt-24 pb-16">

      {/* Large green triangle - top left */}
      <div className="absolute top-32 left-[4%] animate-float">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <polygon points="70,8 132,125 8,125" fill="#2DC653" />
        </svg>
      </div>

      {/* Large blue circle - top right */}
      <div className="absolute top-24 right-[5%] animate-float-delayed">
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-blue" />
      </div>

      {/* Yellow square - left side */}
      <div className="absolute top-[55%] left-[3%] animate-float-slow">
        <div className="w-24 h-24 md:w-28 md:h-28 bg-yellow rounded-xl rotate-12" />
      </div>

      {/* Pink star - right */}
      <div className="absolute top-[35%] right-[4%] animate-wiggle">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <polygon
            points="50,3 60,37 95,37 67,58 78,92 50,72 22,92 33,58 5,37 40,37"
            fill="#FF6B9D"
          />
        </svg>
      </div>

      {/* Red circle - bottom left */}
      <div className="absolute bottom-36 left-[10%] animate-float-delayed">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-red" />
      </div>

      {/* Orange half circle - bottom right */}
      <div className="absolute bottom-28 right-[12%] animate-float">
        <div className="w-28 h-14 bg-orange rounded-t-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-10 xl:gap-8">

          {/* Left — text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mx-auto lg:mx-0 mb-8 w-14 h-14 rounded-full bg-foreground flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>

            {/* Approach tag */}
            <div className="mb-6 mx-auto lg:mx-0 inline-flex items-baseline flex-wrap gap-x-1.5 bg-yellow px-4 py-2 rounded-2xl text-sm text-foreground max-w-xs sm:max-w-sm lg:max-w-none">
              <span className="font-bold shrink-0">Enfoque:</span>
              <span className="font-medium">Considerando sus factores personales, ambiente familiar, necesidades y fortalezas</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-7xl xl:text-8xl text-foreground leading-[1.05] tracking-tight">
              Tu bienestar,{" "}
              <br className="hidden sm:block" />
              mi compromiso
            </h1>

            <p className="mt-6 text-base md:text-lg text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              ¿Tu hijo tiene dificultades en la alimentación, el movimiento o la adaptación
              escolar? Hay algo que puedes hacer hoy. Acompañamos a tu familia en Santiago
              con terapia ocupacional a domicilio, cálida y basada en evidencia.
            </p>

            {/* Trust badges — desktop */}
            <div className="mt-10 hidden lg:flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-gray-400 font-medium">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Santiago · A domicilio
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Pago seguro Webpay
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Confirmación instantánea
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Sin derivación médica
              </span>
              <span className="flex items-center gap-2 text-green font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                1ª sesión con garantía
              </span>
            </div>
          </div>

          {/* Center — Bárbara cutout (xl+ solo) */}
          <div className="hidden xl:flex items-end flex-shrink-0 self-end -mb-16">
            <Image
              src="/barbara-cutout.png"
              alt="Bárbara Alarcón Villafaña — Terapeuta Ocupacional"
              width={260}
              height={400}
              className="w-[220px] 2xl:w-[260px] h-auto object-contain drop-shadow-lg"
              priority
            />
          </div>

          {/* Right — Booking Widget */}
          <div className="mt-10 lg:mt-0 w-full lg:w-[420px] xl:w-[440px] flex-shrink-0">
            {/* Urgency */}
            <div className="mb-3 flex items-center justify-center lg:justify-start gap-2 text-xs text-green font-semibold">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
              </span>
              Agenda abierta esta semana · Sin lista de espera
            </div>
            <BookingWidget variant="hero" />
          </div>
        </div>

        {/* Trust badges — mobile */}
        <div className="mt-12 flex lg:hidden flex-wrap justify-center items-center gap-x-10 gap-y-4 text-sm text-gray-400 font-medium">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Santiago · A domicilio
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Pago seguro Webpay
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Confirmación instantánea
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Sin derivación médica
          </span>
          <span className="flex items-center gap-2 text-green font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            1ª sesión con garantía
          </span>
        </div>
      </div>
    </section>
  );
}
