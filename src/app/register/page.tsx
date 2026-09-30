"use client";

import React, { useState } from "react";
import Link from "next/link";
export default function RegisterPage() {

  const [role, setRole] = useState<"OFFICER" | "CONTRACTOR">("OFFICER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("WORKS_CONSTRUCTION");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email && !phone) {
      setError("Please provide at least an email address or mobile number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Include designation/org details with name or note if relevant
      const displayName =
        role === "OFFICER" && designation
          ? `${name.trim()} (${designation})`
          : role === "CONTRACTOR" && organization
          ? `${name.trim()} - ${organization}`
          : name.trim();

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          password,
          requestedRole: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit registration request.");
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      {/* Top Banner */}
      <header className="bg-white border-b border-outline-variant py-4 px-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
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
              <div className="text-[#00003c] text-xs opacity-75">
                Government Projects Finance Management System
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-on-surface-variant hidden sm:inline">
              Already have an account?
            </span>
            <Link
              href="/login"
              className="px-4 py-1.5 border border-[#00003c] text-[#00003c] rounded hover:bg-surface-container transition text-sm font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main id="main-content" className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {isSuccess ? (
            <div className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl" aria-hidden="true">
                  check_circle
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[#00003c] mb-2 font-[family:var(--font-public-sans)]">
                Registration Request Submitted
              </h1>
              <div className="inline-block bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-4">
                Status: PENDING_APPROVAL
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-[family:var(--font-inter)] max-w-lg mx-auto">
                Thank you for applying. As a multi-tier governance platform, your account request for the role of{" "}
                <strong>{role}</strong> has been placed into the administrative review queue. An administrator will verify your credentials and activate your access.
              </p>
              <div className="bg-surface-container p-4 rounded-lg text-left text-xs text-on-surface-variant space-y-1 mb-8 max-w-md mx-auto">
                <div><strong>Requested Role:</strong> {role}</div>
                <div><strong>Applicant Name:</strong> {name}</div>
                {email && <div><strong>Email:</strong> {email}</div>}
                {phone && <div><strong>Mobile:</strong> {phone}</div>}
                <div><strong>Next Step:</strong> Administrator approval via Admin Portal</div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-[#00003c] text-white rounded hover:bg-[#000080] transition text-sm font-medium"
                >
                  Go to Sign In
                </Link>
                <Link
                  href="/"
                  className="px-6 py-2.5 border border-outline-variant text-[#00003c] rounded hover:bg-surface-container transition text-sm font-medium"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              {/* Header Box */}
              <div className="bg-[#00003c] text-white px-8 py-6">
                <div className="text-xs uppercase tracking-widest text-[#fe9832] font-semibold mb-1">
                  Public Sector Account Request
                </div>
                <h1 className="text-2xl font-bold font-[family:var(--font-public-sans)]">
                  Register for NIRMAAN
                </h1>
                <p className="text-white/70 text-xs sm:text-sm mt-1">
                  Request access as a Departmental Project Officer or Empanelled Contractor.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Academic Note */}
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3.5 text-xs flex gap-2.5 items-start">
                  <span className="material-symbols-outlined text-amber-700 text-lg flex-shrink-0" aria-hidden="true">
                    info
                  </span>
                  <div>
                    <strong>Approval Policy:</strong> All new accounts require administrative verification. Once submitted, your account will remain in <code className="bg-amber-100 px-1 rounded">PENDING_APPROVAL</code> status until approved by an administrator.
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Role Toggle */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    Select Account Role <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("OFFICER")}
                      className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition ${
                        role === "OFFICER"
                          ? "border-[#00003c] bg-surface-container text-[#00003c] ring-2 ring-[#00003c]/10"
                          : "border-outline-variant hover:border-outline text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[#00003c] text-2xl">
                        badge
                      </span>
                      <div>
                        <div className="font-semibold text-sm">Department Officer</div>
                        <div className="text-[11px] opacity-75">
                          Project supervision, milestone review &amp; payments
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("CONTRACTOR")}
                      className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition ${
                        role === "CONTRACTOR"
                          ? "border-[#00003c] bg-surface-container text-[#00003c] ring-2 ring-[#00003c]/10"
                          : "border-outline-variant hover:border-outline text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[#00003c] text-2xl">
                        engineering
                      </span>
                      <div>
                        <div className="font-semibold text-sm">Contractor / Vendor</div>
                        <div className="text-[11px] opacity-75">
                          Assigned tenders, proof uploads &amp; payment claims
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Rajesh Deshmukh"
                    className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@department.org"
                      className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g., 9876543210"
                      className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                    />
                  </div>
                </div>

                {/* Role Specific Fields */}
                {role === "OFFICER" ? (
                  <div className="grid sm:grid-cols-2 gap-4 bg-surface-container/50 p-4 rounded-lg border border-outline-variant">
                    <div>
                      <label htmlFor="reg-dept" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Assigned Department
                      </label>
                      <select
                        id="reg-dept"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#000080]"
                      >
                        <option value="WORKS_CONSTRUCTION">Works &amp; Construction</option>
                        <option value="RURAL_WATER_SUPPLY">Rural Water Supply</option>
                        <option value="AGRICULTURE">Agriculture &amp; Irrigation</option>
                        <option value="HEALTH">Health &amp; Family Welfare</option>
                        <option value="EDUCATION_PRIMARY">Primary Education</option>
                        <option value="WATER_SUPPLY_SANITATION">Water Supply &amp; Sanitation</option>
                        <option value="DISTRICT_ADMINISTRATION">District Administration</option>
                        <option value="SOCIAL_WELFARE">Social Welfare</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="reg-desig" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Designation / Position
                      </label>
                      <input
                        id="reg-desig"
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g., Executive Engineer"
                        className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#000080]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container/50 p-4 rounded-lg border border-outline-variant space-y-3">
                    <div>
                      <label htmlFor="reg-org" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Company / Contractor Firm Name
                      </label>
                      <input
                        id="reg-org"
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g., Sahyadri Infra Projects Pvt Ltd"
                        className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#000080]"
                      />
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-password" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000080] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-confirm" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-confirm"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#00003c] text-white rounded-lg hover:bg-[#000080] transition font-semibold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-base">
                          progress_activity
                        </span>
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Registration Request
                        <span className="material-symbols-outlined text-base">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="bg-white border-t border-outline-variant py-4 px-6 text-center text-xs text-on-surface-variant">
        NIRMAAN Academic Project Prototype — Not an official Government or Zilla Parishad service.
      </footer>
    </div>
  );
}
