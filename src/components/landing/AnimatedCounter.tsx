"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  format?: (n: number) => string;
  label: string;
  icon: string;
  color: string;
}

export default function AnimatedCounter({
  target,
  duration = 1800,
  format,
  label,
  icon,
  color,
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const startTime = performance.now();

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  const displayValue = format ? format(value) : value.toLocaleString("en-IN");

  return (
    <div
      ref={elementRef}
      className="bg-white rounded-xl shadow-sm border border-outline-variant p-6 flex flex-col items-center text-center hover:shadow-md transition group"
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${color}`}
      >
        <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>
          {icon}
        </span>
      </div>
      <div className="text-3xl md:text-4xl font-bold font-[family:var(--font-public-sans)] text-[#00003c] mb-1">
        {displayValue}
      </div>
      <div className="text-sm font-[family:var(--font-inter)] text-on-surface-variant">
        {label}
      </div>
    </div>
  );
}
