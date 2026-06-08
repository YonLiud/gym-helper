import { cn } from '../lib/cn'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-white border-transparent hover:opacity-90',
  secondary:
    'bg-transparent border-[var(--border)] text-[var(--text-h)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
  ghost:
    'bg-transparent border-transparent text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--code-bg)]',
  danger:
    'bg-red-500 text-white border-transparent hover:bg-red-600',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-md',
  md: 'px-4 py-2 rounded-lg',
  lg: 'text-lg px-6 py-3 rounded-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 border font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
