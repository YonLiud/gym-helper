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
    'bg-(--accent) text-[#0f0f0f] border-transparent hover:opacity-90',
  secondary:
    'bg-(--surface) border-(--border) text-(--text-muted) hover:text-(--text-h)',
  ghost:
    'bg-transparent border-transparent text-(--text-muted) hover:text-(--text-h) hover:bg-(--surface)',
  danger:
    'bg-red-500 text-white border-transparent hover:bg-red-600',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-[13px] px-3 py-2 rounded-[10px]',
  md: 'text-[14px] px-4 py-3 rounded-[12px]',
  lg: 'text-[15px] px-4 py-[17px] rounded-[14px]',
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
