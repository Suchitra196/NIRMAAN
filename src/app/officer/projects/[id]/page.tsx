"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import StatusBadge from "@/components/StatusBadge"

interface Task {
  id: string
  title: string
  description: string | null
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  dueDate: string | null
}

interface Installment {
  id: string
  amount: number
  datePaid: string
  description: string | null
}

interface PaymentRequest {
  id: string
  amount: number
  description: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  officerNote: string | null
  proofImages: string[]
  createdAt: string
  contractor: { id: string; name: string | null; email: string | null }
  task: { id: string; title: string } | null
}

interface Project {
  id: string
  name: string
  description: string | null
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  budgetPlanned: number
  budgetActual: number
  tenderAmount: number
  officer?: { id: string; name: string | null; email: string | null }
  contractor?: { id: string; name: string | null; email: string | null }
  tasks: Task[]
  installments: Installment[]
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

export default function OfficerProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)

  // Payment requests
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [actionState, setActionState] = useState<Record<string, { mode: "approve" | "reject" | null; datePaid: string; rejectNote: string }>>({})
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  async function loadProject() {
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (res.ok) setProject(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadPaymentRequests() {
    try {
      const res = await fetch(`/api/payment-requests?projectId=${id}&status=PENDING`)
      if (res.ok) setPaymentRequests(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadProject()
    loadPaymentRequests()
  }, [id])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  async function updateTaskStatus(taskId: string, newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED") {
    setUpdatingTask(taskId)
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      await loadProject()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingTask(null)
    }
  }

  function getActionState(prId: string) {
    return actionState[prId] || { mode: null, datePaid: "", rejectNote: "" }
  }

  function setMode(prId: string, mode: "approve" | "reject" | null) {
    setActionState((prev) => ({
      ...prev,
      [prId]: { ...getActionState(prId), mode },
    }))
  }

  function setDatePaid(prId: string, datePaid: string) {
    setActionState((prev) => ({
      ...prev,
      [prId]: { ...getActionState(prId), datePaid },
    }))
  }

  function setRejectNote(prId: string, rejectNote: string) {
    setActionState((prev) => ({
      ...prev,
      [prId]: { ...getActionState(prId), rejectNote },
    }))
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
        showToast(action === "approve" ? "Payment approved and installment recorded." : "Payment request rejected.")
        await loadProject()
        await loadPaymentRequests()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-2 block">error_outline</span>
        <p>Project not found.</p>
        <Link href="/officer/projects" className="text-primary-container hover:underline mt-2 inline-block">← Back to projects</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-on-background text-background px-4 py-3 rounded shadow-lg text-sm max-w-sm">
          {toast}
        </div>
      )}

      {/* Back + Header */}
      <div>
        <Link href="/officer/projects" className="text-sm text-primary-container hover:underline flex items-center gap-1 mb-3">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-on-background">{project.name}</h2>
            {project.description && <p className="text-on-surface-variant mt-1">{project.description}</p>}
          </div>
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant rounded-lg p-4">
          <p className="text-xs text-on-surface-variant mb-1">Budget Planned</p>
          <p className="font-bold text-primary-container">{formatCurrency(project.budgetPlanned)}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-4">
          <p className="text-xs text-on-surface-variant mb-1">Budget Actual</p>
          <p className="font-bold text-on-tertiary-container">{formatCurrency(project.budgetActual)}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-4">
          <p className="text-xs text-on-surface-variant mb-1">Tender Amount</p>
          <p className="font-bold text-secondary-container">{formatCurrency(project.tenderAmount)}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-4">
          <p className="text-xs text-on-surface-variant mb-1">Contractor</p>
          <p className="font-bold text-on-background text-sm">{project.contractor?.name || "—"}</p>
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">Tasks ({project.tasks.length})</h3>
        </div>
        {project.tasks.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">task_alt</span>
            <p>No tasks yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {project.tasks.map((task) => (
              <div key={task.id} className="p-4 flex items-start gap-4 hover:bg-surface-container-lowest transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-background">{task.title}</p>
                  {task.description && <p className="text-sm text-on-surface-variant mt-0.5">{task.description}</p>}
                  {task.dueDate && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status} />
                  <select
                    value={task.status}
                    disabled={updatingTask === task.id}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED")}
                    className="text-xs border border-outline-variant rounded px-2 py-1 font-body-md focus:outline-none focus:border-primary-container disabled:opacity-50"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Installments */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">Installments ({project.installments.length})</h3>
        </div>
        {project.installments.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
            <p>No installments recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Date</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Description</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {project.installments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 text-sm text-on-surface-variant">
                      {new Date(inst.datePaid).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 text-on-background">{inst.description || "—"}</td>
                    <td className="p-4 text-right font-medium text-on-tertiary-container">{formatCurrency(inst.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Requests */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">
            Pending Payment Requests ({paymentRequests.length})
          </h3>
        </div>
        {paymentRequests.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">payments</span>
            <p>No pending payment requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {paymentRequests.map((pr) => {
              const state = getActionState(pr.id)
              return (
                <div key={pr.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-on-background">{pr.contractor.name || pr.contractor.email}</span>
                        <PaymentStatusBadge status={pr.status} />
                      </div>
                      <p className="text-sm text-on-surface-variant">{pr.description}</p>
                      {pr.task && (
                        <p className="text-xs text-on-surface-variant mt-1">Task: {pr.task.title}</p>
                      )}
                      <p className="text-xs text-on-surface-variant mt-1">
                        {new Date(pr.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-primary-container">{formatCurrency(pr.amount)}</p>
                    </div>
                  </div>

                  {/* Proof Images */}
                  {pr.proofImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {pr.proofImages.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded overflow-hidden border border-outline-variant hover:opacity-80 transition-opacity">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  {state.mode === null && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMode(pr.id, "approve")}
                        className="px-3 py-1.5 bg-on-tertiary-container text-on-primary rounded text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        Approve Payment
                      </button>
                      <button
                        onClick={() => setMode(pr.id, "reject")}
                        className="px-3 py-1.5 border border-error text-error rounded text-sm font-semibold hover:bg-error/10 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {state.mode === "approve" && (
                    <div className="flex items-end gap-2 flex-wrap">
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Date Paid</label>
                        <input
                          type="date"
                          value={state.datePaid}
                          onChange={(e) => setDatePaid(pr.id, e.target.value)}
                          className="p-2 border border-outline-variant rounded text-sm focus:border-primary-container focus:outline-none bg-surface"
                        />
                      </div>
                      <button
                        onClick={() => handleAction(pr.id, "approve")}
                        disabled={processingId === pr.id}
                        className="px-3 py-2 bg-on-tertiary-container text-on-primary rounded text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                      >
                        {processingId === pr.id ? "Processing..." : "Confirm Approve"}
                      </button>
                      <button onClick={() => setMode(pr.id, null)} className="px-3 py-2 border border-outline-variant rounded text-sm hover:bg-surface-container-low">
                        Cancel
                      </button>
                    </div>
                  )}

                  {state.mode === "reject" && (
                    <div className="flex items-end gap-2 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-on-surface-variant mb-1">Reason (optional)</label>
                        <input
                          type="text"
                          value={state.rejectNote}
                          onChange={(e) => setRejectNote(pr.id, e.target.value)}
                          placeholder="Reason for rejection..."
                          className="w-full p-2 border border-outline-variant rounded text-sm focus:border-error focus:outline-none bg-surface"
                        />
                      </div>
                      <button
                        onClick={() => handleAction(pr.id, "reject")}
                        disabled={processingId === pr.id}
                        className="px-3 py-2 bg-error text-on-error rounded text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                      >
                        {processingId === pr.id ? "Processing..." : "Confirm Reject"}
                      </button>
                      <button onClick={() => setMode(pr.id, null)} className="px-3 py-2 border border-outline-variant rounded text-sm hover:bg-surface-container-low">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
