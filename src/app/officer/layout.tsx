"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import MobileNav from "@/components/MobileNav"

const officerNavItems = [
  { label: "Dashboard", href: "/officer", icon: "dashboard" },
  { label: "Projects", href: "/officer/projects", icon: "account_tree" },
  { label: "Finance", href: "/officer/finance", icon: "payments" },
  { label: "Settings", href: "/officer/settings", icon: "settings" },
]

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // Wait for role to be populated
    const role = session?.user?.role
    if (!role) return

    const userStatus = (session?.user as any)?.status

    if (userStatus === "PENDING_APPROVAL") {
      router.replace("/pending-approval")
      return
    }

    if (role === "ADMIN") { router.replace("/admin"); return }
    if (role === "CONTRACTOR") { router.replace("/contractor"); return }

    // Confirmed OFFICER — check setup
    if (role === "OFFICER") {
      const designation = (session?.user as any)?.designation
      if (!designation && !pathname.startsWith("/setup")) {
        router.replace("/setup")
      }
    }
  }, [status, session, router, pathname])

  if (status === "loading" || !session?.user?.role) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  if (session?.user?.role !== "OFFICER") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md">
      <Sidebar navItems={officerNavItems} />
      <div className="flex-1 flex flex-col md:ml-[280px]">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 bg-surface-bright pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav navItems={officerNavItems} />
    </div>
  )
}
