import { cn } from '../lib/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4',
        onClick &&
          'cursor-pointer hover:border-[var(--accent)] hover:shadow-[var(--shadow)] transition-all',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
