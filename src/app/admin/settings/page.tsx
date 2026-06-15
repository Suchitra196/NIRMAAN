"use client"

import { useSession } from "next-auth/react"

export default function AdminSettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-on-background">Settings</h2>
        <p className="text-on-surface-variant mt-1">Your account and profile</p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary-container/20 border border-outline-variant overflow-hidden flex items-center justify-center">
            {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-primary-container text-4xl">person</span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-background">{session?.user?.name || "—"}</h3>
            <p className="text-on-surface-variant">{session?.user?.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-container/10 text-primary-container border border-primary-container/20 mt-2">
              {session?.user?.role}
            </span>
          </div>
        </div>

        <div className="border-t border-outline-variant pt-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Full Name</label>
            <p className="font-body-md text-base text-on-background p-2 bg-surface-container-low rounded border border-outline-variant">
              {session?.user?.name || "Not set"}
            </p>
          </div>
          <div>
            <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Email Address</label>
            <p className="font-body-md text-base text-on-background p-2 bg-surface-container-low rounded border border-outline-variant">
              {session?.user?.email || "Not set"}
            </p>
          </div>
          <div>
            <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Role</label>
            <p className="font-body-md text-base text-on-background p-2 bg-surface-container-low rounded border border-outline-variant">
              {session?.user?.role || "—"}
            </p>
          </div>
        </div>

        <div className="border-t border-outline-variant pt-4">
          <p className="text-sm text-on-surface-variant">
            Profile updates (name, image) are managed through your Google account. Contact a system administrator to change your role.
          </p>
        </div>
      </div>
    </div>
  )
}
