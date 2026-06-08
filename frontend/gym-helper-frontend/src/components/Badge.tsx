import { cn } from '../lib/cn'

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[#2a2a2a] border border-[#333] text-[#777]',
  accent: 'bg-(--accent-bg) border border-(--accent-border) text-(--accent)',
  success: 'bg-green-900/30 border border-green-800 text-green-400',
  warning: 'bg-yellow-900/30 border border-yellow-800 text-yellow-400',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[20px] px-2.5 py-1 text-[11px] font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
