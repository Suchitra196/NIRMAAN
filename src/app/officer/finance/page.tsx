"use client"

import { useEffect, useState } from "react"

interface Installment {
  id: string
  amount: number
  datePaid: string
  description: string | null
  projectId: string
}

interface Project {
  id: string
  name: string
  budgetPlanned: number
  budgetActual: number
  // installments are included in the /api/projects response
  installments: Array<{
    id: string
    amount: number
    datePaid: string
    description: string | null
  }>
}

export default function OfficerFinancePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [allInstallments, setAllInstallments] = useState<(Installment & { projectName: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ projectId: "", amount: "", description: "", datePaid: "" })
  const [submitting, setSubmitting] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) return
      const ps: Project[] = await res.json()
      setProjects(ps)

      // Use installments already included in the projects response
      const flat = ps.flatMap((p) =>
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
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
      if (res.ok) {
        setShowAddModal(false)
        setAddForm({ projectId: "", amount: "", description: "", datePaid: "" })
        await loadData()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const totalInstallments = allInstallments.reduce((s, i) => s + i.amount, 0)

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`
    return `₹${val.toLocaleString("en-IN")}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-background">Finance</h2>
          <p className="text-on-surface-variant mt-1">Installments for your projects</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-xs bg-primary-container text-on-primary px-md py-2 rounded font-title-md font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span> Record Payment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-on-tertiary-container"></div>
          <p className="text-sm font-semibold text-on-surface-variant mb-2">Total Disbursed</p>
          <p className="text-3xl font-bold text-on-tertiary-container">{formatCurrency(totalInstallments)}</p>
          <p className="text-xs text-on-surface-variant mt-1">{allInstallments.length} installments</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
          <p className="text-sm font-semibold text-on-surface-variant mb-2">Projects Covered</p>
          <p className="text-3xl font-bold text-primary-container">{projects.length}</p>
        </div>
      </div>

      {/* Installments Table */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">Payment History</h3>
        </div>
        {allInstallments.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
            <p>No payments recorded yet.</p>
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
                    <td className="p-4 text-sm text-on-surface-variant">
                      {new Date(inst.datePaid).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 font-medium text-on-background">{inst.projectName}</td>
                    <td className="p-4 text-sm text-on-surface-variant">{inst.description || "—"}</td>
                    <td className="p-4 text-right font-medium text-on-tertiary-container">{formatCurrency(inst.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-md p-6 border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-background">Record Payment</h3>
              <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-on-background">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Project *</label>
                <select
                  required
                  value={addForm.projectId}
                  onChange={(e) => setAddForm({ ...addForm, projectId: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none bg-surface"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Amount (₹) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="any"
                  value={addForm.amount}
                  onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none bg-surface"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Description</label>
                <input
                  type="text"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none bg-surface"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Date Paid</label>
                <input
                  type="date"
                  value={addForm.datePaid}
                  onChange={(e) => setAddForm({ ...addForm, datePaid: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none bg-surface"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-md py-2 border border-outline-variant rounded font-title-md text-sm hover:bg-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-md py-2 bg-primary-container text-on-primary rounded font-title-md text-sm font-semibold hover:opacity-90 disabled:opacity-50"
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
