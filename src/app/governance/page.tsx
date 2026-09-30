import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export const metadata = {
  title: "Governance & Separation of Duties — NIRMAAN (Academic Demo)",
  description: "Role-Based Access Control and administrative governance model in the NIRMAAN architecture.",
};

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Governance Model</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              RBAC &amp; Accountability
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] mt-2 mb-4 font-[family:var(--font-public-sans)]">
              Governance Framework
            </h1>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-8">
              NIRMAAN employs strict Role-Based Access Control (RBAC) and separation of duties to prevent single-point corruption, unauthorized budget escalation, and unverified contractor payouts.
            </p>

            <div className="space-y-6">
              {/* Role 1 */}
              <div className="p-5 border border-outline-variant rounded-xl bg-surface-container/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-red-100 text-red-900 flex items-center justify-center font-bold text-sm">
                    1
                  </span>
                  <h2 className="text-lg font-bold text-[#00003c]">Administrator (System Governor)</h2>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                  Responsible for user credential onboarding, system security, assigning departmental administrative privileges, and managing project taxonomies.
                </p>
                <div className="text-xs font-medium text-primary flex gap-4">
                  <span>&bull; Account Approvals</span>
                  <span>&bull; User Status Audits</span>
                  <span>&bull; System Hierarchy Config</span>
                </div>
              </div>

              {/* Role 2 */}
              <div className="p-5 border border-outline-variant rounded-xl bg-surface-container/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm">
                    2
                  </span>
                  <h2 className="text-lg font-bold text-[#00003c]">Departmental Officer (Supervising Authority)</h2>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                  District executive engineers and project directors who manage project creation, record budget installments from treasury allocations, inspect on-site progress, and approve or reject milestone payment requests.
                </p>
                <div className="text-xs font-medium text-primary flex gap-4">
                  <span>&bull; Project Initiation</span>
                  <span>&bull; Installment Crediting</span>
                  <span>&bull; Milestone Verification</span>
                </div>
              </div>

              {/* Role 3 */}
              <div className="p-5 border border-outline-variant rounded-xl bg-surface-container/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-900 flex items-center justify-center font-bold text-sm">
                    3
                  </span>
                  <h2 className="text-lg font-bold text-[#00003c]">Contractor / Executing Agency</h2>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                  Tender-awarded executing parties responsible for task milestones. They submit payment claim requests accompanied by inspection photographs and invoices for official review.
                </p>
                <div className="text-xs font-medium text-primary flex gap-4">
                  <span>&bull; Assigned Task Tracking</span>
                  <span>&bull; Evidence Submission</span>
                  <span>&bull; Payment Request Invoices</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
              <span>All changes are tracked via database relational audit constraints.</span>
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Apply for Access &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
