"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import StatusBadge from "@/components/StatusBadge"

interface Task {
  id: string
  title: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
}

interface Project {
  id: string
  name: string
  description: string | null
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  tenderAmount: number
  tasks: Task[]
  officer?: { id: string; name: string | null; email: string | null }
}

export default function ContractorProjectsPage() {
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-on-background">My Contracts</h2>
        <p className="text-on-surface-variant mt-1">{projects.length} contract{projects.length !== 1 ? "s" : ""} assigned to you</p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block">construction</span>
          <p className="font-title-md text-lg">No contracts assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            const completedTasks = project.tasks.filter((t) => t.status === "COMPLETED").length
            const totalTasks = project.tasks.length
            const pct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
            return (
              <div key={project.id} className="bg-surface border border-outline-variant rounded-lg p-6 relative hover:border-primary-container/40 transition-colors hover:shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-on-tertiary-container"></div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-title-md text-lg font-semibold text-on-surface truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                {project.officer && (
                  <p className="text-xs text-on-surface-variant mb-1">
                    <span className="font-medium">Officer:</span> {project.officer.name || project.officer.email}
                  </p>
                )}

                <p className="text-xs text-on-surface-variant mb-3">
                  <span className="font-medium">Tender:</span> {formatCurrency(project.tenderAmount)}
                </p>

                <div className="mb-2 flex justify-between text-xs text-on-surface-variant">
                  <span>Progress</span>
                  <span className="font-semibold">{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 mb-4">
                  <div className="bg-on-tertiary-container h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>

                <Link
                  href={`/contractor/projects/${project.id}`}
                  className="flex items-center justify-center gap-1 w-full bg-primary-container/10 text-primary-container border border-primary-container/20 py-2 rounded font-title-md text-sm font-semibold hover:bg-primary-container/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span> View Details
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
