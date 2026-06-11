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
        'glass rounded-[14px] px-4 py-3.5',
        onClick && 'glass-interactive cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
