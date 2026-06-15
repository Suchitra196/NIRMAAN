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

interface PaymentRequest {
  id: string
  amount: number
  description: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  project: { id: string; name: string }
  contractor: { id: string; name: string | null; email: string | null }
  officer: { id: string; name: string | null; email: string | null } | null
}

function PaymentStatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-tertiary-container/10 text-on-tertiary-container border border-tertiary-container/20">
        Approved
      </span>
    )
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-error/10 text-error border border-error/20">
        Rejected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant">
      Pending
    </span>
  )
}

export default function AdminFinancePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [allInstallments, setAllInstallments] = useState<(Installment & { projectName: string })[]>([])
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [prFilter, setPrFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, prRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/payment-requests"),
        ])
        if (pRes.ok) {
          const ps: Project[] = await pRes.json()
          setProjects(ps)
          // Use installments included in projects response
          const flat = ps.flatMap((p) =>
            (p.installments || []).map((i) => ({ ...i, projectName: p.name }))
          )
          flat.sort((a, b) => new Date(b.datePaid).getTime() - new Date(a.datePaid).getTime())
          setAllInstallments(flat)
        }
        if (prRes.ok) {
          setPaymentRequests(await prRes.json())
        }
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

  const filteredPR = prFilter === "ALL"
    ? paymentRequests
    : paymentRequests.filter((r) => r.status === prFilter)

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

      {/* Payment Requests Log */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">Payment Requests Log</h3>
        </div>
        {/* Filter Tabs */}
        <div className="flex gap-1 px-4 pt-4 border-b border-outline-variant">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setPrFilter(f)}
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                prFilter === f
                  ? "border-primary-container text-primary-container"
                  : "border-transparent text-on-surface-variant hover:text-on-background"
              }`}
            >
              {f === "ALL" ? `All (${paymentRequests.length})` : `${f.charAt(0) + f.slice(1).toLowerCase()} (${paymentRequests.filter((r) => r.status === f).length})`}
            </button>
          ))}
        </div>
        {filteredPR.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">payments</span>
            <p>No payment requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Project</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Contractor</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Officer</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-right">Amount</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Status</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filteredPR.map((pr) => (
                  <tr key={pr.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-medium text-on-background max-w-[140px] truncate">{pr.project.name}</td>
                    <td className="p-4 text-on-surface-variant text-sm">{pr.contractor.name || pr.contractor.email}</td>
                    <td className="p-4 text-on-surface-variant text-sm">{pr.officer?.name || pr.officer?.email || "—"}</td>
                    <td className="p-4 text-right font-medium text-on-tertiary-container">{formatCurrency(pr.amount)}</td>
                    <td className="p-4"><PaymentStatusBadge status={pr.status} /></td>
                    <td className="p-4 text-sm text-on-surface-variant">{new Date(pr.createdAt).toLocaleDateString("en-IN")}</td>
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
