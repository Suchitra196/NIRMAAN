import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export const metadata = {
  title: "Terms & Conditions — NIRMAAN (Academic Demo)",
  description: "Terms and conditions for utilizing the NIRMAAN academic project simulation.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Terms &amp; Conditions</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Legal &amp; Scope Notice
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] font-[family:var(--font-public-sans)]">
              Terms &amp; Conditions
            </h1>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-xs">
              <strong>Academic Demonstration Clause:</strong> This application is developed solely for educational and research demonstration purposes. It does not represent an official legal service or tender solicitation of any Government body.
            </div>

            <section className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
              <h2 className="text-lg font-bold text-[#00003c]">1. Acceptance of Terms</h2>
              <p>
                By navigating or submitting data within NIRMAAN, users acknowledge that this software is an academic prototype. Users agree not to input classified government documents, authentic personal financial tokens, or sensitive non-public records.
              </p>
            </section>

            <section className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
              <h2 className="text-lg font-bold text-[#00003c]">2. Simulated Data and Non-Affiliation</h2>
              <p>
                All project figures, tender amounts, department designations, contractor names, and project records rendered within this system are simulated sample records. NIRMAAN does not possess authority to disburse state funds or issue binding contracts.
              </p>
            </section>

            <section className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
              <h2 className="text-lg font-bold text-[#00003c]">3. User Responsibilities &amp; RBAC</h2>
              <p>
                Credentials generated on this portal are for evaluation of Role-Based Access Control (RBAC). Users must refrain from attempting privilege escalation, SQL injection, or denial of service against the demonstration infrastructure.
              </p>
            </section>

            <section className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
              <h2 className="text-lg font-bold text-[#00003c]">4. Intellectual Property &amp; Open Education</h2>
              <p>
                This codebase is created under open educational guidelines to illustrate modern software engineering practices using Next.js 16, React 19, TypeScript, and Prisma ORM.
              </p>
            </section>

            <div className="pt-6 border-t border-outline-variant text-xs text-on-surface-variant flex justify-between">
              <span>Last Updated: March 2026</span>
              <Link href="/privacy" className="text-primary hover:underline">
                Review Privacy Policy &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
