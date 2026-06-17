"use client"

import { useEffect, useState } from "react"
import { DESIGNATION_HIERARCHY, DEPARTMENT_LABELS, DepartmentKey } from "@/lib/hierarchy"

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
  isSuperAdmin: boolean
}

type View = "tree" | "officers"

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

// Build a tree structure from the designation hierarchy
function buildTree() {
  // Group designations by department, sorted by level
  const byDept: Record<string, { designation: string; level: number }[]> = {}
  for (const [designation, info] of Object.entries(DESIGNATION_HIERARCHY)) {
    if (!byDept[info.department]) byDept[info.department] = []
    byDept[info.department].push({ designation, level: info.level })
  }
  for (const dept of Object.keys(byDept)) {
    byDept[dept].sort((a, b) => a.level - b.level)
  }
  return byDept
}

export default function HierarchyPage() {
  const [view, setView] = useState<View>("tree")
  const [officers, setOfficers] = useState<OfficerUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOfficers() {
      try {
        const res = await fetch("/api/users?role=OFFICER")
        if (res.ok) setOfficers(await res.json())
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadOfficers()
  }, [])

  const tree = buildTree()

  // Sort officers by hierarchyLevel
  const sortedOfficers = [...officers].sort((a, b) => (a.hierarchyLevel || 99) - (b.hierarchyLevel || 99))

  // Colour for hierarchy level
  function levelColor(level: number) {
    if (level <= 2) return "bg-error/10 text-error border-error/20"
    if (level <= 4) return "bg-secondary-container/10 text-secondary-container border-secondary-container/20"
    if (level <= 6) return "bg-primary-container/10 text-primary-container border-primary-container/20"
    return "bg-surface-container text-on-surface-variant border-outline-variant"
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-on-background">Organisational Hierarchy</h2>
        <p className="text-on-surface-variant mt-1">Zilla Parishad structure and officer assignments</p>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("tree")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
            view === "tree"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_tree</span>
          Tree View
        </button>
        <button
          onClick={() => setView("officers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
            view === "officers"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">groups</span>
          Officers View
        </button>
      </div>

      {/* Tree View */}
      {view === "tree" && (
        <div className="space-y-4">
          {Object.entries(tree).map(([dept, roles]) => {
            const deptLabel = DEPARTMENT_LABELS[dept as DepartmentKey] || dept
            // Find officers in this department
            const deptOfficers = officers.filter(
              (o) => o.department === dept && o.status !== "SUSPENDED"
            )

            return (
              <div key={dept} className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-[20px]">domain</span>
                    <h3 className="font-bold text-on-background">{deptLabel}</h3>
                  </div>
                  {deptOfficers.length > 0 && (
                    <span className="text-xs text-on-surface-variant bg-primary-container/10 border border-primary-container/20 rounded-full px-2 py-0.5">
                      {deptOfficers.length} officer{deptOfficers.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {roles.map((role, idx) => {
                    const assigned = officers.filter(
                      (o) => o.designation === role.designation
                    )
                    return (
                      <div key={role.designation} className="flex items-start gap-3 mb-2 last:mb-0">
                        {/* Tree connector lines */}
                        <div className="flex flex-col items-center pt-1 flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${levelColor(role.level).split(" ").slice(1).join(" ")}`} />
                          {idx < roles.length - 1 && (
                            <div className="w-0.5 flex-1 min-h-[20px] bg-outline-variant/50 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${levelColor(role.level)}`}>
                              L{role.level}
                            </span>
                            <p className="text-sm font-medium text-on-background">{role.designation}</p>
                          </div>
                          {assigned.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {assigned.map((o) => (
                                <div key={o.id} className="flex items-center gap-1.5 bg-primary-container/5 border border-primary-container/20 rounded-full px-2 py-0.5">
                                  {o.isDeptAdmin && (
                                    <span className="material-symbols-outlined text-[12px] text-primary-container">star</span>
                                  )}
                                  <span className="text-xs text-primary-container font-medium">{o.name || o.email}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Officers View */}
      {view === "officers" && (
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
            </div>
          ) : sortedOfficers.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 block">badge</span>
              <p>No officers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-on-surface-variant">Officer</th>
                    <th className="p-4 text-sm font-semibold text-on-surface-variant">Designation</th>
                    <th className="p-4 text-sm font-semibold text-on-surface-variant">Department</th>
                    <th className="p-4 text-sm font-semibold text-on-surface-variant text-center">Level</th>
                    <th className="p-4 text-sm font-semibold text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {sortedOfficers.map((officer) => (
                    <tr
                      key={officer.id}
                      className={`hover:bg-surface-container-lowest transition-colors ${
                        officer.isDeptAdmin ? "bg-primary-container/5" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {officer.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={officer.image} alt={officer.name || ""} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-primary-container text-[18px]">person</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-on-background text-sm">{officer.name || "—"}</p>
                              {officer.isDeptAdmin && (
                                <span className="material-symbols-outlined text-[14px] text-primary-container" title="Dept Admin">star</span>
                              )}
                              {officer.isSuperAdmin && (
                                <span className="material-symbols-outlined text-[14px] text-error" title="Super Admin">verified</span>
                              )}
                            </div>
                            <p className="text-xs text-on-surface-variant">{officer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-on-surface-variant max-w-[200px]">
                        <p className="truncate">{officer.designation || "—"}</p>
                      </td>
                      <td className="p-4 text-sm text-on-surface-variant">
                        {officer.department && officer.department !== "NONE"
                          ? DEPARTMENT_LABELS[officer.department as DepartmentKey] || officer.department
                          : "—"}
                      </td>
                      <td className="p-4 text-center">
                        {officer.hierarchyLevel < 99 ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${levelColor(officer.hierarchyLevel)}`}>
                            L{officer.hierarchyLevel}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <StatusChip status={officer.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
