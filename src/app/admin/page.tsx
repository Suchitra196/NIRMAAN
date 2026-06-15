"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import StatusBadge from "@/components/StatusBadge"

interface Project {
  id: string
  name: string
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  tenderAmount: number
  budgetPlanned: number
  budgetActual: number
  officer?: { id: string; name: string | null; email: string | null }
  contractor?: { id: string; name: string | null; email: string | null }
  createdAt: string
}

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [officers, setOfficers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, userRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/users?role=OFFICER"),
        ])
        if (projRes.ok) setProjects(await projRes.json())
        if (userRes.ok) setOfficers(await userRes.json())
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalTender = projects.reduce((sum, p) => sum + (p.tenderAmount || 0), 0)
  const recentProjects = projects.slice(0, 5)

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
      {/* Page Header */}
      <div>
        <h2 className="text-4xl font-bold text-on-background">Ministry Dashboard</h2>
        <p className="text-lg text-on-surface-variant mt-2">
          Welcome back, {session?.user?.name || "Administrator"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative overflow-hidden hover:border-primary-container/50 transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xl font-semibold text-on-surface-variant">Total Projects</span>
            <span className="material-symbols-outlined text-secondary-container">account_tree</span>
          </div>
          <div className="text-4xl text-secondary-container font-bold">{projects.length}</div>
          <p className="text-sm text-on-surface-variant mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-on-tertiary-container text-[14px]">info</span>
            {projects.filter((p) => p.status === "ONGOING").length} ongoing
          </p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative overflow-hidden hover:border-primary-container/50 transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xl font-semibold text-on-surface-variant">Active Officers</span>
            <span className="material-symbols-outlined text-primary-container">badge</span>
          </div>
          <div className="text-4xl text-primary-container font-bold">{officers.length}</div>
          <p className="text-sm text-on-surface-variant mt-2">Registered in system</p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-lg p-6 relative overflow-hidden hover:border-primary-container/50 transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary-container"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xl font-semibold text-on-surface-variant">Total Tender Value</span>
            <span className="material-symbols-outlined text-on-tertiary-container">payments</span>
          </div>
          <div className="text-4xl text-on-tertiary-container font-bold">{formatCurrency(totalTender)}</div>
          <p className="text-sm text-on-surface-variant mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-on-tertiary-container text-[14px]">check_circle</span>
            Across all projects
          </p>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-surface border border-outline-variant rounded-lg p-0 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-background">Recent Projects</h3>
          <Link href="/admin/projects" className="text-sm font-medium text-primary-container hover:underline">
            View All
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block">folder_open</span>
            <p>No projects yet. <Link href="/admin/projects" className="text-primary-container hover:underline">Create one</Link></p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Project Name</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Officer</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Status</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-right">Tender Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-surface-container-lowest transition-colors group cursor-pointer">
                    <td className="p-4 font-medium text-on-background group-hover:text-primary-container transition-colors">
                      <Link href={`/admin/projects`}>{project.name}</Link>
                    </td>
                    <td className="p-4 text-on-surface-variant">{project.officer?.name || "—"}</td>
                    <td className="p-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="p-4 text-right text-on-surface-variant">{formatCurrency(project.tenderAmount)}</td>
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
