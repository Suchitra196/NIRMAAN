"use client"

import React, { useEffect, useState } from "react"
import { DESIGNATIONS, DEPARTMENT_LABELS, DepartmentKey } from "@/lib/hierarchy"

interface LoginRequest {
  id: string
  name: string
  email: string | null
  phone: string | null
  requestedRole: string
  status: string
  adminNote: string | null
  createdAt: string
}

interface PendingUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  status: string
  createdAt: string
  providers: string[]
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 font-body-md text-sm">
      <span className="material-symbols-outlined text-[18px]">check_circle</span>
      {message}
    </div>
  )
}

type Tab = "credentials" | "google"

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("credentials")
  const [requests, setRequests] = useState<LoginRequest[]>([])
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Credential-request reject state
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Google user approval modal state
  const [approvingUser, setApprovingUser] = useState<PendingUser | null>(null)
  const [approveForm, setApproveForm] = useState({
    role: "OFFICER",
    designation: "",
    department: "" as DepartmentKey | "",
  })

  async function loadData() {
    setLoading(true)
    try {
      const [credRes, pendingRes] = await Promise.all([
        fetch("/api/login-requests?status=PENDING"),
        fetch("/api/users/pending"),
      ])
      if (credRes.ok) setRequests(await credRes.json())
      if (pendingRes.ok) setPendingUsers(await pendingRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // ─── Credential requests ───────────────────────────────────────────────────
  async function handleApprove(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/login-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })
      if (res.ok) {
        setToast("Request approved — user account created.")
        await loadData()
      } else {
        const data = await res.json()
        setToast(`Error: ${data.error || "Failed to approve"}`)
      }
    } catch {
      setToast("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/login-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", adminNote: rejectNote }),
      })
      if (res.ok) {
        setToast("Request rejected.")
        setRejectingId(null)
        setRejectNote("")
        await loadData()
      } else {
        const data = await res.json()
        setToast(`Error: ${data.error || "Failed to reject"}`)
      }
    } catch {
      setToast("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Google sign-in pending users ─────────────────────────────────────────
  function openApproveModal(user: PendingUser) {
    setApprovingUser(user)
    setApproveForm({ role: "OFFICER", designation: "", department: "" })
  }

  async function handleApproveGoogleUser() {
    if (!approvingUser) return
    setActionLoading(approvingUser.id)
    try {
      const res = await fetch(`/api/users/${approvingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ACTIVE",
          role: approveForm.role,
          designation: approveForm.designation || undefined,
          department: approveForm.department || undefined,
        }),
      })
      if (res.ok) {
        setToast("User approved and activated.")
        setApprovingUser(null)
        await loadData()
      } else {
        const data = await res.json()
        setToast(`Error: ${data.error || "Failed to approve"}`)
      }
    } catch {
      setToast("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleSuspendUser(id: string) {
    if (!confirm("Suspend this user? They will not be able to log in.")) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SUSPENDED" }),
      })
      if (res.ok) {
        setToast("User suspended.")
        await loadData()
      }
    } catch {
      setToast("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  const credentialsBadge = requests.length
  const googleBadge = pendingUsers.length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div>
        <h2 className="text-3xl font-bold text-on-background">Pending Requests</h2>
        <p className="text-on-surface-variant mt-1">Review and approve or reject access requests</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant gap-1">
        <button
          onClick={() => setActiveTab("credentials")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "credentials"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Credential Requests
          {credentialsBadge > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error text-on-error text-[10px] font-bold">
              {credentialsBadge}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("google")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "google"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Google Sign-in Requests
          {googleBadge > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error text-on-error text-[10px] font-bold">
              {googleBadge}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
        </div>
      ) : activeTab === "credentials" ? (
        <>
          {requests.length === 0 ? (
            <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 block">pending_actions</span>
              <p className="font-title-md text-lg">No pending credential requests</p>
              <p className="text-sm mt-1">New registration requests will appear here.</p>
            </div>
          ) : (
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      <th className="p-4 text-sm font-semibold text-on-surface-variant">Name</th>
                      <th className="p-4 text-sm font-semibold text-on-surface-variant">Contact</th>
                      <th className="p-4 text-sm font-semibold text-on-surface-variant">Requested Role</th>
                      <th className="p-4 text-sm font-semibold text-on-surface-variant">Submitted</th>
                      <th className="p-4 text-sm font-semibold text-on-surface-variant text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {requests.map((req) => (
                      <React.Fragment key={req.id}>
                        <tr className="hover:bg-surface-container-lowest transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-primary-container text-[18px]">person</span>
                              </div>
                              <span className="font-medium text-on-background">{req.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-on-surface-variant text-sm">
                            {req.email && <div>{req.email}</div>}
                            {req.phone && <div>{req.phone}</div>}
                            {!req.email && !req.phone && <span className="text-outline">—</span>}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                              req.requestedRole === "OFFICER"
                                ? "bg-primary-container/10 text-primary-container border-primary-container/20"
                                : "bg-secondary-container/10 text-on-secondary-container border-secondary-container/20"
                            }`}>
                              {req.requestedRole}
                            </span>
                          </td>
                          <td className="p-4 text-on-surface-variant text-sm">
                            {new Date(req.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleApprove(req.id)}
                                disabled={actionLoading === req.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-on-tertiary-container/10 text-on-tertiary-container border border-on-tertiary-container/20 rounded hover:bg-on-tertiary-container/20 transition-colors disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingId(rejectingId === req.id ? null : req.id)
                                  setRejectNote("")
                                }}
                                disabled={actionLoading === req.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-error/10 text-error border border-error/20 rounded hover:bg-error/20 transition-colors disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                        {rejectingId === req.id && (
                          <tr key={`${req.id}-reject`} className="bg-surface-container-low">
                            <td colSpan={5} className="px-4 py-3">
                              <div className="flex items-center gap-3 max-w-lg">
                                <input
                                  type="text"
                                  placeholder="Reason for rejection (optional)"
                                  value={rejectNote}
                                  onChange={(e) => setRejectNote(e.target.value)}
                                  className="flex-1 px-3 py-1.5 text-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-error focus:ring-1 focus:ring-error/30 outline-none text-on-surface"
                                />
                                <button
                                  onClick={() => handleReject(req.id)}
                                  disabled={actionLoading === req.id}
                                  className="px-3 py-1.5 text-xs font-semibold bg-error text-on-error rounded hover:bg-error/90 transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === req.id ? "Rejecting..." : "Confirm Reject"}
                                </button>
                                <button
                                  onClick={() => setRejectingId(null)}
                                  className="text-outline hover:text-on-surface-variant"
                                >
                                  <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {pendingUsers.length === 0 ? (
            <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 block">person_search</span>
              <p className="font-title-md text-lg">No pending Google sign-in requests</p>
              <p className="text-sm mt-1">New Google sign-ins awaiting approval will appear here.</p>
            </div>
          ) : (
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      <th className="p-4 text-sm font-semibold text-on-surface-variant">User</th>
                      <th className="p-4 text-sm font-semibold text-on-surface-variant">Email</th>
                      <th className="p-4 text-sm font-semibold text-on-surface-variant">Sign-in Method</th>
                      <th className="p-4 text-sm font-semibold text-on-surface-variant">Joined</th>
                      <th className="p-4 text-sm font-semibold text-on-surface-variant text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {pendingUsers.map((user) => (
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
                            <span className="font-medium text-on-background">{user.name || "—"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-on-surface-variant text-sm">{user.email}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {user.providers.map((p) => (
                              <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-container border border-outline-variant text-on-surface-variant">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-on-surface-variant text-sm">
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openApproveModal(user)}
                              disabled={actionLoading === user.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-on-tertiary-container/10 text-on-tertiary-container border border-on-tertiary-container/20 rounded hover:bg-on-tertiary-container/20 transition-colors disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Approve
                            </button>
                            <button
                              onClick={() => handleSuspendUser(user.id)}
                              disabled={actionLoading === user.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-error/10 text-error border border-error/20 rounded hover:bg-error/20 transition-colors disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[14px]">block</span>
                              Reject
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
        </>
      )}

      {/* Google user approval modal */}
      {approvingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md border border-outline-variant">
            <div className="flex justify-between items-center p-5 border-b border-outline-variant">
              <h3 className="text-lg font-bold text-on-background">Approve Google User</h3>
              <button
                onClick={() => setApprovingUser(null)}
                className="text-on-surface-variant hover:text-on-background p-1 rounded hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  {approvingUser.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={approvingUser.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-container/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container">person</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-on-background">{approvingUser.name || "—"}</p>
                  <p className="text-sm text-on-surface-variant">{approvingUser.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">
                  Assign Role <span className="text-error">*</span>
                </label>
                <select
                  value={approveForm.role}
                  onChange={(e) => setApproveForm({ ...approveForm, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-on-surface"
                >
                  <option value="OFFICER">Officer</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CONTRACTOR">Contractor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">
                  Designation
                </label>
                <select
                  value={approveForm.designation}
                  onChange={(e) => setApproveForm({ ...approveForm, designation: e.target.value })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-on-surface"
                >
                  <option value="">— Select designation (optional) —</option>
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1.5">
                  Department
                </label>
                <select
                  value={approveForm.department}
                  onChange={(e) => setApproveForm({ ...approveForm, department: e.target.value as DepartmentKey })}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-on-surface"
                >
                  <option value="">— Select department (optional) —</option>
                  {(Object.entries(DEPARTMENT_LABELS) as [DepartmentKey, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setApprovingUser(null)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low transition-colors text-on-surface"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveGoogleUser}
                  disabled={actionLoading === approvingUser.id}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {actionLoading === approvingUser.id ? "Approving..." : "Approve User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
