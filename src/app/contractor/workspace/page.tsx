"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface Project {
  id: string
  name: string
  status: "ONGOING" | "DELAYED" | "COMPLETED"
  tasks: Array<{ id: string; title: string; status: string }>
}

interface UploadedFile {
  name: string
  type: string // "image" | "doc"
  dataUrl: string
  size: number
}

const CHECKLIST_ITEMS = [
  "Geo-tagged photos required",
  "Daily log correlation check",
  "Material consumption report",
]

export default function ContractorWorkspacePage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [progress, setProgress] = useState(0)
  const [description, setDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const [lastStatus, setLastStatus] = useState<"IN_REVIEW" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/projects")
      if (res.ok) {
        const data: Project[] = await res.json()
        setProjects(data)
        if (data.length > 0) setSelectedProjectId(data[0].id)
      }
    }
    load()
  }, [])

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        showToast(`${file.name} exceeds 10MB.`, "error")
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        const isImage = file.type.startsWith("image/")
        setUploadedFiles((prev) => [
          ...prev,
          { name: file.name, type: isImage ? "image" : "doc", dataUrl, size: file.size },
        ])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  function removeFile(idx: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(isDraft = false) {
    if (!selectedProjectId) { showToast("Select a project.", "error"); return }
    if (!isDraft && !description.trim()) { showToast("Work description is required.", "error"); return }
    if (!isDraft && progress === 0) { showToast("Set a progress percentage.", "error"); return }

    isDraft ? setSavingDraft(true) : setSubmitting(true)

    try {
      // Submit as a payment request with proof images — uses existing API
      const imageFiles = uploadedFiles.filter((f) => f.type === "image").map((f) => f.dataUrl)
      const selectedProject = projects.find((p) => p.id === selectedProjectId)
      const inProgressTask = selectedProject?.tasks.find((t) => t.status === "IN_PROGRESS")

      const body: Record<string, unknown> = {
        projectId: selectedProjectId,
        amount: 0, // progress update — no payment amount
        description: description || `Progress update: ${progress}%`,
        proofImages: imageFiles.slice(0, 5),
      }
      if (inProgressTask) body.taskId = inProgressTask.id

      const res = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok || res.status === 201) {
        setLastStatus("IN_REVIEW")
        showToast(isDraft ? "Draft saved." : "Progress submitted. Officer has been notified.")
        if (!isDraft) {
          setDescription("")
          setProgress(0)
          setUploadedFiles([])
        }
      } else {
        const data = await res.json()
        showToast(data.error || "Submission failed.", "error")
      }
    } catch {
      showToast("Network error.", "error")
    } finally {
      isDraft ? setSavingDraft(false) : setSubmitting(false)
    }
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm flex items-center gap-2 ${
          toast.type === "success" ? "bg-on-background text-background" : "bg-error text-on-error"
        }`}>
          <span className="material-symbols-outlined text-[18px]">{toast.type === "success" ? "check_circle" : "error"}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-on-background">Workspace</h1>
        <p className="text-on-surface-variant mt-1">Ensure all project milestones are documented with precision for government auditing.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left — Main form */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-6">
            {/* Project selector */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                Select Active Project
              </label>
              <div className="relative">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg text-sm font-medium bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface appearance-none pr-10"
                >
                  {projects.length === 0 && <option value="">No projects assigned</option>}
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* Progress slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  Progress Percentage
                </label>
                <span className="text-4xl font-bold text-on-tertiary-container">{progress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #319e23 0%, #319e23 ${progress}%, #e1e3e4 ${progress}%, #e1e3e4 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                <span>0% (Not Started)</span>
                <span>100% (Completed)</span>
              </div>
            </div>

            {/* Work Description */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                Work Done Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none text-on-surface resize-none"
                placeholder="Detail the specific tasks completed, materials used, and any site observations..."
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={savingDraft}
                className="flex-1 py-3 border border-outline-variant rounded-lg font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                {savingDraft ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : (
                  <>Submit Progress <span className="material-symbols-outlined text-[18px]">send</span></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right — Evidence upload + verification */}
        <div className="lg:w-72 space-y-4">
          {/* Evidence Upload */}
          <div className="bg-surface border border-outline-variant rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary-container">cloud_upload</span>
              <h3 className="font-bold text-base text-on-background">Evidence Upload</h3>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-surface-container-low hover:border-primary-container/50 transition-colors group"
            >
              <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary-container mb-2">add_photo_alternate</span>
              <p className="text-sm text-on-surface-variant">Drag and drop site photos or project docs here</p>
              <span className="mt-3 px-4 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors">
                Browse Files
              </span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" multiple className="hidden" onChange={handleFileChange} />

            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-surface-container-low rounded-lg border border-outline-variant">
                    <span className={`material-symbols-outlined text-[18px] ${f.type === "image" ? "text-on-tertiary-container" : "text-secondary-container"}`}>
                      {f.type === "image" ? "image" : "description"}
                    </span>
                    <span className="flex-1 text-xs text-on-background truncate">{f.name}</span>
                    <button type="button" onClick={() => removeFile(idx)} className="text-error hover:text-error/80">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Protocol */}
          <div className="bg-primary text-on-primary rounded-xl p-5">
            <h3 className="font-bold text-base mb-3">Verification Protocol</h3>
            <ul className="space-y-2">
              {CHECKLIST_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-[16px] text-on-tertiary-container bg-on-primary/10 rounded-full p-0.5 flex-shrink-0">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Last update status */}
          {lastStatus && (
            <div className="border-l-4 border-secondary-container pl-4 py-2">
              <p className="text-xs text-on-surface-variant uppercase tracking-wide">Last Update Status</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-semibold text-on-background">Verification Pending</span>
                <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-xs font-bold uppercase">
                  In Review
                </span>
              </div>
            </div>
          )}

          {/* Back link */}
          <Link
            href="/contractor/projects"
            className="flex items-center gap-1 text-sm text-primary-container hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Projects
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-on-surface-variant">
        <span>© 2024 NIRMAAN INFRASTRUCTURE PROTOCOL</span>
        <div className="flex gap-4">
          <span className="hover:text-primary cursor-pointer">COMPLIANCE</span>
          <span className="hover:text-primary cursor-pointer">SUPPORT</span>
          <span className="hover:text-primary cursor-pointer">DATA POLICY</span>
        </div>
      </div>
    </div>
  )
}
