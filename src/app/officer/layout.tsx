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
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      const userStatus = (session?.user as any)?.status
      const role = session?.user?.role

      if (userStatus === "PENDING_APPROVAL") {
        router.replace("/pending-approval")
        return
      }

      if (role !== "OFFICER") {
        if (role === "ADMIN") router.replace("/admin")
        else if (role === "CONTRACTOR") router.replace("/contractor")
        else router.replace("/login")
        return
      }

      // If officer has no designation and isn't already on /setup, redirect to setup
      const designation = (session?.user as any)?.designation
      if (!designation && pathname !== "/setup") {
        router.replace("/setup")
        return
      }
    }
  }, [status, session, router, pathname])

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
