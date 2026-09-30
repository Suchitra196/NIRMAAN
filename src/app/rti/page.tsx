import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export const metadata = {
  title: "RTI Transparency Disclosure — NIRMAAN (Academic Demo)",
  description: "Proactive public disclosure model under the spirit of the Right to Information Act.",
};

export default function RTIPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">RTI Information</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Transparency &amp; Open Governance
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] font-[family:var(--font-public-sans)]">
              Right to Information (RTI) Transparency Model
            </h1>

            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
              In accordance with Section 4(1)(b) of the Right to Information (RTI) Act, 2005, public authorities are encouraged to proactively publish project allocations and expenditure records so that citizens require minimum recourse to formal RTI petitions.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-surface-container/30 rounded-xl border border-outline-variant">
                <h2 className="text-sm font-bold text-[#00003c] mb-1.5">1. Proactive Budget Disclosure</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Every sanctioned project published on NIRMAAN displays its total planned budget, tender value, executing contractor, and cumulative actual expenditure calculated via verified installments.
                </p>
              </div>

              <div className="p-4 bg-surface-container/30 rounded-xl border border-outline-variant">
                <h2 className="text-sm font-bold text-[#00003c] mb-1.5">2. Milestone-Level Transparency</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Citizens can view milestone statuses (Pending, In Progress, Completed) across all 36 Maharashtra districts on the public Locations portal without creating an account.
                </p>
              </div>

              <div className="p-4 bg-surface-container/30 rounded-xl border border-outline-variant">
                <h2 className="text-sm font-bold text-[#00003c] mb-1.5">3. Simulated Public Information Officer (PIO)</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  For academic evaluation of grievance workflows, questions regarding data modeling may be routed to the academic research team via the Contact portal.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant flex flex-wrap gap-4 items-center justify-between text-xs text-on-surface-variant">
              <span>Academic Prototype Simulation &bull; Non-governmental</span>
              <Link href="/locations" className="text-primary hover:underline font-semibold">
                Explore Project Data by District &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
