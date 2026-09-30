"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [citizenOpen, setCitizenOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-[#00003c] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-sm">school</span>
            <span>NIRMAAN Academic Prototype — Public Finance Management</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#main" className="hover:underline">
              Skip to Main Content
            </a>
            <div className="flex items-center gap-1">
              <button aria-label="Decrease text size" className="hover:bg-white/10 px-1 rounded">
                A-
              </button>
              <button aria-label="Default text size" className="hover:bg-white/10 px-1 rounded">
                A
              </button>
              <button aria-label="Increase text size" className="hover:bg-white/10 px-1 rounded">
                A+
              </button>
            </div>
            <button aria-label="Toggle contrast" className="hover:bg-white/10 p-1 rounded">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                contrast
              </span>
            </button>
            <Link href="/sitemap" className="hover:underline">
              Sitemap
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header className="sticky top-0 bg-white shadow-md z-40">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <span className="material-symbols-outlined text-[#00003c]" style={{ fontSize: 36 }}>
              shield
            </span>
            <div>
              <div className="text-[#00003c] font-bold text-xl font-[family:var(--font-public-sans)] leading-tight">
                NIRMAAN
              </div>
              <div className="text-[#00003c] text-xs opacity-70">Project Management System</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center text-sm font-medium text-[#00003c]">
            <Link href="/about" className="hover:text-[#000080] transition">
              About Us
            </Link>
            <div className="relative">
              <button
                className="hover:text-[#000080] transition flex items-center gap-0.5"
                onMouseEnter={() => setCitizenOpen(true)}
                onMouseLeave={() => setCitizenOpen(false)}
              >
                Citizen Corner
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  arrow_drop_down
                </span>
              </button>
              {citizenOpen && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded border border-outline-variant min-w-[160px] py-1"
                  onMouseEnter={() => setCitizenOpen(true)}
                  onMouseLeave={() => setCitizenOpen(false)}
                >
                  <Link href="/tenders" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    Tenders &amp; Schemes
                  </Link>
                  <Link href="/faq" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    FAQs
                  </Link>
                  <Link href="/contact" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    Grievances &amp; Contact
                  </Link>
                </div>
              )}
            </div>
            <Link href="/locations" className="hover:text-[#000080] transition">
              Locations (36 Districts)
            </Link>
            <Link href="/tenders" className="hover:text-[#000080] transition">
              Opportunities
            </Link>
            <div className="relative">
              <button
                className="hover:text-[#000080] transition flex items-center gap-0.5"
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
              >
                Resources
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  arrow_drop_down
                </span>
              </button>
              {resourcesOpen && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded border border-outline-variant min-w-[160px] py-1"
                  onMouseEnter={() => setResourcesOpen(true)}
                  onMouseLeave={() => setResourcesOpen(false)}
                >
                  <Link href="/circulars" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    Circulars &amp; Guidelines
                  </Link>
                  <Link href="/downloads" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    Downloads &amp; Forms
                  </Link>
                  <Link href="/governance" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    Governance Model
                  </Link>
                  <Link href="/rti" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    RTI Disclosure
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container transition"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                search
              </span>
            </button>
            <Link
              href="/login"
              className="hidden md:inline-block px-4 py-1.5 border border-[#00003c] text-[#00003c] rounded hover:bg-surface-container transition text-sm font-medium"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="hidden md:inline-block px-4 py-1.5 bg-[#00003c] text-white rounded hover:bg-[#000080] transition text-sm font-medium"
            >
              Sign Up
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="md:hidden p-2"
            >
              <span className="material-symbols-outlined">
                {menuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-outline-variant bg-white">
            <div className="px-4 py-3 space-y-3 text-sm font-medium text-[#00003c]">
              <Link href="/about" onClick={() => setMenuOpen(false)} className="block py-2">
                About Us
              </Link>
              <Link href="/locations" onClick={() => setMenuOpen(false)} className="block py-2">
                Locations (36 Districts)
              </Link>
              <Link href="/tenders" onClick={() => setMenuOpen(false)} className="block py-2">
                Tenders &amp; Opportunities
              </Link>
              <Link href="/faq" onClick={() => setMenuOpen(false)} className="block py-2">
                FAQs &amp; Citizen Corner
              </Link>
              <Link href="/downloads" onClick={() => setMenuOpen(false)} className="block py-2">
                Resources &amp; Downloads
              </Link>
              <Link href="/circulars" onClick={() => setMenuOpen(false)} className="block py-2">
                Circulars &amp; Guidelines
              </Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="block py-2">
                Contact &amp; Grievances
              </Link>
              <hr className="border-outline-variant" />
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-2">
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="block py-2 text-[#fe9832] font-semibold">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
