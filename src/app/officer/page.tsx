"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import StatusBadge from "@/components/StatusBadge"

interface Task {
  id: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
}

interface Project {
  id: string
  name: string
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  budgetPlanned: number
  budgetActual: number
  tasks: Task[]
}

export default function OfficerDashboard() {
  const { data: session } = useSession()
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

  const allTasks = projects.flatMap((p) => p.tasks || [])
  const pendingTasks = allTasks.filter((t) => t.status === "PENDING").length
  const totalBudgetPlanned = projects.reduce((s, p) => s + p.budgetPlanned, 0)
  const totalBudgetActual = projects.reduce((s, p) => s + p.budgetActual, 0)
  const utilPct = totalBudgetPlanned > 0 ? ((totalBudgetActual / totalBudgetPlanned) * 100).toFixed(1) : "0"

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
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
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-on-background">Officer Dashboard</h2>
        <p className="text-on-surface-variant mt-1">Welcome back, {session?.user?.name || "Officer"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-title-md text-lg font-semibold text-on-surface">Active Projects</p>
            <span className="material-symbols-outlined text-secondary-container">construction</span>
          </div>
          <span className="text-4xl font-bold text-secondary-container">{projects.length}</span>
          <p className="text-xs text-on-surface-variant mt-1">Assigned to you</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-title-md text-lg font-semibold text-on-surface">Pending Tasks</p>
            <span className="material-symbols-outlined text-error">assignment_late</span>
          </div>
          <span className="text-4xl font-bold text-error">{pendingTasks}</span>
          <p className="text-xs text-on-surface-variant mt-1">Across all projects</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-on-tertiary-container"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-title-md text-lg font-semibold text-on-surface">Budget Utilization</p>
            <span className="material-symbols-outlined text-on-tertiary-container">account_balance_wallet</span>
          </div>
          <span className="text-4xl font-bold text-on-tertiary-container">{utilPct}%</span>
          <p className="text-xs text-on-surface-variant mt-1">
            {formatCurrency(totalBudgetActual)} / {formatCurrency(totalBudgetPlanned)}
          </p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-background">Your Projects</h3>
          <Link href="/officer/projects" className="text-sm font-medium text-primary-container hover:underline">
            View All
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">folder_open</span>
            <p>No projects assigned yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {projects.slice(0, 5).map((p) => {
              const completedTasks = p.tasks.filter((t) => t.status === "COMPLETED").length
              const totalTasks = p.tasks.length
              const taskPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
              return (
                <div key={p.id} className="p-4 hover:bg-surface-container-lowest transition-colors flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/officer/projects`} className="font-medium text-on-background hover:text-primary-container transition-colors truncate block">
                      {p.name}
                    </Link>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-surface-container-highest rounded-full h-1.5">
                        <div className="bg-secondary-container h-1.5 rounded-full" style={{ width: `${taskPct}%` }} />
                      </div>
                      <span className="text-xs text-on-surface-variant whitespace-nowrap">
                        {completedTasks}/{totalTasks} tasks
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
