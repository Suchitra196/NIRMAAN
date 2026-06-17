"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import StatusBadge from "@/components/StatusBadge"

interface Officer {
  id: string
  name: string | null
  email: string | null
}

interface Task {
  id: string
  title: string
  description: string | null
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  dueDate: string | null
}

interface Project {
  id: string
  name: string
  description: string | null
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  budgetPlanned: number
  budgetActual: number
  tenderAmount: number
  officer?: Officer | null
  contractor?: Officer | null
  tasks: Task[]
}

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [officers, setOfficers] = useState<Officer[]>([])
  const [contractors, setContractors] = useState<Officer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Editable fields
  const [editStatus, setEditStatus] = useState<"ONGOING" | "DELAYED" | "COMPLETED">("ONGOING")
  const [editDescription, setEditDescription] = useState("")
  const [editOfficerId, setEditOfficerId] = useState("")
  const [editContractorId, setEditContractorId] = useState("")

  // New task form
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", status: "PENDING" as Task["status"] })
  const [addingTask, setAddingTask] = useState(false)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)

  async function loadProject() {
    setLoading(true)
    try {
      const [pRes, oRes, cRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch("/api/users?role=OFFICER"),
        fetch("/api/users?role=CONTRACTOR"),
      ])
      if (pRes.ok) {
        const p: Project = await pRes.json()
        setProject(p)
        setEditStatus(p.status)
        setEditDescription(p.description || "")
        setEditOfficerId(p.officer?.id || "")
        setEditContractorId(p.contractor?.id || "")
      }
      if (oRes.ok) setOfficers(await oRes.json())
      if (cRes.ok) setContractors(await cRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProject() }, [id])

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
    return `₹${val.toLocaleString("en-IN")}`
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccessMsg("")
    try {
      const body: Record<string, unknown> = {
        status: editStatus,
        description: editDescription || null,
        officerId: editOfficerId || null,
        contractorId: editContractorId || null,
      }

      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to save.")
      } else {
        setSuccessMsg("Changes saved successfully.")
        await loadProject()
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveOfficer() {
    if (!confirm("Remove the assigned officer from this project?")) return
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId: null }),
      })
      setEditOfficerId("")
      await loadProject()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleRemoveContractor() {
    if (!confirm("Remove the assigned contractor from this project?")) return
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractorId: null }),
      })
      setEditContractorId("")
      await loadProject()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.title.trim()) return
    setAddingTask(true)
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || undefined,
          dueDate: newTask.dueDate || undefined,
          status: newTask.status,
          projectId: id,
        }),
      })
      if (res.ok) {
        setShowNewTaskForm(false)
        setNewTask({ title: "", description: "", dueDate: "", status: "PENDING" })
        await loadProject()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAddingTask(false)
    }
  }

  async function handleTaskStatusChange(taskId: string, status: Task["status"]) {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      await loadProject()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
      await loadProject()
    } catch (e) {
      console.error(e)
    }
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
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-on-surface-variant">Project not found.</p>
        <Link href="/admin/projects" className="text-primary-container underline mt-2 inline-block">Back to Projects</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/admin/projects" className="hover:text-primary-container transition-colors">Projects</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-background font-medium truncate max-w-[200px]">{project.name}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-background font-medium">Edit</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-background">{project.name}</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Edit project details and personnel</p>
        </div>
        <Link
          href="/admin/projects"
          className="flex items-center gap-1 px-4 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low transition-colors text-on-surface flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </Link>
      </div>

      {/* Read-only section */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 className="text-base font-bold text-on-background mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
          Project Details (Read-only)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Project Name</p>
            <p className="text-on-background font-medium">{project.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Budget Planned</p>
            <p className="text-on-background font-medium">{formatCurrency(project.budgetPlanned)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase mb-1">Tender Amount</p>
            <p className="text-on-background font-medium">{formatCurrency(project.tenderAmount)}</p>
          </div>
        </div>
      </div>

      {/* Editable form */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-5">
          <h2 className="text-base font-bold text-on-background mb-2">Editable Details</h2>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as "ONGOING" | "DELAYED" | "COMPLETED")}
              className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
            >
              <option value="ONGOING">Ongoing</option>
              <option value="DELAYED">Delayed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface resize-none"
              placeholder="Project description..."
            />
          </div>
        </div>

        {/* Personnel Management */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-5">
          <h2 className="text-base font-bold text-on-background mb-2">Personnel Management</h2>

          {/* Officer */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">Assigned Officer</label>
            {project.officer ? (
              <div className="flex items-center gap-3 p-3 bg-surface-container-low border border-outline-variant rounded-lg mb-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">badge</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-background">{project.officer.name || "—"}</p>
                  <p className="text-xs text-on-surface-variant">{project.officer.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveOfficer}
                  className="text-error hover:bg-error/10 p-1.5 rounded transition-colors text-xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">person_remove</span>
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant mb-2">No officer assigned.</p>
            )}
            <select
              value={editOfficerId}
              onChange={(e) => setEditOfficerId(e.target.value)}
              className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
            >
              <option value="">— {project.officer ? "Replace officer" : "Assign officer"} —</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>{o.name || o.email}</option>
              ))}
            </select>
          </div>

          {/* Contractor */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">Assigned Contractor</label>
            {project.contractor ? (
              <div className="flex items-center gap-3 p-3 bg-surface-container-low border border-outline-variant rounded-lg mb-2">
                <span className="material-symbols-outlined text-secondary-container text-[20px]">engineering</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-background">{project.contractor.name || "—"}</p>
                  <p className="text-xs text-on-surface-variant">{project.contractor.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveContractor}
                  className="text-error hover:bg-error/10 p-1.5 rounded transition-colors text-xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">person_remove</span>
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant mb-2">No contractor assigned.</p>
            )}
            <select
              value={editContractorId}
              onChange={(e) => setEditContractorId(e.target.value)}
              className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
            >
              <option value="">— {project.contractor ? "Replace contractor" : "Assign contractor"} —</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>{c.name || c.email}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-error bg-error/5 border border-error/20 rounded px-3 py-2">{error}</p>
        )}
        {successMsg && (
          <p className="text-sm text-on-tertiary-container bg-on-tertiary-container/5 border border-on-tertiary-container/20 rounded px-3 py-2">{successMsg}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/projects"
            className="px-5 py-2.5 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low transition-colors text-on-surface"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Tasks */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-on-background">Tasks</h2>
          <button
            onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Task
          </button>
        </div>

        {showNewTaskForm && (
          <form onSubmit={handleAddTask} className="bg-surface-container-low border border-outline-variant rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-on-background">New Task</h3>
            <input
              required
              type="text"
              placeholder="Task title *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
            />
            <textarea
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface resize-none"
            />
            <div className="flex gap-3">
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="flex-1 px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
              />
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task["status"] })}
                className="flex-1 px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewTaskForm(false)}
                className="px-3 py-1.5 border border-outline-variant rounded-lg text-sm hover:bg-surface-container transition-colors text-on-surface"
              >Cancel</button>
              <button
                type="submit"
                disabled={addingTask}
                className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {addingTask ? "Adding..." : "Add Task"}
              </button>
            </div>
          </form>
        )}

        {project.tasks.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6">No tasks yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-surface-container-low border border-outline-variant rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === "COMPLETED" ? "line-through text-on-surface-variant" : "text-on-background"}`}>
                    {task.title}
                  </p>
                  {task.description && <p className="text-xs text-on-surface-variant mt-0.5 truncate">{task.description}</p>}
                  {task.dueDate && (
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Due: {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={task.status} />
                  {task.status !== "COMPLETED" && (
                    <button
                      onClick={() => handleTaskStatusChange(task.id, "COMPLETED")}
                      className="p-1 text-on-tertiary-container hover:bg-on-tertiary-container/10 rounded transition-colors"
                      title="Mark complete"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-error hover:bg-error/10 rounded transition-colors"
                    title="Delete task"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
