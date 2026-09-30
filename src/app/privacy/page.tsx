import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";

export const metadata = {
  title: "Privacy Policy — NIRMAAN (Academic Demo)",
  description: "Privacy policy and data handling principles for the NIRMAAN academic prototype.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <PublicHeader />

      <main id="main-content" className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <span className="text-[#00003c] font-medium">Privacy Policy</span>
          </nav>

          <div className="bg-white border border-outline-variant rounded-2xl p-8 md:p-12 shadow-xs space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fe9832]">
              Data Protection &amp; Sessions
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00003c] font-[family:var(--font-public-sans)]">
              Privacy Policy
            </h1>

            <section className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
              <h2 className="text-lg font-bold text-[#00003c]">1. Information Collection</h2>
              <p>
                When creating an evaluation account on this demonstration site, we collect basic contact information (name, simulated email, phone number, and requested role). Passwords are never stored in plaintext; they are securely salted and hashed using bcrypt before persistence.
              </p>
            </section>

            <section className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
              <h2 className="text-lg font-bold text-[#00003c]">2. Session Authentication &amp; Cookies</h2>
              <p>
                NIRMAAN utilizes NextAuth.js stateless JSON Web Tokens (JWT) for authentication state. We store minimal necessary session cookies solely for verifying identity across protected portal routes (/admin, /officer, /contractor). No third-party behavioral tracking or commercial advertisement trackers are present.
              </p>
            </section>

            <section className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
              <h2 className="text-lg font-bold text-[#00003c]">3. Third-Party OAuth Services</h2>
              <p>
                If signing in via Google OAuth, we receive your email and profile name as authorized by your OAuth consent screen. We do not access external Google Drive data, emails, or personal contacts.
              </p>
            </section>

            <section className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
              <h2 className="text-lg font-bold text-[#00003c]">4. Data Retention &amp; Academic Scope</h2>
              <p>
                Because this database serves as an academic testing environment, test records may be purged, reseeded, or reset during migration maintenance cycles.
              </p>
            </section>

            <div className="pt-6 border-t border-outline-variant text-xs text-on-surface-variant flex justify-between">
              <span>Last Updated: March 2026</span>
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Use &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
