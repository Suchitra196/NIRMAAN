import React from "react";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-[#00003c] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#fe9832] text-3xl" aria-hidden="true">
                shield
              </span>
              <div>
                <span className="font-bold text-lg font-[family:var(--font-public-sans)] tracking-wide">
                  NIRMAAN
                </span>
                <div className="text-xs text-white/60">Government Projects Finance Management System</div>
              </div>
            </Link>
            <p className="text-xs text-white/70 leading-relaxed mb-4 max-w-sm font-[family:var(--font-inter)]">
              An academic prototype designed to demonstrate multi-tier public project financial tracking, installment releases, milestone verification, and fraud prevention across 36 districts of Maharashtra.
            </p>
            <div className="inline-block bg-white/10 rounded px-2.5 py-1 text-[11px] text-amber-300">
              🎓 Academic Demonstration &bull; Simulated Public Data
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fe9832] mb-3">
              About &amp; Model
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <Link href="/about" className="hover:text-white transition">About NIRMAAN</Link>
              </li>
              <li>
                <Link href="/vision-mission" className="hover:text-white transition">Vision &amp; Mission</Link>
              </li>
              <li>
                <Link href="/governance" className="hover:text-white transition">Governance &amp; RBAC</Link>
              </li>
              <li>
                <Link href="/locations" className="hover:text-white transition">36 Maharashtra Districts</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">Frequently Asked Questions</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fe9832] mb-3">
              Resources &amp; Notice
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <Link href="/tenders" className="hover:text-white transition">Simulated Tenders</Link>
              </li>
              <li>
                <Link href="/circulars" className="hover:text-white transition">Circulars &amp; Directives</Link>
              </li>
              <li>
                <Link href="/downloads" className="hover:text-white transition">Downloads &amp; Forms</Link>
              </li>
              <li>
                <Link href="/rti" className="hover:text-white transition">RTI Transparency Info</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">Contact &amp; Grievances</Link>
              </li>
            </ul>
          </div>

          {/* Portals & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#fe9832] mb-3">
              Portals &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <Link href="/login" className="hover:text-white transition">Officer &amp; Contractor Login</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition">Request Account (Sign Up)</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-white transition">Accessibility Statement</Link>
              </li>
              <li>
                <Link href="/sitemap" className="hover:text-white transition">Sitemap</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>
            &copy; NIRMAAN (GPOMS) &bull; Academic Research Project Prototype &bull; Non-governmental simulation.
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/accessibility" className="hover:text-white transition">Accessibility</Link>
            <Link href="/sitemap" className="hover:text-white transition">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
