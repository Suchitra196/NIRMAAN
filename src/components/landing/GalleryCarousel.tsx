"use client";

import { useRef } from "react";
import { LANDING_IMAGES } from "@/lib/images";

const GALLERY_LOCATIONS = [
  "Pune District",
  "Nashik District",
  "Aurangabad District",
  "Nagpur District",
  "Satara District",
  "Kolhapur District",
];

export default function GalleryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll gallery left"
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-outline-variant flex items-center justify-center hover:bg-surface-container transition"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {LANDING_IMAGES.gallery.map((item, i) => (
          <div
            key={item.slot}
            data-image-slot={item.slot}
            className="flex-shrink-0 w-[280px] rounded-xl overflow-hidden shadow-sm border border-outline-variant bg-white hover:shadow-md transition group"
          >
            {/* Image area */}
            <div className="w-full h-44 relative overflow-hidden">
              {item.src ? (
                <img
                  src={item.src}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-surface-container-high flex flex-col items-center justify-center gap-2 text-on-surface-variant/40 group-hover:bg-surface-container transition">
                  <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
                    photo_camera
                  </span>
                  <span className="text-xs uppercase tracking-wider">{item.label}</span>
                </div>
              )}
            </div>
            {/* Card body */}
            <div className="p-4">
              <h3 className="font-semibold text-[#00003c] font-[family:var(--font-public-sans)] mb-1">
                {item.label}
              </h3>
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  location_on
                </span>
                {GALLERY_LOCATIONS[i]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll gallery right"
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-outline-variant flex items-center justify-center hover:bg-surface-container transition"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
