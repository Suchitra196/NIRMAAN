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

export default function ContractorProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)

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

  useEffect(() => { loadProject() }, [id])

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
    </div>
  )
}
