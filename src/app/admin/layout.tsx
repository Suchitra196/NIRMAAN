"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import MobileNav from "@/components/MobileNav"
import type { NavItem } from "@/components/Sidebar"

const baseNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Projects", href: "/admin/projects", icon: "folder_open" },
  { label: "Officers", href: "/admin/officers", icon: "badge" },
  { label: "Hierarchy", href: "/admin/hierarchy", icon: "account_tree" },
  { label: "Finance", href: "/admin/finance", icon: "payments" },
  { label: "Reports", href: "/admin/reports", icon: "description" },
  { label: "Requests", href: "/admin/requests", icon: "pending_actions" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Only redirect when session state is fully resolved — never during "loading"
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // status === "authenticated" — only redirect if role is explicitly NOT admin
    // Do NOT redirect if role is undefined (session still hydrating)
    const role = session?.user?.role
    if (!role) return

    if (role === "OFFICER") { router.replace("/officer"); return }
    if (role === "CONTRACTOR") { router.replace("/contractor"); return }
    // Any other non-ADMIN role — send to login, but only if we're sure
    if (role !== "ADMIN") { router.replace("/login"); return }
  }, [status, session, router])

  // Fetch pending requests count (only when confirmed ADMIN)
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") return
    async function fetchPendingCount() {
      try {
        const res = await fetch("/api/login-requests?status=PENDING")
        if (res.ok) {
          const data = await res.json()
          setPendingCount(Array.isArray(data) ? data.length : 0)
        }
      } catch { /* silent */ }
    }
    fetchPendingCount()
  }, [status, session])

  const navItems: NavItem[] = baseNavItems.map((item) =>
    item.href === "/admin/requests" ? { ...item, badge: pendingCount } : item
  )

  // Show spinner while loading or before role is confirmed
  if (status === "loading" || !session?.user?.role) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md">
      <Sidebar navItems={navItems} />
      <div className="flex-1 flex flex-col md:ml-[280px]">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 bg-surface-bright pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav navItems={navItems} />
    </div>
  )
}
