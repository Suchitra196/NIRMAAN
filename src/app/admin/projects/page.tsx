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
    officerId: "",
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
    setForm({ name: "", description: "", budgetPlanned: "", tenderAmount: "", contractorId: "", officerId: "", status: "ONGOING" })
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
      officerId: p.officer?.id || "",
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4 py-8">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg border border-outline-variant my-auto">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface rounded-t-xl">
              <h3 className="text-xl font-bold text-on-background">
                {editProject ? "Edit Project" : "New Project"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-background p-1 rounded hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Project Name */}
              <div>
                <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Project Name <span className="text-error">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg font-body-md text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface transition-colors"
                  placeholder="Enter project name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg font-body-md text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface transition-colors resize-none"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>

              {/* Budget + Tender — stacked on mobile, side by side on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                    Budget Planned (₹) <span className="text-error">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.budgetPlanned}
                    onChange={(e) => setForm({ ...form, budgetPlanned: e.target.value })}
                    className="w-full px-3 py-2.5 border border-outline-variant rounded-lg font-body-md text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface transition-colors"
                    placeholder="e.g. 5000000"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                    Tender Amount (₹) <span className="text-error">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.tenderAmount}
                    onChange={(e) => setForm({ ...form, tenderAmount: e.target.value })}
                    className="w-full px-3 py-2.5 border border-outline-variant rounded-lg font-body-md text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface transition-colors"
                    placeholder="e.g. 4500000"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "ONGOING" | "DELAYED" | "COMPLETED" })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg font-body-md text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface transition-colors"
                >
                  <option value="ONGOING">Ongoing</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* Officer */}
              <div>
                <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Assign Officer
                </label>
                <select
                  value={form.officerId}
                  onChange={(e) => setForm({ ...form, officerId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg font-body-md text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface transition-colors"
                >
                  <option value="">— Select officer —</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>{o.name || o.email}</option>
                  ))}
                </select>
                {officers.length === 0 && (
                  <p className="text-xs text-on-surface-variant mt-1">No officers found. Register officers first.</p>
                )}
              </div>

              {/* Contractor */}
              <div>
                <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Assign Contractor
                </label>
                <select
                  value={form.contractorId}
                  onChange={(e) => setForm({ ...form, contractorId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg font-body-md text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface transition-colors"
                >
                  <option value="">— Select contractor —</option>
                  {contractors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.email}</option>
                  ))}
                </select>
                {contractors.length === 0 && (
                  <p className="text-xs text-on-surface-variant mt-1">No contractors found. Register contractors first.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-outline-variant rounded-lg font-title-md text-sm hover:bg-surface-container-low transition-colors text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-title-md text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
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
