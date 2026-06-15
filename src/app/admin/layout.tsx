"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import MobileNav from "@/components/MobileNav"

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Projects", href: "/admin/projects", icon: "account_tree" },
  { label: "Officers", href: "/admin/officers", icon: "badge" },
  { label: "Finance", href: "/admin/finance", icon: "payments" },
  { label: "Reports", href: "/admin/reports", icon: "description" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      const role = session?.user?.role
      if (role === "OFFICER") router.replace("/officer")
      else if (role === "CONTRACTOR") router.replace("/contractor")
      else router.replace("/login")
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-md">
      <Sidebar navItems={adminNavItems} />
      <div className="flex-1 flex flex-col md:ml-[280px] h-full overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface-bright pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav navItems={adminNavItems} />
    </div>
  )
}
