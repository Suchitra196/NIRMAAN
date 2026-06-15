"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

export interface NavItem {
  label: string
  href: string
  icon: string
}

interface SidebarProps {
  navItems: NavItem[]
  showNewProject?: boolean
  onNewProject?: () => void
}

export default function Sidebar({ navItems, showNewProject, onNewProject }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="fixed left-0 h-full w-[280px] bg-primary text-on-primary shadow-sm flex-col py-lg border-r border-outline-variant/20 hidden md:flex z-40">
      {/* Header */}
      <div className="px-md mb-xl flex items-center gap-sm">
        <div className="w-12 h-12 rounded-full bg-on-primary flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
        </div>
        <div>
          <h1 className="font-headline-lg text-2xl font-bold">NIRMAAN</h1>
          <p className="font-label-sm text-xs text-on-primary/70">Project Management System</p>
        </div>
      </div>

      {/* CTA */}
      {showNewProject && (
        <div className="px-md mb-lg">
          <button
            onClick={onNewProject}
            className="w-full bg-secondary-container text-on-secondary-container border border-secondary-container py-2 rounded font-title-md font-semibold text-center hover:bg-secondary-container/90 transition-colors flex items-center justify-center gap-xs"
          >
            <span className="material-symbols-outlined">add</span> New Project
          </button>
        </div>
      )}

      {/* Main Nav */}
      <ul className="flex-1 flex flex-col gap-xs">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-xs px-md py-sm transition-all ${
                  isActive
                    ? "border-l-4 border-secondary-container bg-primary-container/10 text-on-primary font-bold"
                    : "text-on-primary/70 hover:bg-primary-container/20 hover:text-on-primary"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-md text-base">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Footer */}
      <ul className="mt-auto flex flex-col gap-xs border-t border-outline-variant/20 pt-md">
        <li>
          <div className="flex items-center gap-xs px-md py-sm text-on-primary/70">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden flex-shrink-0">
              {session?.user?.image ? (
                <img alt="Profile" className="w-full h-full object-cover" src={session.user.image} />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant text-xl flex items-center justify-center w-full h-full">person</span>
              )}
            </div>
            <span className="font-body-md text-sm truncate">{session?.user?.name || session?.user?.email || "User"}</span>
          </div>
        </li>
        <li>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-xs px-md py-sm text-on-primary/70 hover:bg-primary-container/20 hover:text-on-primary transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md text-base">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
