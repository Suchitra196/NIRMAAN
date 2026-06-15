"use client"

import { useEffect, useState } from "react"

interface Officer {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  managedProjects: { id: string }[]
}

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState("OFFICER")
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)

  async function loadOfficers() {
    setLoading(true)
    try {
      const res = await fetch("/api/users?role=OFFICER")
      if (res.ok) setOfficers(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOfficers() }, [])

  function startEdit(officer: Officer) {
    setEditingId(officer.id)
    setEditRole(officer.role)
    setEditName(officer.name || "")
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
      await loadOfficers()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-on-background">Officers</h2>
        <p className="text-on-surface-variant mt-1">Manage officer accounts and roles</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
        </div>
      ) : officers.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block">badge</span>
          <p className="font-title-md text-lg">No officers found</p>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Officer</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Email</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-center">Projects</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant">Role</th>
                  <th className="p-4 text-sm font-semibold text-on-surface-variant text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {officers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {officer.image ? (
                            <img src={officer.image} alt={officer.name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-primary-container text-[18px]">person</span>
                          )}
                        </div>
                        {editingId === officer.id ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border border-outline-variant rounded px-2 py-1 text-sm font-body-md focus:outline-none focus:border-primary-container"
                          />
                        ) : (
                          <span className="font-medium text-on-background">{officer.name || "—"}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant text-sm">{officer.email}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-container/10 text-primary-container font-bold text-sm">
                        {officer.managedProjects?.length || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      {editingId === officer.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="border border-outline-variant rounded px-2 py-1 text-sm font-body-md focus:outline-none focus:border-primary-container"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="OFFICER">Officer</option>
                          <option value="CONTRACTOR">Contractor</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-container/10 text-primary-container border border-primary-container/20">
                          {officer.role}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {editingId === officer.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => saveEdit(officer.id)}
                            disabled={saving}
                            className="text-on-tertiary-container hover:bg-tertiary-container/10 p-1.5 rounded transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[18px]">check</span>
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-error hover:bg-error/10 p-1.5 rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(officer)}
                          className="p-1.5 text-primary-container hover:bg-primary-container/10 rounded transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
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
