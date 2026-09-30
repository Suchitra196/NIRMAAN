"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

import { MAHARASHTRA_DIVISIONS as MAHARASHTRA_DISTRICTS, ALL_DISTRICTS } from "@/lib/maharashtra"

interface Project {
  id: string
  name: string
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  description: string | null
}

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  ONGOING: { label: "Ongoing", cls: "bg-blue-100 text-blue-800 border border-blue-200" },
  DELAYED: { label: "Delayed", cls: "bg-orange-100 text-orange-800 border border-orange-200" },
  COMPLETED: { label: "Completed", cls: "bg-green-100 text-green-800 border border-green-200" },
}

function DistrictRow({ district, color }: { district: string; color: string }) {
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  async function loadProjects() {
    if (fetched) return
    setLoading(true)
    try {
      const res = await fetch("/api/public/projects")
      if (res.ok) {
        const all: Project[] = await res.json()
        // Filter by district name appearing in project description or name
        const filtered = all.filter(
          (p) =>
            p.name.toLowerCase().includes(district.toLowerCase()) ||
            (p.description || "").toLowerCase().includes(district.toLowerCase())
        )
        setProjects(filtered)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }

  function handleToggle() {
    if (!open && !fetched) loadProjects()
    setOpen((v) => !v)
  }

  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-surface-container-low transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium text-[#00003c] text-sm">{district}</span>
        </div>
        <div className="flex items-center gap-2">
          {fetched && (
            <span className="text-xs text-on-surface-variant">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </span>
          )}
          <span
            className="material-symbols-outlined text-on-surface-variant transition-transform"
            style={{ fontSize: 20, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            expand_more
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-outline-variant bg-surface-container-low px-4 py-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant py-2">
              <span
                className="material-symbols-outlined animate-spin"
                style={{ fontSize: 16 }}
              >
                progress_activity
              </span>
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-on-surface-variant py-2 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                info
              </span>
              No projects registered for {district} yet.
              <Link href="/login" className="text-[#000080] hover:underline ml-1">
                Login to add →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => {
                const s = STATUS_STYLES[project.status] ?? STATUS_STYLES.ONGOING
                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between py-2 border-b border-outline-variant/50 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#00003c] truncate">
                        {project.name}
                      </p>
                      {project.description && (
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`ml-3 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${s.cls}`}
                    >
                      {s.label}
                    </span>
                  </div>
                )
              })}
              <Link
                href="/login"
                className="text-xs text-[#000080] hover:underline mt-1 inline-block"
              >
                View all in dashboard →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ViewLocationsPage() {
  const [search, setSearch] = useState("")
  const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>(
    Object.fromEntries(MAHARASHTRA_DISTRICTS.map((d) => [d.division, true]))
  )

  const filtered = search.trim()
    ? MAHARASHTRA_DISTRICTS.map((div) => ({
        ...div,
        districts: div.districts.filter((d) =>
          d.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((div) => div.districts.length > 0)
    : MAHARASHTRA_DISTRICTS

  function toggleDivision(division: string) {
    setOpenDivisions((prev) => ({ ...prev, [division]: !prev[division] }))
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Top bar */}
      <div className="bg-[#00003c] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-sm">school</span>
            <span>NIRMAAN Academic Prototype — 36 Maharashtra Districts</span>
          </div>
          <Link href="/" className="hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              home
            </span>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Nav */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[#00003c]"
              style={{ fontSize: 32 }}
            >
              shield
            </span>
            <div>
              <div className="text-[#00003c] font-bold text-lg leading-tight">NIRMAAN</div>
              <div className="text-[#00003c] text-xs opacity-60">Project Management System</div>
            </div>
          </Link>
          <Link
            href="/login"
            className="px-4 py-1.5 bg-[#00003c] text-white rounded hover:bg-[#000080] transition text-sm font-medium"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#00003c] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              chevron_right
            </span>
            <span>View Locations</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-[family:var(--font-public-sans)] mb-3">
            District Coverage — Maharashtra
          </h1>
          <p className="text-white/70 max-w-2xl text-sm leading-relaxed">
            NIRMAAN currently covers all{" "}
            <span className="text-[#fe9832] font-semibold">36 districts</span> across{" "}
            <span className="text-[#fe9832] font-semibold">6 administrative divisions</span> of
            Maharashtra. Click on any district to view registered projects.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Total Districts", value: "36", icon: "location_on" },
              { label: "Administrative Divisions", value: "6", icon: "domain" },
              { label: "Sub-Divisions", value: "350+", icon: "map" },
              { label: "Gram Panchayats", value: "27,920", icon: "home_work" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <span
                  className="material-symbols-outlined text-[#fe9832] mb-2 block"
                  style={{ fontSize: 24 }}
                >
                  {s.icon}
                </span>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — district list */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-6">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                style={{ fontSize: 20 }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Search district..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg text-sm bg-white focus:border-[#00003c] focus:ring-2 focus:ring-[#00003c]/20 focus:outline-none"
              />
            </div>

            {/* Divisions */}
            <div className="space-y-6">
              {filtered.map((div) => (
                <div key={div.division}>
                  {/* Division header */}
                  <button
                    onClick={() => toggleDivision(div.division)}
                    className="w-full flex items-center justify-between mb-3 group"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 20, color: div.color }}
                      >
                        {div.icon}
                      </span>
                      <h2
                        className="font-bold text-base font-[family:var(--font-public-sans)]"
                        style={{ color: div.color }}
                      >
                        {div.division} Division
                      </h2>
                      <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                        {div.districts.length} districts
                      </span>
                    </div>
                    <span
                      className="material-symbols-outlined text-on-surface-variant transition-transform"
                      style={{
                        fontSize: 20,
                        transform: openDivisions[div.division]
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* District rows */}
                  {openDivisions[div.division] !== false && (
                    <div className="space-y-2 pl-2">
                      {div.districts.map((district) => (
                        <DistrictRow
                          key={district}
                          district={district}
                          color={div.color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-16 text-on-surface-variant">
                  <span
                    className="material-symbols-outlined text-5xl mb-3 block"
                    style={{ fontSize: 48 }}
                  >
                    search_off
                  </span>
                  <p>No districts match &quot;{search}&quot;</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — map + info */}
          <div className="lg:w-80 space-y-5 flex-shrink-0">
            {/* Map image */}
            <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
              <div className="bg-[#00003c] px-4 py-3">
                <h3 className="text-white font-semibold text-sm">Maharashtra — District Map</h3>
              </div>
              <div className="p-2">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container-low">
                  <Image
                    src="/images/Districts-of-Maharashtra.jpg"
                    alt="Districts of Maharashtra map"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Division legend */}
            <div className="bg-white rounded-xl border border-outline-variant p-4 shadow-sm">
              <h3 className="font-semibold text-[#00003c] text-sm mb-3">
                Administrative Divisions
              </h3>
              <div className="space-y-2">
                {MAHARASHTRA_DISTRICTS.map((div) => (
                  <div key={div.division} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: div.color }}
                    />
                    <span className="text-xs text-on-surface-variant">{div.division}</span>
                    <span className="text-xs text-outline ml-auto">
                      {div.districts.length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#00003c] text-white rounded-xl p-5">
              <h3 className="font-bold mb-2">Register a Project</h3>
              <p className="text-white/70 text-xs leading-relaxed mb-4">
                Officers can log in to register and manage projects for their district.
              </p>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#fe9832] text-[#00003c] rounded-lg font-semibold text-sm hover:opacity-90 transition"
              >
                Officer Login
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#00003c] text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#fe9832]" style={{ fontSize: 24 }}>
              shield
            </span>
            <span className="font-semibold">NIRMAAN</span>
            <span className="text-white/50">— Academic Demonstration Portal</span>
          </div>
          <div className="flex gap-4 text-white/60 text-xs">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/accessibility" className="hover:text-white transition">
              Accessibility
            </Link>
            <Link href="/sitemap" className="hover:text-white transition">
              Sitemap
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10 py-3 text-center text-xs text-white/40">
          © NIRMAAN (GPOMS) Academic Demonstration | Non-Governmental Educational Project
        </div>
      </footer>
    </div>
  )
}
