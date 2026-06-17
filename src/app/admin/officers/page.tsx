"use client"

import { useEffect, useState } from "react"
import { DEPARTMENT_LABELS, DepartmentKey } from "@/lib/hierarchy"

interface OfficerUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  status: string
  designation: string | null
  department: string
  hierarchyLevel: number
  isDeptAdmin: boolean
  managedProjects: { id: string }[]
  contractedProjects: { id: string }[]
}

type FilterTab = "ALL" | "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED" | "CONTRACTORS"

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Active", cls: "bg-on-tertiary-container/10 text-on-tertiary-container border-on-tertiary-container/20" },
    PENDING_APPROVAL: { label: "Pending", cls: "bg-secondary-container/10 text-secondary-container border-secondary-container/20" },
    SUSPENDED: { label: "Suspended", cls: "bg-error/10 text-error border-error/20" },
  }
  const cfg = map[status] ?? { label: status, cls: "bg-surface-container text-on-surface-variant border-outline-variant" }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

export default function AdminOfficersPage() {
  const [allUsers, setAllUsers] = useState<OfficerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<FilterTab>("ALL")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState("OFFICER")
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)

  async function loadUsers() {
    setLoading(true)
    try {
      // Fetch officers + contractors
      const [oRes, cRes] = await Promise.all([
        fetch("/api/users?role=OFFICER"),
        fetch("/api/users?role=CONTRACTOR"),
      ])
      const officers: OfficerUser[] = oRes.ok ? await oRes.json() : []
      const contractors: OfficerUser[] = cRes.ok ? await cRes.json() : []
      setAllUsers([...officers, ...contractors])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  function getFiltered(): OfficerUser[] {
    if (filterTab === "ALL") return allUsers.filter((u) => u.role === "OFFICER")
    if (filterTab === "CONTRACTORS") return allUsers.filter((u) => u.role === "CONTRACTOR")
    return allUsers.filter((u) => u.role === "OFFICER" && u.status === filterTab)
  }

  const filtered = getFiltered()
  const officerCount = allUsers.filter((u) => u.role === "OFFICER").length
  const activeCount = allUsers.filter((u) => u.role === "OFFICER" && u.status === "ACTIVE").length
  const pendingCount = allUsers.filter((u) => u.role === "OFFICER" && u.status === "PENDING_APPROVAL").length
  const suspendedCount = allUsers.filter((u) => u.role === "OFFICER" && u.status === "SUSPENDED").length
  const contractorCount = allUsers.filter((u) => u.role === "CONTRACTOR").length

  function startEdit(user: OfficerUser) {
    setEditingId(user.id)
    setEditRole(user.role)
    setEditName(user.name || "")
  }

  async function saveEdit(id: string) {
    setSaving(true)
    try {
      await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole, name: editName }),
      })
      setEditingId(null)
      await loadUsers()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleSuspend(id: string) {
    if (!confirm("Suspend this user? They will not be able to log in.")) return
    try {
      await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SUSPENDED" }),
      })
      await loadUsers()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleActivate(id: string) {
    try {
      await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      })
      await loadUsers()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently remove this user from the system? This cannot be undone.")) return
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" })
      await loadUsers()
    } catch (e) {
      console.error(e)
    }
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: "All Officers", count: officerCount },
    { key: "ACTIVE", label: "Active", count: activeCount },
    { key: "PENDING_APPROVAL", label: "Pending", count: pendingCount },
    { key: "SUSPENDED", label: "Suspended", count: suspendedCount },
    { key: "CONTRACTORS", label: "Contractors", count: contractorCount },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-on-background">Officers &amp; Users</h2>
        <p className="text-on-surface-variant mt-1">Manage officer accounts, roles, and access</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-outline-variant overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              filterTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab.label}
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
              filterTab === tab.key
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block">badge</span>
          <p className="font-title-md text-lg">No users found</p>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Name</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Designation</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Department</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-center">Level</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Status</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-center">Projects</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-primary-container text-[18px]">person</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          {editingId === user.id ? (
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="border border-outline-variant rounded px-2 py-1 text-sm font-body-md focus:outline-none focus:border-primary-container"
                            />
                          ) : (
                            <p className="font-medium text-on-background truncate">{user.name || "—"}</p>
                          )}
                          <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant max-w-[180px]">
                      <p className="truncate">{user.designation || "—"}</p>
                      {user.isDeptAdmin && (
                        <span className="text-[10px] font-semibold text-primary-container">Dept Admin</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">
                      {user.department && user.department !== "NONE"
                        ? DEPARTMENT_LABELS[user.department as DepartmentKey] || user.department
                        : "—"}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        user.hierarchyLevel <= 3
                          ? "bg-error/10 text-error"
                          : user.hierarchyLevel <= 5
                          ? "bg-secondary-container/20 text-secondary-container"
                          : "bg-surface-container text-on-surface-variant"
                      }`}>
                        {user.hierarchyLevel >= 99 ? "—" : user.hierarchyLevel}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusChip status={user.status} />
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-container/10 text-primary-container font-bold text-sm">
                        {user.role === "CONTRACTOR"
                          ? user.contractedProjects?.length || 0
                          : user.managedProjects?.length || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {editingId === user.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => saveEdit(user.id)}
                            disabled={saving}
                            className="text-on-tertiary-container hover:bg-tertiary-container/10 p-1.5 rounded transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            <span className="material-symbols-outlined text-[18px]">check</span>
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-error hover:bg-error/10 p-1.5 rounded transition-colors"
                            title="Cancel"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(user)}
                            className="p-1.5 text-primary-container hover:bg-primary-container/10 rounded transition-colors"
                            title="Edit name/role"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {user.status === "SUSPENDED" ? (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="p-1.5 text-on-tertiary-container hover:bg-on-tertiary-container/10 rounded transition-colors"
                              title="Re-activate"
                            >
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(user.id)}
                              className="p-1.5 text-secondary-container hover:bg-secondary-container/10 rounded transition-colors"
                              title="Suspend"
                            >
                              <span className="material-symbols-outlined text-[18px]">block</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 text-error hover:bg-error/10 rounded transition-colors"
                            title="Remove from system"
                          >
                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                          </button>
                        </div>
                      )}
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
