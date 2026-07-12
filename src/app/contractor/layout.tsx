"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import MobileNav from "@/components/MobileNav"

const contractorNavItems = [
  { label: "Dashboard", href: "/contractor", icon: "dashboard" },
  { label: "Projects", href: "/contractor/projects", icon: "account_tree" },
  { label: "Workspace", href: "/contractor/workspace", icon: "construction" },
  { label: "Finance", href: "/contractor/finance", icon: "payments" },
  { label: "Settings", href: "/contractor/settings", icon: "settings" },
]

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const role = session?.user?.role
    if (!role) return

    if (role === "ADMIN") { router.replace("/admin"); return }
    if (role === "OFFICER") { router.replace("/officer"); return }
  }, [status, session, router])

  if (status === "loading" || !session?.user?.role) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  if (session?.user?.role !== "CONTRACTOR") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md">
      <Sidebar navItems={contractorNavItems} />
      <div className="flex-1 flex flex-col md:ml-[280px]">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 bg-surface-bright pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav navItems={contractorNavItems} />
    </div>
  )
}
