"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchProfileImage() {
      if (!session) return
      try {
        const res = await fetch("/api/users/profile")
        if (res.ok) {
          const data = await res.json()
          setProfileImage(data.profileImage || null)
        }
      } catch {
        // silent
      }
    }
    fetchProfileImage()
  }, [session])

  async function fetchUnreadCount() {
    if (!session) return
    try {
      const res = await fetch("/api/notifications?unread=true")
      if (res.ok) {
        const data: Notification[] = await res.json()
        setUnreadCount(data.length)
      }
    } catch {
      // silent
    }
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
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [session])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showDropdown])

  async function handleBellClick() {
    if (!showDropdown) {
      await fetchNotifications()
    }
    setShowDropdown((v) => !v)
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
    } catch {
      // silent
    }
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
    } catch {
      // silent
    }
    setShowDropdown(false)
    if (n.link) {
      router.push(n.link)
    }
  }

  const avatarSrc = profileImage || session?.user?.image || null

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
        {/* Notifications bell */}
        <div className="relative" ref={dropdownRef}>
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

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-surface border border-outline-variant rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
                <span className="font-semibold text-on-background text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary-container hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant text-sm">
                  No notifications
                </div>
              ) : (
                <ul className="max-h-96 overflow-y-auto divide-y divide-outline-variant/50">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left px-4 py-3 hover:bg-surface-container-lowest transition-colors flex gap-3 items-start ${!n.read ? "border-l-2 border-primary-container" : ""}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium text-on-background ${!n.read ? "font-semibold" : ""}`}>{n.title}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-outline mt-1">{relativeTime(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-container flex-shrink-0 mt-1.5" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden ml-2 flex-shrink-0 cursor-pointer">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="Profile" className="w-full h-full object-cover" src={avatarSrc} />
          ) : (
            <span className="material-symbols-outlined text-on-surface-variant flex items-center justify-center w-full h-full text-xl">person</span>
          )}
        </div>
      </div>
    </header>
  )
}
