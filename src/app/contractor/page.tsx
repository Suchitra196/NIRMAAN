"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import StatusBadge from "@/components/StatusBadge"

interface Task {
  id: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
}

interface Installment {
  id: string
  amount: number
}

interface Project {
  id: string
  name: string
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  tenderAmount: number
  tasks: Task[]
  installments: Installment[]
}

export default function ContractorDashboard() {
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
  const pendingTasks = allTasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length
  const totalDisbursed = projects.flatMap((p) => p.installments || []).reduce((s, i) => s + i.amount, 0)
  const totalTender = projects.reduce((s, p) => s + p.tenderAmount, 0)

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
        <h2 className="text-3xl font-bold text-on-background">Contractor Dashboard</h2>
        <p className="text-on-surface-variant mt-1">Welcome back, {session?.user?.name || "Contractor"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-on-tertiary-container"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-title-md text-lg font-semibold text-on-surface">Total Disbursed</p>
            <span className="material-symbols-outlined text-on-tertiary-container">account_balance_wallet</span>
          </div>
          <p className="text-4xl font-bold text-on-tertiary-container">{formatCurrency(totalDisbursed)}</p>
          <p className="text-xs text-on-surface-variant mt-1">Across {projects.length} projects</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-title-md text-lg font-semibold text-on-surface">Active Tasks</p>
            <span className="material-symbols-outlined text-secondary-container">pending_actions</span>
          </div>
          <p className="text-4xl font-bold text-secondary-container">{pendingTasks}</p>
          <p className="text-xs text-on-surface-variant mt-1">In progress / pending</p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-title-md text-lg font-semibold text-on-surface">Total Contracts</p>
            <span className="material-symbols-outlined text-primary-container">fact_check</span>
          </div>
          <p className="text-4xl font-bold text-primary-container">{formatCurrency(totalTender)}</p>
          <p className="text-xs text-on-surface-variant mt-1">Total tender value</p>
        </div>
      </div>

      {/* Active Contracts */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-background">Active Contracts</h3>
          <Link href="/contractor/projects" className="text-sm font-medium text-primary-container hover:underline">
            View All
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">construction</span>
            <p>No contracts assigned yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {projects.slice(0, 5).map((p) => {
              const completedTasks = p.tasks.filter((t) => t.status === "COMPLETED").length
              const totalTasks = p.tasks.length
              const pct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
              return (
                <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link href={`/contractor/projects/${p.id}`} className="font-medium text-on-background hover:text-primary-container transition-colors truncate block">
                      {p.name}
                    </Link>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-surface-container-highest rounded-full h-1.5">
                        <div className="bg-on-tertiary-container h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-on-surface-variant whitespace-nowrap">{pct.toFixed(0)}%</span>
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
