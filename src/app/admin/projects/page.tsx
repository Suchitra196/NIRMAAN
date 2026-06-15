"use client"

import { useEffect, useState } from "react"
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

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [officers, setOfficers] = useState<User[]>([])
  const [contractors, setContractors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    budgetPlanned: "",
    tenderAmount: "",
    contractorId: "",
    status: "ONGOING" as "ONGOING" | "DELAYED" | "COMPLETED",
  })

  async function loadData() {
    setLoading(true)
    try {
      const [pRes, oRes, cRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/users?role=OFFICER"),
        fetch("/api/users?role=CONTRACTOR"),
      ])
      if (pRes.ok) setProjects(await pRes.json())
      if (oRes.ok) setOfficers(await oRes.json())
      if (cRes.ok) setContractors(await cRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function openCreate() {
    setEditProject(null)
    setForm({ name: "", description: "", budgetPlanned: "", tenderAmount: "", contractorId: "", status: "ONGOING" })
    setShowModal(true)
  }

  function openEdit(p: Project) {
    setEditProject(p)
    setForm({
      name: p.name,
      description: p.description || "",
      budgetPlanned: String(p.budgetPlanned),
      tenderAmount: String(p.tenderAmount),
      contractorId: p.contractor?.id || "",
      status: p.status,
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body = { ...form }
      if (editProject) {
        await fetch(`/api/projects/${editProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      }
      setShowModal(false)
      await loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

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
        <button
          onClick={openCreate}
          className="flex items-center gap-xs bg-primary-container text-on-primary px-md py-2 rounded font-title-md font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span> New Project
        </button>
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
                        <button
                          onClick={() => openEdit(project)}
                          className="p-1.5 text-primary-container hover:bg-primary-container/10 rounded transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-lg p-6 border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-background">
                {editProject ? "Edit Project" : "New Project"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-background"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Project Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Budget Planned (₹) *</label>
                  <input
                    required
                    type="number"
                    value={form.budgetPlanned}
                    onChange={(e) => setForm({ ...form, budgetPlanned: e.target.value })}
                    className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Tender Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    value={form.tenderAmount}
                    onChange={(e) => setForm({ ...form, tenderAmount: e.target.value })}
                    className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "ONGOING" | "DELAYED" | "COMPLETED" })}
                    className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none"
                  >
                    <option value="ONGOING">Ongoing</option>
                    <option value="DELAYED">Delayed</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Contractor</label>
                  <select
                    value={form.contractorId}
                    onChange={(e) => setForm({ ...form, contractorId: e.target.value })}
                    className="w-full p-2 border border-outline-variant rounded font-body-md text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 focus:outline-none"
                  >
                    <option value="">None</option>
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.email}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-md py-2 border border-outline-variant rounded font-title-md text-sm hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-md py-2 bg-primary-container text-on-primary rounded font-title-md text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editProject ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
