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
        'rounded-[14px] border border-(--border) bg-(--surface) px-4 py-3.5',
        onClick && 'cursor-pointer transition-colors hover:border-(--accent-border)',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
