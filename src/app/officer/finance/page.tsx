"use client"

import { useEffect, useState } from "react"

interface Installment {
  id: string
  amount: number
  datePaid: string
  description: string | null
  projectId: string
  projectName: string
}

interface Project {
  id: string
  name: string
  budgetPlanned: number
  budgetActual: number
  tenderAmount: number
  installments: Array<{ id: string; amount: number; datePaid: string; description: string | null }>
}

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 font-body-md text-sm ${
      type === "success" ? "bg-primary text-on-primary" : "bg-error text-on-error"
    }`}>
      <span className="material-symbols-outlined text-[18px]">{type === "success" ? "check_circle" : "error"}</span>
      {message}
    </div>
  )
}

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`
  return `₹${val.toLocaleString("en-IN")}`
}

export default function OfficerFinancePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [allInstallments, setAllInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ projectId: "", amount: "", description: "", datePaid: "" })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  async function loadData() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to load projects.")
        return
      }
      const ps: Project[] = await res.json()
      setProjects(ps)

      // The projects API already includes installments — use them directly
      const flat: Installment[] = ps.flatMap((p) =>
        (p.installments || []).map((i) => ({
          ...i,
          projectId: p.id,
          projectName: p.name,
        }))
      )
      flat.sort((a, b) => new Date(b.datePaid).getTime() - new Date(a.datePaid).getTime())
      setAllInstallments(flat)
    } catch (e) {
      console.error(e)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")

    if (!addForm.projectId) { setFormError("Please select a project."); return }
    if (!addForm.amount || isNaN(parseFloat(addForm.amount)) || parseFloat(addForm.amount) <= 0) {
      setFormError("Please enter a valid amount."); return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/installments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: addForm.projectId,
          amount: parseFloat(addForm.amount),
          description: addForm.description || undefined,
          datePaid: addForm.datePaid || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "Failed to record payment.")
      } else {
        setShowAddModal(false)
        setAddForm({ projectId: "", amount: "", description: "", datePaid: "" })
        setToast({ message: "Payment recorded successfully.", type: "success" })
        await loadData()
      }
    } catch {
      setFormError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const totalDisbursed = allInstallments.reduce((s, i) => s + i.amount, 0)
  const totalBudgetPlanned = projects.reduce((s, p) => s + p.budgetPlanned, 0)
  const totalBudgetActual = projects.reduce((s, p) => s + p.budgetActual, 0)
  const utilizationPct = totalBudgetPlanned > 0
    ? Math.min(100, Math.round((totalBudgetActual / totalBudgetPlanned) * 100))
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <span className="material-symbols-outlined text-error text-4xl">error</span>
        <p className="text-on-surface-variant">{error}</p>
        <button onClick={loadData} className="px-4 py-2 bg-primary text-on-primary rounded font-title-md text-sm">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-background">Finance</h2>
          <p className="text-on-surface-variant mt-1">Installments and budget tracking for your projects</p>
        </div>
        {projects.length > 0 && (
          <button
            onClick={() => { setShowAddModal(true); setFormError("") }}
            className="flex items-center gap-xs bg-primary text-on-primary px-md py-2 rounded font-title-md font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">add</span> Record Payment
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-on-tertiary-container"></div>
          <p className="text-sm font-semibold text-on-surface-variant mb-2">Total Disbursed</p>
          <p className="text-3xl font-bold text-on-tertiary-container">{formatCurrency(totalDisbursed)}</p>
          <p className="text-xs text-on-surface-variant mt-1">{allInstallments.length} payment{allInstallments.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
          <p className="text-sm font-semibold text-on-surface-variant mb-2">Projects Covered</p>
          <p className="text-3xl font-bold text-primary-container">{projects.length}</p>
          <p className="text-xs text-on-surface-variant mt-1">assigned to you</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
          <p className="text-sm font-semibold text-on-surface-variant mb-2">Budget Utilization</p>
          <p className="text-3xl font-bold text-secondary-container">{utilizationPct}%</p>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2">
            <div
              className="bg-secondary-container h-1.5 rounded-full transition-all"
              style={{ width: `${utilizationPct}%` }}
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            {formatCurrency(totalBudgetActual)} / {formatCurrency(totalBudgetPlanned)}
          </p>
        </div>
      </div>

      {/* Per-project budget breakdown */}
      {projects.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
          <div className="p-6 border-b border-outline-variant">
            <h3 className="text-xl font-bold text-on-background">Project Budget Breakdown</h3>
          </div>
          <div className="divide-y divide-outline-variant/50">
            {projects.map((p) => {
              const pct = p.budgetPlanned > 0
                ? Math.min(100, Math.round((p.budgetActual / p.budgetPlanned) * 100))
                : 0
              const installCount = (p.installments || []).length
              return (
                <div key={p.id} className="p-4 hover:bg-surface-container-lowest transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-on-background">{p.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{installCount} payment{installCount !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-on-background">{formatCurrency(p.budgetActual)}</p>
                      <p className="text-xs text-on-surface-variant">of {formatCurrency(p.budgetPlanned)}</p>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        pct >= 90 ? "bg-error" : pct >= 70 ? "bg-secondary-container" : "bg-on-tertiary-container"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{pct}% utilized</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">Payment History</h3>
        </div>
        {allInstallments.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
            <p className="font-title-md">No payments recorded yet</p>
            {projects.length > 0 && (
              <p className="text-sm mt-1">Click "Record Payment" to add the first installment.</p>
            )}
            {projects.length === 0 && (
              <p className="text-sm mt-1">You have no projects assigned yet.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Date</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Project</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Description</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {allInstallments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 text-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(inst.datePaid).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="p-4 font-medium text-on-background">{inst.projectName}</td>
                    <td className="p-4 text-sm text-on-surface-variant">{inst.description || "—"}</td>
                    <td className="p-4 text-right font-medium text-on-tertiary-container whitespace-nowrap">
                      {formatCurrency(inst.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-md p-6 border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-background">Record Payment</h3>
              <button
                onClick={() => { setShowAddModal(false); setFormError("") }}
                className="text-on-surface-variant hover:text-on-background"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                  Project <span className="text-error">*</span>
                </label>
                <select
                  required
                  value={addForm.projectId}
                  onChange={(e) => setAddForm({ ...addForm, projectId: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none bg-surface text-on-surface"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                  Amount (₹) <span className="text-error">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0"
                  value={addForm.amount}
                  onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none bg-surface text-on-surface"
                />
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional note"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none bg-surface text-on-surface"
                />
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                  Date Paid
                </label>
                <input
                  type="date"
                  value={addForm.datePaid}
                  onChange={(e) => setAddForm({ ...addForm, datePaid: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none bg-surface text-on-surface"
                />
              </div>

              {formError && (
                <p className="text-sm text-error bg-error/5 border border-error/20 rounded px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setFormError("") }}
                  className="px-md py-2 border border-outline-variant rounded font-title-md text-sm hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-md py-2 bg-primary text-on-primary rounded font-title-md text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
