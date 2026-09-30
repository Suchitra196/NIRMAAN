import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export const metadata = {
  title: "Tenders & Opportunities — NIRMAAN (Academic Demo)",
  description: "Simulated e-procurement notifications and works contracts across Maharashtra districts.",
};

const SAMPLE_TENDERS = [
  {
    id: "TND-2026-MH-0104",
    title: "Construction of Multi-Purpose Rural Community Hall (Panchayat Samiti)",
    district: "Satara",
    department: "Works & Construction",
    estCost: "₹ 48,50,000",
    submissionDeadline: "2026-10-15",
    status: "Active",
  },
  {
    id: "TND-2026-MH-0105",
    title: "Solar-Powered Drinking Water Supply & Pipeline Extension Scheme",
    district: "Yavatmal",
    department: "Rural Water Supply",
    estCost: "₹ 72,00,000",
    submissionDeadline: "2026-10-18",
    status: "Active",
  },
  {
    id: "TND-2026-MH-0106",
    title: "Renovation and Digitization of Zilla Parishad Primary School Complex",
    district: "Chhatrapati Sambhajinagar",
    department: "Primary Education",
    estCost: "₹ 34,20,000",
    submissionDeadline: "2026-10-22",
    status: "Active",
  },
  {
    id: "TND-2026-MH-0107",
    title: "Construction of Concrete Feeder Road & Cross-Drainage Culverts",
    district: "Sindhudurg",
    department: "Works & Construction",
    estCost: "₹ 1,12,00,000",
    submissionDeadline: "2026-10-25",
    status: "Active",
  },
  {
    id: "TND-2026-MH-0108",
    title: "Sub-District Health Center Cold-Chain Storage & Solar Backup",
    district: "Wardha",
    department: "Health & Family Welfare",
    estCost: "₹ 55,00,000",
    submissionDeadline: "2026-10-30",
    status: "Active",
  },
];

export default function TendersPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Tenders &amp; Opportunities</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
                  Simulated E-Procurement
                </span>
                <h1 className="text-3xl font-bold text-[#00003c] mt-1 font-[family:var(--font-public-sans)]">
                  Active Tenders &amp; Contracts
                </h1>
              </div>
              <Link
                href="/register"
                className="px-4 py-2 bg-[#00003c] text-white rounded text-xs font-medium hover:bg-[#000080] transition self-start sm:self-auto"
              >
                Register as Contractor &rarr;
              </Link>
            </div>

            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Empanelled contractors can review simulated e-tenders published across Maharashtra departments. Once approved, contractors can log in to claim project tasks and upload verification proofs.
            </p>

            <div className="overflow-x-auto border border-outline-variant rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#00003c] text-white">
                  <tr>
                    <th className="p-3.5 font-semibold">Tender ID</th>
                    <th className="p-3.5 font-semibold">Project Title</th>
                    <th className="p-3.5 font-semibold">District</th>
                    <th className="p-3.5 font-semibold">Department</th>
                    <th className="p-3.5 font-semibold">Est. Amount</th>
                    <th className="p-3.5 font-semibold">Deadline</th>
                    <th className="p-3.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {SAMPLE_TENDERS.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-container/30 transition">
                      <td className="p-3.5 font-mono text-[11px] text-primary font-medium">
                        {t.id}
                      </td>
                      <td className="p-3.5 font-medium text-[#00003c] max-w-xs">
                        {t.title}
                      </td>
                      <td className="p-3.5 text-on-surface-variant">{t.district}</td>
                      <td className="p-3.5 text-on-surface-variant">{t.department}</td>
                      <td className="p-3.5 font-semibold text-[#00003c]">{t.estCost}</td>
                      <td className="p-3.5 text-on-surface-variant">{t.submissionDeadline}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-semibold">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-xs text-on-surface-variant italic">
              Note: This list is illustrative simulated sample data for academic demonstration of public procurement workflows.
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
