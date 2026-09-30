"use client";

import React, { useState } from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    district: "Pune",
    subject: "Academic Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Contact &amp; Grievances</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Feedback &amp; Inquiries
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] mt-2 mb-4 font-[family:var(--font-public-sans)]">
              Contact &amp; Grievance Redressal
            </h1>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-8">
              Submit feedback, academic queries, or simulated grievance tickets regarding public projects monitored through NIRMAAN.
            </p>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center max-w-lg mx-auto">
                <span className="material-symbols-outlined text-green-600 text-5xl mb-3">
                  mark_email_read
                </span>
                <h2 className="text-xl font-bold text-green-900 mb-2">Message Recorded</h2>
                <p className="text-xs text-green-800 leading-relaxed mb-6">
                  Thank you for submitting your simulated inquiry. As an academic prototype, tickets are logged into simulated test queues.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 bg-[#00003c] text-white rounded text-xs font-medium hover:bg-[#000080] transition"
                >
                  Submit Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Anjali Patil"
                      className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="anjali@example.com"
                      className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-district" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      District Jurisdiction
                    </label>
                    <select
                      id="contact-district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#000080]"
                    >
                      <option value="Pune">Pune</option>
                      <option value="Mumbai Suburban">Mumbai Suburban</option>
                      <option value="Nagpur">Nagpur</option>
                      <option value="Nashik">Nashik</option>
                      <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                      <option value="Amravati">Amravati</option>
                      <option value="Other">Other (All 36 Districts)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#000080]"
                    >
                      <option value="Academic Inquiry">Academic Inquiry / Research</option>
                      <option value="Simulated Grievance">Project Progress Grievance (Sample)</option>
                      <option value="Technical Feedback">System Architecture / Bug Report</option>
                      <option value="Contractor Question">Contractor Onboarding Query</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-msg" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Message / Grievance Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-msg"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry or simulated grievance ticket..."
                    className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00003c] text-white rounded-lg hover:bg-[#000080] transition text-sm font-semibold flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
