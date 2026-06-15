"use client"

import { useEffect, useState } from "react"

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

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<LoginRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Reject inline state
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function loadRequests() {
    setLoading(true)
    try {
      const res = await fetch("/api/login-requests?status=PENDING")
      if (res.ok) {
        setRequests(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

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
        await loadRequests()
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
        await loadRequests()
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div>
        <h2 className="text-3xl font-bold text-on-background">Pending Requests</h2>
        <p className="text-on-surface-variant mt-1">Review and approve or reject registration requests</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block">pending_actions</span>
          <p className="font-title-md text-lg">No pending requests</p>
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
                  <>
                    <tr key={req.id} className="hover:bg-surface-container-lowest transition-colors">
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
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
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
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
