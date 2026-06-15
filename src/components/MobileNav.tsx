"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavItem } from "./Sidebar"

interface MobileNavProps {
  navItems: NavItem[]
}

export default function MobileNav({ navItems }: MobileNavProps) {
  const pathname = usePathname()
  const visibleItems = navItems.slice(0, 4)

  return (
    <nav className="md:hidden bg-surface w-full h-[72px] fixed bottom-0 z-50 flex justify-around items-center px-4 border-t border-outline-variant">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 min-w-[64px] py-1 ${
              isActive ? "text-secondary-container font-bold" : "text-on-surface-variant"
            }`}
          >
            {isActive ? (
              <div className="bg-secondary-container/20 px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-secondary-container">{item.icon}</span>
              </div>
            ) : (
              <span className="material-symbols-outlined">{item.icon}</span>
            )}
            <span className="font-label-sm text-xs">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
