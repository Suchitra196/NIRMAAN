import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export const metadata = {
  title: "Circulars & Guidelines — NIRMAAN (Academic Demo)",
  description: "Administrative circulars, regulatory guidelines, and project norms.",
};

const CIRCULARS = [
  {
    refNo: "CIR/2026/FIN-019",
    date: "2026-03-12",
    title: "Mandatory Geo-Tagged Photographic Proof for Milestone Verification under NIRMAAN",
    department: "Accounts & Finance",
    category: "Financial Compliance",
  },
  {
    refNo: "CIR/2026/WKS-042",
    date: "2026-02-28",
    title: "Updated Schedule of Rates (DSR) Guidelines for Rural Infrastructure Construction",
    department: "Works & Construction",
    category: "Technical Standards",
  },
  {
    refNo: "CIR/2026/RWS-011",
    date: "2026-02-15",
    title: "Quality Assurance Benchmarks for Har Ghar Jal Water Supply Projects",
    department: "Rural Water Supply",
    category: "Quality Assurance",
  },
  {
    refNo: "CIR/2026/ADM-005",
    date: "2026-01-20",
    title: "Delegation of Financial Powers and Two-Tier Approval Hierarchy for Executive Engineers",
    department: "District Administration",
    category: "Administrative Powers",
  },
];

export default function CircularsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Circulars &amp; Guidelines</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Administrative Orders
            </span>
            <h1 className="text-3xl font-bold text-[#00003c] mt-1 mb-4 font-[family:var(--font-public-sans)]">
              Circulars &amp; Directives
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              Sample administrative orders and technical directives governing milestone audits, installment releases, and quality assurance standards across participating departments.
            </p>

            <div className="space-y-4">
              {CIRCULARS.map((c) => (
                <div
                  key={c.refNo}
                  className="p-5 border border-outline-variant rounded-xl hover:border-outline transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                      <span className="font-mono text-primary font-semibold">{c.refNo}</span>
                      <span>&bull;</span>
                      <span>{c.date}</span>
                      <span>&bull;</span>
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] font-medium">
                        {c.category}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-[#00003c]">
                      {c.title}
                    </h2>
                    <div className="text-xs text-on-surface-variant">
                      Issuing Department: <strong>{c.department}</strong>
                    </div>
                  </div>

                  <Link
                    href="/downloads"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline whitespace-nowrap self-start sm:self-center"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Sample PDF
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
