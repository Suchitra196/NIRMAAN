"use client"

import { signOut, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TopBarProps {
  title?: string
}

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  link: string | null
  createdAt: string
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function TopBar({ title }: TopBarProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const [profileImage, setProfileImage] = useState<string | null>(null)

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Fetch profile image
  useEffect(() => {
    async function fetchProfile() {
      if (!session) return
      try {
        const res = await fetch("/api/users/profile")
        if (res.ok) {
          const data = await res.json()
          setProfileImage(data.profileImage || null)
        }
      } catch { /* silent */ }
    }
    fetchProfile()
  }, [session])

  // Fetch unread notification count, poll every 30s
  async function fetchUnreadCount() {
    if (!session) return
    try {
      const res = await fetch("/api/notifications?unread=true")
      if (res.ok) {
        const data: Notification[] = await res.json()
        setUnreadCount(data.length)
      }
    } catch { /* silent */ }
  }

  async function fetchNotifications() {
    if (!session) return
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data: Notification[] = await res.json()
        setNotifications(data.slice(0, 10))
        setUnreadCount(data.filter((n) => !n.read).length)
      }
    } catch { /* silent */ }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleBellClick() {
    if (!showNotifDropdown) await fetchNotifications()
    setShowNotifDropdown((v) => !v)
    setShowProfileDropdown(false)
  }

  async function handleMarkAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch { /* silent */ }
  }

  async function handleNotificationClick(n: Notification) {
    try {
      await fetch(`/api/notifications/${n.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      })
      setNotifications((prev) =>
        prev.map((item) => item.id === n.id ? { ...item, read: true } : item)
      )
      setUnreadCount((c) => Math.max(0, c - (n.read ? 0 : 1)))
    } catch { /* silent */ }
    setShowNotifDropdown(false)
    if (n.link) router.push(n.link)
  }

  // Derive settings path from current URL
  const role = (session?.user as any)?.role as string | undefined
  const settingsHref =
    role === "ADMIN" ? "/admin/settings"
    : role === "OFFICER" ? "/officer/settings"
    : "/contractor/settings"

  const avatarSrc = profileImage || session?.user?.image || null

  return (
    <header className="bg-surface text-primary border-b border-outline-variant flex justify-between items-center w-full px-md h-16 sticky top-0 z-30">
      {/* Left: logo (mobile) + search (desktop) */}
      <div className="flex items-center gap-md w-full md:w-auto">
        <h1 className="md:hidden font-headline-lg text-xl font-bold">NIRMAAN</h1>
        {title && <h2 className="hidden md:block font-title-md text-lg font-semibold text-on-surface">{title}</h2>}
        <div className="hidden md:flex relative w-64 items-center">
          <span className="material-symbols-outlined absolute left-2 text-outline">search</span>
          <input
            className="w-full pl-8 pr-2 py-1 bg-surface-container-low border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 font-body-md transition-colors placeholder:text-outline focus:outline-none"
            placeholder="Search..."
            type="text"
          />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-1">

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full flex items-center justify-center relative"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-low">
                <span className="font-semibold text-on-background text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-primary-container hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant text-sm">No notifications</div>
              ) : (
                <ul className="max-h-96 overflow-y-auto divide-y divide-outline-variant/50">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left px-4 py-3 hover:bg-surface-container-lowest transition-colors flex gap-3 items-start ${!n.read ? "border-l-2 border-primary-container bg-primary-container/5" : ""}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-on-background ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-outline mt-1">{relativeTime(n.createdAt)}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary-container flex-shrink-0 mt-1.5" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => { setShowProfileDropdown((v) => !v); setShowNotifDropdown(false) }}
            className="w-9 h-9 rounded-full bg-surface-container-highest border-2 border-outline-variant overflow-hidden flex-shrink-0 hover:border-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container/50"
            aria-label="Profile menu"
            aria-haspopup="true"
            aria-expanded={showProfileDropdown}
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="Profile" className="w-full h-full object-cover" src={avatarSrc} />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant flex items-center justify-center w-full h-full" style={{ fontSize: "20px" }}>person</span>
            )}
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-1 w-60 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-outline-variant overflow-hidden flex-shrink-0">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="Profile" className="w-full h-full object-cover" src={avatarSrc} />
                  ) : (
                    <span className="material-symbols-outlined text-primary-container flex items-center justify-center w-full h-full" style={{ fontSize: "22px" }}>person</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-on-background truncate">{session?.user?.name || "User"}</p>
                  <p className="text-xs text-on-surface-variant truncate">{session?.user?.email}</p>
                  <span className="inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-container/10 text-primary-container border border-primary-container/20">
                    {role || "—"}
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <ul className="py-1">
                <li>
                  <Link
                    href={settingsHref}
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "18px" }}>manage_accounts</span>
                    Profile &amp; Settings
                  </Link>
                </li>
                <li className="border-t border-outline-variant/50 mt-1 pt-1">
                  <button
                    onClick={() => { setShowProfileDropdown(false); signOut({ callbackUrl: "/login" }) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
