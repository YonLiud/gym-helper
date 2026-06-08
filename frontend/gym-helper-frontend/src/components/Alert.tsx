import { cn } from '../lib/cn'

type AlertVariant = 'error' | 'success' | 'warning' | 'info'

interface AlertProps {
  variant?: AlertVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'bg-red-900/20 border border-red-800/60 text-red-400',
  success: 'bg-green-900/20 border border-green-800/60 text-green-400',
  warning: 'bg-yellow-900/20 border border-yellow-800/60 text-yellow-400',
  info: 'bg-(--accent-bg) border border-(--accent-border) text-(--accent)',
}

export function Alert({ variant = 'error', children, className }: AlertProps) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 text-[13px]',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}
