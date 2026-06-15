"use client"

import { useEffect, useState } from "react"
import StatusBadge from "@/components/StatusBadge"

interface Project {
  id: string
  name: string
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  budgetPlanned: number
  budgetActual: number
  tenderAmount: number
  tasks?: { id: string; status: string }[]
}

export default function AdminReportsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/projects")
        if (res.ok) setProjects(await res.json())
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const ongoing = projects.filter((p) => p.status === "ONGOING").length
  const delayed = projects.filter((p) => p.status === "DELAYED").length
  const completed = projects.filter((p) => p.status === "COMPLETED").length
  const total = projects.length

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
        <h2 className="text-3xl font-bold text-on-background">Reports</h2>
        <p className="text-on-surface-variant mt-1">Summary analytics across all projects</p>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-on-background">{total}</p>
          <p className="text-sm text-on-surface-variant mt-1">Total Projects</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-primary-container">{ongoing}</p>
          <p className="text-sm text-on-surface-variant mt-1">Ongoing</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-secondary-container">{delayed}</p>
          <p className="text-sm text-on-surface-variant mt-1">Delayed</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-5 text-center">
          <p className="text-3xl font-bold text-on-tertiary-container">{completed}</p>
          <p className="text-sm text-on-surface-variant mt-1">Completed</p>
        </div>
      </div>

      {/* Status distribution bar */}
      {total > 0 && (
        <div className="bg-surface border border-outline-variant rounded-lg p-6">
          <h3 className="text-lg font-bold text-on-background mb-4">Status Distribution</h3>
          <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
            {ongoing > 0 && (
              <div
                className="bg-primary-container/60 flex items-center justify-center text-[10px] text-on-primary font-bold"
                style={{ width: `${(ongoing / total) * 100}%` }}
                title={`Ongoing: ${ongoing}`}
              >
                {ongoing > 1 && ongoing}
              </div>
            )}
            {delayed > 0 && (
              <div
                className="bg-secondary-container flex items-center justify-center text-[10px] text-on-secondary font-bold"
                style={{ width: `${(delayed / total) * 100}%` }}
                title={`Delayed: ${delayed}`}
              >
                {delayed > 1 && delayed}
              </div>
            )}
            {completed > 0 && (
              <div
                className="bg-on-tertiary-container flex items-center justify-center text-[10px] text-on-primary font-bold"
                style={{ width: `${(completed / total) * 100}%` }}
                title={`Completed: ${completed}`}
              >
                {completed > 1 && completed}
              </div>
            )}
          </div>
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-3 h-3 rounded-full bg-primary-container/60 inline-block" /> Ongoing
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-3 h-3 rounded-full bg-secondary-container inline-block" /> Delayed
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-3 h-3 rounded-full bg-on-tertiary-container inline-block" /> Completed
            </div>
          </div>
        </div>
      )}

      {/* Budget Utilization Table */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-background">Budget Utilization per Project</h3>
        </div>
        {projects.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">bar_chart</span>
            <p>No data available.</p>
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
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-center">Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {projects.map((p) => {
                  const pct = p.budgetPlanned > 0 ? (p.budgetActual / p.budgetPlanned) * 100 : 0
                  const completedTasks = p.tasks?.filter((t) => t.status === "COMPLETED").length || 0
                  const totalTasks = p.tasks?.length || 0
                  return (
                    <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4 font-medium text-on-background max-w-[180px] truncate">{p.name}</td>
                      <td className="p-4"><StatusBadge status={p.status} /></td>
                      <td className="p-4 text-right text-on-surface-variant text-sm">{formatCurrency(p.budgetPlanned)}</td>
                      <td className="p-4 text-right text-on-surface-variant text-sm">{formatCurrency(p.budgetActual)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-surface-container-highest rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${pct > 100 ? "bg-error" : "bg-on-tertiary-container"}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-on-surface-variant w-10 text-right">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-sm text-on-surface-variant">
                        {totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
