"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LANDING_IMAGES } from "@/lib/images";
import Image from "next/image";

const slides = LANDING_IMAGES.hero;

const SLIDE_CAPTIONS = [
  {
    title: "Building Maharashtra's Future",
    subtitle: "Empowering Zilla Parishads with transparent, digital project management",
  },
  {
    title: "Transforming Infrastructure",
    subtitle: "Real-time tracking of government projects across every district",
  },
  {
    title: "Digital Governance, Delivered",
    subtitle: "Seamless coordination between officers, contractors and administration",
  },
];

const GRADIENTS = [
  "from-[#00003c] via-[#000080] to-[#00003c]",
  "from-[#00003c] via-[#012900] to-[#00003c]",
  "from-[#00003c] via-[#6d3a00] to-[#00003c]",
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
  }, []);

  useEffect(() => {
    if (!paused) startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, startInterval]);

  const goTo = (index: number) => {
    setCurrent(index);
    if (!paused) startInterval();
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  return (
    <section className="relative w-full h-[480px] overflow-hidden" aria-label="Hero Carousel">
      {slides.map((slide, i) => (
        <div
          key={slide.slot}
          data-image-slot={slide.slot}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {slide.src ? (
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              className="object-cover"
              priority={i === 0}
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${GRADIENTS[i]} flex flex-col items-center justify-center`}
            >
              {/* Camera placeholder icon */}
              <div className="flex flex-col items-center gap-2 text-white/30 mb-8">
                <span className="material-symbols-outlined" style={{ fontSize: 64 }}>
                  photo_camera
                </span>
                <span className="text-sm uppercase tracking-widest">{slide.label}</span>
              </div>
            </div>
          )}

          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

          {/* Caption */}
          <div className="absolute bottom-20 left-0 right-0 px-6 md:px-20 z-20">
            <div className="max-w-3xl">
              <h1 className="text-white text-3xl md:text-5xl font-bold font-[family:var(--font-public-sans)] mb-3 drop-shadow-lg">
                {SLIDE_CAPTIONS[i].title}
              </h1>
              <p className="text-white/85 text-base md:text-lg font-[family:var(--font-inter)] drop-shadow">
                {SLIDE_CAPTIONS[i].subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Arrow controls */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 transition flex items-center justify-center text-white backdrop-blur-sm"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 transition flex items-center justify-center text-white backdrop-blur-sm"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      {/* Bottom controls */}
      <div className="absolute bottom-5 left-0 right-0 z-30 flex items-center justify-center gap-4">
        {/* Dot indicators */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all rounded-full ${
                i === current ? "w-6 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Pause/play */}
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play carousel" : "Pause carousel"}
          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 transition flex items-center justify-center text-white backdrop-blur-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            {paused ? "play_arrow" : "pause"}
          </span>
        </button>
      </div>
    </section>
  );
}
