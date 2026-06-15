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
  { label: "Finance", href: "/contractor/finance", icon: "payments" },
  { label: "Settings", href: "/contractor/settings", icon: "settings" },
]

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (status === "authenticated" && session?.user?.role !== "CONTRACTOR") {
      const role = session?.user?.role
      if (role === "ADMIN") router.replace("/admin")
      else if (role === "OFFICER") router.replace("/officer")
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

  if (status === "unauthenticated" || session?.user?.role !== "CONTRACTOR") {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-md">
      <Sidebar navItems={contractorNavItems} />
      <div className="flex-1 flex flex-col md:ml-[280px] h-full overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface-bright pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav navItems={contractorNavItems} />
    </div>
  )
}
