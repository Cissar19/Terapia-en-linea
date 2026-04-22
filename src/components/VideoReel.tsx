"use client";

import { useEffect, useRef, useState } from "react";

interface VideoItem {
  id: string;
  title: string;
  preview: string; // 5s sin audio — para la tarjeta
  video: string;   // completo con audio — para el modal
}

const videos: VideoItem[] = [
  {
    id: "1",
    title: "Cómo trabajamos en casa",
    preview: "/videos/preview1.mp4",
    video: "/videos/video1.mp4",
  },
  {
    id: "2",
    title: "Sesión de alimentación",
    preview: "/videos/preview2.mp4",
    video: "/videos/video2.mp4",
  },
  {
    id: "3",
    title: "Atención temprana en acción",
    preview: "/videos/preview3.mp4",
    video: "/videos/video3.mp4",
  },
  {
    id: "4",
    title: "Tips para papás y mamás",
    preview: "/videos/preview4.mp4",
    video: "/videos/video4.mp4",
  },
];

function VideoModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-black rounded-3xl overflow-hidden shadow-2xl w-full"
        style={{ maxWidth: 380, aspectRatio: "9/16", maxHeight: "90vh" }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <video
          src={video.video}
          className="w-full h-full object-cover"
          controls
          autoPlay
          playsInline
        />
      </div>
    </div>
  );
}

export default function VideoReel() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (isPaused.current || !el) return;

      const cardWidth = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth + 16 // 16 = gap-4
        : 192;

      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3000);

    const pause = () => { isPaused.current = true; };
    const resume = () => { isPaused.current = false; };

    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });

    return () => {
      clearInterval(interval);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, []);

  return (
    <section className="py-24 px-6 bg-foreground overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight">
              Míranos en acción
            </h2>
            <p className="mt-2 text-white/50 text-base">
              Así es como trabajamos con cada familia
            </p>
          </div>
          <a
            href="https://www.tiktok.com/@barb.alarconv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z" />
            </svg>
            Ver más en TikTok
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Cards */}
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group flex-shrink-0 w-44 md:w-auto snap-center relative rounded-2xl overflow-hidden focus:outline-none bg-white/5"
              style={{ aspectRatio: "9/16" }}
              aria-label={`Reproducir: ${video.title}`}
            >
              {/* Preview video — muted, loop, autoplay */}
              <video
                src={video.preview}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />

              {/* Overlay oscuro + hover */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

              {/* Play */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Título */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-xs font-semibold leading-tight text-left line-clamp-2">
                  {video.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </section>
  );
}
