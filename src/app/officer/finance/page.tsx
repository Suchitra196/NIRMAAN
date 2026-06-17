"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"

interface PaymentRequest {
  id: string
  amount: number
  description: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  officerNote: string | null
  proofImages: string[]
  createdAt: string
  project: { id: string; name: string; budgetPlanned: number; budgetActual: number; tenderAmount: number }
  contractor: { id: string; name: string | null; email: string | null }
  task: { id: string; title: string } | null
}

interface Project {
  id: string
  name: string
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  budgetPlanned: number
  budgetActual: number
  tenderAmount: number
  contractor?: { id: string; name: string | null; email: string | null }
  installments: Array<{ id: string; amount: number; datePaid: string; description: string | null }>
}

const CHECKLIST = [
  "Physical verification report uploaded",
  "Vendor tax compliance verified",
  "Site photographs from Geo-Tag app attached",
]

function PaymentStatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  const map = {
    PENDING: "bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30",
    APPROVED: "bg-on-tertiary-container/10 text-on-tertiary-container border border-on-tertiary-container/20",
    REJECTED: "bg-error/10 text-error border border-error/20",
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${map[status]}`}>{status}</span>
}

const fmt = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
  return `₹${val.toLocaleString("en-IN")}`
}

export default function OfficerFinancePage() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPR, setSelectedPR] = useState<PaymentRequest | null>(null)
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false])
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [approveDate, setApproveDate] = useState("")
  const [rejectNote, setRejectNote] = useState("")
  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function loadData() {
    setLoading(true)
    try {
      const [prRes, projRes] = await Promise.all([fetch("/api/payment-requests"), fetch("/api/projects")])
      if (prRes.ok) {
        const data: PaymentRequest[] = await prRes.json()
        setPaymentRequests(data)
        const firstPending = data.find((r) => r.status === "PENDING")
        if (firstPending) setSelectedPR(firstPending)
      }
      if (projRes.ok) setProjects(await projRes.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  async function handleAction(id: string, action: "approve" | "reject") {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/payment-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "approve" && approveDate ? { datePaid: approveDate } : {}),
          ...(action === "reject" ? { officerNote: rejectNote } : {}),
        }),
      })
      if (res.ok) {
        showToast(action === "approve" ? "Payment approved and installment recorded." : "Request rejected.")
        setActionMode(null); setApproveDate(""); setRejectNote("")
        await loadData()
      } else {
        const d = await res.json(); showToast(d.error || "Action failed.", "error")
      }
    } catch { showToast("Network error.", "error") }
    finally { setProcessingId(null) }
  }

  // Stats
  const pendingCount = paymentRequests.filter((r) => r.status === "PENDING").length
  const today = new Date().toDateString()
  const disbursedToday = projects.reduce((s, p) =>
    s + (p.installments || []).filter((i) => new Date(i.datePaid).toDateString() === today).reduce((a, i) => a + i.amount, 0), 0)
  const totalActiveBudget = projects.reduce((s, p) => s + p.budgetPlanned, 0)
  const totalActual = projects.reduce((s, p) => s + p.budgetActual, 0)
  const allocationPct = totalActiveBudget > 0 ? Math.round((totalActual / totalActiveBudget) * 100) : 0
  const auditFlags = paymentRequests.filter((r) => r.status === "PENDING" && r.proofImages?.length === 0).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm flex items-center gap-2 ${toast.type === "success" ? "bg-on-background text-background" : "bg-error text-on-error"}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.type === "success" ? "check_circle" : "error"}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-on-background">Finance &amp; Payments</h1>
          <p className="text-on-surface-variant mt-1">Track installments, review contractor requests, and manage disbursements</p>
        </div>
        <Link
          href="/officer/finance/record-payment"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Record Payment
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant rounded-xl p-4">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Pending Installments</p>
          <p className="text-4xl font-bold text-on-background">{pendingCount}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-secondary-container">
            <span className="material-symbols-outlined text-[14px]">schedule</span> Awaiting Review
          </div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Disbursed Today</p>
          <p className="text-4xl font-bold text-on-tertiary-container">{fmt(disbursedToday)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-on-tertiary-container">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            {disbursedToday > 0 ? "Payments processed" : "No payments today"}
          </div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Total Active Budget</p>
          <p className="text-4xl font-bold text-primary-container">{fmt(totalActiveBudget)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">pie_chart</span> {allocationPct}% Allocated
          </div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Audit Flags</p>
          <p className="text-4xl font-bold text-error">{String(auditFlags).padStart(2, "0")}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-error">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            {auditFlags > 0 ? "Action Required" : "All clear"}
          </div>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Projects Financial Overview */}
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-background">Active Projects Financial Overview</h2>
            </div>
            {projects.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">account_tree</span>
                <p>No projects assigned.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="p-3 text-xs font-semibold text-on-surface-variant uppercase">Project ID</th>
                      <th className="p-3 text-xs font-semibold text-on-surface-variant uppercase">Project Title</th>
                      <th className="p-3 text-xs font-semibold text-on-surface-variant uppercase text-right">Total Budget</th>
                      <th className="p-3 text-xs font-semibold text-on-surface-variant uppercase text-right">Paid</th>
                      <th className="p-3 text-xs font-semibold text-on-surface-variant uppercase">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {projects.map((p, idx) => {
                      const pct = p.budgetPlanned > 0 ? Math.min(100, (p.budgetActual / p.budgetPlanned) * 100) : 0
                      const isSelected = selectedPR?.project?.id === p.id
                      return (
                        <tr key={p.id} onClick={() => { const pr = paymentRequests.find((r) => r.project?.id === p.id && r.status === "PENDING"); if (pr) { setSelectedPR(pr); setActionMode(null) } }}
                          className={`hover:bg-surface-container-lowest transition-colors cursor-pointer ${isSelected ? "bg-primary-container/5" : ""}`}>
                          <td className="p-3 text-sm font-mono text-on-surface-variant">#PRJ-{String(idx + 1001)}</td>
                          <td className="p-3">
                            <p className="font-semibold text-sm text-on-background">{p.name}</p>
                            {p.contractor && <p className="text-xs text-on-surface-variant mt-0.5">Contractor: {p.contractor.name || p.contractor.email}</p>}
                          </td>
                          <td className="p-3 text-right font-medium text-on-background text-sm">{fmt(p.budgetPlanned)}</td>
                          <td className="p-3 text-right font-bold text-on-tertiary-container text-sm">{fmt(p.budgetActual)}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pct >= 80 ? "bg-on-tertiary-container" : pct >= 40 ? "bg-secondary-container" : "bg-error/50"}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-on-surface-variant whitespace-nowrap">{pct.toFixed(0)}% Disbursed</span>
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

          {/* Payment Requests list */}
          {paymentRequests.length > 0 && (
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
              <div className="p-5 border-b border-outline-variant flex items-center justify-between">
                <h2 className="text-lg font-bold text-on-background">
                  Payment Requests
                  {pendingCount > 0 && <span className="ml-2 px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-xs font-bold">{pendingCount} Pending</span>}
                </h2>
              </div>
              <div className="divide-y divide-outline-variant/50">
                {paymentRequests.map((pr) => (
                  <div key={pr.id} onClick={() => { setSelectedPR(pr); setActionMode(null) }}
                    className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-surface-container-lowest transition-colors ${selectedPR?.id === pr.id ? "bg-primary-container/5 border-l-2 border-primary-container" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-on-background">{pr.project?.name}</p>
                        <PaymentStatusBadge status={pr.status} />
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate">{pr.description}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{pr.contractor?.name || pr.contractor?.email} • {new Date(pr.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <p className="font-bold text-primary-container text-sm whitespace-nowrap">{fmt(pr.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All installments log */}
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-5 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-background">Installment Log</h2>
            </div>
            {projects.every((p) => !p.installments?.length) ? (
              <div className="p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
                <p>No installments recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="p-3 text-xs font-semibold text-on-surface-variant uppercase">Date</th>
                      <th className="p-3 text-xs font-semibold text-on-surface-variant uppercase">Project</th>
                      <th className="p-3 text-xs font-semibold text-on-surface-variant uppercase">Description</th>
                      <th className="p-3 text-xs font-semibold text-on-surface-variant uppercase text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {projects.flatMap((p) => (p.installments || []).map((i) => ({ ...i, projectName: p.name })))
                      .sort((a, b) => new Date(b.datePaid).getTime() - new Date(a.datePaid).getTime())
                      .map((inst) => (
                        <tr key={inst.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="p-3 text-sm text-on-surface-variant">{new Date(inst.datePaid).toLocaleDateString("en-IN")}</td>
                          <td className="p-3 text-sm font-medium text-on-background">{inst.projectName}</td>
                          <td className="p-3 text-sm text-on-surface-variant">{inst.description || "—"}</td>
                          <td className="p-3 text-right font-bold text-on-tertiary-container text-sm">{fmt(inst.amount)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right — Detail panel */}
        {selectedPR ? (
          <div className="xl:w-80 space-y-4 flex-shrink-0">
            {/* Current Review card */}
            <div className="bg-primary text-on-primary rounded-xl overflow-hidden">
              <div className="flex items-start justify-between px-5 pt-5 pb-2">
                <div>
                  <p className="text-xs text-on-primary/60 uppercase tracking-wide">Current Review</p>
                  <h3 className="text-2xl font-bold mt-1">
                    Installment #{(paymentRequests.indexOf(selectedPR) + 1).toString().padStart(2, "0")}
                  </h3>
                </div>
                <span className={`mt-1 px-3 py-1 rounded-lg text-xs font-bold uppercase ${selectedPR.status === "PENDING" ? "bg-secondary-container text-on-secondary-container" : selectedPR.status === "APPROVED" ? "bg-on-tertiary-container/20 text-on-primary" : "bg-error/20 text-on-primary"}`}>
                  {selectedPR.status === "PENDING" ? "Pending Approval" : selectedPR.status}
                </span>
              </div>
              <div className="px-5 pb-5 grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-on-primary/60">Amount Requested</p>
                  <p className="font-bold text-lg">{fmt(selectedPR.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-on-primary/60">Due Date</p>
                  <p className="font-bold text-sm">{new Date(selectedPR.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            </div>

            {/* Project details */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4">
              <div className="flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">info</span>
                <p className="text-sm font-semibold text-on-background">{selectedPR.project?.name} Details</p>
              </div>
              <p className="text-sm text-on-surface-variant">{selectedPR.description}</p>
              {selectedPR.task && <p className="text-xs text-on-surface-variant mt-1">Task: {selectedPR.task.title}</p>}
              <p className="text-xs text-on-surface-variant mt-1">Contractor: {selectedPR.contractor?.name || selectedPR.contractor?.email}</p>
            </div>

            {/* Proof images */}
            {selectedPR.proofImages?.length > 0 && (
              <div className="bg-surface border border-outline-variant rounded-xl p-4">
                <p className="text-sm font-semibold text-on-background mb-3">Proof Images ({selectedPR.proofImages.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedPR.proofImages.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Proof ${idx + 1}`} className="w-full h-16 object-cover rounded-lg border border-outline-variant hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Checklist */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4">
              <p className="text-sm font-semibold text-on-background mb-3">Verification Checklist</p>
              <div className="space-y-2">
                {CHECKLIST.map((item, idx) => (
                  <label key={idx} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={checkedItems[idx]} onChange={(e) => { const n = [...checkedItems]; n[idx] = e.target.checked; setCheckedItems(n) }}
                      className="mt-0.5 w-4 h-4 rounded border-outline-variant accent-primary-container cursor-pointer" />
                    <span className="text-sm text-on-surface">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Approve / Reject */}
            {selectedPR.status === "PENDING" && (
              <div className="space-y-2">
                {actionMode === null && (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setActionMode("approve")} className="py-2.5 bg-on-tertiary-container text-on-primary rounded-lg font-semibold text-sm hover:opacity-90">Approve</button>
                    <button onClick={() => setActionMode("reject")} className="py-2.5 border-2 border-error text-error rounded-lg font-semibold text-sm hover:bg-error/5">Reject</button>
                  </div>
                )}
                {actionMode === "approve" && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Payment Date</label>
                      <input type="date" value={approveDate} onChange={(e) => setApproveDate(e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:border-primary-container focus:outline-none bg-surface" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setActionMode(null)} className="py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low">Cancel</button>
                      <button onClick={() => handleAction(selectedPR.id, "approve")} disabled={processingId === selectedPR.id} className="py-2 bg-on-tertiary-container text-on-primary rounded-lg font-semibold text-sm disabled:opacity-50">
                        {processingId === selectedPR.id ? "..." : "Confirm"}
                      </button>
                    </div>
                  </div>
                )}
                {actionMode === "reject" && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Reason (optional)</label>
                      <input type="text" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Reason for rejection..." className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:border-error focus:outline-none bg-surface" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setActionMode(null)} className="py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low">Cancel</button>
                      <button onClick={() => handleAction(selectedPR.id, "reject")} disabled={processingId === selectedPR.id} className="py-2 bg-error text-on-error rounded-lg font-semibold text-sm disabled:opacity-50">
                        {processingId === selectedPR.id ? "..." : "Reject"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent History */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4">
              <p className="text-sm font-semibold text-on-background mb-3">Recent History</p>
              {(projects.find((p) => p.id === selectedPR.project?.id)?.installments?.slice(0, 3) || []).length === 0
                ? <p className="text-xs text-on-surface-variant">No history.</p>
                : projects.find((p) => p.id === selectedPR.project?.id)?.installments?.slice(0, 3).map((inst) => (
                  <div key={inst.id} className="flex justify-between items-center py-2 border-b border-outline-variant/50 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-on-background">{inst.description || "Installment"}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(inst.datePaid).toLocaleDateString("en-IN")}</p>
                    </div>
                    <p className="text-xs font-bold text-on-tertiary-container">{fmt(inst.amount)}</p>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="xl:w-80 flex-shrink-0">
            <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 block">payments</span>
              <p className="text-sm">Click a project row or payment request to see details here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
