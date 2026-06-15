"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: string
  image: string | null
  profileImage: string | null
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 font-body-md text-sm">
      <span className="material-symbols-outlined text-[18px]">check_circle</span>
      {message}
    </div>
  )
}

export default function ProfileSettings() {
  const { data: session } = useSession()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)

  const [editName, setEditName] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState("")

  const [uploadError, setUploadError] = useState("")
  const [uploading, setUploading] = useState(false)

  const [toast, setToast] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch profile from API
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      try {
        const res = await fetch("/api/users/profile")
        if (res.ok) {
          const data: UserProfile = await res.json()
          setProfile(data)
          setEditName(data.name || "")
          // Priority: profileImage > session.user.image
          setAvatarSrc(data.profileImage || data.image || null)
        }
      } catch (e) {
        console.error("Failed to fetch profile:", e)
      } finally {
        setLoading(false)
      }
    }
    if (session) fetchProfile()
  }, [session])

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError("")

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image must be 2MB or smaller.")
      return
    }

    setUploading(true)

    try {
      const dataURL = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: dataURL }),
      })

      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || "Failed to upload image.")
      } else {
        setAvatarSrc(dataURL)
        setProfile((prev) => prev ? { ...prev, profileImage: dataURL } : prev)
        setToast("Profile picture updated")
      }
    } catch {
      setUploadError("An error occurred while uploading.")
    } finally {
      setUploading(false)
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Use Google Photo (clear profileImage)
  const handleUseGooglePhoto = async () => {
    setUploadError("")
    setUploading(true)

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: null }),
      })

      if (res.ok) {
        const googleImage = profile?.image || session?.user?.image || null
        setAvatarSrc(googleImage)
        setProfile((prev) => prev ? { ...prev, profileImage: null } : prev)
        setToast("Reverted to Google photo")
      }
    } catch {
      setUploadError("Failed to update profile picture.")
    } finally {
      setUploading(false)
    }
  }

  // Save name
  const handleSaveName = async () => {
    if (!editName.trim()) {
      setNameError("Name cannot be empty.")
      return
    }
    setNameError("")
    setSavingName(true)

    try {
      const userId = (session?.user as any)?.id
      if (!userId) {
        setNameError("Session error. Please refresh.")
        return
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setNameError(data.error || "Failed to save name.")
      } else {
        setProfile((prev) => prev ? { ...prev, name: data.name } : prev)
        setToast("Name updated successfully")
      }
    } catch {
      setNameError("An error occurred.")
    } finally {
      setSavingName(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div>
        <h2 className="text-3xl font-bold text-on-background">Settings</h2>
        <p className="text-on-surface-variant mt-1">Your account and profile</p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-lg p-6 space-y-6">
        {/* Profile Picture Section */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary-container/20 border border-outline-variant overflow-hidden flex items-center justify-center flex-shrink-0">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt={profile?.name || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-primary-container text-4xl">person</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-on-background">{profile?.name || "—"}</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[14px]">upload</span>
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>
              <button
                type="button"
                onClick={handleUseGooglePhoto}
                disabled={uploading || !profile?.image}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-surface-container border border-outline-variant text-on-surface rounded hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title={!profile?.image ? "No Google photo available" : "Revert to Google profile picture"}
              >
                <span className="material-symbols-outlined text-[14px]">manage_accounts</span>
                Use Google Photo
              </button>
            </div>
            {uploadError && <p className="text-xs text-error">{uploadError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload profile picture"
            />
          </div>
        </div>

        <div className="border-t border-outline-variant pt-6 grid grid-cols-1 gap-4">
          {/* Editable: Full Name */}
          <div>
            <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Full Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => { setEditName(e.target.value); setNameError("") }}
                className="flex-1 font-body-md text-base p-2 bg-surface-container-low rounded border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 outline-none text-on-surface transition-colors"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={savingName || editName.trim() === (profile?.name || "")}
                className="px-3 py-2 text-xs font-semibold bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingName ? "Saving..." : "Save"}
              </button>
            </div>
            {nameError && <p className="text-xs text-error mt-1">{nameError}</p>}
          </div>

          {/* Read-only: Email */}
          <div>
            <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Email Address</label>
            <p className="font-body-md text-base p-2 bg-surface-container rounded border border-outline-variant text-on-surface-variant">
              {profile?.email || "Not set"}
            </p>
          </div>

          {/* Read-only: Phone (if set) */}
          {profile?.phone && (
            <div>
              <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Mobile Number</label>
              <p className="font-body-md text-base p-2 bg-surface-container rounded border border-outline-variant text-on-surface-variant">
                {profile.phone}
              </p>
            </div>
          )}

          {/* Read-only: Role */}
          <div>
            <label className="block font-label-sm text-xs text-on-surface-variant mb-1">Role</label>
            <p className="font-body-md text-base p-2 bg-surface-container rounded border border-outline-variant text-on-surface-variant">
              {profile?.role || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
