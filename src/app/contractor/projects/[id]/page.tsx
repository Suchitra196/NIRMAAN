"use client"

import { use, useEffect, useRef, useState } from "react"
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
  createdAt: string
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

export default function ContractorProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)

  // Payment request state
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [paymentForm, setPaymentForm] = useState({ amount: "", description: "" })
  const [proofImages, setProofImages] = useState<string[]>([])
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const res = await fetch(`/api/payment-requests?projectId=${id}`)
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

  function openPaymentModal(task: Task) {
    setSelectedTask(task)
    setPaymentForm({ amount: "", description: "" })
    setProofImages([])
    setShowPaymentModal(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (proofImages.length + files.length > 5) {
      showToast("Maximum 5 images allowed.")
      return
    }
    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        showToast(`${file.name} exceeds 2MB limit.`)
        return
      }
      if (!file.type.startsWith("image/")) {
        showToast(`${file.name} is not an image.`)
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        setProofImages((prev) => [...prev, dataUrl])
      }
      reader.readAsDataURL(file)
    })
    // Reset input so the same file can be re-selected
    e.target.value = ""
  }

  function removeImage(idx: number) {
    setProofImages((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      showToast("Amount must be greater than 0.")
      return
    }
    if (!paymentForm.description.trim()) {
      showToast("Description is required.")
      return
    }
    setSubmittingPayment(true)
    try {
      const res = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          taskId: selectedTask?.id,
          amount: parseFloat(paymentForm.amount),
          description: paymentForm.description,
          proofImages,
        }),
      })
      if (res.ok) {
        setShowPaymentModal(false)
        showToast("Payment request submitted. Your officer has been notified.")
        await loadPaymentRequests()
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to submit payment request.")
      }
    } catch (e) {
      console.error(e)
      showToast("Failed to submit payment request.")
    } finally {
      setSubmittingPayment(false)
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
        <Link href="/contractor/projects" className="text-primary-container hover:underline mt-2 inline-block">← Back to contracts</Link>
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

      <div>
        <Link href="/contractor/projects" className="text-sm text-primary-container hover:underline flex items-center gap-1 mb-3">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Contracts
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-on-background">{project.name}</h2>
            {project.description && <p className="text-on-surface-variant mt-1">{project.description}</p>}
          </div>
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant rounded-lg p-4">
          <p className="text-xs text-on-surface-variant mb-1">Tender Amount</p>
          <p className="font-bold text-secondary-container">{formatCurrency(project.tenderAmount)}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-4">
          <p className="text-xs text-on-surface-variant mb-1">Budget Planned</p>
          <p className="font-bold text-primary-container">{formatCurrency(project.budgetPlanned)}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-4">
          <p className="text-xs text-on-surface-variant mb-1">Amount Paid</p>
          <p className="font-bold text-on-tertiary-container">{formatCurrency(project.budgetActual)}</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-4">
          <p className="text-xs text-on-surface-variant mb-1">Officer</p>
          <p className="font-bold text-on-background text-sm">{project.officer?.name || "—"}</p>
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
            <p>No tasks assigned.</p>
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
                <div className="flex items-center gap-2 flex-wrap justify-end">
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
                  {(task.status === "IN_PROGRESS" || task.status === "PENDING") && (
                    <button
                      onClick={() => openPaymentModal(task)}
                      className="text-xs bg-primary-container text-on-primary px-2 py-1 rounded font-semibold hover:opacity-90 transition-opacity"
                    >
                      Request Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Payment Requests */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">My Payment Requests ({paymentRequests.length})</h3>
        </div>
        {paymentRequests.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
            <p>No payment requests submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Description</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-right">Amount</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Task</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Status</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Date</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {paymentRequests.map((pr) => (
                  <tr key={pr.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 text-on-background max-w-[180px] truncate">{pr.description}</td>
                    <td className="p-4 text-right font-medium text-on-tertiary-container">{formatCurrency(pr.amount)}</td>
                    <td className="p-4 text-sm text-on-surface-variant">{pr.task?.title || "—"}</td>
                    <td className="p-4"><PaymentStatusBadge status={pr.status} /></td>
                    <td className="p-4 text-sm text-on-surface-variant">{new Date(pr.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-4 text-sm text-on-surface-variant max-w-[140px] truncate">{pr.officerNote || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Installments / Disbursements */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">Disbursement History ({project.installments.length})</h3>
        </div>
        {project.installments.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
            <p>No disbursements recorded.</p>
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

      {/* Payment Request Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-lg p-6 border border-outline-variant max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-background">Request Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-on-surface-variant hover:text-on-background">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {selectedTask && (
                <div>
                  <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Task</label>
                  <div className="w-full p-2 border border-outline-variant rounded font-body-md text-sm bg-surface-container-low text-on-surface-variant">
                    {selectedTask.title}
                  </div>
                </div>
              )}
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Amount (₹) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="any"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none bg-surface"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Description (work done) *</label>
                <textarea
                  required
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none bg-surface resize-none"
                  placeholder="Describe the work completed..."
                />
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1">
                  Proof Images ({proofImages.length}/5)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={proofImages.length >= 5}
                  className="flex items-center gap-2 border border-dashed border-outline-variant rounded px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Add images (max 5, 2MB each)
                </button>
                {proofImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {proofImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border border-outline-variant">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-0 right-0 bg-error text-on-error rounded-bl p-0.5"
                          aria-label="Remove image"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-md py-2 border border-outline-variant rounded font-title-md text-sm hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-md py-2 bg-primary-container text-on-primary rounded font-title-md text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submittingPayment ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
