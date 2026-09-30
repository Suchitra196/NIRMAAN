"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="min-h-[75vh] flex items-center justify-center bg-surface px-4 py-16"
    >
      <div className="max-w-xl w-full text-center bg-white p-8 md:p-12 rounded-xl shadow-sm border border-outline-variant">
        <div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl" aria-hidden="true">
            report_problem
          </span>
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
          Error 500
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] mt-2 mb-3 font-[family:var(--font-public-sans)]">
          Application Error
        </h1>
        <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-6 font-[family:var(--font-inter)]">
          An unexpected situation interrupted processing. You can try refreshing the action or navigating back to the portal homepage.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00003c] text-white rounded hover:bg-[#000080] transition text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-[#000080]"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              refresh
            </span>
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-outline-variant text-[#00003c] rounded hover:bg-surface-container transition text-sm font-medium"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              home
            </span>
            Return to Homepage
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-on-surface-variant hover:text-[#00003c] transition text-sm font-medium"
          >
            Report Issue
          </Link>
        </div>
      </div>
    </main>
  );
}
