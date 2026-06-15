"use client"

import { useEffect, useState } from "react"
import StatusBadge from "@/components/StatusBadge"

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
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  budgetPlanned: number
  budgetActual: number
  tenderAmount: number
  installments?: Installment[]
}

export default function AdminFinancePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [allInstallments, setAllInstallments] = useState<(Installment & { projectName: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/projects")
        if (!res.ok) return
        const ps: Project[] = await res.json()
        setProjects(ps)

        const installmentResults = await Promise.all(
          ps.map(async (p) => {
            const r = await fetch(`/api/installments?projectId=${p.id}`)
            if (!r.ok) return []
            const items: Installment[] = await r.json()
            return items.map((i) => ({ ...i, projectName: p.name }))
          })
        )
        setAllInstallments(installmentResults.flat().sort((a, b) => new Date(b.datePaid).getTime() - new Date(a.datePaid).getTime()))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalPlanned = projects.reduce((s, p) => s + p.budgetPlanned, 0)
  const totalActual = projects.reduce((s, p) => s + p.budgetActual, 0)
  const totalTender = projects.reduce((s, p) => s + p.tenderAmount, 0)

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
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-on-background">Finance Overview</h2>
        <p className="text-on-surface-variant mt-1">Budget and installment tracking across all projects</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
          <p className="text-sm font-semibold text-on-surface-variant mb-2">Total Budget Planned</p>
          <p className="text-3xl font-bold text-primary-container">{formatCurrency(totalPlanned)}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-on-tertiary-container"></div>
          <p className="text-sm font-semibold text-on-surface-variant mb-2">Total Spent (Actual)</p>
          <p className="text-3xl font-bold text-on-tertiary-container">{formatCurrency(totalActual)}</p>
          {totalPlanned > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>Utilization</span>
                <span>{((totalActual / totalPlanned) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5">
                <div
                  className="bg-on-tertiary-container h-1.5 rounded-full"
                  style={{ width: `${Math.min((totalActual / totalPlanned) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
          <p className="text-sm font-semibold text-on-surface-variant mb-2">Total Tender Value</p>
          <p className="text-3xl font-bold text-secondary-container">{formatCurrency(totalTender)}</p>
        </div>
      </div>

      {/* Per-Project Budget Table */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">Budget per Project</h3>
        </div>
        {projects.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">payments</span>
            <p>No projects found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Project</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Status</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-right">Planned</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-right">Actual</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {projects.map((p) => {
                  const pct = p.budgetPlanned > 0 ? (p.budgetActual / p.budgetPlanned) * 100 : 0
                  return (
                    <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4 font-medium text-on-background max-w-[200px] truncate">{p.name}</td>
                      <td className="p-4"><StatusBadge status={p.status} /></td>
                      <td className="p-4 text-right text-on-surface-variant">{formatCurrency(p.budgetPlanned)}</td>
                      <td className="p-4 text-right text-on-surface-variant">{formatCurrency(p.budgetActual)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-surface-container-highest rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${pct > 100 ? "bg-error" : "bg-on-tertiary-container"}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-on-surface-variant w-12 text-right">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Installments Table */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">All Installments</h3>
        </div>
        {allInstallments.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
            <p>No installments recorded yet.</p>
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
                    <td className="p-4 text-on-surface-variant text-sm">
                      {new Date(inst.datePaid).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 font-medium text-on-background">{inst.projectName}</td>
                    <td className="p-4 text-on-surface-variant text-sm">{inst.description || "—"}</td>
                    <td className="p-4 text-right font-medium text-on-tertiary-container">{formatCurrency(inst.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
