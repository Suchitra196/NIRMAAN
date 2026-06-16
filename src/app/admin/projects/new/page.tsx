"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
}

const PRIORITIES = ["Standard", "High", "Critical"] as const
type Priority = typeof PRIORITIES[number]

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [officers, setOfficers] = useState<User[]>([])
  const [contractors, setContractors] = useState<User[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    department: "",
    priority: "High" as Priority,
    startDate: "",
    endDate: "",
    city: "",
    pincode: "",
    tenderAmount: "",
    budgetPlanned: "",
    description: "",
    officerIds: [] as string[],
    contractorId: "",
    status: "ONGOING" as "ONGOING" | "DELAYED" | "COMPLETED",
  })

  useEffect(() => {
    async function loadUsers() {
      const [oRes, cRes] = await Promise.all([
        fetch("/api/users?role=OFFICER"),
        fetch("/api/users?role=CONTRACTOR"),
      ])
      if (oRes.ok) setOfficers(await oRes.json())
      if (cRes.ok) setContractors(await cRes.json())
    }
    loadUsers()
  }, [])

  function toggleOfficer(id: string) {
    setForm((prev) => ({
      ...prev,
      officerIds: prev.officerIds.includes(id)
        ? prev.officerIds.filter((o) => o !== id)
        : [...prev.officerIds, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError("Project name is required."); return }
    if (!form.tenderAmount || !form.budgetPlanned) { setError("Financial estimates are required."); return }

    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: [
            form.department && `Department: ${form.department}`,
            form.city && `Location: ${form.city}${form.pincode ? ` - ${form.pincode}` : ""}`,
            form.priority && `Priority: ${form.priority}`,
            form.startDate && `Start: ${form.startDate}`,
            form.endDate && `Expected Completion: ${form.endDate}`,
          ].filter(Boolean).join(" | ") || undefined,
          budgetPlanned: parseFloat(form.budgetPlanned),
          tenderAmount: parseFloat(form.tenderAmount),
          officerId: form.officerIds[0] || undefined,
          contractorId: form.contractorId || undefined,
          status: form.status,
        }),
      })
      if (res.ok) {
        router.push("/admin/projects")
      } else {
        const data = await res.json()
        setError(data.error || "Failed to create project.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const primaryOfficer = officers.find((o) => form.officerIds[0] === o.id)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
        <Link href="/admin/projects" className="hover:text-primary-container transition-colors">Projects</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-background font-medium">New Project Initiation</span>
      </div>

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-primary">Initiate New Project</h1>
        <p className="text-on-surface-variant mt-1">Establish a new infrastructure mandate within the national development pipeline.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column — main form */}
          <div className="flex-1 space-y-6">
            {/* Step indicator */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4">
              <div className="flex items-center gap-4">
                {[
                  { n: 1, label: "Basic Info" },
                  { n: 2, label: "Location & Logistics" },
                  { n: 3, label: "Budgeting" },
                ].map((s, idx) => (
                  <div key={s.n} className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setStep(s.n)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                        step === s.n
                          ? "bg-secondary-container text-on-secondary-container"
                          : step > s.n
                          ? "bg-on-tertiary-container text-on-primary"
                          : "bg-surface-container text-on-surface-variant border border-outline-variant"
                      }`}
                    >
                      {step > s.n ? <span className="material-symbols-outlined text-[14px]">check</span> : s.n}
                    </button>
                    <span className={`text-sm font-medium hidden sm:block ${step === s.n ? "text-on-background" : "text-on-surface-variant"}`}>
                      {s.label}
                    </span>
                    {idx < 2 && <div className="flex-1 h-px bg-outline-variant mx-2 hidden sm:block" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1 — Basic Info */}
            {step === 1 && (
              <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary-container">info</span>
                  <h2 className="text-lg font-bold text-on-background">Project Core Details</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Project Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                    placeholder="e.g. Smart City Infrastructure Expansion Phase IV"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Department</label>
                    <input
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                      placeholder="Public Works Department (PWD)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Project Priority</label>
                    <div className="flex gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, priority: p })}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-colors ${
                            form.priority === p
                              ? p === "Critical"
                                ? "bg-error text-on-error border-error"
                                : p === "High"
                                ? "bg-secondary-container text-on-secondary-container border-secondary-container"
                                : "bg-primary-container text-on-primary border-primary-container"
                              : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Description (optional)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface resize-none"
                    placeholder="Brief project description..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Next: Location <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Timeline & Location */}
            {step === 2 && (
              <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary-container">calendar_today</span>
                  <h2 className="text-lg font-bold text-on-background">Timeline &amp; Execution</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Proposed Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Expected Completion</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">City / District</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                      placeholder="Enter Location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Pincode</label>
                    <input
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                      placeholder="6-digit code"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Assign Contractor</label>
                  <select
                    value={form.contractorId}
                    onChange={(e) => setForm({ ...form, contractorId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                  >
                    <option value="">— Select contractor —</option>
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.email}</option>
                    ))}
                  </select>
                  {contractors.length === 0 && <p className="text-xs text-on-surface-variant mt-1">No contractors registered yet.</p>}
                </div>

                <div className="flex justify-between">
                  <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 px-4 py-2.5 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low transition-colors text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                    Next: Budgeting <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Financial Estimates */}
            {step === 3 && (
              <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary-container">payments</span>
                  <h2 className="text-lg font-bold text-on-background">Financial Estimates</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Tender Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">₹</span>
                      <input
                        required
                        type="number"
                        min="1"
                        step="0.01"
                        value={form.tenderAmount}
                        onChange={(e) => setForm({ ...form, tenderAmount: e.target.value })}
                        className="w-full pl-7 pr-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Pitched / Budget Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">₹</span>
                      <input
                        required
                        type="number"
                        min="1"
                        step="0.01"
                        value={form.budgetPlanned}
                        onChange={(e) => setForm({ ...form, budgetPlanned: e.target.value })}
                        className="w-full pl-7 pr-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Project Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "ONGOING" | "DELAYED" | "COMPLETED" })}
                    className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                  >
                    <option value="ONGOING">Ongoing</option>
                    <option value="DELAYED">Delayed</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {error && (
                  <p className="text-sm text-error bg-error/5 border border-error/20 rounded px-3 py-2">{error}</p>
                )}

                <div className="flex justify-between">
                  <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1 px-4 py-2.5 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low transition-colors text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right column — officer panel + summary */}
          <div className="lg:w-72 space-y-4">
            {/* Assigning Officers */}
            <div className="bg-primary text-on-primary rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[20px]">group_add</span>
                <h3 className="font-bold text-base">Assigning Officers</h3>
              </div>

              {form.officerIds.length > 0 && (
                <div className="space-y-2 mb-3">
                  {form.officerIds.map((oid) => {
                    const o = officers.find((x) => x.id === oid)
                    if (!o) return null
                    return (
                      <div key={oid} className="flex items-center gap-3 bg-on-primary/10 rounded-lg p-2">
                        <div className="w-8 h-8 rounded-full bg-on-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{o.name || o.email}</p>
                          <p className="text-xs text-on-primary/70">Project Lead</p>
                        </div>
                        <button type="button" onClick={() => toggleOfficer(oid)} className="text-on-primary/70 hover:text-on-primary">
                          <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="relative">
                <select
                  value=""
                  onChange={(e) => { if (e.target.value) toggleOfficer(e.target.value) }}
                  className="w-full px-3 py-2 border border-on-primary/30 rounded-lg text-sm bg-on-primary/10 text-on-primary focus:outline-none focus:border-on-primary/60 appearance-none"
                >
                  <option value="">+ Add Officer</option>
                  {officers.filter((o) => !form.officerIds.includes(o.id)).map((o) => (
                    <option key={o.id} value={o.id}>{o.name || o.email}</option>
                  ))}
                </select>
              </div>

              {officers.length === 0 && (
                <p className="text-xs text-on-primary/60 mt-2">No officers registered yet.</p>
              )}
            </div>

            {/* Mandate Verification */}
            <div className="bg-surface border border-outline-variant rounded-xl p-5">
              <h3 className="font-bold text-base text-on-background mb-4">Mandate Verification</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Estimated Timeline</span>
                  <span className="font-semibold text-on-background">
                    {form.startDate && form.endDate
                      ? `${Math.round((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} Months`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Budget Variance</span>
                  <span className={`font-semibold ${form.tenderAmount && form.budgetPlanned && parseFloat(form.budgetPlanned) > parseFloat(form.tenderAmount) ? "text-on-tertiary-container" : "text-error"}`}>
                    {form.tenderAmount && form.budgetPlanned
                      ? `${((parseFloat(form.budgetPlanned) - parseFloat(form.tenderAmount)) / parseFloat(form.tenderAmount) * 100).toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Priority</span>
                  <span className="font-semibold text-on-background">{form.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Approval Tier</span>
                  <span className="font-semibold text-on-background text-xs">Executive Council</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                <p className="text-xs text-on-surface-variant italic">
                  Note: Once submitted, the project will enter &apos;Draft&apos; state until the Financial Department validates the Pitch Amount.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {step === 3 && (
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-bold text-base hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Project"}
                  {!submitting && <span className="material-symbols-outlined text-[20px]">send</span>}
                </button>
                <Link
                  href="/admin/projects"
                  className="w-full flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  Cancel Action
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </Link>
                <p className="text-center text-[10px] text-outline uppercase tracking-widest flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">lock</span>
                  Secure Administration Protocol
                </p>
              </div>
            )}

            {step !== 3 && (
              <div className="space-y-2">
                <Link
                  href="/admin/projects"
                  className="w-full flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  Cancel Action
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-outline-variant text-center">
        <p className="text-xs text-on-surface-variant">
          NIRMAAN Integrated Project Management System • National Digital Infrastructure Initiative
        </p>
        <p className="text-xs text-outline mt-1">v4.2.0-STABLE | © 2024 Government Technical Services</p>
      </div>
    </div>
  )
}
