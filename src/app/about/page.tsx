import React from "react";
import Link from "next/link";
import Image from "next/image";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export const metadata = {
  title: "About NIRMAAN — Government Projects Finance Management System (Academic Demo)",
  description: "Learn about NIRMAAN, an academic full-stack system designed to simulate transparent infrastructure finance management across Maharashtra.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">About NIRMAAN</span>
          </nav>

          {/* Hero */}
          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Background &amp; Motivation
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] mt-2 mb-4 font-[family:var(--font-public-sans)]">
              About the NIRMAAN Project
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed font-[family:var(--font-inter)] mb-6">
              NIRMAAN (Networked Infrastructure &amp; Resource Management for Administration and Nodal Authorities) is an academic research prototype engineered to address transparency, fiscal leakages, and delayed milestone tracking in public infrastructure schemes.
            </p>

            <div className="grid md:grid-cols-2 gap-8 items-center mt-8 pt-8 border-t border-outline-variant">
              <div>
                <h2 className="text-xl font-bold text-[#00003c] mb-3">The Problem We Address</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                  Government-funded rural and urban development works involve complex multi-tiered disbursement cycles. Traditional paper-based verification often results in fund delays, unverified progress claims, and siloed project tracking between district authorities and contractors.
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  NIRMAAN models a centralized ledger and workflow engine providing role-based oversight for all 36 districts of Maharashtra, demonstrating how technology can enforce accountability.
                </p>
              </div>
              <div className="relative h-64 rounded-xl overflow-hidden shadow-sm border border-outline-variant">
                <Image
                  src="/images/about.jpg"
                  alt="Infrastructure development representation"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-xs">
              <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">account_balance</span>
              </div>
              <h3 className="font-bold text-base text-[#00003c] mb-2">Two-Tier Financial Flow</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Budget installments released by departments are strictly segregated from contractor claims, ensuring payment requests cannot exceed allocated funds.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-xs">
              <div className="w-12 h-12 bg-green-100 text-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">verified</span>
              </div>
              <h3 className="font-bold text-base text-[#00003c] mb-2">Proof-Based Verification</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Every milestone claim requires photographic or geo-tagged documentary proof reviewed by an inspecting officer prior to voucher sanction.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-xs">
              <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-lg flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">security</span>
              </div>
              <h3 className="font-bold text-base text-[#00003c] mb-2">Role Separation (RBAC)</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Clear separation between Admins (system governance), Officers (departmental verification), and Contractors (milestone execution).
              </p>
            </div>
          </div>

          {/* Academic Scope Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-sm text-amber-950">
            <h3 className="font-bold text-base mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
              Academic Research Disclaimer
            </h3>
            <p className="text-xs leading-relaxed">
              NIRMAAN is created strictly for academic research and educational evaluation. It is not an official portal of the Government of India or the Government of Maharashtra. All data displayed across dashboards, tenders, and projects represents simulated sample records.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
