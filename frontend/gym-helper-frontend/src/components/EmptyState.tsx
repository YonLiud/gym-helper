interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-full bg-(--code-bg) p-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-(--text)"
        >
          <path d="M6.5 6.5h11" />
          <path d="M6.5 17.5h11" />
          <path d="M3 9.5a2 2 0 0 0 0 5" />
          <path d="M21 9.5a2 2 0 0 1 0 5" />
          <path d="M5.5 6.5v11" />
          <path d="M18.5 6.5v11" />
        </svg>
      </div>
      <p className="text-lg font-medium text-(--text-h)">{title}</p>
      {description && (
        <p className="text-sm text-(--text) max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
