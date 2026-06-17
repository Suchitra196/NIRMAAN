"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DESIGNATIONS, DESIGNATION_HIERARCHY, DEPARTMENT_LABELS, DepartmentKey } from "@/lib/hierarchy"

export default function SetupPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    designation: "",
    department: "" as DepartmentKey | "",
    phone: "",
    employeeId: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }
    if (status === "authenticated") {
      const userStatus = (session?.user as any)?.status
      if (userStatus === "PENDING_APPROVAL") {
        router.replace("/pending-approval")
        return
      }
      // Pre-fill name from session
      if (session?.user?.name) {
        setForm((prev) => ({ ...prev, name: session.user!.name || "" }))
      }
    }
  }, [status, session, router])

  // When designation changes, auto-fill department
  function handleDesignationChange(designation: string) {
    const info = DESIGNATION_HIERARCHY[designation]
    setForm((prev) => ({
      ...prev,
      designation,
      department: info ? (info.department as DepartmentKey) : prev.department,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.name.trim()) {
      setError("Full name is required.")
      return
    }
    if (!form.designation) {
      setError("Please select your designation.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          designation: form.designation,
          department: form.department || undefined,
          phone: form.phone.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to save profile.")
        return
      }

      // Force session refresh so designation is picked up
      await update()
      router.replace("/officer")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="h-1 bg-primary" />
          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-primary text-3xl">badge</span>
              </div>
              <h1 className="text-2xl font-bold text-on-background">Complete Your Profile</h1>
              <p className="text-on-surface-variant text-sm mt-1">
                Set up your officer profile to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-on-surface"
                  placeholder="Your full name"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">
                  Designation <span className="text-error">*</span>
                </label>
                <select
                  required
                  value={form.designation}
                  onChange={(e) => handleDesignationChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-on-surface"
                >
                  <option value="">— Select your designation —</option>
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Department — auto-filled but editable */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">
                  Department
                </label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value as DepartmentKey })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-on-surface"
                >
                  <option value="">— Select department —</option>
                  {(Object.entries(DEPARTMENT_LABELS) as [DepartmentKey, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {form.designation && DESIGNATION_HIERARCHY[form.designation] && (
                  <p className="text-xs text-on-surface-variant mt-1">
                    Auto-filled from designation. You can change if needed.
                  </p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-on-surface"
                  placeholder="10-digit mobile number"
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">
                  Employee ID <span className="text-outline">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-on-surface"
                  placeholder="e.g. EMP-2024-001"
                />
              </div>

              {error && (
                <p className="text-sm text-error bg-error/5 border border-error/20 rounded px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    Complete Setup
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
