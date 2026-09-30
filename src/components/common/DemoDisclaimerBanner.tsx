import React from "react";

interface DemoDisclaimerBannerProps {
  compact?: boolean;
}

export default function DemoDisclaimerBanner({ compact = false }: DemoDisclaimerBannerProps) {
  if (compact) {
    return (
      <aside
        aria-label="Academic Project Demonstration Notice"
        className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-1.5 text-xs flex items-center justify-between gap-2"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-amber-700 text-sm select-none" aria-hidden="true">
              school
            </span>
            <span>
              <strong>Academic Demonstration:</strong> Simulated data only. Not an official Government or Zilla Parishad portal.
            </span>
          </div>
          <span className="text-[11px] text-amber-800 hidden sm:inline">
            शैक्षणिक प्रात्यक्षिक — केवळ नमुना माहिती
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Academic Project Demonstration Notice"
      className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2 text-xs shadow-inner"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-white text-base select-none" aria-hidden="true">
            school
          </span>
          <span className="font-semibold tracking-wide">
            ACADEMIC PROJECT DEMONSTRATION ONLY
          </span>
          <span className="hidden md:inline text-amber-200">|</span>
          <span className="text-amber-100 text-[11px] sm:text-xs">
            Student &amp; Research Prototype for Public Finance Tracking. Not affiliated with Government of India, Government of Maharashtra, or any Zilla Parishad. All data is simulated.
          </span>
        </div>
        <div className="text-[11px] text-amber-200 font-medium whitespace-nowrap">
          शैक्षणिक प्रात्यक्षिक पोर्टल
        </div>
      </div>
    </aside>
  );
}
