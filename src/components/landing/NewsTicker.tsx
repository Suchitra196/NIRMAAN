"use client";

import { useState, useEffect, useRef } from "react";

interface Announcement {
  id: string;
  text: string;
}

interface NewsTickerProps {
  announcements: Announcement[];
}

export default function NewsTicker({ announcements }: NewsTickerProps) {
  const [paused, setPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    if (paused) {
      el.style.animationPlayState = "paused";
    } else {
      el.style.animationPlayState = "running";
    }
  }, [paused]);

  const tickerText = announcements.map((a) => a.text).join("   ✦   ");

  return (
    <div className="w-full bg-[#000080] text-white overflow-hidden" role="marquee" aria-label="Announcements">
      <div className="flex items-stretch">
        {/* Label */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-[#fe9832] text-[#00003c] px-4 py-2 font-bold text-sm uppercase tracking-wide">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            campaign
          </span>
          What&apos;s New
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume ticker" : "Pause ticker"}
            className="ml-1 opacity-80 hover:opacity-100 transition"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {paused ? "play_arrow" : "pause"}
            </span>
          </button>
        </div>

        {/* Scrolling text */}
        <div className="flex-1 overflow-hidden py-2 relative">
          <div
            ref={marqueeRef}
            className="whitespace-nowrap text-sm font-[family:var(--font-inter)] animate-ticker inline-block"
            style={{
              animation: "ticker 35s linear infinite",
            }}
          >
            {tickerText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}
          </div>
        </div>

        {/* View all */}
        <a
          href="/login"
          className="flex-shrink-0 flex items-center gap-1 bg-white/10 hover:bg-white/20 transition px-4 text-sm font-medium border-l border-white/20"
        >
          View All
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            arrow_forward
          </span>
        </a>
      </div>

      <style jsx>{`
        @keyframes ticker {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
