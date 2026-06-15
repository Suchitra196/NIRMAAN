"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import MobileNav from "@/components/MobileNav"

const officerNavItems = [
  { label: "Dashboard", href: "/officer", icon: "dashboard" },
  { label: "Projects", href: "/officer/projects", icon: "account_tree" },
  { label: "Finance", href: "/officer/finance", icon: "payments" },
  { label: "Payments", href: "/officer/payments", icon: "payments" },
  { label: "Settings", href: "/officer/settings", icon: "settings" },
]

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (status === "authenticated" && session?.user?.role !== "OFFICER") {
      const role = session?.user?.role
      if (role === "ADMIN") router.replace("/admin")
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

  if (status === "unauthenticated" || session?.user?.role !== "OFFICER") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md">
      <Sidebar navItems={officerNavItems} />
      <div className="flex-1 flex flex-col md:ml-[280px] min-h-screen">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 bg-surface-bright pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav navItems={officerNavItems} />
    </div>
  )
}
