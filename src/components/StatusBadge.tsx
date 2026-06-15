interface StatusBadgeProps {
  status: "ONGOING" | "DELAYED" | "COMPLETED" | "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED"
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, { label: string; className: string }> = {
    ONGOING: {
      label: "Ongoing",
      className: "bg-primary-container/10 text-primary-container border border-primary-container/20",
    },
    DELAYED: {
      label: "Delayed",
      className: "bg-secondary-container/10 text-secondary-container border border-secondary-container/20",
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-tertiary-container/10 text-on-tertiary-container border border-tertiary-container/20",
    },
    PENDING: {
      label: "Pending",
      className: "bg-surface-container text-on-surface-variant border border-outline-variant",
    },
    IN_PROGRESS: {
      label: "In Progress",
      className: "bg-primary-container/10 text-primary-container border border-primary-container/20",
    },
    APPROVED: {
      label: "Approved",
      className: "bg-tertiary-container/10 text-on-tertiary-container border border-tertiary-container/20",
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-error/10 text-error border border-error/20",
    },
  }

  const config = map[status] ?? { label: status, className: "bg-surface-container text-on-surface-variant" }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
