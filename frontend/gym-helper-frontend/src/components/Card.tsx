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
        'rounded-xl border border-(--border) bg-(--bg) p-4',
        onClick &&
          'cursor-pointer hover:border-(--accent) hover:shadow-(--shadow) transition-all',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
