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
            <span className="text-base">🇮🇳</span>
            <span>Government of India</span>
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
            <a href="#" className="hover:underline">
              More
            </a>
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
            <Link href="#about" className="hover:text-[#000080] transition">
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
                  <a href="#" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    Schemes
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    FAQs
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    Grievances
                  </a>
                </div>
              )}
            </div>
            <Link href="#gallery" className="hover:text-[#000080] transition">
              Gallery
            </Link>
            <Link href="#" className="hover:text-[#000080] transition">
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
                  <a href="#" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    Guidelines
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    Downloads
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-surface-container text-sm">
                    Reports
                  </a>
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
              <a href="#about" className="block py-2">
                About Us
              </a>
              <a href="#" className="block py-2">
                Citizen Corner
              </a>
              <a href="#gallery" className="block py-2">
                Gallery
              </a>
              <a href="#" className="block py-2">
                Opportunities
              </a>
              <a href="#" className="block py-2">
                Resources
              </a>
              <hr className="border-outline-variant" />
              <Link href="/login" className="block py-2">
                Login
              </Link>
              <Link href="/register" className="block py-2">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
