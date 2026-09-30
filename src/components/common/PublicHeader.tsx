"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 bg-white border-b border-outline-variant shadow-xs z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <span
            className="material-symbols-outlined text-[#00003c]"
            style={{ fontSize: 32 }}
            aria-hidden="true"
          >
            shield
          </span>
          <div>
            <div className="text-[#00003c] font-bold text-lg leading-tight font-[family:var(--font-public-sans)]">
              NIRMAAN
            </div>
            <div className="text-[#00003c] text-[11px] opacity-75">
              Government Projects Finance Management System
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#00003c]">
          <Link href="/about" className="hover:text-[#000080] transition">
            About
          </Link>
          <Link href="/governance" className="hover:text-[#000080] transition">
            Governance
          </Link>
          <Link href="/locations" className="hover:text-[#000080] transition">
            36 Districts
          </Link>
          <Link href="/tenders" className="hover:text-[#000080] transition">
            Tenders
          </Link>
          <Link href="/circulars" className="hover:text-[#000080] transition">
            Circulars
          </Link>
          <Link href="/downloads" className="hover:text-[#000080] transition">
            Downloads
          </Link>
          <Link href="/faq" className="hover:text-[#000080] transition">
            FAQs
          </Link>
          <Link href="/contact" className="hover:text-[#000080] transition">
            Contact
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-1.5 border border-[#00003c] text-[#00003c] rounded hover:bg-surface-container transition text-sm font-medium"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.5 bg-[#00003c] text-white rounded hover:bg-[#000080] transition text-sm font-medium"
          >
            Sign Up
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="lg:hidden p-1.5 text-[#00003c] hover:bg-surface-container rounded"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-outline-variant bg-white px-4 py-3 space-y-2 text-sm font-medium text-[#00003c]">
          <Link href="/about" onClick={() => setMenuOpen(false)} className="block py-1.5">
            About NIRMAAN
          </Link>
          <Link href="/vision-mission" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Vision &amp; Mission
          </Link>
          <Link href="/governance" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Governance &amp; RBAC
          </Link>
          <Link href="/locations" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Maharashtra (36 Districts)
          </Link>
          <Link href="/tenders" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Tenders &amp; Opportunities
          </Link>
          <Link href="/circulars" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Circulars &amp; Guidelines
          </Link>
          <Link href="/downloads" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Downloads &amp; Forms
          </Link>
          <Link href="/rti" onClick={() => setMenuOpen(false)} className="block py-1.5">
            RTI Transparency
          </Link>
          <Link href="/faq" onClick={() => setMenuOpen(false)} className="block py-1.5">
            FAQs &amp; Help
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Contact &amp; Grievances
          </Link>
          <Link href="/sitemap" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Sitemap
          </Link>
        </div>
      )}
    </header>
  );
}
