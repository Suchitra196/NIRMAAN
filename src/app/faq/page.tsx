"use client";

import React, { useState } from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

interface FAQItem {
  q: string;
  a: string;
  category: "General" | "Officers" | "Contractors";
}

const FAQS: FAQItem[] = [
  {
    category: "General",
    q: "Is NIRMAAN an official government website?",
    a: "No. NIRMAAN is an academic engineering demonstration project built to illustrate best practices in public finance tracking and multi-tier approval workflows. All data shown is simulated.",
  },
  {
    category: "General",
    q: "How many districts does the platform support?",
    a: "NIRMAAN covers all 36 administrative districts of Maharashtra, organized into 6 regional divisions (Konkan, Pune, Nashik, Chhatrapati Sambhajinagar, Amravati, and Nagpur).",
  },
  {
    category: "Officers",
    q: "How do new officers gain system access?",
    a: "Officers submit a registration request via the /register portal with their departmental details. The account enters PENDING_APPROVAL status until verified and activated by an Administrator.",
  },
  {
    category: "Officers",
    q: "How does the two-tier financial control work?",
    a: "Before a project can pay out funds, the supervising department must record an Installment allocation. Contractor payment requests are matched against these available allocations, preventing budget overruns.",
  },
  {
    category: "Contractors",
    q: "Can contractors register directly on the portal?",
    a: "Yes, contractors can register at /register by specifying their organization and license details. Accounts require administrator review before milestone claim submissions are enabled.",
  },
  {
    category: "Contractors",
    q: "What proof is required for payment request claims?",
    a: "Contractors must provide a detailed work summary, specify the associated project milestone, and attach supporting documentation or photographic proofs of completed work.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered =
    activeCategory === "All"
      ? FAQS
      : FAQS.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Frequently Asked Questions</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Help &amp; Knowledge Base
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] mt-2 mb-4 font-[family:var(--font-public-sans)]">
              Frequently Asked Questions (FAQ)
            </h1>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-8">
              Find answers to commonly asked questions regarding NIRMAAN, user roles, approval workflows, and system architecture.
            </p>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 mb-8">
              {["All", "General", "Officers", "Contractors"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                    activeCategory === cat
                      ? "bg-[#00003c] text-white"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-4">
              {filtered.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={faq.q}
                    className="border border-outline-variant rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-6 py-4 text-left font-semibold text-sm text-[#00003c] flex items-center justify-between gap-4 bg-white hover:bg-surface-container transition"
                    >
                      <span>{faq.q}</span>
                      <span className="material-symbols-outlined text-base text-on-surface-variant flex-shrink-0">
                        {isOpen ? "expand_less" : "expand_more"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 py-4 bg-surface-container/30 border-t border-outline-variant text-xs md:text-sm text-on-surface-variant leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-10 p-6 bg-surface-container rounded-xl border border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-sm text-[#00003c]">Still have questions?</h2>
                <p className="text-xs text-on-surface-variant">
                  Reach out through our academic feedback channel.
                </p>
              </div>
              <Link
                href="/contact"
                className="px-5 py-2 bg-[#00003c] text-white rounded text-xs font-medium hover:bg-[#000080] transition whitespace-nowrap"
              >
                Contact Academic Team
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
