"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Project {
  id: string
  name: string
  budgetPlanned: number
  budgetActual: number
}

export default function RecordPaymentPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    projectId: "",
    amount: "",
    description: "",
    datePaid: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/projects")
      if (res.ok) {
        const data: Project[] = await res.json()
        setProjects(data)
        if (data.length > 0) setForm((f) => ({ ...f, projectId: data[0].id }))
      }
      setLoading(false)
    }
    load()
  }, [])

  const selectedProject = projects.find((p) => p.id === form.projectId)
  const fmt = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`
    return `₹${val.toLocaleString("en-IN")}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.projectId) { setError("Please select a project."); return }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError("Enter a valid amount."); return }

    setSubmitting(true)
    try {
      const res = await fetch("/api/installments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: form.projectId,
          amount: parseFloat(form.amount),
          description: form.description || undefined,
          datePaid: form.datePaid || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to record payment.")
      } else {
        setSuccess(true)
        setTimeout(() => router.push("/officer/finance"), 2000)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
        <Link href="/officer/finance" className="hover:text-primary-container transition-colors">Finance</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-background font-medium">Record Payment</span>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-background">Record Payment</h1>
        <p className="text-on-surface-variant mt-1">Manually record a direct payment installment to a contractor</p>
      </div>

      {success ? (
        <div className="bg-on-tertiary-container/10 border border-on-tertiary-container/30 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-on-tertiary-container text-5xl mb-3 block">check_circle</span>
          <h2 className="text-xl font-bold text-on-background mb-1">Payment Recorded</h2>
          <p className="text-on-surface-variant text-sm">Installment saved. Redirecting to Finance dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project selection with budget info */}
          <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container text-[20px]">account_tree</span>
              Project
            </h2>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Select Project <span className="text-error">*</span></label>
              <select
                required
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {projects.length === 0 && <p className="text-xs text-on-surface-variant mt-1">No projects assigned.</p>}
            </div>

            {/* Budget summary for selected project */}
            {selectedProject && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant">
                  <p className="text-xs text-on-surface-variant">Budget Planned</p>
                  <p className="font-bold text-primary-container mt-0.5">{fmt(selectedProject.budgetPlanned)}</p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant">
                  <p className="text-xs text-on-surface-variant">Paid So Far</p>
                  <p className="font-bold text-on-tertiary-container mt-0.5">{fmt(selectedProject.budgetActual)}</p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant">
                  <p className="text-xs text-on-surface-variant">Remaining</p>
                  <p className={`font-bold mt-0.5 ${selectedProject.budgetPlanned - selectedProject.budgetActual < 0 ? "text-error" : "text-on-background"}`}>
                    {fmt(Math.max(0, selectedProject.budgetPlanned - selectedProject.budgetActual))}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment details */}
          <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container text-[20px]">payments</span>
              Payment Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Amount (₹) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold text-sm">₹</span>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full pl-7 pr-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Date Paid</label>
                <input
                  type="date"
                  value={form.datePaid}
                  onChange={(e) => setForm({ ...form, datePaid: e.target.value })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Description / Notes</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface resize-none"
                placeholder="e.g. Milestone 3 completion, Site clearance payment..."
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-error bg-error/5 border border-error/20 rounded-lg px-4 py-3">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/officer/finance"
              className="flex-1 flex items-center justify-center py-3 border border-outline-variant rounded-lg font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Recording..." : (
                <><span className="material-symbols-outlined text-[18px]">save</span> Record Payment</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
