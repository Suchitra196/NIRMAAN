"use client"

import { useEffect, useState } from "react"

interface PaymentRequest {
  id: string
  amount: number
  description: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  officerNote: string | null
  createdAt: string
  project: { id: string; name: string }
  contractor: { id: string; name: string | null; email: string | null }
  task: { id: string; title: string } | null
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

export default function OfficerPaymentsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"PENDING" | "ALL">("PENDING")
  const [actionState, setActionState] = useState<Record<string, { mode: "approve" | "reject" | null; datePaid: string; rejectNote: string }>>({})
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  async function loadRequests() {
    setLoading(true)
    try {
      const res = await fetch("/api/payment-requests")
      if (res.ok) setRequests(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  function getActionState(prId: string) {
    return actionState[prId] || { mode: null, datePaid: "", rejectNote: "" }
  }

  function setMode(prId: string, mode: "approve" | "reject" | null) {
    setActionState((prev) => ({ ...prev, [prId]: { ...getActionState(prId), mode } }))
  }

  function setDatePaid(prId: string, datePaid: string) {
    setActionState((prev) => ({ ...prev, [prId]: { ...getActionState(prId), datePaid } }))
  }

  function setRejectNote(prId: string, rejectNote: string) {
    setActionState((prev) => ({ ...prev, [prId]: { ...getActionState(prId), rejectNote } }))
  }

  async function handleAction(prId: string, action: "approve" | "reject") {
    setProcessingId(prId)
    const state = getActionState(prId)
    try {
      const res = await fetch(`/api/payment-requests/${prId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "approve" && state.datePaid ? { datePaid: state.datePaid } : {}),
          ...(action === "reject" && state.rejectNote ? { officerNote: state.rejectNote } : {}),
        }),
      })
      if (res.ok) {
        showToast(action === "approve" ? "Payment approved." : "Payment rejected.")
        await loadRequests()
      } else {
        const data = await res.json()
        showToast(data.error || "Action failed.")
      }
    } catch (e) {
      console.error(e)
      showToast("Action failed.")
    } finally {
      setProcessingId(null)
    }
  }

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`
    return `₹${val.toLocaleString("en-IN")}`
  }

  const displayRequests = activeTab === "PENDING"
    ? requests.filter((r) => r.status === "PENDING")
    : requests

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-on-background text-background px-4 py-3 rounded shadow-lg text-sm max-w-sm">
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold text-on-background">Payment Requests</h2>
        <p className="text-on-surface-variant mt-1">Review and approve contractor payment requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-outline-variant">
        {(["PENDING", "ALL"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary-container text-primary-container"
                : "border-transparent text-on-surface-variant hover:text-on-background"
            }`}
          >
            {tab === "PENDING" ? `Pending (${requests.filter((r) => r.status === "PENDING").length})` : `All (${requests.length})`}
          </button>
        ))}
      </div>

      {displayRequests.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 block">payments</span>
          <p>No {activeTab === "PENDING" ? "pending " : ""}payment requests.</p>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Project</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Contractor</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-right">Amount</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Description</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Status</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Date</th>
                  {activeTab === "PENDING" && (
                    <th className="p-4 text-sm font-semibold text-on-surface-variant">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayRequests.map((pr) => {
                  const state = getActionState(pr.id)
                  return (
                    <>
                      <tr key={pr.id} className="border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors">
                        <td className="p-4 font-medium text-on-background max-w-[140px] truncate">{pr.project.name}</td>
                        <td className="p-4 text-on-surface-variant text-sm">{pr.contractor.name || pr.contractor.email}</td>
                        <td className="p-4 text-right font-medium text-primary-container">{formatCurrency(pr.amount)}</td>
                        <td className="p-4 text-on-surface-variant text-sm max-w-[160px] truncate">{pr.description}</td>
                        <td className="p-4"><PaymentStatusBadge status={pr.status} /></td>
                        <td className="p-4 text-sm text-on-surface-variant">{new Date(pr.createdAt).toLocaleDateString("en-IN")}</td>
                        {activeTab === "PENDING" && (
                          <td className="p-4">
                            {pr.status === "PENDING" && state.mode === null && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setMode(pr.id, "approve")}
                                  className="px-2 py-1 bg-on-tertiary-container text-on-primary rounded text-xs font-semibold hover:opacity-90"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setMode(pr.id, "reject")}
                                  className="px-2 py-1 border border-error text-error rounded text-xs font-semibold hover:bg-error/10"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                      {/* Inline action row */}
                      {pr.status === "PENDING" && state.mode !== null && (
                        <tr key={`${pr.id}-action`} className="bg-surface-container-low border-b border-outline-variant/50">
                          <td colSpan={activeTab === "PENDING" ? 7 : 6} className="px-4 py-3">
                            {state.mode === "approve" && (
                              <div className="flex items-end gap-2 flex-wrap">
                                <div>
                                  <label className="block text-xs text-on-surface-variant mb-1">Date Paid</label>
                                  <input
                                    type="date"
                                    value={state.datePaid}
                                    onChange={(e) => setDatePaid(pr.id, e.target.value)}
                                    className="p-1.5 border border-outline-variant rounded text-sm focus:border-primary-container focus:outline-none bg-surface"
                                  />
                                </div>
                                <button
                                  onClick={() => handleAction(pr.id, "approve")}
                                  disabled={processingId === pr.id}
                                  className="px-3 py-1.5 bg-on-tertiary-container text-on-primary rounded text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                                >
                                  {processingId === pr.id ? "Processing..." : "Confirm Approve"}
                                </button>
                                <button onClick={() => setMode(pr.id, null)} className="px-3 py-1.5 border border-outline-variant rounded text-sm hover:bg-surface-container">
                                  Cancel
                                </button>
                              </div>
                            )}
                            {state.mode === "reject" && (
                              <div className="flex items-end gap-2 flex-wrap">
                                <div className="flex-1 min-w-[200px]">
                                  <label className="block text-xs text-on-surface-variant mb-1">Reason</label>
                                  <input
                                    type="text"
                                    value={state.rejectNote}
                                    onChange={(e) => setRejectNote(pr.id, e.target.value)}
                                    placeholder="Optional reason..."
                                    className="w-full p-1.5 border border-outline-variant rounded text-sm focus:outline-none bg-surface"
                                  />
                                </div>
                                <button
                                  onClick={() => handleAction(pr.id, "reject")}
                                  disabled={processingId === pr.id}
                                  className="px-3 py-1.5 bg-error text-on-error rounded text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                                >
                                  {processingId === pr.id ? "Processing..." : "Confirm Reject"}
                                </button>
                                <button onClick={() => setMode(pr.id, null)} className="px-3 py-1.5 border border-outline-variant rounded text-sm hover:bg-surface-container">
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
