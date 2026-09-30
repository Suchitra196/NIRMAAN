import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export const metadata = {
  title: "Sitemap & Page Directory — NIRMAAN (Academic Demo)",
  description: "Complete sitemap of all public pages, portals, and modules in the NIRMAAN demonstration system.",
};

const SITE_SECTIONS = [
  {
    title: "Public Informational Pages",
    links: [
      { name: "Homepage", href: "/", desc: "Main portal landing page with hero banner and project insights" },
      { name: "About NIRMAAN", href: "/about", desc: "Background, architecture overview, and academic research scope" },
      { name: "Vision & Mission", href: "/vision-mission", desc: "Foundational pillars for transparent public finance" },
      { name: "Governance & RBAC", href: "/governance", desc: "Role-based separation of duties framework" },
      { name: "Locations (36 Districts)", href: "/locations", desc: "Interactive directory of all 36 Maharashtra districts" },
      { name: "FAQs & Knowledge Base", href: "/faq", desc: "Common questions for citizens, officers, and contractors" },
      { name: "Contact & Grievances", href: "/contact", desc: "Feedback form and simulated grievance registration" },
    ],
  },
  {
    title: "Resources & Documents",
    links: [
      { name: "Tenders & Opportunities", href: "/tenders", desc: "Simulated public e-procurement notifications" },
      { name: "Circulars & Guidelines", href: "/circulars", desc: "Administrative government orders and project directives" },
      { name: "Downloads & Forms", href: "/downloads", desc: "Sample forms, inspection checklists, and user manuals" },
      { name: "RTI Transparency Disclosure", href: "/rti", desc: "Proactive disclosure under the Right to Information spirit" },
    ],
  },
  {
    title: "Portals & Authentication",
    links: [
      { name: "Login Portal", href: "/login", desc: "Sign in with Credentials or Google OAuth" },
      { name: "Registration Portal", href: "/register", desc: "Apply for Officer or Contractor system access" },
      { name: "Pending Approval Notice", href: "/pending-approval", desc: "Landing page for newly registered pending accounts" },
      { name: "Initial Setup Wizard", href: "/setup", desc: "Profile designation setup for newly approved officers" },
    ],
  },
  {
    title: "Role-Based Dashboards (Guarded)",
    links: [
      { name: "Admin Dashboard", href: "/admin", desc: "User approval queue, system hierarchy, and platform analytics" },
      { name: "Officer Dashboard", href: "/officer", desc: "Project lifecycle, installment tracking, and milestone reviews" },
      { name: "Contractor Portal", href: "/contractor", desc: "Assigned projects, milestone proofs, and claim submissions" },
    ],
  },
  {
    title: "Legal & Conformance",
    links: [
      { name: "Terms & Conditions", href: "/terms", desc: "Academic prototype terms of service and simulated data clause" },
      { name: "Privacy Policy", href: "/privacy", desc: "Data protection standards and session security policies" },
      { name: "Accessibility Statement", href: "/accessibility", desc: "WCAG 2.1 AA conformance and inclusive features" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Sitemap</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Portal Navigation
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] mt-2 mb-4 font-[family:var(--font-public-sans)]">
              Site Map &amp; Page Directory
            </h1>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-8">
              A comprehensive index of all routes, public pages, documents, and authenticated role portals available across the NIRMAAN system.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {SITE_SECTIONS.map((sec) => (
                <div key={sec.title} className="p-6 bg-surface-container/20 rounded-xl border border-outline-variant">
                  <h2 className="text-base font-bold text-[#00003c] mb-4 pb-2 border-b border-outline-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">folder</span>
                    {sec.title}
                  </h2>
                  <ul className="space-y-3">
                    {sec.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm font-semibold text-[#00003c] hover:text-[#000080] hover:underline flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm text-on-surface-variant">
                            chevron_right
                          </span>
                          {link.name}
                        </Link>
                        <p className="text-xs text-on-surface-variant pl-5">
                          {link.desc}
                        </p>
                      </li>
                    ))}
                  </ul>
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
