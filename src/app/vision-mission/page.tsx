import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export const metadata = {
  title: "Vision & Mission — NIRMAAN (Academic Demo)",
  description: "Vision and mission statement for transparent public project management and governance.",
};

export default function VisionMissionPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Vision &amp; Mission</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Guiding Principles
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] mt-2 mb-6 font-[family:var(--font-public-sans)]">
              Vision &amp; Mission
            </h1>

            <div className="space-y-8">
              {/* Vision */}
              <div className="border-l-4 border-[#00003c] pl-6 py-2">
                <h2 className="text-xl font-bold text-[#00003c] mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#fe9832]">visibility</span>
                  Our Vision
                </h2>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  To conceptualize and demonstrate an incorruptible, digital-first public infrastructure finance architecture where every rupee allocated toward public development can be traced from sanctioned installment to verified milestone completion.
                </p>
              </div>

              {/* Mission */}
              <div className="border-l-4 border-[#fe9832] pl-6 py-2">
                <h2 className="text-xl font-bold text-[#00003c] mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#fe9832]">flag</span>
                  Our Mission
                </h2>
                <ul className="text-on-surface-variant text-sm space-y-3 list-disc pl-5 leading-relaxed">
                  <li>
                    <strong>Eliminate Fund Divergence:</strong> Implement immutable audit logs and relational database safeguards ensuring contractor claims are strictly bound to designated project budget heads.
                  </li>
                  <li>
                    <strong>Empower District Administrations:</strong> Provide standardized project tracking tools for officers across all 36 Maharashtra districts.
                  </li>
                  <li>
                    <strong>Promote Verification Integrity:</strong> Mandate tangible photographic proof and multi-officer sanctioning before payment vouchers are cleared.
                  </li>
                  <li>
                    <strong>Academic Openness:</strong> Serve as an educational benchmark for full-stack engineering students exploring public sector FinTech and e-governance systems.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-outline-variant flex flex-wrap gap-4">
              <Link
                href="/governance"
                className="px-5 py-2.5 bg-[#00003c] text-white rounded hover:bg-[#000080] transition text-sm font-medium"
              >
                Explore Governance Model
              </Link>
              <Link
                href="/about"
                className="px-5 py-2.5 border border-outline-variant text-[#00003c] rounded hover:bg-surface-container transition text-sm font-medium"
              >
                About the Architecture
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
