import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";
import DownloadButton from "@/components/common/DownloadButton";

export const metadata = {
  title: "Downloads & Resources — NIRMAAN (Academic Demo)",
  description: "Download sample project templates, inspection forms, and user manuals.",
};

const DOWNLOADS = [
  {
    title: "Contractor Payment Claim Submission Template",
    category: "Forms & Templates",
    format: "PDF (180 KB)",
    description: "Standard milestone claim voucher format with photographic proof declaration.",
  },
  {
    title: "NIRMAAN System Architecture & API Documentation",
    category: "Technical Manuals",
    format: "PDF (2.4 MB)",
    description: "Full-stack schema design, RBAC specifications, and Next.js serverless route documentation.",
  },
  {
    title: "District Officer Milestone Verification Checklist",
    category: "Guidelines",
    format: "PDF (210 KB)",
    description: "Inspection criteria for approving stage installments and milestone deliverables.",
  },
  {
    title: "Empanelment Application Sample Document",
    category: "Forms & Templates",
    format: "DOCX (95 KB)",
    description: "Sample format for contractor firm registration and technical capacity declaration.",
  },
  {
    title: "Maharashtra 36 Districts Administrative Reference List",
    category: "Data Reference",
    format: "CSV (45 KB)",
    description: "Reference catalog of all 36 districts grouped by division with census codes.",
  },
];

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Downloads &amp; Resources</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Resource Repository
            </span>
            <h1 className="text-3xl font-bold text-[#00003c] mt-1 mb-4 font-[family:var(--font-public-sans)]">
              Downloads &amp; Templates
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              Access educational documentation, sample verification checklists, and prototype templates used throughout the NIRMAAN infrastructure lifecycle.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {DOWNLOADS.map((item) => (
                <div
                  key={item.title}
                  className="p-5 border border-outline-variant rounded-xl flex flex-col justify-between hover:border-outline transition bg-surface-container/20"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-2">
                      <span className="bg-surface-container px-2 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                      <span className="font-mono text-primary">{item.format}</span>
                    </div>
                    <h2 className="text-sm font-bold text-[#00003c] mb-1.5">
                      {item.title}
                    </h2>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant">Simulated Academic Resource</span>
                    <DownloadButton title={item.title} />
                  </div>
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
