"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PendingApprovalPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  // Auto-check every 30 seconds — if status changes to ACTIVE redirect to dashboard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }

    const interval = setInterval(async () => {
      await update()
    }, 30000)

    return () => clearInterval(interval)
  }, [status, router, update])

  // Watch for status change to ACTIVE
  useEffect(() => {
    if (status !== "authenticated") return
    const userStatus = (session?.user as any)?.status
    const role = (session?.user as any)?.role

    if (userStatus === "ACTIVE") {
      if (role === "ADMIN") router.replace("/admin")
      else if (role === "OFFICER") router.replace("/officer")
      else if (role === "CONTRACTOR") router.replace("/contractor")
      else router.replace("/officer")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  const user = session?.user
  const email = user?.email
  const image = user?.image

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-secondary-container" />

          <div className="p-8 text-center space-y-6">
            {/* Icon */}
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-secondary-container/20 border-2 border-secondary-container/30 flex items-center justify-center">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-secondary-container text-4xl">pending</span>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-on-background">Account Pending Approval</h1>
              <p className="text-on-surface-variant mt-2 text-sm">
                Your account is awaiting review by the system administrator.
              </p>
            </div>

            {/* Email chip */}
            {email && (
              <div className="inline-flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-full px-4 py-2">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">email</span>
                <span className="text-sm text-on-surface-variant">{email}</span>
              </div>
            )}

            {/* Info box */}
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 text-left space-y-3">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary-container mt-0.5 text-[20px]">schedule</span>
                <div>
                  <p className="text-sm font-semibold text-on-background">While you wait</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    The system administrator will review your account and assign your role and department.
                    You will be able to log in once approved.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-on-tertiary-container mt-0.5 text-[20px]">sync</span>
                <div>
                  <p className="text-sm font-semibold text-on-background">Auto-checking status</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    This page automatically checks every 30 seconds. You&apos;ll be redirected as soon as your account is approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-outline mt-4">
          NIRMAAN — Government Project Management System
        </p>
      </div>
    </div>
  )
}
