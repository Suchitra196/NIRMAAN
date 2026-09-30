import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export const metadata = {
  title: "Accessibility Statement — NIRMAAN (Academic Demo)",
  description: "Accessibility commitment and WCAG 2.1 AA conformance details for the NIRMAAN platform.",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Accessibility</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Universal Access
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] font-[family:var(--font-public-sans)]">
              Accessibility Statement (WCAG 2.1 AA)
            </h1>

            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
              NIRMAAN is committed to digital inclusion, ensuring that citizens, officers, and contractors with diverse physical and cognitive abilities can navigate public project data effectively.
            </p>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-surface-container/40 rounded-xl border border-outline-variant">
                <h2 className="font-bold text-sm text-[#00003c] mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">keyboard</span>
                  Full Keyboard Navigation
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  All interactive elements, buttons, modals, dropdowns, and pagination controls support standard <kbd className="bg-white px-1.5 py-0.5 rounded border border-outline-variant text-[10px]">Tab</kbd>, <kbd className="bg-white px-1.5 py-0.5 rounded border border-outline-variant text-[10px]">Enter</kbd>, and <kbd className="bg-white px-1.5 py-0.5 rounded border border-outline-variant text-[10px]">Space</kbd> key navigation with visible focus rings.
                </p>
              </div>

              <div className="p-4 bg-surface-container/40 rounded-xl border border-outline-variant">
                <h2 className="font-bold text-sm text-[#00003c] mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">contrast</span>
                  High Contrast &amp; Font Sizing
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Color contrast ratios across text and actionable elements meet or exceed the 4.5:1 ratio mandated by WCAG 2.1 Level AA standards. Text sizing controls are provided in the utility bar.
                </p>
              </div>

              <div className="p-4 bg-surface-container/40 rounded-xl border border-outline-variant">
                <h2 className="font-bold text-sm text-[#00003c] mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">screen_search_desktop</span>
                  Screen Reader Compatibility
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Semantic HTML5 landmarks (&lt;main&gt;, &lt;header&gt;, &lt;nav&gt;, &lt;footer&gt;), descriptive aria-labels, and meaningful alt tags are implemented across all pages.
                </p>
              </div>

              <div className="p-4 bg-surface-container/40 rounded-xl border border-outline-variant">
                <h2 className="font-bold text-sm text-[#00003c] mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">translate</span>
                  Bilingual Context (English &amp; Marathi)
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Administrative division names and public sector terms incorporate dual-language identifiers to assist local stakeholders across rural and urban Maharashtra.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant text-xs text-on-surface-variant">
              Notice an accessibility barrier? Please report it via our <Link href="/contact" className="text-primary hover:underline font-semibold">Contact &amp; Feedback Form</Link>.
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
