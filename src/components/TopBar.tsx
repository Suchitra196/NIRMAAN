"use client"

import { useSession } from "next-auth/react"

interface TopBarProps {
  title?: string
}

export default function TopBar({ title }: TopBarProps) {
  const { data: session } = useSession()

  return (
    <header className="bg-surface text-primary border-b border-outline-variant flex justify-between items-center w-full px-md h-16 sticky top-0 z-30">
      <div className="flex items-center gap-md w-full md:w-auto">
        <h1 className="md:hidden font-headline-lg text-xl font-bold">NIRMAAN</h1>
        {title && <h2 className="hidden md:block font-title-md text-lg font-semibold text-on-surface">{title}</h2>}
        <div className="hidden md:flex relative w-64 items-center">
          <span className="material-symbols-outlined absolute left-2 text-outline">search</span>
          <input
            className="w-full pl-8 pr-2 py-1 bg-surface-container-low border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 font-body-md transition-colors placeholder:text-outline"
            placeholder="Search..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-sm">
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden ml-2 flex-shrink-0 cursor-pointer">
          {session?.user?.image ? (
            <img alt="Profile" className="w-full h-full object-cover" src={session.user.image} />
          ) : (
            <span className="material-symbols-outlined text-on-surface-variant flex items-center justify-center w-full h-full text-xl">person</span>
          )}
        </div>
      </div>
    </header>
  )
}
