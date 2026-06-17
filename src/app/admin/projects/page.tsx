"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import StatusBadge from "@/components/StatusBadge"

interface Project {
  id: string
  name: string
  description: string | null
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  tenderAmount: number
  budgetPlanned: number
  budgetActual: number
  officer?: { id: string; name: string | null; email: string | null }
  contractor?: { id: string; name: string | null; email: string | null }
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const pRes = await fetch("/api/projects")
      if (pRes.ok) setProjects(await pRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return
    await fetch(`/api/projects/${id}`, { method: "DELETE" })
    await loadData()
  }

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
    return `₹${val.toLocaleString("en-IN")}`
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-background">Projects</h2>
          <p className="text-on-surface-variant mt-1">Manage all government projects</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-xs bg-primary text-on-primary px-md py-2 rounded-lg font-title-md font-semibold hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">add</span> New Project
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block">folder_open</span>
          <p className="font-title-md text-lg">No projects yet</p>
          <p className="font-body-md text-sm mt-1">Click &quot;New Project&quot; to get started.</p>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Name</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Status</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Officer</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Contractor</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-right">Tender Amount</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-medium text-on-background max-w-[200px]">
                      <p className="truncate">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-on-surface-variant truncate">{project.description}</p>
                      )}
                    </td>
                    <td className="p-4"><StatusBadge status={project.status} /></td>
                    <td className="p-4 text-on-surface-variant">{project.officer?.name || "—"}</td>
                    <td className="p-4 text-on-surface-variant">{project.contractor?.name || "—"}</td>
                    <td className="p-4 text-right text-on-surface-variant">{formatCurrency(project.tenderAmount)}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/projects/${project.id}/edit`}
                          className="p-1.5 text-primary-container hover:bg-primary-container/10 rounded transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-1.5 text-error hover:bg-error/10 rounded transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
